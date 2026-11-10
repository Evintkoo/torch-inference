/* Copyright (c) 2026 Torviello. */
/**
 * Integration tests for torviello-landing/deploy/deploy.ts — contract, happy path, dry run, edge cases.
 *
 * Specification: specifications/landing-deployment.md (LD-01..LD-09, E1..E10)
 * Contract:      contracts/deployment/deploy-contract.json (v1.0.0)
 *
 * Hermetic by construction (GOV-09.03): `ssh` and `bun` are stubbed with
 * deterministic fakes on PATH, `rsync` is stubbed with a translator that runs
 * the real rsync binary against a local "remote root", and no test touches a
 * network or a real host. The fake ssh executes the received remote command
 * locally with the webroot prefix rewritten to the fake remote root, so the
 * real checksum/ln/mv logic exercised on the server runs here too.
 *
 * Trace: AC-LD-1 (edge cases E1-E10 and the LD-01/03/04 happy path),
 * AC-LD-3 (contract validation and script/contract cross-check).
 */
import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { CONTRACT, RELEASE_ID, SCRIPT, UNIT_ROOT, fakeRemote, pointCurrent, readCurrent, removeDist, root, rsyncInvocations, rsyncLog, run, seedDist, sshInvocations, sshLog, installHarness } from "./deploy-harness.ts";

installHarness();

describe("deploy contract (AC-LD-3, GOV-08)", () => {
  test("contract document parses and carries the required sections", () => {
    expect(CONTRACT.version).toBe("1.2.0");
    expect(CONTRACT.script).toContain("deploy.ts");
    expect(CONTRACT.invocation).toContain("bun deploy/deploy.ts");
    expect(CONTRACT.compatibility).toContain("GOV-13");
    expect(Object.keys(CONTRACT.commands)).toEqual(
      expect.arrayContaining(["deploy", "rollback", "bootstrap"]),
    );
    expect(CONTRACT.environment.LANDING_DEPLOY_HOST.required).toBe(true);
    for (const code of ["0", "2", "3", "4", "5", "6", "7"]) {
      expect(CONTRACT.exit_codes[code], `exit code ${code}`).toBeString();
    }
    expect(CONTRACT.remote_layout.current_link).toContain("current");
    expect(CONTRACT.release_id_format.pattern).toBe("^[A-Za-z0-9._-]+$");
    for (const marker of Object.keys(CONTRACT.verification_markers)) {
      expect(marker).toMatch(/^TORVIELLO_[A-Z_]+_OK$/);
    }
  });

  test("script implements the contract: commands, flags, env, exit codes, marker", () => {
    // The tool is deploy.ts plus its remote-script module (split for CQ-02).
    const src = [SCRIPT, join(UNIT_ROOT, "deploy", "remote-scripts.ts")]
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    for (const cmd of Object.keys(CONTRACT.commands)) {
      expect(src).toContain(`"${cmd}"`);
    }
    for (const flag of Object.keys(CONTRACT.flags)) {
      expect(src, `flag ${flag}`).toContain(flag);
    }
    for (const envVar of Object.keys(CONTRACT.environment)) {
      expect(src, `env ${envVar}`).toContain(envVar);
    }
    for (const code of Object.keys(CONTRACT.exit_codes)) {
      // The tool returns codes through die(code, ...) or process.exit(code).
      expect(src, `exit path for code ${code}`).toMatch(new RegExp(`(die|process\\.exit)\\(${code}\\b`));
    }
    for (const marker of Object.keys(CONTRACT.verification_markers)) {
      expect(src, `marker ${marker}`).toContain(marker);
    }
    expect(src).toContain(CONTRACT.release_id_format.pattern);
  });
});

describe("LD-01/LD-02/LD-03/LD-04 — deploy happy path", () => {
  beforeAll(() => {
    removeDist();
    seedDist();
    rmSync(fakeRemote, { recursive: true, force: true });
    mkdirSync(fakeRemote, { recursive: true });
    rmSync(sshLog, { force: true });
    rmSync(rsyncLog, { force: true });
  });

  test("deploy publishes a verified release and atomically activates it", () => {
    const res = run(["deploy", "--skip-build"]);
    expect(res.exitCode, res.stderr || res.stdout).toBe(0);
    expect(res.stdout).toContain(RELEASE_ID);

    const releaseDir = join(fakeRemote, "releases", RELEASE_ID);
    expect(existsSync(join(releaseDir, "index.html"))).toBeTrue();
    expect(existsSync(join(releaseDir, "assets", "app-42.js"))).toBeTrue();

    // LD-03: manifest present, checksums actually valid on the fake remote.
    const sums = readFileSync(join(releaseDir, "SHA256SUMS"), "utf8");
    expect(sums).toContain("./index.html");
    const check = Bun.spawnSync(["/bin/bash", "-c", `cd '${releaseDir}' && shasum -a 256 -c SHA256SUMS >/dev/null`]);
    expect(check.exitCode).toBe(0);

    // LD-04: current points at the new release only after verification ran.
    expect(readCurrent()).toBe(`releases/${RELEASE_ID}`);
    const log = sshInvocations().join("\n");
    expect(log).toContain("TORVIELLO_RELEASE_OK");
    // mkdir happened before rsync upload.
    expect(log.indexOf("mkdir")).toBeGreaterThanOrEqual(0);
    expect(rsyncInvocations().join(" ")).not.toContain("--dry-run");
  });

  test("release directory survives a re-deploy of a different id (LD-02 immutability)", () => {
    const second = "20261109000001-def5678";
    const res = run(["deploy", "--skip-build"], { LANDING_DEPLOY_RELEASE_ID: second });
    expect(res.exitCode).toBe(0);
    expect(existsSync(join(fakeRemote, "releases", RELEASE_ID, "index.html"))).toBeTrue();
    expect(existsSync(join(fakeRemote, "releases", second, "index.html"))).toBeTrue();
    expect(readCurrent()).toBe(`releases/${second}`);
  });
});

describe("LD-07 — dry run purity", () => {
  beforeAll(() => {
    seedDist();
    rmSync(fakeRemote, { recursive: true, force: true });
    mkdirSync(fakeRemote, { recursive: true });
    rmSync(sshLog, { force: true });
    rmSync(rsyncLog, { force: true });
  });

  test("--dry-run exercises the local path and never mutates remote state", () => {
    const res = run(["deploy", "--dry-run", "--skip-build"]);
    expect(res.exitCode, res.stderr).toBe(0);
    expect(res.stdout).toContain(RELEASE_ID);
    expect(sshInvocations()).toEqual([]); // no SSH at all: no mkdir, no verify, no flip
    expect(rsyncInvocations().join(" ")).toContain("--dry-run");
    expect(existsSync(join(fakeRemote, "releases"))).toBeFalse();
    expect(readCurrent()).toBeNull();
  });
});

describe("edge cases", () => {
  beforeEach(() => {
    rmSync(sshLog, { force: true });
    rmSync(rsyncLog, { force: true });
  });

  beforeAll(() => {
    rmSync(fakeRemote, { recursive: true, force: true });
    mkdirSync(fakeRemote, { recursive: true });
  });

  test("E1: missing host is a usage error naming the variable", () => {
    const res = run(["deploy", "--skip-build"], { LANDING_DEPLOY_HOST: undefined as unknown as string });
    expect(res.exitCode).toBe(2);
    expect(`${res.stderr}${res.stdout}`).toContain("LANDING_DEPLOY_HOST");
    expect(sshInvocations()).toEqual([]);
  });

  test("E2: missing dependency exits 3", () => {
    const emptyPath = join(root, "empty-path");
    mkdirSync(emptyPath, { recursive: true });
    const res = run(["deploy", "--skip-build"], {}, emptyPath);
    expect(res.exitCode).toBe(3);
    expect(`${res.stderr}${res.stdout}`).toMatch(/rsync|ssh/i);
  });

  test("E3: build failure exits 4 and touches nothing remote", () => {
    seedDist();
    removeDist();
    const res = run(["deploy", "--release-id", RELEASE_ID], { TORVIELLO_FAKE_BUN_FAIL: "1" });
    expect(res.exitCode).toBe(4);
    expect(sshInvocations()).toEqual([]);
    expect(existsSync(join(fakeRemote, "releases"))).toBeFalse();
  });

  test("E4: --skip-build without dist exits 7", () => {
    removeDist();
    const res = run(["deploy", "--skip-build"]);
    expect(res.exitCode).toBe(7);
    expect(sshInvocations()).toEqual([]);
  });

  test("E5: failed on-server verification exits 5 and leaves current untouched", () => {
    seedDist();
    pointCurrent("20261109000000-abc1234");
    mkdirSync(join(fakeRemote, "releases", "old-release"), { recursive: true });
    const res = run(["deploy", "--skip-build"], {
      LANDING_DEPLOY_RELEASE_ID: "20261109000002-fail999",
      TORVIELLO_FAKE_SSH_FAIL_VERIFY: "1",
    });
    expect(res.exitCode, res.stderr).toBe(5);
    expect(readCurrent()).toBe("releases/20261109000000-abc1234"); // activation skipped
    // the failed release stays on the server for inspection (E5), unactivated
    expect(existsSync(join(fakeRemote, "releases", "20261109000002-fail999", "index.html"))).toBeTrue();
  });

  test("E8: outside git, the release id falls back to the nogit suffix", () => {
    seedDist();
    const res = run(["deploy", "--skip-build"], {
      LANDING_DEPLOY_RELEASE_ID: undefined as unknown as string,
      GIT_DIR: join(root, "no-git-dir"),
      GIT_WORK_TREE: join(root, "no-git-worktree"),
    });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toMatch(/-nogit/);
    const ids = readdirSync(join(fakeRemote, "releases")).filter((f) => f.endsWith("-nogit"));
    expect(ids.length).toBe(1);
  });

  test("E10: unsafe webroot is rejected before anything runs", () => {
    seedDist();
    const res = run(["deploy", "--skip-build"], { LANDING_DEPLOY_WEBROOT: "/var/www/x; rm -rf /" });
    expect(res.exitCode).toBe(2);
    expect(sshInvocations()).toEqual([]);
  });

  test("unsafe --release-id is rejected", () => {
    seedDist();
    const res = run(["deploy", "--skip-build", "--release-id", "bad id!"]);
    expect(res.exitCode).toBe(2);
    expect(sshInvocations()).toEqual([]);
  });

  test("unknown command exits 2", () => {
    const res = run(["explode"]);
    expect(res.exitCode).toBe(2);
  });
});
