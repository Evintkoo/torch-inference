# torviello_roles

Standard-library implementation of the ticket store and CLI.

- `store.py` — ticket model, TOML front-matter parsing and rendering, lifecycle
  transitions, validation, and the session brief.
- `cli.py` — argument parsing and command handlers; all output goes through
  `sys.stdout`/`sys.stderr`, never `print`.
- `__main__.py` — `python -m torviello_roles` entry point.

Compatibility target: the Python version pinned by `pyproject.toml`; no third
party dependency is required.
