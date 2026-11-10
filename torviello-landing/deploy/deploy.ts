#!/usr/bin/env bun
/* Copyright (c) 2026 Torviello. */
/**
 * torviello-landing deploy — build, publish, verify, activate, rollback.
 *
 * Contract:  ../contracts/deployment/deploy-contract.json (v1.2.0)
 * Spec:      ../specifications/landing-deployment.md (LD-01..LD-09)
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
import {
  BOOTSTRAP_MARKER,
  REMOTE_BOOTSTRAP_TEMPLATE,
  REMOTE_FLIP_SCRIPT,
  REMOTE_LIST_SCRIPT,
  REMOTE_PRUNE_SCRIPT,
  REMOTE_VERIFY_TEMPLATE,
  VERIFICATION_MARKER,
  manifestText,
  remoteScript,
  renderCaddyConfig,
} from "./remote-scripts.ts";

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

type ExitCode = 0 | 2 | 3 | 4 | 5 | 6 | 7;
let COMMAND: "deploy" | "rollback" | "bootstrap" = "deploy";
let DRY_RUN = false;
let SKIP_BUILD = false;
let ROLLBACK_INTO = "";
let DOMAIN = "";

/** Operator CLI output (OBS-01 scope: this is a CLI, not a runtime service):
 * explicit stream writes, the repository's CLI convention (torviello_roles
 * writes through sys.stdout). */
const out = (line: string): void => void process.stdout.write(`${line}\n`);
const err = (line: string): void => void process.stderr.write(`${line}\n`);

function die(code: ExitCode, message: string): never {
  err(`deploy: ${message}`);
  process.exit(code);
}

function usage(): string {
  return `torviello-landing deploy — build, publish, verify, activate, rollback.

Contract:  contracts/deployment/deploy-contract.json (v1.2.0)
Spec:      specifications/landing-deployment.md (LD-01..LD-09)

Usage:
  bun deploy/deploy.ts deploy    [--dry-run] [--skip-build] [--host H] [--keep N]
                                 [--release-id ID]
  bun deploy/deploy.ts rollback  [--dry-run] [--host H] [--into ID]
  bun deploy/deploy.ts bootstrap [--dry-run] [--host H] [--domain NAME]

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
      case "bootstrap":
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
      case "--domain": {
        if (COMMAND !== "bootstrap") die(2, "--domain applies to bootstrap");
        DOMAIN = argv.shift() ?? die(2, "--domain needs a value");
        break;
      }
      case "--help":
      case "-h":
        out(usage());
        process.exit(0);
      default:
        err(`deploy: unknown argument: ${arg}\n`);
        err(usage());
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
  if (DOMAIN !== "" && unsafe(DOMAIN, /^[A-Za-z0-9.-]+$/)) {
    die(2, "unsafe --domain: allowed [A-Za-z0-9.-]");
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
  // rollback and bootstrap only need ssh; deploy also needs rsync and bun.
  const needed = COMMAND === "deploy" ? ["rsync", "ssh"] : ["ssh"];
  for (const tool of needed) {
    if (toolMissing(tool)) missing.push(tool);
  }
  if (!SKIP_BUILD && toolMissing("bun")) {
    missing.push("bun (needed to build; use --skip-build to reuse web/dist)");
  }
  if (missing.length > 0) {
    for (const tool of missing) err(`deploy: missing dependency: ${tool}`);
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

function doBootstrap(): void {
  let config: string;
  try {
    config = renderCaddyConfig(UNIT_ROOT, WEBROOT, DOMAIN);
  } catch (error) {
    die(2, (error as Error).message);
  }
  const script = remoteScript(REMOTE_BOOTSTRAP_TEMPLATE, { WEBROOT })
    .replace("__CADDY_CONFIG__", config);

  if (DRY_RUN) {
    out(`==> would bootstrap ${HOST} (site address: ${DOMAIN === "" ? ":80" : DOMAIN}; dry run; nothing changed)`);
    out(script);
    process.exit(0);
  }

  out(`==> bootstrapping ${HOST} (install caddy/rsync, webroot, firewall, render ${DOMAIN === "" ? ":80" : DOMAIN}, start caddy)`);
  const res = ssh([script]);
  if (res.status !== 0 || !(res.stdout as string).includes(BOOTSTRAP_MARKER)) {
    die(5, `bootstrap failed on ${HOST}; the script ran with set -eu, so the first failed step is in the output above`);
  }
  out("==> bootstrap complete: caddy is serving; run deploy to publish a release");
}

function verifyRemoteRelease(id: string): boolean {
  const script = remoteScript(REMOTE_VERIFY_TEMPLATE, {
    RELEASE_DIR: `${WEBROOT}/releases/${id}`,
  });
  const res = ssh([script]);
  return res.status === 0 && (res.stdout as string).includes(VERIFICATION_MARKER);
}

// ---- build + stage ---------------------------------------------------------------

function buildSite(): void {
  out("==> building web/ (bun run build)");
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
  out(`==> release ${id}${DRY_RUN ? " (dry run)" : ""}`);

  if (!SKIP_BUILD) buildSite();
  const stage = stageRelease(id);
  out(`==> staged ${stage}`);

  if (DRY_RUN) {
    // LD-07: rsync --dry-run only; no SSH command runs at all.
    out(`==> would upload to ${HOST}:${WEBROOT}/releases/${id}/`);
    const res = spawnSync(
      "rsync",
      ["-a", "--delete", "--dry-run", "--itemize-changes", `${stage}/`, `${HOST}:${WEBROOT}/releases/${id}/`],
      { stdio: "inherit" },
    );
    if (res.status !== 0) process.exit(res.status ?? 1);
    out("==> dry run complete: no remote state was touched");
    process.exit(0);
  }

  out("==> preparing remote directories");
  const mkdir = ssh([`mkdir -p '${WEBROOT}/releases'`]);
  if (mkdir.status !== 0) die(5, `cannot create ${WEBROOT}/releases on ${HOST}`);

  out("==> uploading release");
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

  out("==> verifying release on server");
  if (!verifyRemoteRelease(id)) {
    die(
      5,
      `remote verification failed for ${id} (checksums or index.html); current release left untouched; the failed release stays in releases/ for inspection`,
    );
  }

  out("==> activating (atomic symlink flip)");
  const flip = ssh([remoteScript(REMOTE_FLIP_SCRIPT, { WEBROOT, RELEASE_ID: id })]);
  const activated = flip.status === 0 ? (flip.stdout as string).trim() : "";
  if (activated === "") die(5, `activation failed on ${HOST}`);
  out(`==> active release: ${activated}`);

  out(`==> pruning (keep=${KEEP})`);
  ssh([remoteScript(REMOTE_PRUNE_SCRIPT, { WEBROOT, KEEP })]);

  out(`==> deployed ${id} to ${HOST}:${WEBROOT}`);
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
    out(`==> would roll back ${current === "" ? "<none>" : current} -> ${target} (dry run; nothing changed)`);
    process.exit(0);
  }

  out(`==> verifying target release ${target} on server`);
  if (!verifyRemoteRelease(target)) {
    die(5, `target release ${target} failed verification on server; refusing to activate it`);
  }

  out("==> rolling back (atomic symlink flip)");
  const flip = ssh([remoteScript(REMOTE_FLIP_SCRIPT, { WEBROOT, RELEASE_ID: target })]);
  const activated = flip.status === 0 ? (flip.stdout as string).trim() : "";
  if (activated === "") die(5, `rollback activation failed on ${HOST}`);
  out(`==> active release: ${activated} (was ${current === "" ? "<none>" : current})`);
}

// ---- main ------------------------------------------------------------------------------

function main(): void {
  parseArgs([...process.argv.slice(2)]);
  validateConfig();
  if (COMMAND === "deploy") {
    requireTools();
    doDeploy();
  } else if (COMMAND === "rollback") {
    doRollback();
  } else {
    doBootstrap();
  }
  process.exit(0);
}

main();