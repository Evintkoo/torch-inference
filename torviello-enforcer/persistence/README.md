# persistence domain

**Development stage:** CDD

This directory contains 6 normative control document(s) and the generated enforcement tests for the **persistence** domain (Persistence and data lifecycle). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| DATA-01 | [01-data-inventory-and-database-selection.md](rules/01-data-inventory-and-database-selection.md) | RP-032–RP-034, SO-033 | [tests/test_01_data_inventory_and_database_selection.py](tests/test_01_data_inventory_and_database_selection.py) | Data inventory and database selection |
| DATA-02 | [02-schema-migrations-backups-and-integrity.md](rules/02-schema-migrations-backups-and-integrity.md) | RP-032–RP-034, SO-033 | [tests/test_02_schema_migrations_backups_and_integrity.py](tests/test_02_schema_migrations_backups_and_integrity.py) | Schema migrations, backups, and integrity |
| DATA-03 | [03-data-classification-retention-and-deletion.md](rules/03-data-classification-retention-and-deletion.md) | RP-032–RP-034, SO-004, SO-021, SO-033 | [tests/test_03_data_classification_retention_and_deletion.py](tests/test_03_data_classification_retention_and_deletion.py) | Data classification, retention, and deletion |
| DATA-04 | [04-consistency-transactions-concurrency-and-integrity.md](rules/04-consistency-transactions-concurrency-and-integrity.md) | RP-032–RP-034, SO-031, SO-033 | [tests/test_04_consistency_transactions_concurrency_and_integrity.py](tests/test_04_consistency_transactions_concurrency_and_integrity.py) | Consistency, transactions, concurrency, and integrity |
| DATA-05 | [05-schema-migration-and-recovery-operations.md](rules/05-schema-migration-and-recovery-operations.md) | RP-003, RP-033–RP-034, SO-031–SO-033 | [tests/test_05_schema_migration_and_recovery_operations.py](tests/test_05_schema_migration_and_recovery_operations.py) | Schema migration and recovery operations |
| DATA-06 | [06-database-logical-and-physical-design.md](rules/06-database-logical-and-physical-design.md) | RP-032–RP-035, SO-004, SO-021, SO-033, PDL-006–PDL-008 | [tests/test_06_database_logical_and_physical_design.py](tests/test_06_database_logical_and_physical_design.py) | Database logical and physical design |

## Detailed controls

### DATA-01 — Data inventory and database selection

**Objective.** These controls govern **data inventory and database selection**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-032–RP-034, SO-033

**Normative requirements:**

- **DATA-01.01 — Before selecting a database, inventory each record type, owner.** Before selecting a database, the project MUST inventory each record type, owner, purpose, sensitivity, read/write path, consistency requirement, retention, scale, availability, backup, and offline requirement..
- **DATA-01.02 — Distinguish durable business state from cache entries, inference payloads.** The project MUST distinguish durable business state from cache entries, inference payloads, logs, telemetry, model bytes, and temporary jobs. Persist only data with an approved product need.
- **DATA-01.03 — Compare embedded and server databases against the actual local.** The project MUST compare embedded and server databases against the actual local, hosted, and multi-instance profiles. The project MUST also record operations burden, failure modes, encryption, licensing, migration support, backup/restore, and deployment requirements in a decision record.
- **DATA-01.04 — Make a database a dependency of the minimal local.** The project MUST NOT make a database a dependency of the minimal local engine when that profile has no durable account or hosted-management state.
- **DATA-01.05 — Define data classification, access control, deletion, retention, and export.** The project MUST define data classification, access control, deletion, retention, and export before storing personal, authentication, license, or audit data.

**Rule document:** [rules/01-data-inventory-and-database-selection.md](rules/01-data-inventory-and-database-selection.md)

**Enforcement:** [tests/test_01_data_inventory_and_database_selection.py](tests/test_01_data_inventory_and_database_selection.py)

**Prohibited conditions:**

- The project MUST NOT add a database because a feature might need one later
- The project MUST NOT store raw prompts, uploaded media, or credentials by default
- The project MUST NOT assume a database choice fits both offline single-node use and hosted scale without evidence
### DATA-02 — Schema migrations, backups, and integrity

**Objective.** These controls govern **schema migrations, backups, and integrity**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-032–RP-034, SO-033

**Normative requirements:**

- **DATA-02.01 — Version every persistent schema.** The project MUST version every persistent schema. Migrations are deterministic, ordered, repeatable only when explicitly safe, and validated before they affect production data.
- **DATA-02.02 — Use transactions or an equivalent safe migration strategy.** The project MUST use transactions or an equivalent safe migration strategy. The project MUST also preserve constraints and invariants. The project MUST also define forward-recovery or rollback behavior for partially applied changes.
- **DATA-02.03 — Encrypt sensitive data in transit and at rest according.** The project MUST encrypt sensitive data in transit and at rest according to the deployment threat model. The project MUST also enforce ownership and authorization at every read/write boundary.
- **DATA-02.04 — Document backup scope, frequency, retention, encryption, access control, recovery.** The project MUST document backup scope, frequency, retention, encryption, access control, recovery point, and recovery time objectives. The project MUST also test restoration from backup before production readiness.
- **DATA-02.05 — Define deletion and retention behavior for accounts, credentials, audit.** The project MUST define deletion and retention behavior for accounts, credentials, audit data, registry records, and user data. Propagate deletion to replicas and backups according to approved retention rules.
- **DATA-02.06 — Monitor database health, saturation, connection pools, migration status.** The project MUST monitor database health, saturation, connection pools, migration status, and backup freshness without exposing row contents or secrets.

**Rule document:** [rules/02-schema-migrations-backups-and-integrity.md](rules/02-schema-migrations-backups-and-integrity.md)

**Enforcement:** [tests/test_02_schema_migrations_backups_and_integrity.py](tests/test_02_schema_migrations_backups_and_integrity.py)

**Prohibited conditions:**

- The project MUST NOT run destructive migrations without a backup and recovery plan
- The project MUST NOT claim backup readiness based solely on successful backup creation
- The project MUST NOT log SQL parameters or row contents when they can contain secrets or personal data
### DATA-03 — Data classification, retention, and deletion

**Objective.** This control defines the intended outcome for **data classification, retention, and deletion** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-032–RP-034, SO-004, SO-021, SO-033

**Normative requirements:**

- **DATA-03.01 — Every persistent record category MUST identify owner, purpose….** **Requirement:** Every persistent record category MUST identify owner, purpose, sensitivity, source, users/roles allowed to read or mutate, retention trigger, deletion method, backup coverage, and whether it is required for local inference.
- **DATA-03.02 — Inference prompts, uploads, outputs, and intermediate….** **Requirement:** Inference prompts, uploads, outputs, and intermediate tensors MUST remain transient by default. Any persistence MUST be an explicit feature with disclosure, scope, retention, access, deletion, backup, and legal basis decisions.
- **DATA-03.03 — Deletion MUST cover primary storage, indexes, caches….** **Requirement:** Deletion MUST cover primary storage, indexes, caches, derived records, exports, and backups according to a documented retention schedule; backup copies MUST expire within a stated period or be cryptographically rendered inaccessible.
- **DATA-03.04 — Encryption at rest MUST be selected according to data….** **Requirement:** Encryption at rest MUST be selected according to data classification, threat model, deployment capabilities, key ownership, recovery, and performance impact. Key loss and rotation consequences MUST be documented.
- **DATA-03.05 — Data export MUST preserve integrity and clearly state schema/version….** **Requirement:** Data export MUST preserve integrity and clearly state schema/version, included record categories, redactions, and re-import compatibility. Export access MUST be authorized and audited when records are sensitive.
- **DATA-03.06 — Retention jobs MUST be idempotent, bounded, observable….** **Requirement:** Retention jobs MUST be idempotent, bounded, observable, and safe under restart. Failed deletion MUST be surfaced as an operational/security finding rather than silently retried forever.
- **DATA-03.07 — Local no-persistence profiles MUST not initialize a database….** **Requirement:** Local no-persistence profiles MUST not initialize a database or write inference content to disk merely for telemetry or debugging.

**Rule document:** [rules/03-data-classification-retention-and-deletion.md](rules/03-data-classification-retention-and-deletion.md)

**Enforcement:** [tests/test_03_data_classification_retention_and_deletion.py](tests/test_03_data_classification_retention_and_deletion.py)

**Prohibited conditions:**

- Do not retain sensitive payloads because they are convenient for reproducing bugs.
- Do not claim deletion until derived copies and backup lifecycle have been considered.
### DATA-04 — Consistency, transactions, concurrency, and integrity

**Objective.** This control defines the intended outcome for **consistency, transactions, concurrency, and integrity** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-032–RP-034, SO-031, SO-033

**Normative requirements:**

- **DATA-04.01 — Each persistent operation MUST state its atomicity and consistency….** **Requirement:** Each persistent operation MUST state its atomicity and consistency requirement, transaction boundary, conflict behavior, and retry semantics. Multi-record invariants MUST be enforced in the database transaction or a documented equivalent.
- **DATA-04.02 — Concurrent writes MUST have explicit isolation/version semantics. Lost….** **Requirement:** Concurrent writes MUST have explicit isolation/version semantics. Lost updates MUST be prevented with transactions, compare-and-swap/version columns, or another verified mechanism where last-write-wins is not acceptable.
- **DATA-04.03 — Constraints that protect ownership, uniqueness, referential integrity….** **Requirement:** Constraints that protect ownership, uniqueness, referential integrity, and valid state MUST be enforced at the durable boundary, not only by request validation.
- **DATA-04.04 — Idempotent writes MUST define duplicate identity and retention….** **Requirement:** Idempotent writes MUST define duplicate identity and retention; non-idempotent operations MUST use transactionally recorded deduplication state before retry is allowed.
- **DATA-04.05 — Database connection pools, lock waits, statement execution….** **Requirement:** Database connection pools, lock waits, statement execution, and retries MUST be bounded. Deadlocks and busy/serialization failures MUST be classified and retried only when the transaction is safe to replay.
- **DATA-04.06 — Registry/config changes MUST validate a candidate, persist it….** **Requirement:** Registry/config changes MUST validate a candidate, persist it with an immutable version or audit record, and publish it atomically; readers MUST observe a complete prior or new version, never a partial mixture.
- **DATA-04.07 — Integrity checks MUST detect corruption, schema mismatch….** **Requirement:** Integrity checks MUST detect corruption, schema mismatch, missing required indexes/constraints, and failed migrations before the service reports persistence readiness.

**Rule document:** [rules/04-consistency-transactions-concurrency-and-integrity.md](rules/04-consistency-transactions-concurrency-and-integrity.md)

**Enforcement:** [tests/test_04_consistency_transactions_concurrency_and_integrity.py](tests/test_04_consistency_transactions_concurrency_and_integrity.py)

**Prohibited conditions:**

- Do not hold transactions open across long model inference or unbounded network operations.
- Do not treat successful in-memory mutation as durable commit when the contract promises persistence.
### DATA-05 — Schema migration and recovery operations

**Objective.** This control defines the intended outcome for **schema migration and recovery operations** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-003, RP-033–RP-034, SO-031–SO-033

**Normative requirements:**

- **DATA-05.01 — Every schema change MUST have a versioned, ordered….** **Requirement:** Every schema change MUST have a versioned, ordered migration and an explicit compatibility window between application and schema versions.
- **DATA-05.02 — Migrations MUST be deterministic and safe to resume….** **Requirement:** Migrations MUST be deterministic and safe to resume or fail visibly. Destructive changes MUST use expand/migrate/contract or an equivalent staged strategy when older binaries or rollback can still access the data.
- **DATA-05.03 — Before applying a destructive or irreversible migration….** **Requirement:** Before applying a destructive or irreversible migration, the system MUST verify required backup/snapshot evidence or have a tested forward-recovery path; the policy MUST state when maintenance mode is required.
- **DATA-05.04 — Migration execution MUST be serialized across instances and protected….** **Requirement:** Migration execution MUST be serialized across instances and protected against concurrent startup. Record migration identity, start/end, result, and failure details without exposing sensitive row content.
- **DATA-05.05 — Backup procedures MUST state consistency method, scope….** **Requirement:** Backup procedures MUST state consistency method, scope, encryption, key access, retention, RPO/RTO, storage independence, and version compatibility.
- **DATA-05.06 — Restore tests MUST use isolated environments, validate schema….** **Requirement:** Restore tests MUST use isolated environments, validate schema and application startup, verify representative records and constraints, and measure achieved recovery objectives.
- **DATA-05.07 — If rollback is impossible, release procedure MUST declare….** **Requirement:** If rollback is impossible, release procedure MUST declare forward-only migration status and provide a tested recovery plan before deployment.

**Rule document:** [rules/05-schema-migration-and-recovery-operations.md](rules/05-schema-migration-and-recovery-operations.md)

**Enforcement:** [tests/test_05_schema_migration_and_recovery_operations.py](tests/test_05_schema_migration_and_recovery_operations.py)

**Prohibited conditions:**

- Do not delete the only compatible backup before confirming the migrated system is healthy.
- Do not assume copying a live database file produces a consistent backup.
### DATA-06 — Database logical and physical design

**Objective.** Design persistent data structures from approved product behavior, invariants, access patterns, and operational constraints so that correctness is enforced at the storage boundary and the design can evolve safely.

**Requirements traced:** RP-032–RP-035, SO-004, SO-021, SO-033, PDL-006–PDL-008

**Normative requirements:**

- **DATA-06.02 — Model concepts and invariants before storage layout.** Produce a logical model of entities/value objects, identity, relationships, cardinality, ownership, lifecycle states, and invariants. Define terminology and distinguish stable identity from mutable display attributes. Resolve whether a relationship is one-to-one, one-to-many, or many-to-many and who owns deletion. Map invariants to enforcement points; correctness-critical uniqueness, referential integrity, valid ranges, and required values MUST be enforced by the authoritative store where the selected technology supports it, with application checks as defense in depth.
- **DATA-06.03 — Select representation and normalization deliberately.** Map the logical model to the selected database’s types and constraints. Prefer normalized authoritative data that avoids update anomalies; denormalize only for a measured read/latency or reporting need, document the source of truth, refresh/consistency model, and repair procedure. Choose JSON/document fields only for genuinely variable or opaque substructures with defined validation and query requirements; do not use them to evade a stable relational model. For each field define nullability, default semantics, units, precision, timezone, encoding, maximum size, and invalid-value behavior.
- **DATA-06.04 — Choose identifiers, time, and deletion semantics explicitly.** Define primary key generation, uniqueness scope, external/public identifier exposure, and collision behavior. Store instants in an unambiguous UTC representation while preserving a local timezone separately when business meaning depends on it. Define soft-delete versus hard-delete rationale, tombstone visibility, uniqueness after deletion, cascading effects, retention, legal holds where applicable, and backup/replica propagation. Never imply deletion from active views while leaving uncontrolled accessible copies.
- **DATA-06.05 — Derive indexes and queries from access paths.** For each important read/write path specify query shape, filters, ordering, pagination, expected cardinality, frequency, and latency/throughput target. Add indexes to support demonstrated access patterns and uniqueness/integrity requirements; assess write amplification, storage, lock contention, and maintenance cost. Avoid speculative indexes and unbounded scans. Use query plans and representative data distributions before asserting performance. Define pagination stability and cursor behavior for changing datasets.
- **DATA-06.06 — Define transaction and concurrency boundaries.** Identify operations that MUST be atomic and their consistency/isolation requirements. Specify behavior under concurrent updates, retries, duplicate requests, partial failure, timeouts, and process interruption. Use database transactions for related state changes where supported; otherwise define an idempotent recovery protocol. Avoid holding locks across network calls or long inference work. Define optimistic/pessimistic concurrency controls and conflict outcomes where simultaneous edits are possible.
- **DATA-06.07 — Design tenant and authorization boundaries in data access.** If multiple users, tenants, or roles share a store, define the ownership key and isolation boundary in the logical model. Every query and mutation MUST enforce the authorized scope at the repository/service boundary; do not trust client-supplied tenant or owner identifiers. Evaluate row-level policies, separate schemas/databases, or application filtering against threat model, operational burden, backup/restore, and migration needs. Test cross-tenant access failures.
- **DATA-06.08 — Assess lifecycle and operational cost before approval.** Before schema implementation, review model and representative queries with product, application, security/privacy, and operations owners. Document growth assumptions, partitioning/archival needs, backup/restore and recovery targets, migration strategy, encryption and key handling, observability, licensing, portability, and exit path. Do not introduce partitioning or distributed database complexity without a measured scale/availability need and an operating owner.
- **DATA-06.09 — Verify the design against representative data and failure cases.** Create migration-backed test fixtures with realistic cardinality and edge cases. Verify constraints, indexes, query plans, transaction outcomes, concurrent writes, retention/deletion, authorization isolation, backup restore, and supported upgrade paths. Use generated/synthetic data where production data is unnecessary. Keep schema diagrams and data dictionaries synchronized with migrations.

**Rule document:** [rules/06-database-logical-and-physical-design.md](rules/06-database-logical-and-physical-design.md)

**Enforcement:** [tests/test_06_database_logical_and_physical_design.py](tests/test_06_database_logical_and_physical_design.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/persistence
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
