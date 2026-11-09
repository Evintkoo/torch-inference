# No committed shell scripts

**Control family:** governance  
**Control document:** GOV-13  
**Requirement trace:** ED-022  
**Status:** Normative project control

**Owner direction 2026-11-09:** "i dont want any sh please add that to rules"
— the repository owner directed that the repository contain no shell scripts
and that the preference become a normative control. This document is that
control. It extends [ED-022](../../requirements/engineering-and-delivery.md)
(packaging shall not depend on `.sh` scripts) from packaging to the whole
repository, including deployment and operations tooling, as owner policy.

## Control objective

Committed shell script files are excluded from this repository so that every
build, deployment, operations, and release path runs on a declared, typed,
tested toolchain instead of untyped shell. Shell scripts fail silently across
platforms (macOS/BSD versus GNU), resist static analysis and typing, cannot
share code with product units, and drift from the unit ownership model. With
this control, reviewers and agents can rely on a single answer to "where does
this command live": inside a `torviello-*` unit, in its declared runtime.

## Applicability

This control applies to every committed file in the repository, in every
`torviello-*` unit and at the repository root, and to every contributor,
agent, or automation that adds committed tooling. It applies regardless of
purpose: build, packaging, deployment, operations, test fixtures, or
one-off scripts. It does not apply to shell command *strings* constructed at
runtime and passed to a platform interface that requires them (for example,
remote commands sent over an SSH session by a typed deploy tool); such
strings are not committed script files. It does not govern the content of
normative corpus documents, which MAY quote shell commands as examples.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are
interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-13.01 — The repository MUST NOT contain committed shell script files

**Requirement:** A committed file MUST NOT be a shell script file. A shell
script file is any tracked file whose name ends in `.sh`, `.bash`, or `.zsh`,
or any tracked executable text file whose first line is a shell interpreter
directive (`#!/bin/sh`, `#!/bin/bash`, `#!/bin/zsh`, `#!/usr/bin/env sh`,
`#!/usr/bin/env bash`, or `#!/usr/bin/env zsh`). The prohibition applies at
the repository root, inside every `torviello-*` unit, and inside every other
committed directory. The migration that introduced this control removed the
one existing violation (`torviello-landing/deploy/deploy.sh`, replaced by
`torviello-landing/deploy/deploy.ts`) in the same change that added the
control.

### GOV-13.02 — Repository tooling MUST be implemented in the owning unit's declared runtime

**Requirement:** Build, packaging, deployment, operations, and release
tooling MUST be implemented as source files of the owning unit's declared
toolchain — for example TypeScript executed by the unit's package manager —
or as an artifact type the unit's contract declares. A contributor or agent
MUST NOT introduce a shell-script implementation of new tooling, and MUST
NOT work around GOV-13.01 by committing shell logic inside another file
format (for example a Markdown document treated as an executable script or
a polyglot file whose executable payload is shell).

### GOV-13.03 — Platform-mandated shell command strings MAY be constructed at runtime, but MUST NOT be committed as files

**Requirement:** Where a platform interface requires shell commands — remote
execution over SSH, container entrypoints, or a shell step inside an existing
CI workflow definition — the tooling MAY construct and pass command strings
at runtime. Such strings MUST be validated or generated from checked values
before use, and the tooling MUST NOT materialize them as committed `.sh` or
shell-shebang files. Test harnesses MAY generate temporary shell stubs inside
a test-managed temporary directory; such generated files are runtime
fixtures, not committed artifacts, and MUST be cleaned up by the harness.

### GOV-13.04 — Conformance MUST be enforced by an automated repository scan

**Requirement:** The generated conformance test for this control MUST scan
the whole repository (excluding the normative corpus and ignored build
directories) for GOV-13.01 violations and MUST fail on any violation.
A violation found by the scan or in review is a defect: it is recorded on a
ticket with the standard defect sections and resolved by reimplementing the
tooling per GOV-13.02, not by deleting the check.

## Prohibited conditions

- Committing a file ending in `.sh`, `.bash`, or `.zsh`.
- Committing an executable text file with a POSIX/Bash/Zsh shell shebang.
- Implementing new build, packaging, deployment, operations, or release
  tooling as shell scripts.
- Smuggling shell logic into an executable non-shell file format to evade
  GOV-13.01.
- Disabling, weakening, or narrowing the generated conformance check to make
  a shell script pass.

## Decision procedure

When a task seems to call for a shell script:

1. Identify the owning `torviello-*` unit and its declared runtime
   (unit `README.md` and manifest).
2. Implement the tooling in that runtime inside the unit, behind the same
   specification, contract, and test discipline as any other unit artifact
   (GOV-06 through GOV-10).
3. Where a remote or platform interface needs shell commands, construct the
   strings at runtime from validated values (GOV-13.03).
4. Run the unit's test suite and the generated GOV-13 conformance check
   before committing.

Steps 1–4 can be automated. Granting an exception (step 5 in the exceptions
section) requires the accountable human owner.

## Assessment procedure

### Examine

- Run the generated conformance test for this control and confirm it passes.
- Search `git ls-files` for `.sh`, `.bash`, and `.zsh` suffixes and confirm
  the list is empty.
- Confirm repository tooling under changed paths is implemented in the owning
  unit's declared runtime.

### Interview

- Ask an engineer how a new operations task would be automated without a
  shell script, and which unit owns the result.
- Ask the reviewer what happens when a proposed change contains a shell
  helper script (expected: defect, reimplement per GOV-13.02).

### Test

- In a scratch worktree, add an empty `scratch.sh`, run the generated
  conformance test, and confirm it fails naming the file.
- Remove the file, re-run, and confirm it passes.

## Assessment determination

Pass requires the repository scan to find zero committed shell script files
and the tooling under review to be implemented in declared unit runtimes.
Fail on any committed shell script file, on shell-logic smuggling, or on a
weakened check. Not applicable requires a recorded reason (for example, a
repository with no committed tooling at all).

## Required evidence

- The generated conformance test result for the current revision.
- `git ls-files` output showing no shell script suffixes, for any audit that
  claims conformance.
- Ticket records for any shell-script defect found and reimplemented.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable repository owner
before the change is treated as complete. Record the affected clauses,
reason, scope, risk, compensating control, remediation owner, and review or
expiry date in [the assurance register](../assurance-register.md). An
exception does not amend this rule. Given the owner direction recorded above,
a recurring shell-script violation is treated as a governance defect rather
than a renewing exception.

## Reference trail

The mapping for this document is in
[00-references-trails.md](../trails/00-references-trails.md). ED-022
establishes the non-shell entry-point expectation for packaging; the owner
direction of 2026-11-09 extends the same policy to every committed file.
External sources are not required for this owner policy; where shell is
discussed in cited frameworks, those citations provide provenance only.
