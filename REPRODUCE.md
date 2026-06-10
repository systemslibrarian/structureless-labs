# REPRODUCE

A skeptical visitor's guide to verifying every artifact in Structureless Labs from a
clean checkout. If the lab's method is "every claim is testable," this document is
where the testability becomes operational.

## Prerequisites

- Git
- Node.js ≥ 20 (no other runtime needed — scripts are zero-dependency)
- Optional: Python 3 (only for the simplest `http.server` of the atlas locally)

That's the whole trusted compute base for everything below. If a step adds a new
dependency in the future, it should be questioned by the Engineer persona.

## Clone

```bash
git clone https://github.com/systemslibrarian/structureless-labs
cd structureless-labs
```

## Run every CI gate locally (mirrors the .github/workflows/validate.yml job)

```bash
node scripts/validate-atlas.mjs        # JSON Schema validation for every sl-atlas concept
node scripts/check-atlas-parity.mjs    # concepts.js ↔ content/ parity, BLOCK honored
node scripts/check-citations.mjs       # every citation ID resolves in CITATIONS.md
node scripts/check-no-fabrication.mjs  # STRUCTURAL DRAFT specs have no concrete numbers
node scripts/check-lwe-math.mjs        # LWE interactive math invariants (I1/I2/I3)
node scripts/gen-status.mjs --check    # STATUS.md is up to date with the tree
```

Each line either prints `PASS` or exits non-zero. If any fails on `main`, that is a
bug — open a `[doc-drift]` issue and the maintainer will treat it as a build break.

## Run the atlas

Pick one:

```bash
# Python (built in everywhere)
python -m http.server 8765 --directory sl-atlas/src
# → http://localhost:8765/
```

```bash
# Node alternative
npx serve sl-atlas/src
```

Or just double-click `sl-atlas/src/index.html` — it works from `file://` because all
content is embedded in `concepts.js` / `citations.js` / `blocked.js`.

### Verify the LWE interactive

Once the atlas is up, navigate to **Learning With Errors** in the sidebar. The
upgrade landed in `sl-atlas/decisions/D-0001.md` and is reproducible offline:

1. Leave the preset on **Toy** (`n=3, m=4, q=17, η=1`).
2. Press **Try to solve** with *Noise on*. The recovered `s′` differs from
   the true `s`; the per-row verification pills show only the first `n` rows
   verifying — those were forced by the elimination.
3. Press **Noise off**, then **Try to solve** again. The recovered `s′` now
   equals `s` and every row verifies green.
4. Switch to **Small** (`q=97`) and **Medium** (`q=257`) and repeat. The
   collapse happens at every scale; the matrices just get bigger.
5. Press **Export**. The JSON object includes the seed; pasting that seed +
   parameters into any environment with the same PRNG (`mulberry32`)
   regenerates `A`, `s`, and `e` bit-for-bit.

You have now personally executed the attack the developer-view paragraph
describes ("Strip the noise away and it collapses to ordinary linear
algebra — Gaussian elimination solves it in milliseconds").

## Run the benchmark harness

```bash
node sl-bench/sl-kem/harness.mjs --spec SPEC-000 --iters 1000
```

Expected outcome on `SPEC-000`: the harness detects the structural-draft status,
performs zero KEM operations, and writes
`sl-bench/sl-kem/SPEC-000/results.json` with `iters_run: 0` and `"TODO"` for every
measurement. That is the *correct* output — it documents the anti-fabrication rule.

To prove the harness *would* fail loudly against a non-structural spec without a
reference implementation, run:

```bash
node sl-bench/sl-kem/harness.mjs --spec NONEXISTENT --iters 1
# expected: exits non-zero with "Spec not found: ..."
```

## Regenerate STATUS.md

```bash
node scripts/gen-status.mjs
```

Then `git diff STATUS.md`. If nothing changed, the tree's counts are in sync.

## Verify each artifact category

| Artifact | How to verify |
|---|---|
| **Live atlas concept** | `sl-atlas/src/concepts.js` (runtime) ↔ `sl-atlas/content/<id>.json` (lint source); both validated by `validate-atlas.mjs` and `check-atlas-parity.mjs`. |
| **Blocked atlas draft** | `sl-atlas/content/<id>.json` has `"status"` starting with `"BLOCKED"`; the parity check asserts it is NOT in `concepts.js`; the atlas UI shows it under "Held by Teacher gate." |
| **Filed finding** | `sl-attacklab/findings/F-####.md`; cross-references its target and the recommended follow-up decision. |
| **Flight-recorder decision** | `sl-{kem,researchkit}/decisions/D-####.md`; six-persona verdicts on the record; the chosen path resolves every PASS-WITH-NOTES gate in the same commit set. |
| **Prediction** | `sl-kem/predictions/PREDICTION-###.md`; carries a `Grade by:` date (per `TIME-CAPSULE-PREDICTIONS.md`). |
| **Fossil** | `fossils/` (org-level) or `sl-kem/fossils/`; explains what was superseded and why. |
| **Atlas Teacher review** | `sl-atlas/reviews/TEACHER-YYYY-MM-DD[-name].md`; ends with `VERDICT: PASS` / `PASS WITH NOTES` / `BLOCK`. |
| **Citation** | `### <short-id>` heading in `CITATIONS.md`; referenced by `citations: [...]` arrays in concept JSON. |
| **Spec** | `sl-kem/spec/SPEC-###.md`; structural drafts contain `STRUCTURAL DRAFT` in the Status field and have no concrete parameter values (anti-fabrication CI gate enforces this). |
| **Frozen target** | `sl-attacklab/targets/T-####.md`; names the spec version and commit it freezes, the claim with evidence grade, and explicit non-claims. |
| **Vector set** | `sl-vectors/<repo>/SPEC-###/`; empty directory with a README explaining absence is *also* valid (it documents the SPEC has no parameters yet). |
| **Benchmark run** | `sl-bench/<repo>/SPEC-###/results.json` next to `INTERPRETATION.md`; numbers without interpretation are not a result. |

## What "verify" does NOT mean

This guide does not let you verify the *cryptographic security* of any sl-kem
parameter set — because no parameter set has been bound yet. When SPEC-001 lands
(per [`sl-kem/decisions/D-0003.md`](sl-kem/decisions/D-0003.md)), a new section
here will describe how to re-derive the lattice-estimator output for the chosen
parameters using whichever tool (`lattice-estimator`, `core-SVP` model, etc.) the
binding decision names.

Until then, "verify" means: the lab's structure is sound; the gates run; the
artifacts cross-reference; nothing claims more than it has earned.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
