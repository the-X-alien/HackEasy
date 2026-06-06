#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# vercel_deploy.sh — Idempotent Vercel deployment script
# Usage: ./vercel_deploy.sh [--prod]
# ============================================================

DEPLOY_ENV="${1:---prod}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Vercel Deploy ==="
echo "Project: $PROJECT_DIR"
echo "Target:  $DEPLOY_ENV"

# Step 1: Check / install Vercel CLI
if command -v vercel &>/dev/null; then
    echo "[OK] Vercel CLI found: $(vercel --version)"
else
    echo "[...] Vercel CLI not found. Installing..."
    if command -v npm &>/dev/null; then
        npm install -g vercel
        echo "[OK] Vercel CLI installed."
    else
        echo "[FAIL] npm not found. Install Node.js first: https://nodejs.org"
        exit 1
    fi
fi

# Step 2: Load VERCEL_TOKEN from .env if present
ENV_FILE="$PROJECT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

if [ -n "${VERCEL_TOKEN:-}" ]; then
    echo "[OK] Using VERCEL_TOKEN from .env"
    export VERCEL_TOKEN="$VERCEL_TOKEN"
fi

# Step 3: Deploy
echo "[...] Deploying..."
cd "$PROJECT_DIR"

if vercel "$DEPLOY_ENV" --yes 2>&1; then
    echo ""
    echo "=== Deployment successful ==="
    vercel ls 2>/dev/null | head -5 || true
    echo ""
    echo "Deployed to: https://$(vercel ls 2>/dev/null | grep -oP '[a-z0-9-]+\.vercel\.app' | head -1)"
    exit 0
else
    EXIT_CODE=$?
    echo ""
    echo "[FAIL] Deployment failed (exit code: $EXIT_CODE)."
    echo ""
    echo "--- Troubleshooting ---"
    echo "1. Run 'vercel login' to authenticate manually."
    echo "2. Verify VERCEL_TOKEN is set in .env or as an environment variable."
    echo "3. Ensure vercel.json or next.config.js exists in the project root."
    echo "4. Check for build errors with 'vercel build'."
    echo ""
    echo "--- Manual Deploy Instructions ---"
    echo "  vercel login"
    echo "  vercel --prod"
    echo ""
    exit $EXIT_CODE
fi
