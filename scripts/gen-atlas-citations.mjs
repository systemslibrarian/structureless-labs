#!/usr/bin/env node
// gen-atlas-citations.mjs — parses CITATIONS.md and writes sl-atlas/src/citations.js
// so the atlas UI can render a "References" section without runtime markdown parsing.
//
// The generated file exports window.SL_ATLAS_CITATIONS as an object keyed by short ID.
// Each entry has { id, body, url } where `body` is the raw markdown for the citation
// (the paragraph(s) under the "### <id>" heading) and `url` is the last <…>-wrapped
// URL in that body, if any (used by the renderer to attach a link).
//
// --check mode: regenerates in memory, compares against the file on disk, exits non-zero
// if they differ. Used by CI to ensure CITATIONS.md and citations.js stay in lockstep.

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CITATIONS_PATH = path.join(ROOT, "CITATIONS.md");
const OUT_PATH = path.join(ROOT, "sl-atlas", "src", "citations.js");
const CHECK_MODE = process.argv.includes("--check");

const md = await readFile(CITATIONS_PATH, "utf8");

// Find every "### <id>" header and capture text until the next "### " or "## " header.
const entries = {};
const lines = md.split(/\r?\n/);
let current = null;
let buffer = [];
for (const line of lines) {
  const h3 = line.match(/^### ([a-z][a-z0-9-]*[a-z0-9])\s*$/);
  const h2 = /^## /.test(line);
  if (h3) {
    if (current) entries[current] = buffer.join("\n").trim();
    current = h3[1];
    buffer = [];
    continue;
  }
  if (h2) {
    if (current) { entries[current] = buffer.join("\n").trim(); current = null; buffer = []; }
    continue;
  }
  if (current) buffer.push(line);
}
if (current) entries[current] = buffer.join("\n").trim();

// Build the JS module body.
const lib = [];
lib.push("/* GENERATED FILE — DO NOT EDIT.");
lib.push("   Regenerate with: node scripts/gen-atlas-citations.mjs");
lib.push("   Source: CITATIONS.md at the repo root. CI fails if this file drifts. */");
lib.push("");
lib.push("window.SL_ATLAS_CITATIONS = {");

const ids = Object.keys(entries).sort();
for (const id of ids) {
  const body = entries[id];
  // Extract last <URL> as the link target.
  const urlMatch = [...body.matchAll(/<(https?:\/\/[^>]+)>/g)].pop();
  const url = urlMatch ? urlMatch[1] : null;
  // Strip the <URL> from the displayed body (the renderer attaches it as a link).
  const displayBody = body.replace(/<https?:\/\/[^>]+>\s*$/g, "").trim();
  lib.push(`  ${JSON.stringify(id)}: {`);
  lib.push(`    id: ${JSON.stringify(id)},`);
  lib.push(`    body: ${JSON.stringify(displayBody)},`);
  lib.push(`    url: ${JSON.stringify(url)}`);
  lib.push(`  },`);
}
lib.push("};");
lib.push("");

const generated = lib.join("\n");

if (CHECK_MODE) {
  if (!existsSync(OUT_PATH)) {
    console.error(`sl-atlas/src/citations.js does not exist. Run: node scripts/gen-atlas-citations.mjs`);
    process.exit(1);
  }
  const onDisk = await readFile(OUT_PATH, "utf8");
  if (onDisk !== generated) {
    console.error(`sl-atlas/src/citations.js is out of date. Run: node scripts/gen-atlas-citations.mjs and commit.`);
    process.exit(1);
  }
  console.log(`gen-atlas-citations: up to date (${ids.length} entries).`);
} else {
  await writeFile(OUT_PATH, generated, "utf8");
  console.log(`gen-atlas-citations: wrote ${path.relative(ROOT, OUT_PATH)} with ${ids.length} entries.`);
}
