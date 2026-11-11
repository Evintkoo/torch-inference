+++
id = "0051"
title = "Move the audit disposition into the engine unit and disposition the untracked root product tree"
status = "in_progress"
priority = "P1"
owner = "engineer"
created = "2026-11-11"
updated = "2026-11-11"
requirements = ["SO-012"]
controls = ["GOV-12"]
depends_on = ["0050"]
labels = ["ci", "root-hygiene"]
+++
## Outcome

the repository root contains only its fixed committed file set plus the owner-dispositioned untracked product tree, and the cargo-audit configuration is owned by torviello-engine

## Acceptance

- [ ] cargo audit passes with the disposition read from torviello-engine/.cargo/audit.toml in CI and locally
- [ ] no file added by the agent remains at the repository root outside the fixed committed set
- [ ] the untracked multimodal-server working tree is preserved intact pending the owner's consolidation decision

## Log

- 2026-11-11 — created
- 2026-11-11 — started
- 2026-11-11 — owner direction 2026-11-11: root must always be clean. Accounting: the only root file the agent added was .cargo/audit.toml (ticket 0050) - relocated to torviello-engine/.cargo/audit.toml (cargo-audit auto-reads .cargo/audit.toml from the CWD and has no --config flag; verified locally: cd torviello-engine && cargo audit -f ../Cargo.lock = 0 vulnerabilities + 1 allowed unmaintained warning); ci.yml dependency-audit now runs from the unit. Root caches .pytest_cache/.ruff_cache removed (regenerable). IMPORTANT correction to earlier framing: the ~29 remaining untracked root entries are NOT retired-engine leftovers - they are the owner's ACTIVE second product (actix multimodal inference server: src/ web/ services/ benches/ tests/ scripts/ docs/ Dockerfile Makefile compose*.yaml nginx.conf model_registry.json models.json convert_kokoro.py CLAUDE.md with live TTS/STT/detect/LLM guidance); working copies DIFFER from the feature branches that track 8 of these paths, i.e. uncommitted work exists and nothing may be deleted. Root was in this mixed state before the agent's sessions (recorded in the prior session's logs as untracked legacy). Awaiting owner decision on consolidating the product tree (options: dedicated branch + worktree; separate repo; leave as-is). canvas/README.md documents the committed canvas/data.json - owner call to commit or relocate
