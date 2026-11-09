#!/usr/bin/env bun
/**
 * torviello-landing deploy — build, publish, verify, activate, rollback.
 *
 * Contract:  ../contracts/deployment/deploy-contract.json (v1.1.0)
 * Spec:      ../specifications/landing-deployment.md (LD-01..LD-08)
 * Ownership: GOV-12.04 — this deploy tooling is a torviello-landing unit
 *            artifact and never lives outside the unit.
 * Runtime:   GOV-13 — repository tooling is implemented in the owning unit's
 *            declared runtime (TypeScript executed by Bun), never as
 *            committed shell scripts. The remote command strings below are
 *            constructed at runtime and passed to SSH (GOV-13.03); the only
 *            shell that ever runs them is the server's own.
 *
 * Usage:
 *   bun deploy/deploy.ts deploy   [--dry-run] [--skip-build] [--host H] [--keep N]
 *                                 [--release-id ID]
 *   bun deploy/deploy.ts rollback [--dry-run] [--host H] [--into ID]
 *
 * Remote layout (under LANDING_DEPLOY_WEBROOT, default /var/www/torviello-landing):
 *   releases/<release-id>/   immutable uploaded releases with SHA256SUMS
 *   current -> releases/<id> activated release; replaced by rename only
 *             after on-server checksum verification passes.
 *
 * No host, IP, key, or credential is stored in this repository: the
 * destination comes from LANDING_DEPLOY_HOST or --host.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const UNIT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIR = join(UNIT_ROOT, "web");
const DIST_DIR = join(WEB_DIR, "dist");
const STAGING_ROOT = join(UNIT_ROOT, "deploy", ".staging");

const WEBROOT = process.env.LANDING_DEPLOY_WEBROOT ?? "/var/www/torviello-landing";
const SSH_PORT = process.env.LANDING_DEPLOY_SSH_PORT ?? "22";
let KEEP = process.env.LANDING_DEPLOY_KEEP ?? "5";
let HOST: string = process.env.LANDING_DEPLOY_HOST ?? "";
let RELEASE_ID_OVERRIDE = process.env.LANDING_DEPLOY_RELEASE_ID ?? "";
const SSH_EXTRA = process.env.LANDING_DEPLOY_SSH_OPTIONS ?? "";

const RELEASE_ID_PATTERN = "^[A-Za-z0-9._-]+$";
const VERIFICATION_MARKER = "TORVIELLO_RELEASE_OK";

type ExitCode = 0 | 2 | 3 | 4 | 5 | 6 | 7;
let COMMAND: "deploy" | "rollback" = "deploy";
let DRY_RUN = false;
let SKIP_BUILD = false;
let ROLLBACK_INTO = "";

function die(code: ExitCode, message: string): never {
  console.error(`deploy: ${message}`);
  process.exit(code);
}

function usage(): string {
  return `torviello-landing deploy — build, publish, verify, activate, rollback.

Contract:  contracts/deployment/deploy-contract.json (v1.1.0)
Spec:      specifications/landing-deployment.md (LD-01..LD-08)

Usage:
  bun deploy/deploy.ts deploy   [--dry-run] [--skip-build] [--host H] [--keep N]
                                [--release-id ID]
  bun deploy/deploy.ts rollback [--dry-run] [--host H] [--into ID]

Environment:
  LANDING_DEPLOY_HOST        (required) SSH destination: [user@]host
  LANDING_DEPLOY_SSH_PORT    (default 22)
  LANDING_DEPLOY_WEBROOT     (default /var/www/torviello-landing)
  LANDING_DEPLOY_KEEP        (default 5; 0 disables pruning)
  LANDING_DEPLOY_RELEASE_ID  override the release id (deterministic runs)
  LANDING_DEPLOY_SSH_OPTIONS extra ssh options, e.g. -i keyfile; never commit keys
`;
}

// ---- argument parsing -------------------------------------------------------

function parseArgs(argv: string[]): void {
  let commandSeen = false;
  while (argv.length > 0) {
    const arg = argv.shift() as string;
    switch (arg) {
      case "deploy":
      case "rollback":
        if (commandSeen) die(2, "duplicate command");
        commandSeen = true;
        COMMAND = arg;
        break;
      case "--dry-run":
        DRY_RUN = true;
        break;
      case "--skip-build":
        if (COMMAND !== "deploy") die(2, "--skip-build applies to deploy");
        SKIP_BUILD = true;
        break;
      case "--host":
        HOST = argv.shift() ?? die(2, "--host needs a value");
        break;
      case "--keep": {
        if (COMMAND !== "deploy") die(2, "--keep applies to deploy");
        KEEP = argv.shift() ?? die(2, "--keep needs a value");
        break;
      }
      case "--release-id": {
        if (COMMAND !== "deploy") die(2, "--release-id applies to deploy");
        RELEASE_ID_OVERRIDE = argv.shift() ?? die(2, "--release-id needs a value");
        break;
      }
      case "--into":
        if (COMMAND !== "rollback") die(2, "--into applies to rollback");
        ROLLBACK_INTO = argv.shift() ?? die(2, "--into needs a value");
        break;
      case "--help":
      case "-h":
        console.log(usage());
        process.exit(0);
      default:
        console.error(`deploy: unknown argument: ${arg}\n`);
        console.error(usage());
        process.exit(2);
    }
  }
}

// ---- validation (LD-08, E1, E10) ---------------------------------------------

function unsafe(value: string, allowed: RegExp): boolean {
  return !allowed.test(value);
}

function validateConfig(): void {
  if (HOST === "") {
    die(2, "LANDING_DEPLOY_HOST is not set (pass --host USER@HOST or export LANDING_DEPLOY_HOST)");
  }
  if (unsafe(HOST, /^[A-Za-z0-9@._-]+$/)) die(2, "unsafe host value: allowed [A-Za-z0-9@._-]");
  if (!/^[0-9]+$/.test(SSH_PORT)) die(2, "LANDING_DEPLOY_SSH_PORT must be an integer");
  if (unsafe(WEBROOT, /^[A-Za-z0-9/._-]+$/)) die(2, "unsafe LANDING_DEPLOY_WEBROOT: allowed [A-Za-z0-9/._-]");
  if (!/^[0-9]+$/.test(KEEP)) die(2, "LANDING_DEPLOY_KEEP must be a non-negative integer");
  if (RELEASE_ID_OVERRIDE !== "" && unsafe(RELEASE_ID_OVERRIDE, new RegExp(RELEASE_ID_PATTERN))) {
    die(2, "unsafe release id: allowed [A-Za-z0-9._-]");
  }
  if (ROLLBACK_INTO !== "" && unsafe(ROLLBACK_INTO, new RegExp(RELEASE_ID_PATTERN))) {
    die(2, "unsafe --into id: allowed [A-Za-z0-9._-]");
  }
}

// ---- dependencies (E2, E3) ----------------------------------------------------

/** Probe for the binary on this process' PATH without executing anything —
 * spawning a probe would count as a dependency invocation. */
function toolMissing(tool: string): boolean {
  return Bun.which(tool) === null;
}

function requireTools(): void {
  const missing: string[] = [];
  for (const tool of ["rsync", "ssh"]) {
    if (toolMissing(tool)) missing.push(tool);
  }
  if (!SKIP_BUILD && toolMissing("bun")) {
    missing.push("bun (needed to build; use --skip-build to reuse web/dist)");
  }
  if (missing.length > 0) {
    for (const tool of missing) console.error(`deploy: missing dependency: ${tool}`);
    process.exit(3);
  }
}

// ---- helpers -------------------------------------------------------------------

function ssh(args: string[]): ReturnType<typeof spawnSync> {
  // LANDING_DEPLOY_SSH_OPTIONS is intentionally unquoted-through: operators
  // pass multi-option strings (e.g. "-i key -o Foo=1"); values are operator
  // controlled and never committed.
  const extra = SSH_EXTRA === "" ? [] : SSH_EXTRA.split(" ").filter((part) => part !== "");
  return spawnSync(
    "ssh",
    ["-o", "BatchMode=yes", "-o", "ConnectTimeout=10", "-p", SSH_PORT, ...extra, HOST, ...args],
    { encoding: "utf8" },
  );
}

function releaseId(): string {
  if (RELEASE_ID_OVERRIDE !== "") return RELEASE_ID_OVERRIDE;
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14); // YYYYmmddHHMMSS (UTC)
  const git = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: UNIT_ROOT, encoding: "utf8" });
  const sha = git.status === 0 ? (git.stdout as string).trim() : "nogit";
  return `${timestamp}-${sha}`;
}

function sha256File(path: string): string {
  return new Bun.CryptoHasher("sha256").update(readFileSync(path)).digest("hex");
}

/** Relative "./path" list of every file under dir, C-locale sorted (LD-03). */
function manifestEntries(dir: string): string[] {
  const entries: string[] = [];
  const walk = (current: string): void => {
    for (const name of readdirSync(current).sort()) {
      const full = join(current, name);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else {
        entries.push(`./${full.slice(dir.length + 1)}`);
      }
    }
  };
  walk(dir);
  return entries.sort();
}

function manifestText(dir: string): string {
  const skip = (relative: string) => relative.split("/").pop()?.startsWith("SHA256SUMS") ?? false;
  return manifestEntries(dir)
    .filter((relative) => !skip(relative))
    .map((relative) => `${sha256File(join(dir, relative))}  ${relative}`)
    .join("\n") + "\n";
}

/** Remote scripts are constructed here and executed by the server's shell
 * over SSH (GOV-13.03). Values inlined are strictly validated above. */
function remoteScript(template: string, values: Record<string, string>): string {
  let script = template;
  for (const [key, value] of Object.entries(values)) {
    script = script.replaceAll(`__${key}__`, value);
  }
  return script;
}

const REMOTE_VERIFY_TEMPLATE = `
set -eu
cd "__RELEASE_DIR__"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum -c SHA256SUMS >/dev/null
else
  shasum -a 256 -c SHA256SUMS >/dev/null
fi
test -f index.html
echo ${VERIFICATION_MARKER}
`;

const REMOTE_LIST_SCRIPT = `
set -eu
cd "__WEBROOT__/releases" 2>/dev/null || exit 6
ls -1 | LC_ALL=C sort
printf "CURRENT=%s\\n" "$(basename "$(readlink "__WEBROOT__/current" 2>/dev/null)" 2>/dev/null || true)"
`;

/** Activation by rename (LD-04) with a relative symlink target. GNU mv needs
 * -T to rename over a symlink-to-directory; platforms without -T fall back to
 * rm+rename (the Linux deployment platform always takes the atomic path). */
const REMOTE_FLIP_SCRIPT = `
set -eu
ln -sfn "releases/__RELEASE_ID__" "__WEBROOT__/.current.new"
if mv -Tf "__WEBROOT__/.current.new" "__WEBROOT__/current" 2>/dev/null; then
  :
else
  rm -rf "__WEBROOT__/current"
  mv -f "__WEBROOT__/.current.new" "__WEBROOT__/current"
fi
basename "$(readlink "__WEBROOT__/current")"
`;

const REMOTE_PRUNE_SCRIPT = `
set -eu
cd "__WEBROOT__/releases" || exit 0
keep="__KEEP__"
[ "$keep" -gt 0 ] || exit 0
current_target="$(basename "$(readlink "__WEBROOT__/current" 2>/dev/null)" 2>/dev/null || true)"
ls -1 | LC_ALL=C sort -r | tail -n +"$((keep + 1))" | while IFS= read -r old; do
  [ -n "$old" ] || continue
  [ "$old" = "$current_target" ] && continue
  rm -rf -- "$old"
  echo "pruned $old"
done
`;

function verifyRemoteRelease(id: string): boolean {
  const script = remoteScript(REMOTE_VERIFY_TEMPLATE, {
    RELEASE_DIR: `${WEBROOT}/releases/${id}`,
  });
  const res = ssh([script]);
  return res.status === 0 && (res.stdout as string).includes(VERIFICATION_MARKER);
}

// ---- build + stage ---------------------------------------------------------------

function buildSite(): void {
  console.log("==> building web/ (bun run build)");
  const res = spawnSync("bun", ["run", "build"], { cwd: WEB_DIR, encoding: "utf8" });
  if (res.status !== 0) die(4, "build failed: bun run build exited non-zero");
}

function stageRelease(id: string): string {
  const stage = join(STAGING_ROOT, id);
  if (!existsSync(join(DIST_DIR, "index.html"))) {
    die(7, "web/dist/index.html not found (run a build first or drop --skip-build)");
  }
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });

  const res = spawnSync("rsync", ["-a", "--delete", `${DIST_DIR}/`, `${stage}/`], { stdio: "inherit" });
  if (res.status !== 0) die(7, `staging failed: rsync exited ${res.status}`);

  // Manifest over the staged tree, then a local integrity gate before
  // anything leaves the machine (LD-03, SO-012).
  writeFileSync(join(stage, "SHA256SUMS"), manifestText(stage));
  const expected = readFileSync(join(stage, "SHA256SUMS"), "utf8");
  if (manifestText(stage) !== expected) die(7, "local staging integrity check failed");
  return stage;
}

// ---- deploy -----------------------------------------------------------------------

function doDeploy(): void {
  const id = releaseId();
  if (unsafe(id, new RegExp(RELEASE_ID_PATTERN))) die(2, `unsafe release id generated: ${id}`);
  console.log(`==> release ${id}${DRY_RUN ? " (dry run)" : ""}`);

  if (!SKIP_BUILD) buildSite();
  const stage = stageRelease(id);
  console.log(`==> staged ${stage}`);

  if (DRY_RUN) {
    // LD-07: rsync --dry-run only; no SSH command runs at all.
    console.log(`==> would upload to ${HOST}:${WEBROOT}/releases/${id}/`);
    const res = spawnSync(
      "rsync",
      ["-a", "--delete", "--dry-run", "--itemize-changes", `${stage}/`, `${HOST}:${WEBROOT}/releases/${id}/`],
      { stdio: "inherit" },
    );
    if (res.status !== 0) process.exit(res.status ?? 1);
    console.log("==> dry run complete: no remote state was touched");
    process.exit(0);
  }

  console.log("==> preparing remote directories");
  const mkdir = ssh([`mkdir -p '${WEBROOT}/releases'`]);
  if (mkdir.status !== 0) die(5, `cannot create ${WEBROOT}/releases on ${HOST}`);

  console.log("==> uploading release");
  const extra = SSH_EXTRA === "" ? [] : SSH_EXTRA.split(" ").filter((part) => part !== "");
  const upload = spawnSync(
    "rsync",
    [
      "-a",
      "--delete",
      "-e",
      `ssh -o BatchMode=yes -o ConnectTimeout=10 -p ${SSH_PORT} ${SSH_EXTRA}`.trimEnd(),
      `${stage}/`,
      `${HOST}:${WEBROOT}/releases/${id}/`,
    ],
    { stdio: "inherit" },
  );
  if (upload.status !== 0) die(5, `upload failed: rsync exited ${upload.status}`);

  console.log("==> verifying release on server");
  if (!verifyRemoteRelease(id)) {
    die(
      5,
      `remote verification failed for ${id} (checksums or index.html); current release left untouched; the failed release stays in releases/ for inspection`,
    );
  }

  console.log("==> activating (atomic symlink flip)");
  const flip = ssh([remoteScript(REMOTE_FLIP_SCRIPT, { WEBROOT, RELEASE_ID: id })]);
  const activated = flip.status === 0 ? (flip.stdout as string).trim() : "";
  if (activated === "") die(5, `activation failed on ${HOST}`);
  console.log(`==> active release: ${activated}`);

  console.log(`==> pruning (keep=${KEEP})`);
  ssh([remoteScript(REMOTE_PRUNE_SCRIPT, { WEBROOT, KEEP })]);

  console.log(`==> deployed ${id} to ${HOST}:${WEBROOT}`);
}

// ---- rollback ------------------------------------------------------------------------

function doRollback(): void {
  const listing = ssh([remoteScript(REMOTE_LIST_SCRIPT, { WEBROOT })]);
  if (listing.status !== 0) die(6, `cannot list releases on ${HOST}:${WEBROOT}/releases`);

  const lines = (listing.stdout as string).split("\n").map((line) => line.trim()).filter((line) => line !== "");
  const current = lines.find((line) => line.startsWith("CURRENT="))?.slice("CURRENT=".length) ?? "";
  const releases = lines.filter((line) => !line.startsWith("CURRENT="));
  if (releases.length === 0) die(6, `no releases found on ${HOST}:${WEBROOT}/releases`);

  let target: string;
  if (ROLLBACK_INTO !== "") {
    target = ROLLBACK_INTO;
    if (!releases.includes(target)) die(6, `release not found on server: ${target}`);
    if (target === current) die(6, `${target} is already the active release`);
  } else {
    // default: newest release that is not active (ids sort chronologically)
    const candidates = releases.sort().reverse().filter((release) => release !== current);
    target = candidates[0] ?? "";
    if (target === "") die(6, "nothing to roll back to: the only release is already active");
  }

  if (DRY_RUN) {
    console.log(`==> would roll back ${current === "" ? "<none>" : current} -> ${target} (dry run; nothing changed)`);
    process.exit(0);
  }

  console.log(`==> verifying target release ${target} on server`);
  if (!verifyRemoteRelease(target)) {
    die(5, `target release ${target} failed verification on server; refusing to activate it`);
  }

  console.log("==> rolling back (atomic symlink flip)");
  const flip = ssh([remoteScript(REMOTE_FLIP_SCRIPT, { WEBROOT, RELEASE_ID: target })]);
  const activated = flip.status === 0 ? (flip.stdout as string).trim() : "";
  if (activated === "") die(5, `rollback activation failed on ${HOST}`);
  console.log(`==> active release: ${activated} (was ${current === "" ? "<none>" : current})`);
}

// ---- main ------------------------------------------------------------------------------

function main(): void {
  parseArgs([...process.argv.slice(2)]);
  validateConfig();
  if (COMMAND === "deploy") {
    requireTools();
    doDeploy();
  } else {
    doRollback();
  }
  process.exit(0);
}

main();
