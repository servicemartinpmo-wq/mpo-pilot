#!/usr/bin/env node
/**
 * run-migrations.js
 * Applies pending Supabase SQL migrations in order using the Management API.
 * Tracks applied migrations in .supabase-applied-migrations.json (gitignored).
 * Safe to run multiple times — only applies new migrations.
 *
 * "Already exists" errors (42P07, 42710, 42701) are treated as success —
 * the schema is already in place, so we mark the migration applied and move on.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");
const STATE_FILE = join(ROOT, ".supabase-applied-migrations.json");

const PROJECT_REF = process.env.VITE_SUPABASE_PROJECT_ID;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

// Postgres error codes that mean "already exists" — safe to skip
const ALREADY_EXISTS_CODES = ["42P07", "42710", "42701", "42P16", "42000"];

function isAlreadyExistsError(errorText) {
  const body = errorText.toLowerCase();
  return (
    ALREADY_EXISTS_CODES.some((code) => errorText.includes(code)) ||
    body.includes("already exists") ||
    body.includes("duplicate")
  );
}

async function runMigration(sql) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await response.text();
  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
    err.responseText = text;
    throw err;
  }
  return text;
}

async function main() {
  if (!PROJECT_REF || !ACCESS_TOKEN) {
    console.log("[migrations] Missing VITE_SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN — skipping.");
    process.exit(0);
  }

  // Load applied migrations state
  const applied = existsSync(STATE_FILE)
    ? new Set(JSON.parse(readFileSync(STATE_FILE, "utf8")))
    : new Set();

  // Get all migration files sorted by filename
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("[migrations] All migrations already applied.");
    return;
  }

  console.log(`[migrations] ${pending.length} pending migration(s): ${pending.join(", ")}`);

  let successCount = 0;
  let skipCount = 0;

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    console.log(`[migrations] Applying ${file}…`);
    try {
      await runMigration(sql);
      applied.add(file);
      writeFileSync(STATE_FILE, JSON.stringify([...applied], null, 2));
      console.log(`[migrations] ✓ ${file} applied.`);
      successCount++;
    } catch (err) {
      // If schema already exists, mark as applied and continue
      if (isAlreadyExistsError(err.responseText || err.message)) {
        console.log(`[migrations] ↩ ${file} — schema already present, marking as applied.`);
        applied.add(file);
        writeFileSync(STATE_FILE, JSON.stringify([...applied], null, 2));
        skipCount++;
      } else {
        console.error(`[migrations] ✗ ${file} failed: ${err.message}`);
        process.exit(1);
      }
    }
  }

  console.log(`[migrations] Done. ${successCount} applied, ${skipCount} skipped (already existed).`);
}

main();
