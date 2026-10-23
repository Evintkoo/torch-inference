# Torviello Engine

Copyright (c) 2026 Torviello.

Torviello Engine is a local-first inference service. This book is the operator
and engineering reference for installing, configuring, deploying, and
operating it.

Start with [Installation](INSTALL.md) for a release bundle, or
[Architecture](ARCHITECTURE.md) for the system blueprint. Deployment profiles,
configuration precedence, SLOs, and rollback steps are in the Operations
section.

## Build this book

The site is rendered with mdBook:

```sh
mdbook build docs
mdbook serve docs
```

`just docs` and `just docs-serve` wrap the same commands. The generated site is
written to `docs/book/` and is not committed.
