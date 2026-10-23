# Engineer reliability, security, and observability

**Role:** engineer  
**Document:** 04 of 05

These are entry conditions for review, not aspirations. A change that skips an
applicable obligation states why in the ticket, and the reviewer records it.

## Reliability

- Every network call has a timeout, set at the boundary where the business
  deadline is known.
- Retries are bounded, exponential with jitter, and only for idempotent
  operations — or carry an idempotency key so they are safe.
- Failure of a dependency degrades the feature it serves; it does not take the
  process down or block unrelated work. Backpressure beats queue growth.
- Graceful shutdown drains or cancels in-flight work deterministically and is
  tested, not assumed.
- Time, randomness, and identifiers come from injectable sources so tests are
  deterministic.

## Security

Hold every change to the OWASP Top 10 categories that can apply, and to
OWASP ASVS Level 2 for anything touching authentication, authorization, or
session handling:

- Input is validated at the trust boundary — type, size, range, format —
  before allocation, parsing, or execution.
- Queries are parameterized; paths are joined, never concatenated; commands
  take argument vectors, never shell strings.
- Authorization is enforced where the resource lives, not only in a wrapper,
  UI, or gateway; deny by default.
- Secrets come from configuration or a vault, never code, test fixtures, or
  logs; accidental capture is redacted at the sink.
- Crypto is library calls with library defaults; nothing hand-rolled.
- Dependencies: minimal, pinned via the lockfile, license-compatible, and
  passing the audit step (`cargo audit` / `uv audit` equivalent) — a new
  dependency is justified in the ticket.

## Observability

- The new failure mode is observable: a structured log at warn/error with the
  identifying fields, or a metric — decided in the design note.
- Health and readiness reflect the new dependency if it can take the service
  down.
- Correlation: a request id (or equivalent) crosses the boundaries the change
  touches.
- Log volume is bounded: no per-item logging of unbounded collections.

## Data integrity

- Multi-step writes are transactional, or the compensating path is named.
- Migrations are reversible or carry a documented rollback; destructive
  migrations require an owner decision on the ticket.
- Retention and deletion respect the repository's privacy posture: personal
  data has a lifetime.

## Performance claims

Any performance claim in the ticket carries a dated measurement: revision,
hardware class, warm-up, repetitions, and the distribution — not a single
best-case number. Without a measurement, write "unverified", never a number.
