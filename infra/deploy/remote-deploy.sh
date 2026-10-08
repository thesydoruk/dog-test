#!/usr/bin/env bash
# Runs ON the target host (over SSH from the CD workflow, or by hand) from the directory that
# holds docker-compose.prod.yml.
#
#   IMAGE_TAG       tag to deploy (required)
#   IMAGE_OWNER     GHCR owner, lower-case (default thesydoruk)
#   WEB_PORT        host port (default 3060)
#   REGISTRY_USER / REGISTRY_TOKEN   optional; only needed while the GHCR package is private
#
# Pulls the image, recreates the container, waits for its health check and prunes old images.
set -euo pipefail

: "${IMAGE_TAG:?IMAGE_TAG is required}"
export IMAGE_TAG IMAGE_OWNER="${IMAGE_OWNER:-thesydoruk}" WEB_PORT="${WEB_PORT:-3060}"
COMPOSE=(docker compose -f docker-compose.prod.yml)

if [ -n "${REGISTRY_TOKEN:-}" ]; then
  # The token only lives for the workflow run; nothing long-lived is stored on the host.
  echo "$REGISTRY_TOKEN" | docker login ghcr.io -u "${REGISTRY_USER:?}" --password-stdin
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
fi

"${COMPOSE[@]}" pull web
"${COMPOSE[@]}" up -d --no-build web

# Wait up to a minute for nginx to report healthy.
for _ in $(seq 1 30); do
  status=$("${COMPOSE[@]}" ps --format '{{.Health}}' web 2>/dev/null || true)
  if [ "$status" = "healthy" ]; then
    echo "Deployed dog-viewer ${IMAGE_TAG} on port ${WEB_PORT}"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

echo "dog-viewer did not become healthy after deploying ${IMAGE_TAG}" >&2
"${COMPOSE[@]}" logs --tail 50 web >&2
exit 1
