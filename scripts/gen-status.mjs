#!/usr/bin/env node
// gen-status.mjs — computes counts of artifacts from the tree and writes STATUS.md.
// Run locally with: node scripts/gen-status.mjs
// CI runs it with: node scripts/gen-status.mjs --check
// (--check mode fails if STATUS.md on disk does not match what would be generated.)

import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATUS_PATH = path.join(ROOT, "STATUS.md");
const CHECK_MODE = process.argv.includes("--check");

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}
async function listIfExists(dir, predicate = () => true) {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir);
  return entries.filter(predicate);
}

// ---------- atlas concepts ----------
const conceptsJsCode = await readFile(path.join(ROOT, "sl-atlas/src/concepts.js"), "utf8");
const sandbox = { window: {} };
new Function("window", conceptsJsCode)(sandbox.window);
const publishedConcepts = sandbox.window.SL_ATLAS_CONCEPTS;

const contentFiles = await listIfExists(
  path.join(ROOT, "sl-atlas/content"),
  f => f.endsWith(".json") && f !== "schema.json"
);
const blockedConcepts = [];
for (const f of contentFiles) {
  const doc = JSON.parse(await readFile(path.join(ROOT, "sl-atlas/content", f), "utf8"));
  if (typeof doc.status === "string" && /^\s*BLOCKED/i.test(doc.status)) {
    blockedConcepts.push({ id: doc.id, title: doc.title, status: doc.status });
  }
}

// ---------- findings ----------
const findings = await listIfExists(
  path.join(ROOT, "sl-attacklab/findings"),
  f => /^F-\d{4}\.md$/.test(f)
);

// ---------- decisions ----------
const slkemDecisions = await listIfExists(
  path.join(ROOT, "sl-kem/decisions"),
  f => /^D-\d{4}\.md$/.test(f)
);
const researchkitDecisions = await listIfExists(
  path.join(ROOT, "sl-researchkit/decisions"),
  f => /^D-\d{4}\.md$/.test(f)
);

// ---------- predictions ----------
const predictions = await listIfExists(
  path.join(ROOT, "sl-kem/predictions"),
  f => /^PREDICTION-\d{3}\.md$/.test(f)
);

// ---------- fossils ----------
const slkemFossils = await listIfExists(
  path.join(ROOT, "sl-kem/fossils"),
  f => f.endsWith(".md")
);
const orgFossils = await listIfExists(
  path.join(ROOT, "fossils"),
  f => f.endsWith(".md")
);

// ---------- atlas reviews ----------
const atlasReviews = await listIfExists(
  path.join(ROOT, "sl-atlas/reviews"),
  f => f.endsWith(".md")
);

// ---------- journal entries ----------
const journalEntries = await listIfExists(
  path.join(ROOT, "journal"),
  f => /^\d{4}-\d{2}\.md$/.test(f)
);

// ---------- frozen targets ----------
const targets = await listIfExists(
  path.join(ROOT, "sl-attacklab/targets"),
  f => /^T-\d{4}\.md$/.test(f)
);

// ---------- versioned specs ----------
async function listSpecs(subdir) {
  const dir = path.join(ROOT, subdir);
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir);
  return entries.filter(f => /^SPEC-\d{3}\.md$/.test(f));
}
const slkemSpecs = await listSpecs("sl-kem/spec");

// ---------- vector sets (one per spec under sl-vectors/<repo>/SPEC-###/) ----------
async function listVectorSets(subdir) {
  const dir = path.join(ROOT, subdir);
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir);
  const sets = [];
  for (const e of entries) {
    if (/^SPEC-\d{3}$/.test(e)) {
      const stub = await stat(path.join(dir, e)).catch(() => null);
      if (stub && stub.isDirectory()) sets.push(`${subdir}/${e}`);
    }
  }
  return sets;
}
const slkemVectors = await listVectorSets("sl-vectors/sl-kem");
const slffVectors = await listVectorSets("sl-vectors/slff");

// ---------- benchmark runs (one per SPEC subdirectory with a results.json) ----------
async function listBenchRuns(subdir) {
  const dir = path.join(ROOT, subdir);
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir);
  const runs = [];
  for (const e of entries) {
    if (/^SPEC-\d{3}$/.test(e)) {
      const resultsPath = path.join(dir, e, "results.json");
      if (await exists(resultsPath)) runs.push(`${subdir}/${e}`);
    }
  }
  return runs;
}
const slkemBench = await listBenchRuns("sl-bench/sl-kem");
const slffBench = await listBenchRuns("sl-bench/slff");

const now = new Date();
const stamp = now.toISOString().replace(/\.\d+Z$/, "Z");

const md = [
  "# Structureless Labs — STATUS",
  "",
  "_This file is **generated**. Do not edit by hand. CI regenerates it on every push and",
  "fails the build if it drifts. Source of truth is the tree itself; this is a view._",
  "",
  `Generated: ${stamp}`,
  "",
  "## Counts",
  "",
  "| Artifact | Count |",
  "|---|---|",
  `| Published atlas concepts (in \`sl-atlas/src/concepts.js\`) | **${publishedConcepts.length}** |`,
  `| Blocked atlas drafts (in \`sl-atlas/content/\` with \`status: BLOCKED...\`) | **${blockedConcepts.length}** |`,
  `| Filed attacklab findings (\`sl-attacklab/findings/F-####.md\`) | **${findings.length}** |`,
  `| Flight-recorder decisions (sl-kem + sl-researchkit) | **${slkemDecisions.length + researchkitDecisions.length}** |`,
  `| Predictions on record (\`sl-kem/predictions/\`) | **${predictions.length}** |`,
  `| Fossils (sl-kem + org-level) | **${slkemFossils.length + orgFossils.length}** |`,
  `| Atlas Teacher reviews on record | **${atlasReviews.length}** |`,
  `| Journal entries | **${journalEntries.length}** |`,
  `| Versioned sl-kem specs (\`sl-kem/spec/SPEC-###.md\`) | **${slkemSpecs.length}** |`,
  `| Frozen attack targets (\`sl-attacklab/targets/T-####.md\`) | **${targets.length}** |`,
  `| Vector sets (\`sl-vectors/<repo>/SPEC-###/\`) | **${slkemVectors.length + slffVectors.length}** |`,
  `| Benchmark runs (\`sl-bench/<repo>/SPEC-###/results.json\`) | **${slkemBench.length + slffBench.length}** |`,
  "",
  "## Published atlas concepts",
  "",
  ...publishedConcepts.map(c => `- \`${c.id}\` — ${c.title}${c.evidence_grade ? ` (grade ${c.evidence_grade})` : ""}`),
  "",
  "## Blocked atlas drafts",
  "",
  blockedConcepts.length
    ? blockedConcepts.map(c => `- \`${c.id}\` — ${c.title} — ${c.status}`).join("\n")
    : "_(none)_",
  "",
  "## Attacklab findings",
  "",
  findings.length
    ? findings.map(f => `- [\`${f}\`](sl-attacklab/findings/${f})`).join("\n")
    : "_(none)_",
  "",
  "## Decisions",
  "",
  "### sl-researchkit",
  "",
  researchkitDecisions.length
    ? researchkitDecisions.map(d => `- [\`${d}\`](sl-researchkit/decisions/${d})`).join("\n")
    : "_(none)_",
  "",
  "### sl-kem",
  "",
  slkemDecisions.length
    ? slkemDecisions.map(d => `- [\`${d}\`](sl-kem/decisions/${d})`).join("\n")
    : "_(none)_",
  "",
  "## Predictions",
  "",
  predictions.length
    ? predictions.map(p => `- [\`${p}\`](sl-kem/predictions/${p})`).join("\n")
    : "_(none)_",
  "",
  "## Fossils",
  "",
  "### Org-level",
  "",
  orgFossils.length
    ? orgFossils.map(f => `- [\`${f}\`](fossils/${f})`).join("\n")
    : "_(none)_",
  "",
  "### sl-kem",
  "",
  slkemFossils.length
    ? slkemFossils.map(f => `- [\`${f}\`](sl-kem/fossils/${f})`).join("\n")
    : "_(none)_",
  "",
  "## Atlas Teacher reviews",
  "",
  atlasReviews.length
    ? atlasReviews.map(r => `- [\`${r}\`](sl-atlas/reviews/${r})`).join("\n")
    : "_(none)_",
  "",
  "## Journal",
  "",
  journalEntries.length
    ? journalEntries.map(j => `- [\`${j}\`](journal/${j})`).join("\n")
    : "_(none)_",
  "",
  "## sl-kem specs",
  "",
  slkemSpecs.length
    ? slkemSpecs.map(s => `- [\`${s}\`](sl-kem/spec/${s})`).join("\n")
    : "_(none)_",
  "",
  "## Frozen attack targets",
  "",
  targets.length
    ? targets.map(t => `- [\`${t}\`](sl-attacklab/targets/${t})`).join("\n")
    : "_(none)_",
  "",
  "## Vector sets",
  "",
  (slkemVectors.length + slffVectors.length)
    ? [...slkemVectors, ...slffVectors].map(v => `- [\`${v}/\`](${v}/)`).join("\n")
    : "_(none)_",
  "",
  "## Benchmark runs",
  "",
  (slkemBench.length + slffBench.length)
    ? [...slkemBench, ...slffBench].map(b => `- [\`${b}/\`](${b}/)`).join("\n")
    : "_(none)_",
  "",
  "---",
  "*Soli Deo Gloria — 1 Corinthians 10:31*",
  ""
].join("\n");

// In --check mode, fail if STATUS.md on disk does not match what would be generated,
// IGNORING the `Generated:` timestamp line.
function normalize(s) {
  return s.replace(/^Generated: .+$/m, "Generated: <stamp>");
}

if (CHECK_MODE) {
  if (!(await exists(STATUS_PATH))) {
    console.error("STATUS.md does not exist. Run: node scripts/gen-status.mjs");
    process.exit(1);
  }
  const onDisk = await readFile(STATUS_PATH, "utf8");
  if (normalize(onDisk) !== normalize(md)) {
    console.error("STATUS.md is out of date. Run: node scripts/gen-status.mjs and commit.");
    process.exit(1);
  }
  console.log("STATUS.md: up to date.");
} else {
  await writeFile(STATUS_PATH, md, "utf8");
  console.log(`STATUS.md: regenerated.`);
}
