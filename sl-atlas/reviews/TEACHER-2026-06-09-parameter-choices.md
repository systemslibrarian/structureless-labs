# Teacher Review — sl-atlas: Parameter choices (new concept)

Date:     2026-06-09
Reviewer: Teacher persona
Scope:    The newly-authored "Parameter choices" concept
          (`sl-atlas/src/concepts.js`, mirrored at `sl-atlas/content/parameter-choices.json`).

This is the fifth Teacher review on 2026-06-09 (after the original four-concept
review, encoding, reconciliation, decryption-failure-BLOCK, and now this one).
The carried-forward cadence question from the Reconciliation review is **still
open**; this review acknowledges that but does not by itself re-litigate it.

## Checklist

- [x] **Simple view** exists. Inspected for footing: the "balance / tuning an
      instrument" metaphor + the named-knob list (dimension, modulus, noise size)
      stand on their own. A curious non-expert understands the *shape* of the
      trade-off without needing prior crypto knowledge.
- [x] **Developer view** exists. Inspected for precision: the three constraints
      (`λ`, `δ`, bandwidth/latency) are named verbatim; the trade is correctly
      described as non-monotone; ML-KEM-512 and FrodoKEM-640 are named as
      occupying different positions in the triangle. A programmer can sketch a
      parameter-search loop from this view.
- [x] **Researcher view** exists. Inspected for formality: the lattice-estimator
      reference (Albrecht-Player-Scott 2015) is cited; the core-SVP cost model
      with `2^{0.292β}` and `2^{0.265β}` mapping is stated; the D'Anvers (2019)
      adaptive-failure constraint is named; the moving-target nature of the
      estimator's output is called out, tying back to the lab's own
      sl-bench INTERPRETATION rule.
- [x] A newcomer could find footing from the docs alone.

## Notes (carried forward, not blocking)

- The Researcher view's reference to "BDGL 2016" is named only — the citation
  registry does not (yet) include an entry for Becker-Ducas-Gama-Laarhoven
  2016. The Attacks concept's review carries the same note. **Action:** add
  `bdgl-2016` to `CITATIONS.md` and the citation arrays in both this concept
  and Attacks. Logged as a forward question; not blocking this PASS because
  the prose is internally complete and the lattice-estimator citation
  (`albrecht-2015`) carries the load-bearing reference.

## Verdict

`VERDICT: PASS`

Flight-recorder one-liner:
*Teacher PASS on Parameter choices (7/12 toward PREDICTION-002); the cadence
question from the Reconciliation review remains open and unresolved by this
review.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
