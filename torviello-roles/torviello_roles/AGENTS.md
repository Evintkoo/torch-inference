# Agents: torviello_roles

- Keep the package standard-library only. The store must run on every supported
  build host without installing a dependency.
- Do not use `print()`; write through `emit`/`sys.stdout`/`sys.stderr` so the
  repository output rule and tests keep working.
- Keep the CLI a thin layer over `store.py`; validation and lifecycle rules
  belong in the store so tests and the CLI share one implementation.
- Preserve deterministic output and ordering; agents parse `--json` output.
- Keep every file under 500 lines and add a test for new behavior.
