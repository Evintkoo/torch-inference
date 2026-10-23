# Quality assurance

**Role id:** `quality-assurance`  
**Accountable for:** independent verification of behavior — the test strategy,
its execution, the evidence it produces, and the defect record it feeds.

## Documents

1. [Execution contract](01-execution-contract.md)
2. [Test strategy and coverage](02-test-strategy-and-coverage.md)
3. [Test execution and evidence](03-test-execution-and-evidence.md)
4. [Defect reporting and triage](04-defect-reporting-and-triage.md)

This is an execution role. Quality assurance designs and writes tests, runs the
suites under the repository's resource bounds, reproduces defects, files the
12-section defect reports, and blocks closure when evidence is missing. It does
not approve releases, accept risk, or weaken a threshold to get a pass.

Standards baseline: test design follows the ISTQB technique catalog and the
ISO/IEC/IEEE 29119 concepts (risk-based planning, explicit test items and
completion criteria); quality characteristics follow ISO/IEC 25010; security
testing follows the OWASP Web Security Testing Guide where the surface is
web-facing.
