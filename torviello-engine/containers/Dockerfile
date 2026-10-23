# Copyright (c) 2026 Torviello.
# syntax=docker/dockerfile:1
ARG RUST_IMAGE=rust:1.85-bookworm
ARG RUNTIME_IMAGE=debian:bookworm-slim
FROM ${RUST_IMAGE} AS build
ARG CARGO_FEATURES=engine
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY torviello-engine/services/engine ./torviello-engine/services/engine
RUN cargo build --release --locked --no-default-features --features "${CARGO_FEATURES}"

FROM ${RUNTIME_IMAGE}
ARG CARGO_FEATURES=engine
LABEL org.opencontainers.image.title="torviello-engine" \
      org.opencontainers.image.description="Torviello inference engine (${CARGO_FEATURES} profile)" \
      org.opencontainers.image.licenses="MIT"
RUN groupadd --system torviello \
    && useradd --system --gid torviello --home-dir /opt/torviello --shell /usr/sbin/nologin torviello
WORKDIR /opt/torviello
COPY --from=build /src/target/release/torviello-engine /usr/local/bin/torviello-engine
COPY torviello-engine/config ./config
COPY torviello-engine/services/engine/api/contracts/schema.json ./torviello-engine/services/engine/api/contracts/schema.json
COPY LICENSE NOTICE COMMERCIAL_LICENSE.md /usr/share/doc/torviello/
COPY torviello-engine/services/engine/assets/scalar.LICENSE.txt /usr/share/doc/torviello/scalar.LICENSE.txt
COPY docs/INSTALL.md docs/DEPLOYMENT.md docs/SUPPORTED_PLATFORMS.md ./docs/
RUN mkdir -p /var/lib/torviello && chown -R torviello:torviello /opt/torviello /var/lib/torviello
USER torviello
ENV TORCH_CONFIG=/opt/torviello/config/default.toml \
    TORCH_HOST=127.0.0.1 \
    TORCH_PORT=8000 \
    TORCH_DATABASE_URL=sqlite:///var/lib/torviello/engine.db
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/torviello-engine"]
