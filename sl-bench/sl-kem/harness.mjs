#!/usr/bin/env node
// sl-bench / sl-kem — benchmark harness.
//
// Usage:
//   node sl-bench/sl-kem/harness.mjs --spec SPEC-000 --iters 1000
//
// Status: SCAFFOLD. Against SPEC-000 (a structural draft with no parameters), this
// harness produces a results.json file whose measurements are honestly "TODO" — not
// fabricated numbers. When a parameterized SPEC-NNN lands and the reference
// implementation under sl-kem/ref/ (TBD) is wired in, the same harness will run a
// real keygen/encaps/decaps loop against the bound parameters and emit real numbers.
//
// Zero dependencies (Node built-ins only) per the honesty note in this directory's
// README — the benchmark must not expand the trusted compute base.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------- arg parsing ----------
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i];
  const v = process.argv[i + 1];
  if (!k?.startsWith("--") || v === undefined) {
    console.error(`Usage: node harness.mjs --spec SPEC-NNN --iters N`);
    process.exit(2);
  }
  args.set(k.slice(2), v);
}
const spec = args.get("spec") || "SPEC-000";
const iters = Number(args.get("iters") || "0");
if (Number.isNaN(iters) || iters < 0) {
  console.error(`--iters must be a non-negative integer`);
  process.exit(2);
}

// ---------- locate the spec ----------
const specPath = path.resolve(HERE, "..", "..", "sl-kem", "spec", `${spec}.md`);
if (!existsSync(specPath)) {
  console.error(`Spec not found: ${specPath}`);
  console.error(`Available specs in sl-kem/spec/ should be of the form SPEC-NNN.md.`);
  process.exit(2);
}

const specText = await readFile(specPath, "utf8");
// Match a Status field that names STRUCTURAL DRAFT, tolerant of markdown
// emphasis (`**Status:**`, `_Status_:`, etc.).
const isStructural = /Status[:*_\s]+STRUCTURAL DRAFT/i.test(specText);

// ---------- run ----------
let result;

if (isStructural) {
  // Honest placeholder. No numbers fabricated.
  result = {
    spec,
    iters_requested: iters,
    iters_run: 0,
    ran_at: new Date().toISOString(),
    host: { node: process.version, platform: process.platform, arch: process.arch },
    status: `TODO — ${spec} is a structural draft with no parameter set; no measurements possible without (n, m, q, χ, η, encoder, H)`,
    measurements: {
      keygen_ms: "TODO",
      encaps_ms: "TODO",
      decaps_ms_honest: "TODO",
      decaps_ms_implicit_reject: "TODO",
      pk_bytes: "TODO",
      sk_bytes: "TODO",
      ct_bytes: "TODO",
      security_estimate_bits: "TODO",
      decryption_failure_log2: "TODO"
    },
    honesty_note:
      `This harness is a scaffold. Running it against ${spec} (a structural draft) ` +
      `produces no numerical claims. Per the lab's anti-fabrication rule, the placeholder ` +
      `values are "TODO" rather than fabricated numbers. When a parameterized SPEC-NNN ` +
      `lands and sl-kem/ref/ is wired in, this harness gets a real run loop and emits real numbers.`
  };
} else {
  // A future SPEC-NNN with a bound parameter set would land here. Until sl-kem/ref/
  // exists, refuse to fabricate — exit non-zero rather than silently emit zeroes.
  console.error(
    `${spec} is not a structural draft, but sl-kem/ref/ does not exist yet. ` +
    `Refusing to run rather than emit fabricated numbers.`
  );
  process.exit(3);
}

// ---------- write results.json ----------
const outDir = path.join(HERE, spec);
await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, "results.json");
await writeFile(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(`Wrote ${path.relative(process.cwd(), outPath)} (status: ${result.status.split(";")[0]}).`);
