# Database logical and physical design

**Control family:** persistence  
**Control document:** DATA-06  
**Requirement trace:** RP-032–RP-035, SO-004, SO-021, SO-033, PDL-006–PDL-008  
**Status:** Normative project control

## Control objective

Design persistent data structures from approved product behavior, invariants, access patterns, and operational constraints so that correctness is enforced at the storage boundary and the design can evolve safely.

## Applicability

Applies to new persistent stores, tables, collections, fields, indexes, views, queries, transactions, and materialized/derived data, as well as material changes to existing schemas. Apply security, privacy, API, architecture, migration, backup, and operations controls in parallel.

## Normative requirements

### DATA-06.01 — Establish data needs before drawing tables

The designer MUST start from approved use cases and the data inventory. For each record type identify authoritative owner, purpose, source, consumers, sensitivity, lifecycle, retention/deletion, scale, consistency, availability, offline and replication needs. Separate business state from cache, telemetry, inference payloads, model bytes, and derived data. Do not persist information solely for speculative future use.

### DATA-06.02 — Model concepts and invariants before storage layout

Produce a logical model of entities/value objects, identity, relationships, cardinality, ownership, lifecycle states, and invariants. Define terminology and distinguish stable identity from mutable display attributes. Resolve whether a relationship is one-to-one, one-to-many, or many-to-many and who owns deletion. Map invariants to enforcement points; correctness-critical uniqueness, referential integrity, valid ranges, and required values MUST be enforced by the authoritative store where the selected technology supports it, with application checks as defense in depth.

### DATA-06.03 — Select representation and normalization deliberately

Map the logical model to the selected database’s types and constraints. Prefer normalized authoritative data that avoids update anomalies; denormalize only for a measured read/latency or reporting need, document the source of truth, refresh/consistency model, and repair procedure. Choose JSON/document fields only for genuinely variable or opaque substructures with defined validation and query requirements; do not use them to evade a stable relational model. For each field define nullability, default semantics, units, precision, timezone, encoding, maximum size, and invalid-value behavior.

### DATA-06.04 — Choose identifiers, time, and deletion semantics explicitly

Define primary key generation, uniqueness scope, external/public identifier exposure, and collision behavior. Store instants in an unambiguous UTC representation while preserving a local timezone separately when business meaning depends on it. Define soft-delete versus hard-delete rationale, tombstone visibility, uniqueness after deletion, cascading effects, retention, legal holds where applicable, and backup/replica propagation. Never imply deletion from active views while leaving uncontrolled accessible copies.

### DATA-06.05 — Derive indexes and queries from access paths

For each important read/write path specify query shape, filters, ordering, pagination, expected cardinality, frequency, and latency/throughput target. Add indexes to support demonstrated access patterns and uniqueness/integrity requirements; assess write amplification, storage, lock contention, and maintenance cost. Avoid speculative indexes and unbounded scans. Use query plans and representative data distributions before asserting performance. Define pagination stability and cursor behavior for changing datasets.

### DATA-06.06 — Define transaction and concurrency boundaries

Identify operations that MUST be atomic and their consistency/isolation requirements. Specify behavior under concurrent updates, retries, duplicate requests, partial failure, timeouts, and process interruption. Use database transactions for related state changes where supported; otherwise define an idempotent recovery protocol. Avoid holding locks across network calls or long inference work. Define optimistic/pessimistic concurrency controls and conflict outcomes where simultaneous edits are possible.

### DATA-06.07 — Design tenant and authorization boundaries in data access

If multiple users, tenants, or roles share a store, define the ownership key and isolation boundary in the logical model. Every query and mutation MUST enforce the authorized scope at the repository/service boundary; do not trust client-supplied tenant or owner identifiers. Evaluate row-level policies, separate schemas/databases, or application filtering against threat model, operational burden, backup/restore, and migration needs. Test cross-tenant access failures.

### DATA-06.08 — Assess lifecycle and operational cost before approval

Before schema implementation, review model and representative queries with product, application, security/privacy, and operations owners. Document growth assumptions, partitioning/archival needs, backup/restore and recovery targets, migration strategy, encryption and key handling, observability, licensing, portability, and exit path. Do not introduce partitioning or distributed database complexity without a measured scale/availability need and an operating owner.

### DATA-06.09 — Verify the design against representative data and failure cases

Create migration-backed test fixtures with realistic cardinality and edge cases. Verify constraints, indexes, query plans, transaction outcomes, concurrent writes, retention/deletion, authorization isolation, backup restore, and supported upgrade paths. Use generated/synthetic data where production data is unnecessary. Keep schema diagrams and data dictionaries synchronized with migrations.

## Prohibited conditions

- Choosing a database or schema before defining data ownership, access, and lifecycle needs.
- Relying exclusively on application code for an invariant that the storage engine can enforce.
- Storing secrets, raw prompts, or personal data without a requirement, classification, and access/retention design.
- Adding indexes or denormalized copies without a query or operational rationale.
- Making a migration design without a recovery strategy for real data.

## Design procedure

1. Enumerate use cases and data records; classify each field and assign an owner.
2. Draw the conceptual/logical entities and relationships; write invariants and lifecycle transitions.
3. Select the persistence technology from DATA-01 evidence, then map types, constraints, keys, and relationships.
4. List critical query patterns and transaction units; derive indexes and concurrency semantics.
5. Analyze authorization, retention, export/deletion, migrations, backup, restore, scale, and failure modes.
6. Review with affected owners; prototype and measure uncertain query or scale claims.
7. Baseline the schema, data dictionary, migration, verification plan, and rollback/forward-recovery before implementation.

## Assessment procedure

**Examine:** logical/physical model, inventory, query catalog, constraints, explain plans, migration and lifecycle design, threat/privacy analysis, ownership review.

**Interview:** ask the data owner to explain source of truth, invariants, deletion, and consistency; ask operators to explain restore and migration recovery.

**Test:** load representative synthetic volumes; exercise duplicate/invalid values, concurrent changes, failed transactions, access isolation, migration interruption, and restore. Compare measured query behavior with explicit targets.

## Assessment determination

Pass when the model is traceable to approved needs, invariants and access boundaries are enforced, and lifecycle/recovery claims have evidence. Fail when ownership, authorization, deletion, concurrency, or recovery semantics are ambiguous or untested. Not applicable requires scope and rationale.

## Required evidence

Data inventory; logical model/data dictionary; query and transaction catalog; physical schema and index rationale; decision/review record; migrations; test and restore evidence; unresolved design decisions with owners.

## Exceptions and nonconformance

A MUST exception requires the accountable system/data owner and applicable security/privacy/operations authority. Record affected records/profiles, risk, compensating controls, migration/remediation, owner, and expiry. An exception cannot waive legal or contractual data obligations.

## Reference trail

Sources R1–R6 are listed in [00-references-trails.md](../trails/00-references-trails.md).
