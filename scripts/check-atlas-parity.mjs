#!/usr/bin/env node
// check-atlas-parity.mjs — asserts:
//   (1) Every concept in sl-atlas/src/concepts.js has a matching content/<id>.json.
//   (2) Every PUBLISHABLE content/<id>.json (all three views non-null AND no
//       BLOCKED status) appears in sl-atlas/src/concepts.js.
//   (3) Every BLOCKED or incomplete content/<id>.json does NOT appear in concepts.js.
// Exits non-zero on any mismatch.

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONCEPTS_JS = path.join(ROOT, "sl-atlas", "src", "concepts.js");
const CONTENT_DIR = path.join(ROOT, "sl-atlas", "content");
const NON_CONCEPT = new Set(["schema.json"]);

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
}

// Load concepts.js by evaluating it with a stubbed `window`.
const code = await readFile(CONCEPTS_JS, "utf8");
const sandbox = { window: {} };
new Function("window", code)(sandbox.window);
const concepts = sandbox.window.SL_ATLAS_CONCEPTS;
if (!Array.isArray(concepts)) {
  console.error("concepts.js did not export an array on window.SL_ATLAS_CONCEPTS.");
  process.exit(2);
}
const conceptIds = new Set(concepts.map(c => c.id));

// Load every JSON file in content/.
const entries = await readdir(CONTENT_DIR);
const jsonFiles = entries.filter(f => f.endsWith(".json") && !NON_CONCEPT.has(f));
const jsonDocs = new Map();
for (const f of jsonFiles) {
  jsonDocs.set(f.replace(".json", ""), JSON.parse(await readFile(path.join(CONTENT_DIR, f), "utf8")));
}

function isPublishable(doc) {
  if (typeof doc.status === "string" && /^\s*BLOCKED/i.test(doc.status)) return false;
  const v = doc.views || {};
  return typeof v.simple === "string" && v.simple.length > 0
      && typeof v.developer === "string" && v.developer.length > 0
      && typeof v.researcher === "string" && v.researcher.length > 0;
}

// (1) concepts.js → content/
for (const c of concepts) {
  if (!jsonDocs.has(c.id)) {
    fail(`concept "${c.id}" is in concepts.js but content/${c.id}.json does not exist`);
    continue;
  }
  const doc = jsonDocs.get(c.id);
  if (!isPublishable(doc)) {
    fail(`concept "${c.id}" is in concepts.js but the corresponding JSON is not publishable (BLOCKED or missing a view)`);
  }
}

// (2) content/ publishable → concepts.js
for (const [id, doc] of jsonDocs) {
  if (isPublishable(doc) && !conceptIds.has(id)) {
    fail(`content/${id}.json is publishable but is NOT in concepts.js`);
  }
}

// (3) content/ not publishable → must NOT be in concepts.js
for (const [id, doc] of jsonDocs) {
  if (!isPublishable(doc) && conceptIds.has(id)) {
    fail(`content/${id}.json is NOT publishable (BLOCKED or missing a view) but appears in concepts.js`);
  }
}

const published = [...jsonDocs].filter(([, d]) => isPublishable(d)).length;
const blocked = jsonDocs.size - published;

if (process.exitCode) {
  console.error(`\ncheck-atlas-parity: FAILED — ${concepts.length} in concepts.js, ${jsonDocs.size} content files (${published} publishable, ${blocked} blocked).`);
  process.exit(1);
} else {
  console.log(`check-atlas-parity: PASS — ${concepts.length} published, ${blocked} blocked, no drift.`);
}
