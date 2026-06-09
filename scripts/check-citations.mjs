#!/usr/bin/env node
// check-citations.mjs — asserts every citation short-ID referenced from
// sl-atlas/content/*.json is registered in CITATIONS.md at the repo root.
//
// Zero dependencies. Exits non-zero on any unregistered reference.

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CITATIONS_PATH = path.join(ROOT, "CITATIONS.md");
const CONTENT_DIR = path.join(ROOT, "sl-atlas/content");
const NON_CONCEPT = new Set(["schema.json"]);

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
}

// 1. Parse CITATIONS.md and extract every short-ID registered as a "### <id>" header.
const citations = await readFile(CITATIONS_PATH, "utf8");
const registered = new Set();
for (const m of citations.matchAll(/^### ([a-z][a-z0-9-]*[a-z0-9])\s*$/gm)) {
  registered.add(m[1]);
}
if (registered.size === 0) {
  console.error("CITATIONS.md contains no '### <id>' entries.");
  process.exit(2);
}

// 2. Walk every concept JSON and check its `citations` array (if present).
const entries = await readdir(CONTENT_DIR);
const jsonFiles = entries.filter(f => f.endsWith(".json") && !NON_CONCEPT.has(f));

let referenced = 0;
for (const f of jsonFiles) {
  const doc = JSON.parse(await readFile(path.join(CONTENT_DIR, f), "utf8"));
  const cites = Array.isArray(doc.citations) ? doc.citations : [];
  for (const id of cites) {
    referenced++;
    if (!registered.has(id)) {
      fail(`${f}: citation "${id}" not registered in CITATIONS.md`);
    }
  }
}

if (process.exitCode) {
  console.error(`\ncheck-citations: FAILED — ${registered.size} registered, ${referenced} referenced.`);
  process.exit(1);
} else {
  console.log(`check-citations: PASS — ${registered.size} registered in CITATIONS.md; ${referenced} reference(s) resolved across ${jsonFiles.length} concept file(s).`);
}
