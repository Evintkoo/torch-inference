+++
id = "0017"
title = "Windows MSI installer for the engine"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-020", "ED-021", "ED-022"]
controls = ["REL-01", "GOV-12"]
depends_on = []
labels = ["packaging", "release"]
+++
## Outcome

The packaging driver emits a deterministic WiX definition from a release manifest so a proper signed-ready MSI installer can be produced on Windows or by the CI windows job.

## Acceptance

- [ ] installer command generates a deterministic WiX definition from any release manifest
- [ ] every manifest file maps to one installer component with stable identifiers
- [ ] installer adds the engine bin directory to PATH and a stable upgrade code
- [ ] windows CI job builds the msi and uploads it as an artifact
- [ ] install documentation covers the windows installer
- [ ] packaging tests and ruff and check pass

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: new wix_installer module generates the WiX v4 definition deterministically (uuid5 upgrade code and component guids); driver gained the installer subcommand (payload extraction, definition emission, optional wix build); fixed a real windows packaging bug where archive members dropped the .exe suffix; installer definition had a missing closing Wix tag caught by the xml round-trip test; windows-installer CI job added (build, wix 6.0.1, artifact upload) and yaml validated; INSTALL.md windows section and engine packaging status updated honestly; packaging tests 19 passed; ruff clean; check ok 17 tickets
- 2026-10-23 — evidence: uv run --locked pytest torviello-engine/packaging/tests — 19 passed (8 new installer tests including determinism, stable guids, PATH environment, missing-member rejection, driver command); uv run ruff check . — clean; ci.yml yaml.safe_load — valid; limitation: the first production msi is produced by the windows CI runner on the next run — wxs generation is verified here, wix build executes on windows
