#!/bin/bash
# deploy.sh — Run on the server to deploy the full Yomax stack
# (Next.js frontend + Go backend + PostgreSQL + Nginx)
set -e

# ─── 1. Install Docker if missing ─────────────────────────────────
if ! command -v docker &>/dev/null; then
    echo "→ Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! docker compose version &>/dev/null; then
    echo "→ Installing Docker Compose plugin..."
    apt-get update -y
    apt-get install -y docker-compose-plugin
fi

# ─── 2. Create .env if missing ────────────────────────────────────
if [ ! -f .env ]; then
    echo "→ Creating .env from .env.production.example..."
    cp .env.production.example .env
    echo ""
    echo "⚠️  Edit .env and set real values, then re-run this script."
    echo "   Required: SECRET, DB_PASSWORD, NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL"
    echo ""
    exit 1
fi

# ─── 3. Also ensure fixparts-sync/.env exists ─────────────────────
if [ ! -f fixparts-sync/.env ]; then
    echo "→ Creating fixparts-sync/.env from example..."
    cp fixparts-sync/.env.example fixparts-sync/.env
    echo ""
    echo "⚠️  Edit fixparts-sync/.env and set DB_PASSWORD and IMAGE_BASE_URL, then re-run."
    echo ""
    exit 1
fi

# ─── 4. Stop old backend-only stack if running ────────────────────
if docker ps -q --filter "name=fixparts-nginx" | grep -q .; then
    echo "→ Stopping old backend-only stack..."
    cd fixparts-sync
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    cd ..
fi

# ─── 5. Build and start full stack ────────────────────────────────
echo "→ Building and starting full stack (this may take a few minutes)..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "✅ Deployed. Services:"
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo YOUR_SERVER_IP)"
echo "API:      http://$(curl -s ifconfig.me 2>/dev/null || echo YOUR_SERVER_IP)/api/brands"
echo ""
echo "Trigger first sync:"
echo "  curl -X POST http://localhost/api/sync/trigger -H 'X-API-Key: \$(grep API_KEY fixparts-sync/.env | cut -d= -f2)'"
echo ""
echo "Logs: docker compose -f docker-compose.prod.yml logs -f"
