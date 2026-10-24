# Independent unit packaging and root hygiene

**Control family:** governance  
**Control document:** GOV-12  
**Requirement trace:** CSC-005, ED-011, ED-042, ENG-026, PDL-013  
**Status:** Normative project control

## Control objective

Every `torviello-*` product unit must be able to stand alone as a packageable, versioned artifact, and the repository root must stay a fixed, predictable workspace: artifacts live inside the unit that owns them, never loose at the root. Without this boundary the repository decays into unowned top-level clutter, units cannot be built, released, or consumed independently, and packaging claims cannot be traced to a manifest or build command.

## Applicability

This control applies to every directory named `torviello-*` in the repository, to every contributor, agent, or automation that creates a committed artifact anywhere in the repository, and to the repository root itself. It applies to code, documentation, media, design assets, deployment manifests, configuration, monitoring definitions, and packaged outputs. It does not govern the content of approved requirements or rule domains outside the units; those are governed by their own controls.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-12.01 — Every unit MUST be packageable as an independent, versioned artifact

**Requirement:** Each `torviello-*` unit MUST be structured so it can be packaged as an independent, versioned artifact without reaching outside its own directory for its content, manifest, or build command. Each unit MUST declare its packaging status in its `README.md`: the intended artifact form, and whether packaging evidence exists. A unit that is repository shape only MUST say so explicitly and MUST NOT imply that a package, manifest, or release artifact exists.

### GOV-12.02 — Packaging manifests and build commands MUST live inside the unit

**Requirement:** A unit's packaging manifest, version declaration, lockfile, and build or package command MUST live inside that unit's directory. Shared packaging tooling MAY live outside the units only while a recorded owner decision keeps it there; the supporting unit and the decision record MUST be named. Packaging output MUST NOT be written to the repository root.

### GOV-12.03 — The repository root MUST hold only its fixed file set

**Requirement:** The repository root's committed file set is fixed: license and legal files, `AGENTS.md`, `README.md`, `CODEOWNERS`, `CONTRIBUTING.md`, `SECURITY.md`, `NOTICE`, `justfile`, build manifests and lockfiles, tool configuration files, and dotfiles. New committed files or directories MUST NOT be created at the root. A new artifact MUST be placed inside the owning `torviello-*` unit; if no unit owns it, an owner decision MUST be recorded on a ticket before a home is created, and the root MUST NOT be the default.

### GOV-12.04 — Deployment and operations artifacts MUST live inside the owning unit

**Requirement:** Container images, compose or deploy manifests, environment and runtime configuration, monitoring dashboards, and packaged operational outputs are unit artifacts: they MUST live inside the unit that owns the deployed component. Pre-existing root deployment locations are legacy: they MUST NOT receive new deployment content, and their consolidation into a unit MUST be recorded as an owner decision on a ticket.

### GOV-12.05 — Generated build outputs MUST stay out of version control

**Requirement:** Generated build and packaging outputs MUST be matched by `.gitignore` patterns and MUST NOT be committed. A released artifact is recorded as evaluation evidence — revision, command, digest, and location — not as a committed binary.

### GOV-12.06 — Approved root exceptions MUST be named and bounded

**Requirement:** An artifact MAY remain at the repository root only if this rule or a recorded owner decision names it and bounds its scope. The named exception is the `canvas/` system blueprint. The normative corpus — rules and requirements — lives in `torviello-enforcer/`; operational documentation lives in `torviello-docs/docs/`; organizational policies and evidence records live in `torviello-enforcer/governance/`. Named exceptions retain their root location until an owner decision moves them; they MUST NOT absorb content that belongs to a unit.

### GOV-12.07 — Shared unit artifacts are consumed by import, never by copy

**Requirement:** When one unit consumes an artifact owned by another unit — design assets, tokens, schemas, or other reusable content — it MUST import the artifact from the owning unit through the owning unit's declared entry point, and the import path MUST be declared in the consuming unit's build or module configuration. Re-declaring, embedding, or forking a copy of another unit's artifact in the consuming unit MUST be treated as a finding. Where a build or runtime form requires a transformation of the artifact, the owning unit MUST publish that form alongside the original, and a normative sync test in the owning unit MUST prove the forms stay equal; a stale transformed copy is a finding. Owner direction 2026-10-24: units in this modular monolith import from each other so shared assets stay synchronized at the source.

## Prohibited conditions

- Creating a new committed file or directory at the repository root outside the fixed file set.
- Placing a unit's packaging manifest, version, or build command at the repository root.
- A unit README implying a package or release artifact exists when no packaging evidence is recorded.
- Writing packaging or build output to the repository root, or committing generated outputs.
- Letting a legacy root deployment location absorb new deployment content.
- Moving or deleting a legacy root directory without a recorded owner decision on a ticket.
- Using an unnamed "temporary" root location for an artifact that a unit could own.
- Re-declaring, embedding, or forking another unit's artifact without an owning-unit sync contract.

## Decision procedure

For a new artifact:

1. Identify the owning `torviello-*` unit from the root README routing table.
2. If a unit owns it, place the artifact inside that unit's lifecycle layout (`domain/`, `specifications/`, `contracts/`, `src/`, `tests/`, `evaluations/`).
3. If no unit owns it, record the need, the proposed home, and the accountable owner on a ticket; obtain the owner decision before creating any directory.
4. For packaging work, keep the manifest, version, and build command inside the unit; run the build; record the output location and digest as evidence rather than committing it.
5. Verify the root is unchanged (`git status`) and the generated conformance test passes before committing.

Steps 1–2 and 4–5 can be automated. Step 3, and any change to the named exceptions in GOV-12.06, require the accountable human owner.

## Assessment procedure

### Examine

- List the repository root's tracked entries and confirm each is in the fixed file set or a named exception.
- For each `torviello-*` unit, confirm `README.md` exists and declares packaging status and artifact form.
- Inspect packaging manifests and build commands; confirm they are inside their units.
- Inspect `.gitignore` and `git ls-files` to confirm generated outputs are ignored and uncommitted.

### Interview

- Ask an engineer where a new deployment manifest would go, and how the owning unit is determined.
- Ask the product-manager role how an unowned artifact is routed and who decides when no unit claims it.

### Test

- Run the generated conformance test for this control and confirm it fails when a unit README lacks a packaging declaration or the agent policy loses the root-routing rules.
- In a scratch worktree, add a stray root file and confirm the review process treats it as a GOV-12.03 defect rather than merging it.

## Assessment determination

Pass requires every unit to declare packaging status with manifests and build commands inside their units, the root to contain only the fixed file set plus named exceptions, generated outputs to be ignored, and legacy consolidation to be owner-decided. Fail when a new root artifact appears without an owner decision, a unit claims packaging without evidence, or deployment content lands in a legacy root location. Not applicable requires a recorded reason (for example, a repository with no `torviello-*` units).

## Required evidence

- Per-unit README packaging declarations with the intended artifact form and status.
- The generated conformance test result for the current revision.
- `.gitignore` coverage for generated outputs and a clean `git status` after packaging runs.
- Owner decision records for any root exception, legacy consolidation, or new unit home.
- Package evidence (revision, command, digest, location) for any claimed packageable unit.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering owner before the change is treated as complete. Record the affected clauses, reason, scope, risk, compensating control, remediation owner, and review or expiry date in [the assurance register](../assurance-register.md). An exception does not amend this rule. A root exception without a named scope, or a recurring legacy-directory violation, requires resolving the underlying decision rather than renewing the exception.

## Reference trail

Source IDs R1 and R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). Requirement ENG-026 ties the packaging profiles to the supported build and platform profiles; PDL-013 keeps packaging traceable through the delivery lifecycle. External sources inform the control but do not replace its project-specific requirements.
