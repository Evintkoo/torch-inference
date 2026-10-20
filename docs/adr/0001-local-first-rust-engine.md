# ADR 0001: Local-first Rust engine

## Status

Accepted.

## Context

The engine must run offline on developer laptops and small servers while
exposing a stable HTTP contract to a web console and external clients.

## Decision

Use Rust for the engine core, isolate transport and persistence adapters,
and keep the default bind on loopback. The web console is a separate
TypeScript application. Model files are verified before activation.

## Consequences

The binary has a small footprint and predictable resource limits. Operators
must opt into remote exposure and TLS. Cross-language tests protect the
contract between the Rust engine and the web console.
