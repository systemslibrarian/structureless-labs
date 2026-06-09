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

The demo in [`src/`](src/) ships with **six** foundational concepts authored end-to-end
and **one** held by the Teacher gate. Counts in this README are intentionally minimal
because the canonical inventory is generated from the tree — see
[`STATUS.md`](../STATUS.md) for the auditable current totals.

| Concept | Grade | Status | Notes |
|---|---|---|---|
| Learning With Errors | B | Published | Live matrix `b = A·s + e (mod q)` with a noise toggle |
| Lattices | A | Published | — |
| Noise | B | Published | — |
| Modular Arithmetic | A | Published | — |
| Encoding | B | Published | Cross-links into the LWE noise discussion |
| Reconciliation | B | Published | Helper-bit vs. encryption-style |
| Decryption Failure Probability | B | **BLOCKED 2026-06-09** | Missing Simple view; see [Teacher review](reviews/TEACHER-2026-06-09-decryption-failure.md) and [D-0003](../sl-researchkit/decisions/D-0003.md) |

Plus:

- **Compare mode** — all three views side-by-side.
- **Keyboard nav** — `1` / `2` / `3` switch views, `c` toggles compare, `j` / `k` move between concepts, `t` toggles theme.
- **Hash routing** — every state is a shareable URL: `#/lwe?view=developer`, `#/lwe?compare=1`.
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

1. Add an entry to [`src/concepts.js`](src/concepts.js) following the schema (see
   [`content/CONTENT-SCHEMA.md`](content/CONTENT-SCHEMA.md)).
2. Mirror it as `content/<id>.json` so the Teacher persona and tooling can lint it.
3. If the concept has a source spec elsewhere in the org (e.g. `sl-kem/spec/EXPLAINER-*.md`),
   point `source_spec` at it. The Atlas tracks the spec — never the other way around.
4. Open a PR; the Teacher persona reviews. Missing any of the three views → BLOCK.

---

## Deploy to GitHub Pages

The site is a static directory. Point Pages at the `sl-atlas/src/` folder of this repo
(via a Pages-from-folder source or a deploy workflow that uploads `sl-atlas/src/` as the
artifact). The included `.nojekyll` disables Jekyll preprocessing.

---

## What's still ahead

The roadmap in the sidebar names the next concepts: **Parameter choices**, **Attacks**,
and **S-Cloud+** (planned; *Wang et al.*, ePrint [2024/1306](https://eprint.iacr.org/2024/1306) —
adapt with attribution; see [`content/ROADMAP.md`](content/ROADMAP.md)). Each new entry
is a small structured document, never a bespoke page — the three-view contract holds
across the whole atlas.

Drift control: the README's count and table are **not** the source of truth. CI validates
every concept in `src/concepts.js` against [`content/schema.json`](content/schema.json),
asserts content/ parity, and regenerates [`STATUS.md`](../STATUS.md) — if any of those
go stale, the build fails.

---

*Soli Deo Gloria — 1 Corinthians 10:31*
