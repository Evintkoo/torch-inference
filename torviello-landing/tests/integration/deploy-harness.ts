/* Copyright (c) 2026 Torviello. */
/**
 * Shared hermetic harness for the deploy integration tests (deploy-*.test.ts).
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
import { afterAll, beforeAll } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readlinkSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const UNIT_ROOT = resolve(import.meta.dir, "../..");
export const SCRIPT = join(UNIT_ROOT, "deploy", "deploy.ts");
export const REAL_BUN = Bun.which("bun") as string;
export const CONTRACT = JSON.parse(readFileSync(join(UNIT_ROOT, "contracts", "deployment", "deploy-contract.json"), "utf8"));

export const WEBROOT = "/var/www/torviello-landing";
export const HOST = "deploy@landing.fake.test";
export const RELEASE_ID = "20261109000000-abc1234";

export let root: string;
export let stubDir: string;
export let fakeRemote: string;
export let sshLog: string;
export let rsyncLog: string;
export let bunLog: string;

/** Write an executable bash stub. */
export function stub(name: string, body: string): void {
  const p = join(stubDir, name);
  writeFileSync(p, `#!/bin/bash\n${body}\n`);
  Bun.spawnSync(["chmod", "+x", p]);
}

/** Spawn deploy.sh with the hermetic environment. Extra env overrides merge in. */
export function run(args: string[], extraEnv: Record<string, string> = {}, pathOverride?: string) {
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
export function seedRemoteRelease(id: string, withManifest = false): void {
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

export function pointCurrent(id: string): void {
  const link = join(fakeRemote, "current");
  rmSync(link, { force: true });
  symlinkSync(`releases/${id}`, link);
}

export function readCurrent(): string | null {
  try {
    return readlinkSync(join(fakeRemote, "current"));
  } catch {
    return null;
  }
}

export function sshInvocations(): string[] {
  if (!existsSync(sshLog)) return [];
  return readFileSync(sshLog, "utf8").split("\n").filter(Boolean);
}

export function rsyncInvocations(): string[] {
  if (!existsSync(rsyncLog)) return [];
  return readFileSync(rsyncLog, "utf8").split("\n").filter(Boolean);
}

/** Seed the local web/dist output used by --skip-build runs. */
export function seedDist(): void {
  const dist = join(UNIT_ROOT, "web", "dist");
  mkdirSync(join(dist, "assets"), { recursive: true });
  writeFileSync(join(dist, "index.html"), "<html>landing</html>");
  writeFileSync(join(dist, "assets", "app-42.js"), "export const answer = 42;");
}

let distBackup: string | null = null;

/** Preserve any pre-existing web/dist so the suite never destroys user state. */
export function preserveDist(): void {
  const dist = join(UNIT_ROOT, "web", "dist");
  if (existsSync(dist)) {
    distBackup = join(root, "dist-backup");
    Bun.spawnSync(["mv", dist, distBackup]);
  }
}

/** Remove the test-seeded dist (never the user's real one; see preserveDist). */
export function removeDist(): void {
  rmSync(join(UNIT_ROOT, "web", "dist"), { recursive: true, force: true });
}

export function restoreDist(): void {
  const dist = join(UNIT_ROOT, "web", "dist");
  if (distBackup && existsSync(distBackup)) {
    rmSync(dist, { recursive: true, force: true });
    Bun.spawnSync(["mv", distBackup, dist]);
  } else {
    rmSync(dist, { recursive: true, force: true });
  }
}

/** Register the hermetic fixture hooks in the calling test file. */
export function installHarness(): void {
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
     echo 'export const answer = 1;' > dist/assets/app-7.js`,
  );
});

afterAll(() => {
  restoreDist();
  rmSync(root, { recursive: true, force: true });
  rmSync(join(UNIT_ROOT, "deploy", ".staging"), { recursive: true, force: true });
});
}
