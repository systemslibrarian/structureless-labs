#!/usr/bin/env node
// check-no-fabrication.mjs — anti-fabrication regression test.
//
// Enforces the lab's most load-bearing rule: a spec marked STRUCTURAL DRAFT must NOT
// contain concrete parameter values. The "TODO" entries in SPEC-000's parameter table
// are exactly what makes the spec honest about its non-claims; quietly replacing them
// with numbers (whether by an over-eager human, an AI agent, or accidental copy-paste
// from FrodoKEM) is the failure mode this gate catches.
//
// What we check for each sl-kem/spec/SPEC-*.md:
//   - If the file's Status field contains "STRUCTURAL DRAFT" (case-insensitive,
//     tolerant of markdown emphasis), then every row of the parameter table whose
//     symbol column matches a known LWE parameter (n, m, q, χ, η, λ, δ, encoder, H, ...)
//     must have a value cell that begins with "TODO" or is a reference indirection
//     (starts with "per ", "see ", or is wrapped in `…`).
//
// Pure Node, zero dependencies, exits non-zero on any violation.

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPEC_DIR = path.join(ROOT, "sl-kem", "spec");

function fail(file, msg) {
  console.error(`✗ ${file}: ${msg}`);
  process.exitCode = 1;
}

// A value cell is "honest TODO" if its trimmed text starts with one of these markers.
function isHonestPlaceholder(cellText) {
  const t = cellText.trim();
  if (t === "" || t === "—" || t === "-") return true;        // empty / dash is also OK
  if (/^`?TODO\b/i.test(t)) return true;                       // TODO / `TODO ...`
  if (/^per\s+\S+/i.test(t)) return true;                      // "per FrodoKEM-640 §1.2"
  if (/^see\s+\S+/i.test(t)) return true;                      // "see SPEC-001 §2.4"
  // A pure backticked reference like `frodokem-2017`
  if (/^`[^`]+`$/.test(t)) return true;
  return false;
}

// Approximate parser for a markdown table's "Value" / "Value (SPEC-NNN)" column.
// Returns an array of { symbol, valueCell, lineNo } for rows that look like
// parameter definitions.
function parseParameterTable(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  let inTable = false;
  let headerCols = null;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!inTable && /^\s*\|.*\bSymbol\b.*\|/i.test(raw)) {
      inTable = true;
      headerCols = raw.split("|").map(s => s.trim());
      continue;
    }
    if (inTable) {
      if (/^\s*\|[-:\s|]+\|\s*$/.test(raw)) continue; // header separator row
      if (!raw.includes("|")) { inTable = false; continue; }
      const cells = raw.split("|").map(s => s.trim());
      const symbol = cells[1] || "";
      // strip backticks around symbol
      const sym = symbol.replace(/`/g, "").trim();
      // value column is the LAST non-empty cell typically; find by header
      let valueIdx = headerCols.findIndex(c => /^Value/i.test(c));
      if (valueIdx === -1) valueIdx = cells.length - 2; // assume last data column
      const valueCell = cells[valueIdx] || "";
      if (sym) rows.push({ symbol: sym, valueCell, lineNo: i + 1 });
    }
  }
  return rows;
}

const entries = existsSync(SPEC_DIR) ? await readdir(SPEC_DIR) : [];
const specFiles = entries.filter(f => /^SPEC-\d{3}\.md$/.test(f));

if (specFiles.length === 0) {
  console.log("check-no-fabrication: no SPEC-*.md files under sl-kem/spec/ yet — nothing to check.");
  process.exit(0);
}

let inspectedStructural = 0;
let inspectedConcrete = 0;

for (const f of specFiles) {
  const full = path.join(SPEC_DIR, f);
  const text = await readFile(full, "utf8");
  const isStructural = /Status[:*_\s]+STRUCTURAL\s+DRAFT/i.test(text);

  const rows = parseParameterTable(text);

  if (isStructural) {
    inspectedStructural++;
    for (const row of rows) {
      if (!isHonestPlaceholder(row.valueCell)) {
        fail(
          `sl-kem/spec/${f}`,
          `STRUCTURAL DRAFT but parameter row "${row.symbol}" has a concrete value at line ${row.lineNo}: "${row.valueCell}". ` +
          `Either revise the Status (this is no longer a structural draft) or mark the value "TODO" / "per <reference>" / "see <reference>".`
        );
      }
    }
  } else {
    inspectedConcrete++;
    // Optional future check: a non-structural spec MUST have a Provenance section
    // (per sl-kem D-0003's authoring checklist). We only warn for now to avoid blocking
    // legitimate work-in-progress.
    if (rows.length > 0 && !/^##\s+Provenance\b/im.test(text)) {
      console.warn(
        `⚠ sl-kem/spec/${f}: non-structural spec with a parameter table but no "## Provenance" section. ` +
        `sl-kem D-0003 requires Provenance for adopt-by-reference specs; not enforced yet.`
      );
    }
  }
}

if (process.exitCode) {
  console.error(`\ncheck-no-fabrication: FAILED — ${inspectedStructural} structural draft(s) inspected, ${inspectedConcrete} concrete spec(s) inspected.`);
  process.exit(1);
} else {
  console.log(`check-no-fabrication: PASS — ${inspectedStructural} structural draft(s) verified clean, ${inspectedConcrete} concrete spec(s) inspected.`);
}
