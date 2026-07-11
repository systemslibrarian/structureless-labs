# sl-atlas Roadmap

Concepts visible as "Roadmap" stubs in the sidebar but not yet authored. Each must enter
the Teacher gate before it is published — see
[`sl-researchkit/personas/TEACHER.md`](../../sl-researchkit/personas/TEACHER.md).

## Foundations still to author
- ~~**Encoding**~~ — authored 2026-06-09; see `encoding.json` and Teacher review
  `sl-atlas/reviews/TEACHER-2026-06-09-encoding.md`.
- ~~**Reconciliation**~~ — authored 2026-06-09; see `reconciliation.json` and Teacher review
  `sl-atlas/reviews/TEACHER-2026-06-09-reconciliation.md`.
- ~~**Parameter choices**~~ — authored 2026-06-09; see `parameter-choices.json` and
  Teacher review `sl-atlas/reviews/TEACHER-2026-06-09-parameter-choices.md`.
- ~~**Attacks**~~ — authored 2026-06-09; see `attacks.json` and Teacher review
  `sl-atlas/reviews/TEACHER-2026-06-09-attacks.md`.

## New foundations to add (next round)
- ~~**Side channels**~~ — authored 2026-06-10; see `side-channels.json` and Teacher review
  `sl-atlas/reviews/TEACHER-2026-06-10-side-channels.md` (PASS).
- ~~**Hybrid constructions**~~ — authored 2026-06-10; see `hybrid-constructions.json` and
  Teacher review `sl-atlas/reviews/TEACHER-2026-06-10-hybrid-constructions.md`
  (PASS WITH NOTES — deployment-landscape sentences flagged as moving targets;
  cadence-pacing question formally referred to the PI persona).
- ~~**slff format internals**~~ — authored 2026-06-10 as a draft-with-open-finding; see
  `slff-format.json` and Teacher review `sl-atlas/reviews/TEACHER-2026-06-10-slff-format.md`
  (PASS WITH NOTES — F-0002 carries forward as a binding revision condition; concept must
  be re-submitted when the criticality-marker mechanism is specified). The ROADMAP's
  prior conservative gate ("once F-0002 is resolved") was substituted by the actual
  concept honestly describing the draft state — the permanence-and-humility review accepted
  the substitution.

## Held by Teacher gate (drafted; not published)

- ~~**Decryption Failure Probability**~~ — `BLOCKED 2026-06-09`, **resolved
  2026-07-11**. The Simple view was authored to the standard the 2026-06-09
  review required and the re-submission PASSed:
  `sl-atlas/reviews/TEACHER-2026-07-11-decryption-failure.md`. Superseding
  decision: [`sl-researchkit/decisions/D-0004.md`](../../sl-researchkit/decisions/D-0004.md)
  (D-0003's BLOCK record is preserved unchanged). Published at learning-path
  position 7. The gate is currently empty — its first full lifecycle
  (block → hold → resolve) is on the record.

## Authored 2026-07-11 (the learner-journey round)

- ~~**The quantum threat model**~~ — authored 2026-07-11 as the atlas's new
  front door (learning-path position 1); see `threat-model.json` and
  `sl-atlas/reviews/TEACHER-2026-07-11-threat-model.md` (PASS).
- ~~**Ring-LWE and Module-LWE**~~ — authored 2026-07-11 as the bridge from
  unstructured LWE to deployed schemes (position 11); see
  `ring-module-lwe.json` and
  `sl-atlas/reviews/TEACHER-2026-07-11-ring-module-lwe.md` (PASS).
- ~~**ML-KEM (Kyber)**~~ — authored 2026-07-11 as the path's capstone
  construction study (position 12); see `ml-kem.json` and
  `sl-atlas/reviews/TEACHER-2026-07-11-ml-kem.md` (PASS; first grade-A
  construction page — the note explains why).

Also in this round (site features, not concepts — see
[`sl-atlas/decisions/D-0003.md`](../decisions/D-0003.md)): the numbered
learning path (`path` field in every concept JSON), client-side search, the
glossary, per-concept self-check questions (`checks` field), predict-then-
verify prompts in the LWE and Encoding interactives, and two new
interactives — the 2D lattice visualizer (Lattices) and the attack-cost
explorer (Parameter choices) — each with CI regression tests.

## Still ahead (candidate next concepts)

- **Signatures (ML-DSA / SLH-DSA)** — the other half of the FIPS 2024
  standards; the threat-model concept already routes readers toward the
  KEM-first migration logic that would frame it.
- **NTRU and its lineage** — the older structured family; belongs after
  ring-module-lwe once the structure discussion is load-tested.
- **The lattice estimator, hands-on** — a deeper companion to the
  attack-cost explorer if demand appears; would need careful scoping
  against the "numbers without methodology" rule.

## Constructions to document (with explicit attribution)

- ~~**S-Cloud+**~~ — authored 2026-06-09; see `scloud-plus.json` and Teacher review
  `sl-atlas/reviews/TEACHER-2026-06-09-scloud-plus.md`. The atlas page is an original
  three-depth description of *Wang et al.*'s design with attribution and explicit
  non-endorsement (per [`sl-researchkit/decisions/D-0002`](../../sl-researchkit/decisions/D-0002.md)).
  No scloud-vault content was imported; the atlas description is written from public
  knowledge of the published spec at ePrint [2024/1306](https://eprint.iacr.org/2024/1306).

## Rules for adopting external content

- Every concept whose origin is a specific paper is attributed at the Researcher depth.
- A three-depth Atlas page about someone else's construction is a *teaching artifact* of
  that work — not a claim of authorship, and not a transfer of peer-review status to any
  other lab artifact.
- "Studying X does not validate `sl-kem`." This applies to S-Cloud+, ML-KEM, FrodoKEM,
  Kyber, and any other reviewed design the atlas may explain.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
