+++
id = "0026"
title = "Replace the fictional terminal transcript with the real engine session"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-07"]
depends_on = ["0025"]
labels = ["design", "frontend"]
+++
## Outcome

the terminal demo stops promising a CLI and packaging path that do not exist: the owner confirmed the product is not Python so the transcript now shows the documented torviello-engine binary its environment configuration and its real JSON startup event in place of the invented pip serve and status lines

## Acceptance

- [ ] functional design F-07 response names the documented commands and output with no invented CLI flags install paths or log lines and the board-verbatim invariant is superseded by the recorded owner direction
- [ ] the A6 sheet transcript example matches the implemented lines and drops the decorative emoji
- [ ] design contract tests and the landing build stay green after the specification change

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — owner direction 2026-10-24: we are not even using python — the board's pip/serve transcript is fiction and the owner asked for it deslopped; grounded replacement uses only documented facts from INSTALL.md (torviello-engine binary, verify step) config.rs (TORCH_PORT default 127.0.0.1:8000) and observability.rs record_startup (JSON event startup engine started with version and correlation_id); no serve subcommand no status-line prose no emoji
- 2026-10-24 — specification: F-07 response now names the documented session (help verify step, TORCH_PORT run, real JSON startup event from observability.rs record_startup with version 1.0.0 from Cargo.toml) and gains the invariant that no invented packaging path subcommand or log line may appear; A6 sheet gains the content block with the same lines and drops the emoji; board-verbatim invariant superseded by the recorded owner direction
- 2026-10-24 — evidence: uv run --locked pytest torviello-design/tests — 7 passed 0 failed; specification change is content-only with no threshold or interaction contract weakened
- 2026-10-24 — evidence: pytest torviello-design/tests 7 passed; F-07 and A6 updated with the documented engine session
