# Agents: GitHub automation

- Keep workflow permissions limited to the job's needs; rules validation requires read-only repository access.
- Pin third-party actions to verified full commit SHAs and include the corresponding release tag as a comment.
- Keep CI commands aligned with the documented local `uv` commands and lockfile.
- Treat workflow files as executable code: inspect every trigger, permission, expression, action reference, and shell command before changing them.
