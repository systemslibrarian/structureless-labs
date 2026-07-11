#!/usr/bin/env node
// gen-atlas-concepts.mjs — generates sl-atlas/src/concepts.js from the canonical
// concept documents in sl-atlas/content/*.json.
//
// Why generated: the atlas principle is "content authored once." Before 2026-07-11
// concepts.js was hand-mirrored from content/ and the two drifted (emphasis markers
// and a link were lost in several mirrors — found and repaired when this generator
// was introduced). Generation makes content/ the single source of truth; the
// existing check-atlas-parity.mjs remains as belt-and-braces.
//
// Only PUBLISHABLE concepts are emitted (all three views non-null, no BLOCKED
// status), sorted by their learning-path position (`path`), then by id. BLOCKED
// drafts stay out of the generated file and live in src/blocked.js (hand-maintained,
// since blocks carry review metadata that is not part of the concept schema).
//
// --check mode: regenerates in memory, compares against the file on disk, exits
// non-zero on drift. Wired into .github/workflows/validate.yml.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "sl-atlas", "content");
const OUT_PATH = path.join(ROOT, "sl-atlas", "src", "concepts.js");
const CHECK_MODE = process.argv.includes("--check");
const NON_CONCEPT = new Set(["schema.json"]);

function isPublishable(doc) {
  if (typeof doc.status === "string" && /^\s*BLOCKED/i.test(doc.status)) return false;
  const v = doc.views || {};
  return ["simple", "developer", "researcher"].every(
    k => typeof v[k] === "string" && v[k].length > 0
  );
}

// Fields emitted to the browser, in canonical order. Meta-fields (`status`,
// `_publication_status_note`) are authoring-side only and never shipped.
const EMIT_KEYS = [
  "id", "title", "subtitle", "category", "path", "views", "interactive",
  "evidence_grade", "evidence_note", "related", "citations", "attack_links",
  "source_spec", "checks"
];

const entries = (await readdir(CONTENT_DIR)).filter(
  f => f.endsWith(".json") && !NON_CONCEPT.has(f)
);
const docs = [];
for (const f of entries) {
  const doc = JSON.parse(await readFile(path.join(CONTENT_DIR, f), "utf8"));
  if (isPublishable(doc)) docs.push(doc);
}
docs.sort((a, b) =>
  (a.path ?? Infinity) - (b.path ?? Infinity) || a.id.localeCompare(b.id)
);

const out = [];
out.push("/* GENERATED FILE — DO NOT EDIT.");
out.push("   Regenerate with: node scripts/gen-atlas-concepts.mjs");
out.push("   Source of truth: sl-atlas/content/*.json (one document per concept).");
out.push("   Only publishable concepts are emitted, sorted by learning-path position.");
out.push("   CI fails if this file drifts from content/. */");
out.push("");
out.push("window.SL_ATLAS_CONCEPTS = [");
for (const doc of docs) {
  const emit = {};
  for (const k of EMIT_KEYS) if (k in doc && doc[k] !== undefined) emit[k] = doc[k];
  const json = JSON.stringify(emit, null, 2)
    .split("\n")
    .map(line => "  " + line)
    .join("\n");
  out.push(json + ",");
}
out.push("];");
out.push("");

const generated = out.join("\n");

if (CHECK_MODE) {
  if (!existsSync(OUT_PATH)) {
    console.error("sl-atlas/src/concepts.js does not exist. Run: node scripts/gen-atlas-concepts.mjs");
    process.exit(1);
  }
  const onDisk = await readFile(OUT_PATH, "utf8");
  if (onDisk !== generated) {
    console.error("sl-atlas/src/concepts.js is out of date with sl-atlas/content/. Run: node scripts/gen-atlas-concepts.mjs and commit.");
    process.exit(1);
  }
  console.log(`gen-atlas-concepts: up to date (${docs.length} published concepts).`);
} else {
  await writeFile(OUT_PATH, generated, "utf8");
  console.log(`gen-atlas-concepts: wrote ${path.relative(ROOT, OUT_PATH)} with ${docs.length} published concept(s).`);
}
