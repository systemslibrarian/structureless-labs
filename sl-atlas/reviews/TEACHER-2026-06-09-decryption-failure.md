# Teacher Review — sl-atlas: Decryption Failure Probability (new concept)

Date:     2026-06-09
Reviewer: Teacher persona
Scope:    Proposed new concept `decryption-failure` (draft at
          `sl-atlas/content/decryption-failure.json`).

This is the fourth Teacher review on 2026-06-09. The first three each
returned PASS on a concept whose three depths were all populated. This
review is the first to return BLOCK — on a concept submitted with only
Developer and Researcher views authored.

## Checklist

- [ ] **Simple view exists.** The submitted `views.simple` is `null`. The
      author proceeded straight from "this matters" to the Developer view's
      precise formulation (noise convolution, decoding radius, the D'Anvers
      attack). A curious non-expert cannot find their footing here.
- [x] **Developer view exists** and is precise. The two load-bearing roles
      of `δ` (correctness + adaptive-attack resistance) are clearly stated.
- [x] **Researcher view exists** and is formal. The `δ = Pr[‖e‖_∞ > q/4]`
      formulation, the two-bound trade-off, the D'Anvers et al. (2019)
      citation, and the second-order effects on the lattice estimator are
      all correct as stated. Attribution is in place.
- [ ] **A newcomer could find their footing from the docs alone.** Without
      the Simple view, a curious non-expert can only reach this concept by
      reading the Developer view, which assumes prior comfort with `‖·‖`,
      probability convolution, and the language of "decoders" and "decoding
      radius." This is exactly the failure mode the Teacher gate exists to
      prevent.

## Why this fails the contract

The lab's [`CONSTITUTION` article 5](../../sl-kem/CONSTITUTION.md) — and the
[Teacher persona's mandate](../../sl-researchkit/personas/TEACHER.md) —
require Simple / Developer / Researcher views for every concept. Two-out-of-
three is not a passing mark; it is the absence of the signature feature for
the missing depth. Publishing this concept with `views.simple = null` would
be the lab claiming "explainable at three depths" while shipping at two.

## What must change before this can re-enter the gate

1. **Author a Simple view** that explains:
   - The concept of *the decoder occasionally getting the wrong message
     even though every party followed the rules*.
   - Why the probability has to be made *astronomically* small (both for
     correctness *and* because attackers exploit non-trivial failure rates).
   - Intuition that it is not "tolerate some errors" but "design so errors
     are functionally impossible."
   The Simple view should stand on its own without requiring the
   Developer or Researcher views to make sense.
2. **Verify the Simple view does not silently weaken the claim.** The
   adaptive-attack point (D'Anvers et al.) must survive the simplification.
   "Failures are bad" is necessary but not sufficient; "failures help
   attackers" must also survive.
3. **Re-submit** for a fresh Teacher review. The PASS/BLOCK decision is per
   submission, not per concept.

## Verdict

`VERDICT: BLOCK`

Do not merge `decryption-failure` into `sl-atlas/src/concepts.js`. The
draft stays in `sl-atlas/content/decryption-failure.json` with its
`status` field marking it BLOCKED so future authors do not accidentally
promote it without resolving the missing depth.

Flight-recorder one-liner:
*Teacher BLOCK on the proposed `decryption-failure` concept — Simple view
missing; publication held pending its authoring. First BLOCK on the record
in this lab; resolves a forward question about whether the personas have
teeth (yes).*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
