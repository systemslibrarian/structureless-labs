# Teacher Review — sl-atlas: Side channels (new concept)

Date:     2026-06-10
Reviewer: Teacher persona
Scope:    The newly-authored "Side channels" concept
          (`sl-atlas/src/concepts.js`, mirrored at `sl-atlas/content/side-channels.json`).

First Teacher review of 2026-06-10, the day after the six-review surge of
2026-06-09. The cadence concern carried forward from the Reconciliation,
Attacks, and S-Cloud+ reviews is now operationally relevant: two
consecutive days of new-concept authoring is not yet a sustained tempo,
but it is the start of one. This review treats the carried-forward
concern as a binding constraint on what counts as a careful read — not
as a reason to look for things to BLOCK on, but as a reason to refuse to
PASS on shape alone.

## Checklist

- [x] **Simple view** exists. Inspected for footing: the concept that a
      mathematically-correct cipher can leak through the *physical act of
      running* lands on the reader without requiring the Developer view's
      vocabulary. The four channels (timing / power / EM / faults) are
      not enumerated at this depth — instead the *kind of thing* a
      channel is gets a sensory description (stopwatch, power meter,
      EM listener, voltage glitch) and the *kind of fix* is named
      (constant-time programming, with the honest qualifier that "the
      field still finds new mistakes in old code every year"). The
      Simple view's load-bearing claim — *the fix is not better math; it
      is implementation discipline* — is the central point a non-expert
      should leave with.
- [x] **Developer view** exists. Inspected for precision: the four
      channels are named with canonical references (Kocher 1996 for
      timing, Kocher-Jaffe-Jun 1999 for DPA, Boneh-DeMillo-Lipton 1997
      for faults). The lattice-KEM-specific pitfalls (secret-dependent
      rejection sampling, Gaussian-discrete table sampling vs. CBD,
      non-constant-time modular reduction, branching on the FO
      re-encryption check) are accurate and load-bearing — these are
      exactly the implementation discipline points the abstract spec
      cannot enforce. The framing that places side-channels with the
      Engineer persona rather than the spec author is consistent with
      the Attacks concept's parallel statement and with
      [`sl-researchkit/personas/ENGINEER.md`](../../sl-researchkit/personas/ENGINEER.md).
- [x] **Researcher view** exists. Inspected for formality: the
      structural argument (the standard IND-CCA proof does not bound
      leakage-aware advantage unless `Impl` is leakage-resilient by
      construction) is precise. The leakage-model taxonomy
      (bounded / noisy / simulatable / threshold-implementation) is
      correctly named. The four lattice-KEM-specific attack-surface
      points (i)-(iv) are real published results. The 2-5× cycle penalty
      for first-order masked Kyber is a widely-cited figure (and the
      Researcher view correctly bands rather than pins it).
- [x] A newcomer could find footing from the docs alone.

## Notes (carried forward, not blocking)

- **Same cadence concern as prior reviews.** The lattice-KEM specific
  attack-surface points (i)-(iv) reference real published results
  (Pessl-Bruinderink-Yarom on BLISS, multiple Kyber and Saber DPA and
  fault papers) but cite none of them individually — the Researcher
  view names them in prose without `[[…]]` cite IDs. This is the same
  pattern the Attacks and Parameter Choices reviews flagged: named-but-
  unregistered references accumulate. **Action carried forward:** add
  at least `pessl-2017` (or the canonical equivalent for the BLISS
  rejection-sampling timing attack) and one Kyber-fault citation to
  `CITATIONS.md` and to this concept's citation array. Not blocking
  because the load-bearing references (`kocher-1996`, `kocher-1999`) are
  registered.

- The Developer view's "ML-KEM, FrodoKEM, and the lab's candidate
  `sl-kem` all owe their constant-time guarantees to specific
  implementation choices" is true of ML-KEM and FrodoKEM today; for
  `sl-kem` it is *prospective* — there is no `sl-kem` implementation
  yet, only SPEC-000. The sentence does not over-claim because it says
  "owe their constant-time guarantees to specific implementation
  choices" rather than "achieve constant-time"; the reading is honest.
  Carrying the note forward because a future revision of this concept
  should re-check the wording once an `sl-kem` implementation exists.

## Cadence reflection

This is the first new concept on 2026-06-10 — the second consecutive day
of new-concept authoring after six reviews on 2026-06-09. The forward
question from the prior reviews ("should the gate introduce a review-
pacing rule?") has not yet been answered by a PI-persona decision and
should be. This review does not BLOCK because the concept's content
honestly meets the three-depth contract and the named pitfalls are
correct on inspection. It DOES register that the lab is now visibly in a
two-day tempo of new authoring, and that absent an explicit pacing rule
the next review will be in even tighter cadence territory.

## Verdict

`VERDICT: PASS`

Flight-recorder one-liner:
*Teacher PASS on Side channels (10/12 toward PREDICTION-002); two-day
new-concept tempo now visible; named-but-unregistered citations carried
forward in the same pattern as the Attacks review.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
