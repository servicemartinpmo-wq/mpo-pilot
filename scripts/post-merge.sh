#!/bin/bash
# post-merge.sh — runs automatically after every task merge.
# Installs dependencies and validates TypeScript. Safe to run multiple times.
set -e

echo "[post-merge] Installing npm dependencies..."
npm install --legacy-peer-deps

echo "[post-merge] Running TypeScript type-check..."
npx tsc --noEmit

echo "[post-merge] Done."
