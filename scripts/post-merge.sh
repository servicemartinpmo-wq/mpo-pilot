#!/bin/bash
# post-merge.sh — runs automatically after every task merge.
# Installs dependencies, runs Supabase migrations, and validates TypeScript.
# Safe to run multiple times — migrations are tracked and idempotent.
set -e

echo "[post-merge] Installing npm dependencies..."
npm install --legacy-peer-deps

echo "[post-merge] Running Supabase migrations..."
node scripts/run-migrations.js || echo "[post-merge] Migration step skipped (check credentials)"

echo "[post-merge] Running TypeScript type-check..."
npx tsc --noEmit

echo "[post-merge] Done."
