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

- **Decryption Failure Probability** — `BLOCKED 2026-06-09`. Draft exists at
  `decryption-failure.json` with Developer and Researcher views authored;
  Simple view explicitly missing. Teacher review:
  `sl-atlas/reviews/TEACHER-2026-06-09-decryption-failure.md`. Flight-recorder
  decision: `sl-researchkit/decisions/D-0003.md`. Resolution path: author the
  Simple view to the standard the Teacher gate requires, then re-submit. The
  draft does NOT count toward [`PREDICTION-002`](../../sl-kem/predictions/PREDICTION-002.md).

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
