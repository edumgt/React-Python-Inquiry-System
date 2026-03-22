#!/usr/bin/env bash
# airgap-save.sh
# Run this script on a machine WITH internet access BEFORE moving to an air-gapped environment.
# It builds all Docker images, saves them as tar archives, downloads Python wheels,
# and seeds an npm offline cache so the entire stack can be deployed offline.
#
# Usage:
#   bash scripts/airgap-save.sh
#
# Output:
#   airgap-bundle/images/inquiry-backend.tar
#   airgap-bundle/images/inquiry-frontend.tar
#   airgap-bundle/images/postgres-16-alpine.tar
#   backend/vendor/*.whl   (Python wheels for AIRGAP source rebuild)
#   npm-offline-cache/     (npm cache for AIRGAP source rebuild)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUNDLE_DIR="${ROOT_DIR}/airgap-bundle"
IMAGE_DIR="${BUNDLE_DIR}/images"

# Read versions from Dockerfiles to keep image versions consistent
PYTHON_IMAGE="python:3.12-slim"
NODE_IMAGE="node:22-alpine"

echo "==> [airgap-save] Root: ${ROOT_DIR}"
mkdir -p "${IMAGE_DIR}"

# ── 1. Build Docker images ──────────────────────────────────────────────────
echo "==> [airgap-save] Building Docker images..."
docker compose -f "${ROOT_DIR}/docker-compose.yml" build --no-cache

# ── 2. Save built images ────────────────────────────────────────────────────
echo "==> [airgap-save] Saving backend image..."
docker save inquiry-backend -o "${IMAGE_DIR}/inquiry-backend.tar"

echo "==> [airgap-save] Saving frontend image..."
docker save inquiry-frontend -o "${IMAGE_DIR}/inquiry-frontend.tar"

echo "==> [airgap-save] Pulling and saving postgres:16-alpine..."
docker pull postgres:16-alpine
docker save postgres:16-alpine -o "${IMAGE_DIR}/postgres-16-alpine.tar"

# ── 3. Download Python wheels (matches python:3.12-slim in backend/Dockerfile) ─
echo "==> [airgap-save] Downloading Python wheels into backend/vendor/..."
VENDOR_DIR="${ROOT_DIR}/backend/vendor"
mkdir -p "${VENDOR_DIR}"
docker run --rm \
  -v "${ROOT_DIR}/backend/requirements.txt:/requirements.txt:ro" \
  -v "${VENDOR_DIR}:/vendor" \
  "${PYTHON_IMAGE}" \
  pip download --no-cache-dir -r /requirements.txt -d /vendor

# ── 4. Seed npm offline cache (matches node:22-alpine in Dockerfile.frontend) ─
echo "==> [airgap-save] Seeding npm offline cache into npm-offline-cache/..."
NPM_CACHE_DIR="${ROOT_DIR}/npm-offline-cache"
mkdir -p "${NPM_CACHE_DIR}"
docker run --rm \
  -v "${ROOT_DIR}/package.json:/app/package.json:ro" \
  -v "${ROOT_DIR}/package-lock.json:/app/package-lock.json:ro" \
  -v "${NPM_CACHE_DIR}:/npm-cache" \
  -w /app \
  "${NODE_IMAGE}" \
  sh -c "npm install --cache /npm-cache"

echo ""
echo "==> [airgap-save] Bundle complete."
echo "    Docker images  : ${IMAGE_DIR}/"
echo "    Python wheels  : ${VENDOR_DIR}/"
echo "    npm cache      : ${NPM_CACHE_DIR}/"
echo ""
echo "Transfer the following to the air-gapped machine:"
echo "  • The entire project directory (including airgap-bundle/, backend/vendor/, npm-offline-cache/)"
echo "Then run: bash scripts/airgap-load.sh"
