#!/usr/bin/env node
// validate-atlas.mjs — validates every sl-atlas/content/*.json against schema.json.
// Zero dependencies (Node built-ins only). Exits non-zero on any failure.

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "sl-atlas", "content");
const SCHEMA_PATH = path.join(CONTENT_DIR, "schema.json");

// Files in content/ that are NOT concepts (skip).
const NON_CONCEPT = new Set(["schema.json"]);

const schema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));

function fail(file, msg) {
  console.error(`✗ ${file}: ${msg}`);
  process.exitCode = 1;
}

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function validate(doc, file) {
  const schemaProps = schema.properties;
  const required = schema.required || [];
  const allowed = new Set(Object.keys(schemaProps));

  // additionalProperties: false
  for (const k of Object.keys(doc)) {
    if (!allowed.has(k)) fail(file, `unexpected top-level property "${k}"`);
  }
  // required
  for (const r of required) {
    if (!(r in doc)) fail(file, `missing required property "${r}"`);
  }

  // id
  if (typeof doc.id === "string") {
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(doc.id)) fail(file, `id "${doc.id}" must be kebab-case`);
    const expectedFile = `${doc.id}.json`;
    if (path.basename(file) !== expectedFile) {
      fail(file, `filename must match id (expected ${expectedFile})`);
    }
  } else if (doc.id !== undefined) {
    fail(file, `id must be a string`);
  }

  // title
  if ("title" in doc && (typeof doc.title !== "string" || doc.title.length === 0)) {
    fail(file, `title must be a non-empty string`);
  }

  // category
  if ("category" in doc) {
    const cats = schemaProps.category.enum;
    if (!cats.includes(doc.category)) fail(file, `category "${doc.category}" not in ${JSON.stringify(cats)}`);
  }

  // views
  if ("views" in doc) {
    if (typeOf(doc.views) !== "object") {
      fail(file, `views must be an object`);
    } else {
      const viewKeys = ["simple", "developer", "researcher"];
      for (const k of viewKeys) {
        if (!(k in doc.views)) fail(file, `views.${k} is required (use null for a deliberately missing view, e.g. a BLOCKED draft)`);
        else {
          const v = doc.views[k];
          if (v !== null && typeof v !== "string") fail(file, `views.${k} must be a string or null`);
          if (typeof v === "string" && v.length === 0) fail(file, `views.${k} must be non-empty (or null)`);
        }
      }
      for (const k of Object.keys(doc.views)) {
        if (!viewKeys.includes(k)) fail(file, `unexpected views key "${k}"`);
      }
    }
  }

  // evidence_grade
  if ("evidence_grade" in doc) {
    const grades = schemaProps.evidence_grade.enum;
    if (!grades.includes(doc.evidence_grade)) fail(file, `evidence_grade "${doc.evidence_grade}" not in ${JSON.stringify(grades)}`);
  }

  // related
  if ("related" in doc) {
    if (!Array.isArray(doc.related)) fail(file, `related must be an array`);
    else for (const r of doc.related) {
      if (typeof r !== "string" || !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(r)) fail(file, `related entry "${r}" must be a kebab-case string`);
    }
  }
}

const entries = await readdir(CONTENT_DIR);
const jsonFiles = entries.filter(f => f.endsWith(".json") && !NON_CONCEPT.has(f));

if (jsonFiles.length === 0) {
  console.error("No concept JSON files found.");
  process.exit(2);
}

for (const f of jsonFiles) {
  const full = path.join(CONTENT_DIR, f);
  let doc;
  try {
    doc = JSON.parse(await readFile(full, "utf8"));
  } catch (e) {
    fail(f, `invalid JSON: ${e.message}`);
    continue;
  }
  validate(doc, full);
}

if (process.exitCode) {
  console.error(`\nvalidate-atlas: FAILED — ${jsonFiles.length} concept JSON file(s) inspected.`);
  process.exit(1);
} else {
  console.log(`validate-atlas: PASS — ${jsonFiles.length} concept JSON file(s) validated against schema.`);
}
