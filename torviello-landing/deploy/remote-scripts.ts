/* Copyright (c) 2026 Torviello. */
/**
 * Remote command scripts (GOV-13.03): shell strings constructed at runtime
 * and executed by the server's own shell over SSH. Values are inlined only
 * after strict validation in deploy.ts. Split out of deploy.ts for
 * reviewability (CQ-02: 500-line bound).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const VERIFICATION_MARKER = "TORVIELLO_RELEASE_OK";
export const BOOTSTRAP_MARKER = "TORVIELLO_BOOTSTRAP_OK";

export const REMOTE_VERIFY_TEMPLATE = `
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

export const REMOTE_LIST_SCRIPT = `
set -eu
cd "__WEBROOT__/releases" 2>/dev/null || exit 6
ls -1 | LC_ALL=C sort
printf "CURRENT=%s\\n" "$(basename "$(readlink "__WEBROOT__/current" 2>/dev/null)" 2>/dev/null || true)"
`;

/** Activation by rename (LD-04) with a relative symlink target. GNU mv needs
 * -T to rename over a symlink-to-directory; platforms without -T fall back to
 * rm+rename (the Linux deployment platform always takes the atomic path). */
export const REMOTE_FLIP_SCRIPT = `
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

export const REMOTE_PRUNE_SCRIPT = `
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

/** One-time server bring-up (UC-LD-6/LD-09): Ubuntu server, passwordless
 * sudo (OCI default). The Caddy config is rendered locally from the unit's
 * Caddyfile and embedded here; the script echoes TORVIELLO_BOOTSTRAP_OK only
 * after every step succeeded. */
export const REMOTE_BOOTSTRAP_TEMPLATE = `
set -eu
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -q
sudo apt-get install -yq caddy rsync
sudo mkdir -p "__WEBROOT__/releases"
sudo chown -R "$(id -un)" "__WEBROOT__"
for port in 80 443; do
  sudo iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null || {
    line=$(sudo iptables -L INPUT --line-numbers -n | awk '/REJECT|DROP/ {print $1; exit}')
    sudo iptables -I INPUT "\${line:-1}" -p tcp --dport "$port" -j ACCEPT
  }
done
sudo netfilter-persistent save >/dev/null 2>&1 || sudo sh -c 'iptables-save > /etc/iptables/rules.v4'
sudo tee /etc/caddy/Caddyfile > /dev/null <<'CADDY_EOF'
__CADDY_CONFIG__
CADDY_EOF
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
sudo systemctl restart caddy
echo TORVIELLO_BOOTSTRAP_OK
`;

/** Substitute __KEY__ placeholders with strictly validated values. */
export function remoteScript(template: string, values: Record<string, string>): string {
  let script = template;
  for (const [key, value] of Object.entries(values)) {
    script = script.replaceAll(`__${key}__`, value);
  }
  return script;
}

/** Render the unit Caddyfile for the current phase: bare :80 (IP-only, the
 * pre-domain phase) or the domain form (Caddy auto-TLS via ACME). */
export function renderCaddyConfig(unitRoot: string, webroot: string, domain: string): string {
  const source = readFileSync(join(unitRoot, "deploy", "Caddyfile"), "utf8");
  const site = domain === "" ? ":80" : domain;
  let config = source.replaceAll("http://landing.example {", `${site} {`);
  // The root follows the configured webroot (tests use a different webroot).
  config = config.replaceAll("/var/www/torviello-landing/current", `${webroot}/current`);
  if (config.includes("landing.example")) {
    throw new Error("Caddyfile render failed: site address not found");
  }
  return config;
}

/** SHA-256 of a file (LD-03 manifest building). */
export function sha256File(path: string): string {
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

export function manifestText(dir: string): string {
  const skip = (relative: string) => relative.split("/").pop()?.startsWith("SHA256SUMS") ?? false;
  return manifestEntries(dir)
    .filter((relative) => !skip(relative))
    .map((relative) => `${sha256File(join(dir, relative))}  ${relative}`)
    .join("\n") + "\n";
}

