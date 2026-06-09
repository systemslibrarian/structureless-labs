# Structureless Labs — Organization Scaffold

This directory is a ready-to-push scaffold for the **Structureless Labs** GitHub
organization: the org profile plus seven repositories.

> Open research into conservative post-quantum cryptography, cryptanalysis, and
> long-term digital preservation.

## What's here

```
.github/profile/README.md   → org landing page (create a repo named ".github")
sl-researchkit/             → AI research framework (build this first)
sl-atlas/                   → explainable PQC site (signature feature)
slff/                       → hybrid encrypted file container
sl-bench/                   → benchmarks / parameter lab
sl-vectors/                 → reproducible test vectors
sl-attacklab/               → break-it-first cryptanalysis
sl-kem/                     → experimental KEM (first project built with the kit)
```

Each repo ships with: README, LICENSE (Apache-2.0), SECURITY.md, CONTRIBUTING.md.
sl-researchkit carries the six personas, the Red Team checklist, evidence grading, and
four workflows (flight recorder, time capsules, AI-vs-AI, monthly journal). sl-kem
demonstrates the method end-to-end with a constitution, a decision record, a fossil, a
prediction, and a three-depth explainer.

## Build order (recommended)
1. **sl-researchkit** — the method must exist before the projects.
2. **sl-atlas** — start capturing explainers immediately; it's the durable value.
3. **slff** + **sl-vectors** — integration + reproducibility scaffolding.
4. **sl-attacklab** + **sl-bench** — open the doors to attacks and measurement.
5. **sl-kem** — the first primitive run through the full pipeline.

## Pushing to GitHub
See `SETUP.md` for a copy-paste sequence (one repo each, plus the special `.github` repo
for the org profile).

---
*Soli Deo Gloria — 1 Corinthians 10:31*
