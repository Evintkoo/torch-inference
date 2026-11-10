/* Copyright (c) 2026 Torviello. */
/**
 * Integration tests for torviello-landing/deploy/deploy.ts — rollback, bootstrap, retention.
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
import { mkdirSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { WEBROOT, fakeRemote, pointCurrent, readCurrent, run, seedDist, seedRemoteRelease, sshInvocations, sshLog, installHarness } from "./deploy-harness.ts";

installHarness();

describe("LD-05 — rollback", () => {
  beforeAll(() => {
    rmSync(fakeRemote, { recursive: true, force: true });
    mkdirSync(join(fakeRemote, "releases"), { recursive: true });
    rmSync(sshLog, { force: true });
    seedRemoteRelease("20261109000000-aaa1111", true);
    seedRemoteRelease("20261109000001-bbb2222", true);
    seedRemoteRelease("20261109000002-ccc3333", true);
    pointCurrent("20261109000002-ccc3333");
  });

  test("rolls back to the newest non-active release after verification", () => {
    const res = run(["rollback"]);
    expect(res.exitCode, res.stderr).toBe(0);
    expect(res.stdout).toContain("20261109000001-bbb2222");
    expect(readCurrent()).toBe("releases/20261109000001-bbb2222");
  });

  test("--into selects an explicit target", () => {
    const res = run(["rollback", "--into", "20261109000000-aaa1111"]);
    expect(res.exitCode).toBe(0);
    expect(readCurrent()).toBe("releases/20261109000000-aaa1111");
  });

  test("E7: --into an unknown release exits 6 without mutation", () => {
    const before = readCurrent();
    const res = run(["rollback", "--into", "20261109000009-zzz9999"]);
    expect(res.exitCode).toBe(6);
    expect(readCurrent()).toBe(before);
  });

  test("rollback --dry-run flips nothing", () => {
    pointCurrent("20261109000002-ccc3333");
    const before = readCurrent();
    const res = run(["rollback", "--dry-run"]);
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain("20261109000001-bbb2222"); // names the target
    expect(readCurrent()).toBe(before);
  });
});

describe("LD-05/E6 — rollback with no candidate", () => {
  test("single release means nothing to roll back to: exit 6", () => {
    rmSync(fakeRemote, { recursive: true, force: true });
    mkdirSync(join(fakeRemote, "releases"), { recursive: true });
    seedRemoteRelease("20261109000000-only000", true);
    pointCurrent("20261109000000-only000");
    const res = run(["rollback"]);
    expect(res.exitCode).toBe(6);
    expect(readCurrent()).toBe("releases/20261109000000-only000");
  });

  test("E6: no releases at all exits 6", () => {
    rmSync(fakeRemote, { recursive: true, force: true });
    mkdirSync(fakeRemote, { recursive: true });
    const res = run(["rollback"]);
    expect(res.exitCode).toBe(6);
  });
});

describe("LD-09 — bootstrap", () => {
  beforeEach(() => {
    rmSync(sshLog, { force: true });
  });

  test("happy path runs the bring-up script and requires the marker", () => {
    const res = run(["bootstrap"], { TORVIELLO_FAKE_SSH_MOCK: "1" });
    expect(res.exitCode, res.stderr).toBe(0);
    expect(res.stdout).toContain("bootstrap complete");
    const log = sshInvocations().join("\n");
    expect(log).toContain("apt-get install -yq caddy rsync");
    expect(log).toContain(`mkdir -p "${WEBROOT}/releases"`);
    expect(log).toContain("iptables");
    expect(log).toContain("80");
    expect(log).toContain("443");
    expect(log).toContain("/etc/caddy/Caddyfile");
    expect(log).toContain("systemctl restart caddy");
    expect(log).toContain(":80 {");
  });

  test("--domain renders the domain site address for auto-TLS", () => {
    const res = run(["bootstrap", "--domain", "torviello.dev"], { TORVIELLO_FAKE_SSH_MOCK: "1" });
    expect(res.exitCode).toBe(0);
    const log = sshInvocations().join("\n");
    expect(log).toContain("torviello.dev {");
    expect(log).not.toContain(":80 {");
  });

  test("unsafe --domain is rejected", () => {
    const res = run(["bootstrap", "--domain", "bad host!"], { TORVIELLO_FAKE_SSH_MOCK: "1" });
    expect(res.exitCode).toBe(2);
    expect(sshInvocations()).toEqual([]);
  });

  test("dry run issues no SSH command", () => {
    const res = run(["bootstrap", "--dry-run"]);
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain("would bootstrap");
    expect(sshInvocations()).toEqual([]);
  });

  test("failed remote script exits 5", () => {
    const res = run(["bootstrap"], { TORVIELLO_FAKE_SSH_MOCK: "1", TORVIELLO_FAKE_SSH_MOCK_FAIL: "1" });
    expect(res.exitCode).toBe(5);
    expect(res.stderr).toContain("bootstrap failed");
  });
});

describe("LD-06 — retention", () => {
  beforeAll(() => {
    rmSync(fakeRemote, { recursive: true, force: true });
    mkdirSync(join(fakeRemote, "releases"), { recursive: true });
    seedDist();
  });

  test("prune keeps the N newest releases and never the active one", () => {
    const ids = [
      "20261109000001-k001",
      "20261109000002-k002",
      "20261109000003-k003",
      "20261109000004-k004",
      "20261109000005-k005",
    ];
    for (const id of ids) {
      mkdirSync(join(fakeRemote, "releases", id), { recursive: true });
      writeFileSync(join(fakeRemote, "releases", id, "index.html"), id);
    }
    pointCurrent("20261109000005-k005");

    // Deploy a new release with keep=3: new + 2 retained, k001/k002 pruned.
    const res = run(["deploy", "--skip-build", "--keep", "3"], { LANDING_DEPLOY_RELEASE_ID: "20261109000006-k006" });
    expect(res.exitCode, res.stderr).toBe(0);

    const remaining = readdirSync(join(fakeRemote, "releases")).sort();
    expect(remaining).toEqual(["20261109000004-k004", "20261109000005-k005", "20261109000006-k006"]);
    expect(readCurrent()).toBe("releases/20261109000006-k006");
  });

  test("--keep 0 disables pruning", () => {
    const res = run(["deploy", "--skip-build", "--keep", "0"], { LANDING_DEPLOY_RELEASE_ID: "20261109000007-k007" });
    expect(res.exitCode).toBe(0);
    const remaining = readdirSync(join(fakeRemote, "releases"));
    expect(remaining.length).toBe(4); // nothing pruned
    expect(readCurrent()).toBe("releases/20261109000007-k007");
  });
});
