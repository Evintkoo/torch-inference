/* Copyright (c) 2026 Torviello. */
/**
 * Integration tests for torviello-landing/deploy/deploy.sh.
 *
 * Specification: specifications/landing-deployment.md (LD-01..LD-08, E1..E10)
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
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, readlinkSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const UNIT_ROOT = resolve(import.meta.dir, "../..");
const SCRIPT = join(UNIT_ROOT, "deploy", "deploy.ts");
const REAL_BUN = Bun.which("bun") as string;
const CONTRACT = JSON.parse(readFileSync(join(UNIT_ROOT, "contracts", "deployment", "deploy-contract.json"), "utf8"));

const WEBROOT = "/var/www/torviello-landing";
const HOST = "deploy@landing.fake.test";
const RELEASE_ID = "20261109000000-abc1234";

let root: string;
let stubDir: string;
let fakeRemote: string;
let sshLog: string;
let rsyncLog: string;
let bunLog: string;

/** Write an executable bash stub. */
function stub(name: string, body: string): void {
  const p = join(stubDir, name);
  writeFileSync(p, `#!/bin/bash\n${body}\n`);
  Bun.spawnSync(["chmod", "+x", p]);
}

/** Spawn deploy.sh with the hermetic environment. Extra env overrides merge in. */
function run(args: string[], extraEnv: Record<string, string> = {}, pathOverride?: string) {
  const env: Record<string, string> = {
    PATH: pathOverride ?? `${stubDir}:/usr/bin:/bin:/usr/sbin`,
    HOME: root,
    LANDING_DEPLOY_HOST: HOST,
    LANDING_DEPLOY_WEBROOT: WEBROOT,
    LANDING_DEPLOY_RELEASE_ID: RELEASE_ID,
    TORVIELLO_FAKE_REMOTE: fakeRemote,
    TORVIELLO_FAKE_WEBROOT: WEBROOT,
    TORVIELLO_FAKE_SSH_LOG: sshLog,
    TORVIELLO_FAKE_RSYNC_LOG: rsyncLog,
    TORVIELLO_FAKE_BUN_LOG: bunLog,
    ...extraEnv,
  };
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete env[k];
  // deploy.ts is executed by the real Bun binary directly; its child
  // processes (ssh, rsync, bun run build) resolve through the stubbed PATH.
  const res = spawnSync(REAL_BUN, [SCRIPT, ...args], { env, encoding: "utf8" });
  // spawnSync exposes the exit status as `status`; surface it as exitCode for
  // readable assertions below.
  const withStatus = res as typeof res & { exitCode?: number | null };
  withStatus.exitCode = res.status;
  return withStatus;
}

/** Seed a fake remote release tree directly (simulating prior deploys). */
function seedRemoteRelease(id: string, withManifest = false): void {
  const dir = join(fakeRemote, "releases", id);
  mkdirSync(join(dir, "assets"), { recursive: true });
  const files = new Map<string, Uint8Array>([
    ["index.html", new TextEncoder().encode(`<html>${id}</html>`)],
    ["assets/app.js", new TextEncoder().encode(`// ${id}`)],
  ]);
  for (const [name, bytes] of files) writeFileSync(join(dir, name), bytes);
  if (withManifest) {
    // Real sha256 hashes so the script's on-server verification (shasum -c)
    // genuinely validates this release.
    const lines = [...files.entries()]
      .map(([name, bytes]) => `${new Bun.CryptoHasher("sha256").update(bytes).digest("hex")}  ./${name}`)
      .join("\n");
    writeFileSync(join(dir, "SHA256SUMS"), lines + "\n");
  }
}

function pointCurrent(id: string): void {
  const link = join(fakeRemote, "current");
  rmSync(link, { force: true });
  symlinkSync(`releases/${id}`, link);
}

function readCurrent(): string | null {
  try {
    return readlinkSync(join(fakeRemote, "current"));
  } catch {
    return null;
  }
}

function sshInvocations(): string[] {
  if (!existsSync(sshLog)) return [];
  return readFileSync(sshLog, "utf8").split("\n").filter(Boolean);
}

function rsyncInvocations(): string[] {
  if (!existsSync(rsyncLog)) return [];
  return readFileSync(rsyncLog, "utf8").split("\n").filter(Boolean);
}

/** Seed the local web/dist output used by --skip-build runs. */
function seedDist(): void {
  const dist = join(UNIT_ROOT, "web", "dist");
  mkdirSync(join(dist, "assets"), { recursive: true });
  writeFileSync(join(dist, "index.html"), "<html>landing</html>");
  writeFileSync(join(dist, "assets", "app-42.js"), "console.log(42)");
}

let distBackup: string | null = null;

/** Preserve any pre-existing web/dist so the suite never destroys user state. */
function preserveDist(): void {
  const dist = join(UNIT_ROOT, "web", "dist");
  if (existsSync(dist)) {
    distBackup = join(root, "dist-backup");
    Bun.spawnSync(["mv", dist, distBackup]);
  }
}

/** Remove the test-seeded dist (never the user's real one; see preserveDist). */
function removeDist(): void {
  rmSync(join(UNIT_ROOT, "web", "dist"), { recursive: true, force: true });
}

function restoreDist(): void {
  const dist = join(UNIT_ROOT, "web", "dist");
  if (distBackup && existsSync(distBackup)) {
    rmSync(dist, { recursive: true, force: true });
    Bun.spawnSync(["mv", distBackup, dist]);
  } else {
    rmSync(dist, { recursive: true, force: true });
  }
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "tv-deploy-test-"));
  stubDir = join(root, "stubs");
  fakeRemote = join(root, "fake-remote");
  sshLog = join(root, "ssh.log");
  rsyncLog = join(root, "rsync.log");
  bunLog = join(root, "bun.log");
  mkdirSync(stubDir, { recursive: true });
  mkdirSync(fakeRemote, { recursive: true });
  preserveDist();

  // Fake ssh: log argv, rewrite the webroot prefix to the fake remote root,
  // execute the remote command locally with sh. FAKE_SSH_FAIL_VERIFY=1
  // simulates a failing on-server verification (E5). In mock mode
  // (TORVIELLO_FAKE_SSH_MOCK=1) commands are logged, never executed —
  // bootstrap's Linux commands (apt, iptables) cannot run on macOS — and the
  // success marker is echoed when present; FAKE_SSH_MOCK_FAIL=1 forces exit 1.
  stub(
    "ssh",
    `echo "$*" >> "$TORVIELLO_FAKE_SSH_LOG"
     if [ -n "\${TORVIELLO_FAKE_SSH_MOCK:-}" ]; then
       if [ -n "\${TORVIELLO_FAKE_SSH_MOCK_FAIL:-}" ]; then echo "mock ssh: command failed" >&2; exit 1; fi
       case "$*" in *TORVIELLO_BOOTSTRAP_OK*) echo TORVIELLO_BOOTSTRAP_OK ;; esac
       exit 0
     fi
     cmd=""
     prev=""
     for a in "$@"; do
       if [ "$prev" = "-e" ] || [ "$prev" = "-i" ] || [ "$prev" = "-J" ]; then prev="$a"; continue; fi
       prev="$a"
     done
     cmd="$a"
     if [ -n "\${TORVIELLO_FAKE_SSH_FAIL_VERIFY:-}" ] && printf '%s' "$cmd" | grep -q TORVIELLO_RELEASE_OK; then
       echo "sha256sum: SHA256SUMS: FAILED" >&2
       exit 1
     fi
     cmd="\${cmd//$TORVIELLO_FAKE_WEBROOT/$TORVIELLO_FAKE_REMOTE}"
     sh -c "$cmd"`,
  );

  // Fake rsync: drop -e pairs, rewrite host:webroot to the local fake remote
  // root, then run the real rsync binary so file-transfer semantics are real.
  stub(
    "rsync",
    `echo "$*" >> "$TORVIELLO_FAKE_RSYNC_LOG"
     args=()
     src=""
     dest=""
     skip_next=0
     for a in "$@"; do
       if [ "$skip_next" = "1" ]; then skip_next=0; continue; fi
       if [ "$a" = "-e" ]; then skip_next=1; continue; fi
       args+=("$a")
     done
     n=\${#args[@]}
     src="\${args[$((n-2))]}"
     dest="\${args[$((n-1))]}"
     unset 'args[n-1]' 'args[n-2]'
     case "$dest" in
       *:*) dest_path="\${dest#*:}" ;;
       *) dest_path="$dest" ;;
     esac
     dest_path="\${dest_path//$TORVIELLO_FAKE_WEBROOT/$TORVIELLO_FAKE_REMOTE}"
     exec /usr/bin/rsync "\${args[@]}" "$src" "$dest_path"`,
  );

  // Fake bun: simulates the vite build output deterministically.
  stub(
    "bun",
    `echo "bun $*" >> "$TORVIELLO_FAKE_BUN_LOG"
     if [ -n "\${TORVIELLO_FAKE_BUN_FAIL:-}" ]; then echo "bun: build failed" >&2; exit 1; fi
     mkdir -p dist/assets
     printf '<html>built</html>' > dist/index.html
     echo 'console.log(1)' > dist/assets/app-7.js`,
  );
});

afterAll(() => {
  restoreDist();
  rmSync(root, { recursive: true, force: true });
  rmSync(join(UNIT_ROOT, "deploy", ".staging"), { recursive: true, force: true });
});

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