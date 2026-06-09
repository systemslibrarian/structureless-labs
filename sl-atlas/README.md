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

The demo in [`src/`](src/) ships with four foundational concepts authored end-to-end:

| Concept | Grade | Interactive |
|---|---|---|
| Learning With Errors | B | Live matrix `b = A·s + e (mod q)` with a noise toggle |
| Lattices | A | — |
| Noise | B | — |
| Modular Arithmetic | A | — |

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

The roadmap in the sidebar names the next concepts: Encoding, Reconciliation, Parameter
choices, Attacks. Each new entry is a small structured document, never a bespoke page —
the three-view contract holds across the whole atlas.

---

*Soli Deo Gloria — 1 Corinthians 10:31*
