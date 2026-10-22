# Monitoring

Copyright (c) 2026 Torviello.

Prometheus scrapes `GET /metrics` every 15 seconds from
`monitoring/prometheus/prometheus.yml`. The endpoint has no application auth;
bind it to a private interface or restrict access at the network or reverse
proxy layer. Alerts live in `monitoring/prometheus/alerts.yml`.

Exported series:

- `http_requests_total{method,path,status}` counts completed requests. `path`
  is the matched route template, so model identifiers do not create
  unbounded label cardinality.
- `request_duration_seconds{method,path}` is a histogram with buckets from 5 ms
  to 10 s. The p95 latency alert uses this series.
- `http_requests_in_flight` is the number of requests currently being served.
- No Go or process collectors are registered; the engine exports only these
  application series.

Run a local pair with:

```sh
prometheus --config.file=monitoring/prometheus/prometheus.yml
```
