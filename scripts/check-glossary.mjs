#!/usr/bin/env node
// check-glossary.mjs — validates sl-atlas/src/glossary.js:
//   G1  the glossary exists and is a non-empty array
//   G2  every entry has a non-empty term and definition
//   G3  terms are unique (case-insensitive)
//   G4  every non-null `concept` id resolves to a published concept
// Exits non-zero on any violation. Wired into .github/workflows/validate.yml.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function load(file, key) {
  return readFile(path.join(ROOT, file), "utf8").then(code => {
    const sandbox = { window: {} };
    new Function("window", code)(sandbox.window);
    return sandbox.window[key];
  });
}

const glossary = await load("sl-atlas/src/glossary.js", "SL_ATLAS_GLOSSARY");
const concepts = await load("sl-atlas/src/concepts.js", "SL_ATLAS_CONCEPTS");
const conceptIds = new Set((concepts || []).map(c => c.id));

let failures = 0;
function fail(msg) {
  console.error(`✗ ${msg}`);
  failures++;
}

if (!Array.isArray(glossary) || glossary.length === 0) {
  console.error("glossary.js did not export a non-empty array on window.SL_ATLAS_GLOSSARY.");
  process.exit(1);
}

const seen = new Set();
glossary.forEach((g, i) => {
  if (typeof g.term !== "string" || g.term.trim().length === 0) fail(`entry ${i}: term must be a non-empty string`);
  if (typeof g.definition !== "string" || g.definition.trim().length === 0) fail(`entry ${i} ("${g.term}"): definition must be a non-empty string`);
  const key = String(g.term).toLowerCase();
  if (seen.has(key)) fail(`duplicate term "${g.term}"`);
  seen.add(key);
  if (g.concept !== null && g.concept !== undefined) {
    if (!conceptIds.has(g.concept)) fail(`entry "${g.term}": concept "${g.concept}" is not a published concept`);
  }
});

if (failures) {
  console.error(`\ncheck-glossary: FAILED — ${failures} violation(s) across ${glossary.length} entries.`);
  process.exit(1);
}
console.log(`check-glossary: PASS — ${glossary.length} terms, all unique, all concept links resolve.`);
