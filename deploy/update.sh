#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/riple}"
cd "$APP_DIR"

git pull origin main
npm ci
npm run build
pm2 restart riple
pm2 status
