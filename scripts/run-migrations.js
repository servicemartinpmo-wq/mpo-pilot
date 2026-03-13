#!/usr/bin/env node
/**
 * run-migrations.js
 * Applies pending Supabase SQL migrations in order using the Management API.
 * Tracks applied migrations in .supabase-applied-migrations.json (gitignored).
 * Safe to run multiple times — only applies new migrations.
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
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
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

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    console.log(`[migrations] Applying ${file}…`);
    try {
      await runMigration(sql);
      applied.add(file);
      writeFileSync(STATE_FILE, JSON.stringify([...applied], null, 2));
      console.log(`[migrations] ✓ ${file} applied.`);
    } catch (err) {
      console.error(`[migrations] ✗ ${file} failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("[migrations] Done.");
}

main();
