# sl-atlas

**An interactive learning site for post-quantum cryptography. The signature feature:
explainable PQC at three depths.**

This is, arguably, the most valuable repo in the lab — it can stay useful even if `sl-kem`
never becomes production crypto. The bet from the research arc (cipher-museum →
crypto-compare → crypto-lab → crypto-counsel) is that *making hard cryptography
approachable* is the durable contribution.

---

## The three-view contract

Every concept page renders three synchronized views:

- **Simple** — for a curious non-expert.
- **Developer** — for a programmer.
- **Researcher** — precise and formal.

Content is authored once in a structured format (see [`content/CONTENT-SCHEMA.md`](content/CONTENT-SCHEMA.md))
and the site renders all three. If a concept lacks any of the three views, the
Teacher persona BLOCKs publication.

---

## What's running today

The site in [`src/`](src/) ships a **16-concept numbered learning path** — from
[the quantum threat model](https://systemslibrarian.github.io/structureless-labs/#/threat-model)
*(step 1: why any of this matters)* through the foundations to ML-KEM, S-Cloud+, hybrids,
side channels, and the lab's own draft format. Counts in this README are intentionally minimal because the canonical
inventory is generated from the tree — see [`STATUS.md`](../STATUS.md) for the auditable
current totals. The Teacher gate's first BLOCK (Decryption Failure Probability,
2026-06-09) was resolved 2026-07-11 through the path D-0003 specified; both the BLOCK
and the resolution are on the record.

**Four interactives, each with a CI-tested math core and an explicit
"what this does *not* show" note:**

| Interactive | Concept | The runnable claim |
|---|---|---|
| LWE matrix | Learning With Errors | Noise off → Gaussian elimination recovers `s`; noise on → same elimination, worthless answer |
| 2D lattice | Lattices | Same lattice, different basis: Babai round-off succeeds reduced, misses skewed |
| Encoding ring | Encoding | Codeword + CBD noise + rounding decoder; exact failure probability δ |
| Attack cost | Parameter choices | (n, q, σ) → minimal BKZ β → core-SVP bits, the simplified primal estimate live |

Plus:

- **Learning path + search + glossary** — numbered sidebar order (the `path` field),
  client-side full-text search (`/`), and a ~50-term glossary (`g`) with every term
  linked to the concept that teaches it.
- **Predict-then-verify** — the LWE and Encoding demos ask for your call before showing
  the answer; every concept ends with *Check your understanding* questions
  (the `checks` field, reviewed by the Teacher gate like any prose).
- **Compare mode** — all three views side-by-side.
- **Keyboard nav** — `1` / `2` / `3` switch views, `c` compare, `j` / `k` move along the
  path, `/` search, `g` glossary, `t` theme.
- **Hash routing** — every state is a shareable URL: `#/lwe?view=developer`, `#/glossary`.
- **Theme toggle** — light / dark, persisted to `localStorage`, respects `prefers-color-scheme`.
- **No build step** — pure HTML / CSS / JS, opens directly via `file://` or any static server.

---

## Run it locally

From the repo root:

```bash
# Python (built in everywhere)
python -m http.server 8765 --directory sl-atlas/src
# → http://localhost:8765/

# or, equivalently, with Node
npx serve sl-atlas/src
```

Or just double-click `sl-atlas/src/index.html` — it works from `file://` because all
content is embedded in `concepts.js`.

---

## Authoring a new concept

Content is authored **once**, in `content/<id>.json` — `src/concepts.js` is a
**generated file** (since 2026-07-11; see [`decisions/D-0003.md`](decisions/D-0003.md))
and must never be edited by hand.

1. Write `content/<id>.json` following the schema (see
   [`content/CONTENT-SCHEMA.md`](content/CONTENT-SCHEMA.md)). Give it a `path`
   position (its place in the learning path) and, ideally, 2–3 `checks` questions.
2. Run `node scripts/gen-atlas-concepts.mjs` to regenerate `src/concepts.js`.
   CI fails on drift, so a forgotten regeneration cannot merge.
3. If the concept has a source spec elsewhere in the org (e.g. `sl-kem/spec/EXPLAINER-*.md`),
   point `source_spec` at it. The Atlas tracks the spec — never the other way around.
4. Open a PR; the Teacher persona reviews. Missing any of the three views → BLOCK
   (set the `status` field to `BLOCKED — …` and the concept stays out of the
   generated file; add the draft's stub to `src/blocked.js`).

---

## Deploy to GitHub Pages

The site is a static directory. Point Pages at the `sl-atlas/src/` folder of this repo
(via a Pages-from-folder source or a deploy workflow that uploads `sl-atlas/src/` as the
artifact). The included `.nojekyll` disables Jekyll preprocessing.

---

## What's still ahead

[`content/ROADMAP.md`](content/ROADMAP.md) tracks candidates for the next round —
signatures (ML-DSA / SLH-DSA), the NTRU lineage, and a deeper lattice-estimator
companion. Each new entry is a small structured document, never a bespoke page — the
three-view contract holds across the whole atlas.

Drift control: the README's count and table are **not** the source of truth. CI validates
every concept in `src/concepts.js` against [`content/schema.json`](content/schema.json),
asserts content/ parity, and regenerates [`STATUS.md`](../STATUS.md) — if any of those
go stale, the build fails.

---

*Soli Deo Gloria — 1 Corinthians 10:31*
