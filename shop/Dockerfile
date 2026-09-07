# Backend URL baked into the compiled JS/APK via --dart-define (see
# lib/core/constants/api_endpoints.dart). Override per-build with
# `docker build --build-arg API_BASE_URL=...` — docker-compose.yml wires
# this to the root .env's API_BASE_URL for the *-apk-builder service.
ARG API_BASE_URL=http://localhost:5000/api/v1

# ─── Stage 1: Flutter base (deps + source) ──────────────────
FROM ghcr.io/cirruslabs/flutter:stable AS flutter-base

WORKDIR /app

COPY pubspec.* ./
RUN flutter pub get

COPY . .

# ─── Stage 2a: Web build ─────────────────────────────────────
FROM flutter-base AS web-build
ARG API_BASE_URL

RUN flutter build web --release --dart-define=API_BASE_URL=${API_BASE_URL}

# ─── Stage 2b: APK build ─────────────────────────────────────
# Build-only stage, not part of the always-on service.
# Run it explicitly, e.g.:
#   docker compose --profile build run --rm shop-apk-builder
FROM flutter-base AS apk-build
ARG API_BASE_URL

RUN flutter build apk --release --dart-define=API_BASE_URL=${API_BASE_URL}

CMD ["sh", "-c", "mkdir -p /export && cp -v build/app/outputs/flutter-apk/*.apk /export/"]

# ─── Stage 3: Web runtime (nginx) ────────────────────────────
FROM nginx:alpine AS web

COPY --from=web-build /app/build/web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
