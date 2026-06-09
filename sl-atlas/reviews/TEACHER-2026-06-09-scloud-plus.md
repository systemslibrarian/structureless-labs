# Teacher Review — sl-atlas: S-Cloud+ (new concept)

Date:     2026-06-09
Reviewer: Teacher persona
Scope:    The newly-authored "S-Cloud+" concept
          (`sl-atlas/src/concepts.js`, mirrored at `sl-atlas/content/scloud-plus.json`).

Seventh Teacher review on 2026-06-09. The cadence concern from the
Reconciliation and Attacks reviews continues to apply. This concept is
**also** subject to the honesty-boundary review from
[`sl-researchkit/decisions/D-0002`](../../sl-researchkit/decisions/D-0002.md):
S-Cloud+ is *Wang et al.*'s design, not the lab's, and the atlas page must
not let the lab borrow that design's credibility for `sl-kem` or anything
else.

## Checklist

- [x] **Simple view** exists. Inspected for footing: a curious non-expert
      can pick up the central facts (S-Cloud+ is someone else's published
      KEM; it uses unstructured LWE plus an unusual encoder; we study it
      because the lab works in the same family). The Simple view ends with
      a deliberately bold non-endorsement sentence — Teacher gate sees this
      as *required*, not optional, on a page about someone else's work.
- [x] **Developer view** exists. Inspected for precision: the three
      distinctive design choices (ternary secrets, BW₃₂ encoding, FO
      transform) are correctly named with their attribution to Wang et al.
      and the ePrint 2024/1306 link. The relationship to scloud-vault is
      stated correctly: the atlas describes; scloud-vault implements; both
      are studies of Wang et al.'s work, neither is the lab's KEM.
- [x] **Researcher view** exists. Inspected for formality: the construction
      is stated precisely with the FO derandomization formula matching the
      paper's; the BW₃₂ kissing-number remark is accurate; the security-
      argument provenance is correctly assigned to Wang et al.
- [x] A newcomer could find footing from the docs alone.

## Honesty-boundary review (mandatory for S-Cloud+ per D-0002)

Each sentence about S-Cloud+ was checked against the test: *"would Wang et
al. and a skeptical cryptographer both read this as accurate and
non-overreaching?"*

- Simple view contains the explicit sentence "**studying S-Cloud+ does not
  mean we are endorsing it for production, and it does not make sl-kem
  more trustworthy.**" — required.
- Developer view contains "This atlas page describes S-Cloud+ as a study
  target" and "with explicit attribution and non-endorsement" — required.
- Researcher view contains "**The lab's relationship to S-Cloud+ is
  methodological-and-pedagogical only**" and the explicit non-credibility-
  transfer line — required.
- The `evidence_note` ends with "**This page is a study of someone else's
  published KEM. No security claim is made by Structureless Labs about
  S-Cloud+ or its parameters.**" — required.

No sentence was found where Structureless Labs claims authorship of S-Cloud+
or where the atlas borrows its credibility for `sl-kem` or any other
concept.

## Notes (carried forward, not blocking)

- The Researcher view's mention of `BW₃₂` reaching the Mordell minimum
  kissing-number bound is correct but the citation behind it (the Barnes-
  Wall family's classical Mordell-bound result) is not yet in
  `CITATIONS.md`. Adding it would tighten provenance; not blocking because
  the load-bearing citation (`scloud-plus-2024`) is registered and the
  Mordell remark is supplementary.

## Verdict

`VERDICT: PASS WITH NOTES`

PASS-WITH-NOTES (rather than PASS) because the honesty-boundary review is
load-bearing on a concept describing someone else's work; future edits to
this concept (e.g. by a new contributor) MUST re-pass this same boundary
check, not just the three-depth check. The note is procedural: *any non-
trivial change to this concept re-enters the Teacher gate with the D-0002
honesty boundary explicitly applied.*

Flight-recorder one-liner:
*Teacher PASS-WITH-NOTES on S-Cloud+ (9/12 toward PREDICTION-002); the
D-0002 honesty boundary holds verbatim; cadence concern continues.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
