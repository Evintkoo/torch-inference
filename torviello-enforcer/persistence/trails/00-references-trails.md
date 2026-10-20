# Reference Trails: Persistence and data lifecycle

**Development stage:** CDD

This document records the authoritative sources used to develop this domain. The numbered rule documents state the project obligations directly; source documents inform their scope and verification. A reference is not a claim of certification or compliance.

## Control authoring and assessment basis

The project control format uses outcome-focused, independently assessable requirements informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final). Assessment procedures use the examine, interview, and test method model from [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final), tailored to repository evidence and software behavior. Normative terms follow [IETF BCP 14 (RFC 2119 and RFC 8174)](https://www.rfc-editor.org/info/bcp14/). These sources define how project rules are written and assessed; their inclusion does not claim adoption of a NIST baseline or certification.

## Sources

### R1 — OWASP ASVS 5.0.0

[OWASP ASVS 5.0.0](https://owasp.org/projects/asvs)

### R2 — NIST SSDF SP 800-218

[NIST SSDF SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final)

### R3 — SQLite Transactions

[SQLite Transactions](https://sqlite.org/lang_transaction.html)

### R4 — PostgreSQL Transactions

[PostgreSQL Transactions](https://www.postgresql.org/docs/current/transactions.html)

### R5 — PostgreSQL Constraints

[PostgreSQL constraints documentation](https://www.postgresql.org/docs/current/ddl-constraints.html). Used for examples of storage-enforced keys, uniqueness, referential integrity, and checks; these are principles to apply using the chosen database, not a mandate to select PostgreSQL.

### R6 — PostgreSQL Indexes

[PostgreSQL indexes documentation](https://www.postgresql.org/docs/current/indexes.html). Used for query-driven index design and its write/storage tradeoffs; validate against the selected engine and deployed version.

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-data-inventory-and-database-selection.md](../rules/01-data-inventory-and-database-selection.md) | RP-032–RP-034, SO-033 | R1,R2 |
| [02-schema-migrations-backups-and-integrity.md](../rules/02-schema-migrations-backups-and-integrity.md) | RP-032–RP-034, SO-033 | R1,R2 |
| [03-data-classification-retention-and-deletion.md](../rules/03-data-classification-retention-and-deletion.md) | RP-032–RP-034, SO-004, SO-021, SO-033 | R1,R2 |
| [04-consistency-transactions-concurrency-and-integrity.md](../rules/04-consistency-transactions-concurrency-and-integrity.md) | RP-032–RP-034, SO-031, SO-033 | R1,R3 |
| [05-schema-migration-and-recovery-operations.md](../rules/05-schema-migration-and-recovery-operations.md) | RP-003, RP-033–RP-034, SO-031–SO-033 | R1,R3 |
| [06-database-logical-and-physical-design.md](../rules/06-database-logical-and-physical-design.md) | RP-032–RP-035, SO-004, SO-021, SO-033, PDL-006–PDL-008 | R1–R6 |


## Lifecycle coverage map (assessed status)

This map is a rules-text coverage inventory only; it does not establish that product implementation conforms. Each unresolved row is an explicit gap under GOV-03.06. Before claiming coverage, the domain owner records the scenario/risk and relevant requirement IDs from the rule mapping above, performs a documented review and representative ordinary plus adverse-case dry-run, and links evidence in the [governance assurance register](../../governance/assurance-register.md). Interim safeguard: apply all clearly applicable controls and do not pass a release-critical gate while applicability remains unresolved.

| Lifecycle area | Disposition | Coverage rationale/status | Affected requirements/scenarios | Interim safeguard | Owner | Review trigger |
|---|---|---|---|---|---|---|
| Organizational governance | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Product intent | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| System architecture | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Component/module design | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Interfaces | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Implementation | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Verification | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Release | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Operation | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Incident response | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Retirement | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |

## Maintenance

Use stable versioned identifiers when a source changes its numbering. Review these references at least once per major release and whenever a referenced standard publishes a new stable version. Update the numbered rule text and this trail together; do not copy large portions of external standards.
