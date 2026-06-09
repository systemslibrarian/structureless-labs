# Teacher Review — sl-atlas: Encoding (new concept)

Date:     2026-06-09
Reviewer: Teacher persona
Scope:    The newly-authored "Encoding" concept (`sl-atlas/src/concepts.js`,
          mirrored at `sl-atlas/content/encoding.json`).

This is a separate review from the earlier `TEACHER-2026-06-09.md`, which
covered the four pre-existing concepts. Adding a fifth concept the same day
re-enters the gate per the standard rule.

## Checklist

- [x] **Simple view** exists. Inspected for footing: a curious non-expert can
      understand "encoding" via the "stamped tile in a grid" metaphor and the
      "spacing matters" intuition, without prior lattice knowledge.
- [x] **Developer view** exists. Inspected for precision: the `(E, D)` pair,
      the recovery property, the named code families (bit-by-bit, Reed-Muller,
      Reed-Solomon, Barnes-Wall), and the `(n, τ, |M|)` knob are all stated
      operationally; a programmer can map the prose to code intent without
      researcher-level math.
- [x] **Researcher view** exists. Inspected for formality: the recovery
      property is given a precise statement; the decryption-failure
      probability is given a formula; the lattice-estimator interaction is
      named; attribution to Wang et al. for the `BW₃₂` choice is in-place;
      a hazard reference (D'Anvers et al., 2019) is cited for the decryption-
      failure attack surface.
- [x] A newcomer could find their footing from the docs alone (the Simple
      view does not require the Researcher view to make sense).

## Notes (carried forward, not blocking)

- The mention of S-Cloud+ is descriptive ("the `BW₃₂` instance used in
  S-Cloud+ is one concrete realization") and attributes Wang et al. The
  honesty boundary from D-0002 is respected: the atlas explains the design
  choice without claiming credit for it.
- D'Anvers et al. (2019) is cited by name only. When sl-atlas grows a
  citations / references convention, this reference should resolve to it.

## Verdict

`VERDICT: PASS`

Flight-recorder one-liner:
*Teacher PASS on the newly-authored Encoding concept (5/12 toward PREDICTION-002);
S-Cloud+ attribution honored; one carried-forward note about a future citation
convention.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
