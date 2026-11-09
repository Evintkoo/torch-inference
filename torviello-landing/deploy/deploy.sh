#!/usr/bin/env bash
# torviello-landing deploy — build, publish, verify, activate, rollback.
#
# Contract:  ../contracts/deployment/deploy-contract.json (v1.0.0)
# Spec:      ../specifications/landing-deployment.md (LD-01..LD-08)
# Ownership: GOV-12.04 — this deploy tooling is a torviello-landing unit
#            artifact and never lives outside the unit.
#
# Usage:
#   deploy.sh [deploy]   [--dry-run] [--skip-build] [--host H] [--keep N]
#                        [--release-id ID]
#   deploy.sh rollback   [--dry-run] [--host H] [--into ID]
#
# Remote layout (under LANDING_DEPLOY_WEBROOT, default /var/www/torviello-landing):
#   releases/<release-id>/   immutable uploaded releases with SHA256SUMS
#   current -> releases/<id> activated release; replaced by rename only
#             after on-server checksum verification passes.
#
# No host, IP, key, or credential is stored in this repository: the
# destination comes from LANDING_DEPLOY_HOST or --host.
set -euo pipefail

UNIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$UNIT_ROOT/web"
STAGING_ROOT="$UNIT_ROOT/deploy/.staging"

WEBROOT="${LANDING_DEPLOY_WEBROOT:-/var/www/torviello-landing}"
SSH_PORT="${LANDING_DEPLOY_SSH_PORT:-22}"
KEEP="${LANDING_DEPLOY_KEEP:-5}"
HOST="${LANDING_DEPLOY_HOST:-}"
RELEASE_ID_OVERRIDE="${LANDING_DEPLOY_RELEASE_ID:-}"
SSH_EXTRA="${LANDING_DEPLOY_SSH_OPTIONS:-}"

DRY_RUN=0
SKIP_BUILD=0
COMMAND="deploy"
ROLLBACK_INTO=""

usage() {
  sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

die() { # die <code> <message...>
  local code="$1"; shift
  printf 'deploy: %s\n' "$*" >&2
  exit "$code"
}

usage_or_die() {
  printf 'deploy: %s\n\n' "$*" >&2
  usage >&2
  exit 2
}

# ---- argument parsing -------------------------------------------------------

parse_args() {
  while [ "$#" -gt 0 ]; do
    case "$1" in
      deploy|rollback)
        [ "$COMMAND" = "deploy" ] || usage_or_die "duplicate command"
        [ "${__cmd_seen:-0}" = "0" ] || usage_or_die "duplicate command"
        __cmd_seen=1
        if [ "$1" = "rollback" ]; then COMMAND="rollback"; fi
        shift
        ;;
      --dry-run)   DRY_RUN=1; shift ;;
      --skip-build)
        [ "$COMMAND" = "deploy" ] || usage_or_die "--skip-build applies to deploy"
        SKIP_BUILD=1; shift ;;
      --host)
        [ "$#" -ge 2 ] || usage_or_die "--host needs a value"
        HOST="$2"; shift 2 ;;
      --keep)
        [ "$COMMAND" = "deploy" ] || usage_or_die "--keep applies to deploy"
        [ "$#" -ge 2 ] || usage_or_die "--keep needs a value"
        KEEP="$2"; shift 2 ;;
      --release-id)
        [ "$COMMAND" = "deploy" ] || usage_or_die "--release-id applies to deploy"
        [ "$#" -ge 2 ] || usage_or_die "--release-id needs a value"
        RELEASE_ID_OVERRIDE="$2"; shift 2 ;;
      --into)
        [ "$COMMAND" = "rollback" ] || usage_or_die "--into applies to rollback"
        [ "$#" -ge 2 ] || usage_or_die "--into needs a value"
        ROLLBACK_INTO="$2"; shift 2 ;;
      --help|-h) usage; exit 0 ;;
      *) usage_or_die "unknown argument: $1" ;;
    esac
  done
}

# ---- validation (LD-08, E1, E10) -------------------------------------------

validate_config() {
  [ -n "$HOST" ] || die 2 "LANDING_DEPLOY_HOST is not set (pass --host USER@HOST or export LANDING_DEPLOY_HOST)"
  case "$HOST" in
    *[!A-Za-z0-9@._-]*) die 2 "unsafe host value: allowed [A-Za-z0-9@._-]" ;;
  esac
  case "$SSH_PORT" in
    ''|*[!0-9]*) die 2 "LANDING_DEPLOY_SSH_PORT must be an integer" ;;
  esac
  case "$WEBROOT" in
    *[!A-Za-z0-9/._-]*) die 2 "unsafe LANDING_DEPLOY_WEBROOT: allowed [A-Za-z0-9/._-]" ;;
  esac
  case "$KEEP" in
    ''|*[!0-9]*) die 2 "LANDING_DEPLOY_KEEP must be a non-negative integer" ;;
  esac
  if [ -n "$RELEASE_ID_OVERRIDE" ]; then
    # release-id pattern (contract): ^[A-Za-z0-9._-]+$
    case "$RELEASE_ID_OVERRIDE" in
      *[!A-Za-z0-9._-]*) die 2 "unsafe release id: allowed [A-Za-z0-9._-]" ;;
    esac
  fi
  if [ -n "$ROLLBACK_INTO" ]; then
    case "$ROLLBACK_INTO" in
      *[!A-Za-z0-9._-]*) die 2 "unsafe --into id: allowed [A-Za-z0-9._-]" ;;
    esac
  fi
}

# ---- dependencies (E2, E3) ---------------------------------------------------

require_tools() {
  local missing=0 t
  for t in rsync ssh; do
    command -v "$t" >/dev/null 2>&1 || { printf 'deploy: missing dependency: %s\n' "$t" >&2; missing=1; }
  done
  if [ "$SKIP_BUILD" = "0" ] && ! command -v bun >/dev/null 2>&1; then
    printf 'deploy: missing dependency: bun (needed to build; use --skip-build to reuse web/dist)\n' >&2
    missing=1
  fi
  [ "$missing" = "0" ] || exit 3
}

# ---- helpers -----------------------------------------------------------------

ssh_cmd() { # ssh_cmd <remote command...>
  # shellcheck disable=SC2086
  ssh -o BatchMode=yes -o ConnectTimeout=10 -p "$SSH_PORT" $SSH_EXTRA "$HOST" "$1"
}

release_id() { # LD-02: YYYYmmddHHMMSS-<sha>|nogit, or the override
  if [ -n "$RELEASE_ID_OVERRIDE" ]; then
    printf '%s' "$RELEASE_ID_OVERRIDE"
    return
  fi
  local ts sha
  ts="$(date -u +%Y%m%d%H%M%S)"
  if sha="$(git -C "$UNIT_ROOT" rev-parse --short HEAD 2>/dev/null)"; then
    printf '%s-%s' "$ts" "$sha"
  else
    printf '%s-nogit' "$ts"
  fi
}

sum_tool() { # portable sha256 (macOS has shasum, Linux has sha256sum)
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$@"; else shasum -a 256 "$@"; fi
}

REMOTE_VERIFY_SCRIPT_TEMPLATE='
set -eu
cd "__TV_RELEASE_DIR__"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum -c SHA256SUMS >/dev/null
else
  shasum -a 256 -c SHA256SUMS >/dev/null
fi
test -f index.html
echo TORVIELLO_RELEASE_OK
'

# verify_remote_release <id>: run checksum + index.html verification on the
# server; print the marker only on success (LD-03, SO-012, SO-031).
verify_remote_release() {
  local id="$1" out script
  # Values are inlined into the remote script, never passed as env prefixes
  # (ssh does not propagate local variable assignments). Safety comes from the
  # strict [A-Za-z0-9/._-] validation in validate_config.
  script="${REMOTE_VERIFY_SCRIPT_TEMPLATE//__TV_RELEASE_DIR__/$WEBROOT/releases/$id}"
  out="$(ssh_cmd "$script" </dev/null)"
  printf '%s\n' "$out" | grep -q TORVIELLO_RELEASE_OK
}

remote_list_script='
set -eu
cd "__TV_WEBROOT__/releases" 2>/dev/null || exit 6
ls -1 | LC_ALL=C sort
printf "CURRENT=%s\n" "$(basename "$(readlink "__TV_WEBROOT__/current" 2>/dev/null)" 2>/dev/null || true)"
'

# flip_current <id>: atomic activation by rename (LD-04). The symlink target
# is relative (releases/<id>) per the deployment contract. GNU mv needs -T to
# rename over a symlink-to-directory instead of moving into it; platforms
# without mv -T (macOS/BSD) fall back to rm+rename with a tiny non-atomic
# window — the deployment platform (Linux) always takes the atomic path.
flip_script='
set -eu
ln -sfn "releases/__TV_RELEASE_ID__" "__TV_WEBROOT__/.current.new"
if mv -Tf "__TV_WEBROOT__/.current.new" "__TV_WEBROOT__/current" 2>/dev/null; then
  :
else
  rm -rf "__TV_WEBROOT__/current"
  mv -f "__TV_WEBROOT__/.current.new" "__TV_WEBROOT__/current"
fi
basename "$(readlink "__TV_WEBROOT__/current")"
'

prune_script='
set -eu
cd "__TV_WEBROOT__/releases" || exit 0
keep="__TV_KEEP__"
[ "$keep" -gt 0 ] || exit 0
current_target="$(basename "$(readlink "__TV_WEBROOT__/current" 2>/dev/null)" 2>/dev/null || true)"
ls -1 | LC_ALL=C sort -r | tail -n +"$((keep + 1))" | while IFS= read -r old; do
  [ -n "$old" ] || continue
  [ "$old" = "$current_target" ] && continue
  rm -rf -- "$old"
  echo "pruned $old"
done
'

# ---- build + stage -----------------------------------------------------------

build_site() { # E3
  (cd "$WEB_DIR" && bun run build) || die 4 "build failed: bun run build exited non-zero"
}

stage_release() { # stage web/dist -> deploy/.staging/<id> with SHA256SUMS (E4, E7)
  local id="$1" dist="$WEB_DIR/dist" stage="$STAGING_ROOT/$1"
  [ -f "$dist/index.html" ] || die 7 "web/dist/index.html not found (run a build first or drop --skip-build)"
  rm -rf -- "$stage"
  mkdir -p -- "$stage"
  rsync -a --delete "$dist/" "$stage/"
  # Manifest over the staged tree; regenerate deterministically (LD-03).
  (
    cd "$stage"
    find . -type f ! -name 'SHA256SUMS*' | LC_ALL=C sort | tr '\n' '\0' \
      | xargs -0 -n 64 sh -c 'if command -v sha256sum >/dev/null 2>&1; then sha256sum "$@"; else shasum -a 256 "$@"; fi' _
  ) > "$stage/SHA256SUMS"
  # Local integrity gate before anything leaves the machine.
  (cd "$stage" && sum_tool -c SHA256SUMS >/dev/null) || die 7 "local staging integrity check failed"
  printf '%s\n' "$stage"
}

# ---- deploy ------------------------------------------------------------------

do_deploy() {
  local id stage
  id="$(release_id)"
  case "$id" in *[!A-Za-z0-9._-]*) die 2 "unsafe release id generated: $id" ;; esac
  printf '==> release %s%s\n' "$id" "$([ "$DRY_RUN" = "1" ] && printf ' (dry run)')"

  if [ "$SKIP_BUILD" = "0" ]; then
    printf '==> building web/ (bun run build)\n'
    build_site
  fi
  stage="$(stage_release "$id")"
  printf '==> staged %s\n' "$stage"

  if [ "$DRY_RUN" = "1" ]; then
    # LD-07: rsync --dry-run only; no SSH command runs at all (E: dry-run purity).
    printf '==> would upload to %s:%s/releases/%s/\n' "$HOST" "$WEBROOT" "$id"
    rsync -a --delete --dry-run --itemize-changes "$stage/" "$HOST:$WEBROOT/releases/$id/"
    printf '==> dry run complete: no remote state was touched\n'
    exit 0
  fi

  printf '==> preparing remote directories\n'
  ssh_cmd "mkdir -p '$WEBROOT/releases'" </dev/null

  printf '==> uploading release\n'
  rsync -a --delete -e "ssh -o BatchMode=yes -o ConnectTimeout=10 -p $SSH_PORT $SSH_EXTRA" \
    "$stage/" "$HOST:$WEBROOT/releases/$id/"

  printf '==> verifying release on server\n'
  verify_remote_release "$id" \
    || die 5 "remote verification failed for $id (checksums or index.html); current release left untouched; the failed release stays in releases/ for inspection"

  printf '==> activating (atomic symlink flip)\n'
  local activated script
  script="${flip_script//__TV_WEBROOT__/$WEBROOT}"
  script="${script//__TV_RELEASE_ID__/$id}"
  activated="$(ssh_cmd "$script" </dev/null)"
  printf '==> active release: %s\n' "$activated"

  printf '==> pruning (keep=%s)\n' "$KEEP"
  local prune
  prune="${prune_script//__TV_WEBROOT__/$WEBROOT}"
  prune="${prune//__TV_KEEP__/$KEEP}"
  ssh_cmd "$prune" </dev/null || true

  printf '==> deployed %s to %s:%s\n' "$id" "$HOST" "$WEBROOT"
}

# ---- rollback ----------------------------------------------------------------

do_rollback() {
  local listing current releases target
  listing="$(ssh_cmd "${remote_list_script//__TV_WEBROOT__/$WEBROOT}" </dev/null)" \
    || die 6 "cannot list releases on $HOST:$WEBROOT/releases"

  current="$(printf '%s\n' "$listing" | sed -n 's/^CURRENT=//p')"
  releases="$(printf '%s\n' "$listing" | grep -v '^CURRENT=' | grep -v '^$' || true)"
  [ -n "$releases" ] || die 6 "no releases found on $HOST:$WEBROOT/releases"

  if [ -n "$ROLLBACK_INTO" ]; then
    target="$ROLLBACK_INTO"
    printf '%s\n' "$releases" | grep -Fx -- "$target" >/dev/null \
      || die 6 "release not found on server: $target"
    [ "$target" = "$current" ] && die 6 "$target is already the active release"
  else
    # default: newest release that is not active (ids sort chronologically)
    if [ -n "$current" ]; then
      target="$(printf '%s\n' "$releases" | LC_ALL=C sort -r | grep -v -F -- "$current" | head -n 1 || true)"
    else
      target="$(printf '%s\n' "$releases" | LC_ALL=C sort -r | head -n 1 || true)"
    fi
    [ -n "$target" ] || die 6 "nothing to roll back to: the only release is already active"
  fi

  if [ "$DRY_RUN" = "1" ]; then
    printf '==> would roll back %s -> %s (dry run; nothing changed)\n' "${current:-<none>}" "$target"
    exit 0
  fi

  printf '==> verifying target release %s on server\n' "$target"
  verify_remote_release "$target" \
    || die 5 "target release $target failed verification on server; refusing to activate it"

  printf '==> rolling back (atomic symlink flip)\n'
  local activated script
  script="${flip_script//__TV_WEBROOT__/$WEBROOT}"
  script="${script//__TV_RELEASE_ID__/$target}"
  activated="$(ssh_cmd "$script" </dev/null)"
  printf '==> active release: %s (was %s)\n' "$activated" "${current:-<none>}"
}

# ---- main --------------------------------------------------------------------

main() {
  parse_args "$@"
  validate_config
  if [ "$COMMAND" = "deploy" ]; then
    require_tools
    do_deploy
  else
    do_rollback
  fi
  exit 0
}

main "$@"
