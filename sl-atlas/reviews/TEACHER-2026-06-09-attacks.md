# Teacher Review — sl-atlas: Attacks (new concept)

Date:     2026-06-09
Reviewer: Teacher persona
Scope:    The newly-authored "Attacks" concept
          (`sl-atlas/src/concepts.js`, mirrored at `sl-atlas/content/attacks.json`).

Sixth Teacher review on 2026-06-09. The cadence concern is now louder, not quieter.

## Checklist

- [x] **Simple view** exists. Inspected for footing: the three named ways
      ("find the secret directly / find a close secret / get the decoder to
      leak by failing") are accurate at the abstraction level and survive
      without requiring the Developer view's specifics. The fourth family
      (side-channels) is correctly named as living *outside* the math — a
      crucial distinction newcomers often miss.
- [x] **Developer view** exists. Inspected for precision: the three formal
      families (lattice / combinatorial / adaptive-failure) are named with
      their canonical references; the cost-model framing (core-SVP, `β`) is
      correct; the relationship between attack family and design knob
      ((1)→dimension, (3)→noise, (2)→sanity) is stated explicitly.
- [x] **Researcher view** exists. Inspected for formality: the primal-via-
      Kannan-embedding and dual-via-SIS reductions are precisely named; the
      core-SVP mapping is given with classical and quantum exponents; the
      decryption-failure attack lineage (D'Anvers 2019, with Guo-Johansson
      2021 and Bindel-Schanck 2020 carried forward as future citations) is
      named; side-channels are correctly placed outside the formal security
      argument.
- [x] A newcomer could find footing from the docs alone.

## Notes (carried forward, not blocking)

- **Same as Parameter choices:** BDGL 2016, Guo-Johansson 2021, Bindel-Schanck
  2020, and Chen-Nguyen 2011 are named only — none has an entry in
  `CITATIONS.md` yet. **Action:** add at least `bdgl-2016` and `chen-nguyen-2011`
  to `CITATIONS.md` and the citation arrays here. Not blocking because the
  load-bearing references (`regev-2005`, `dvv-2019`, `albrecht-2015`) are
  registered.

- The Researcher view's "modern schemes target `δ ≤ 2^{-160}`" is widely
  cited but the exact exponent varies (some target `2^{-128}` for level-1,
  some target `2^{-160}` for all levels). The note in the prose is broadly
  correct but readers who chase the exact number will find variation. Not
  a BLOCK — the Developer view's `≤ 2⁻¹⁶⁰ or tighter` accurately reflects
  the range.

## Cadence reflection

This is the sixth Teacher review the same day. The forward question from
the Reconciliation review — "should the gate introduce a review-pacing
rule?" — is louder, not quieter. This review does not BLOCK the concept
because the concept's content honestly meets the three-depth contract; it
DOES register that the PASS-rate today (5 of 5 PASSes after one BLOCK)
makes the gate's discriminating power harder to read from the outside.

The Reconciliation review's forward question stands as a Principal-
Investigator-persona item to be addressed before the next Teacher review.

## Verdict

`VERDICT: PASS`

Flight-recorder one-liner:
*Teacher PASS on Attacks (8/12 toward PREDICTION-002); cadence concern logged
loudly; multiple named-but-unregistered citations carried forward.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
