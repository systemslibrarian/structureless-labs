# Teacher Review — sl-atlas: The quantum threat model (new concept)

Date:     2026-07-11
Reviewer: Teacher persona
Scope:    The newly-authored `threat-model` concept
          (`sl-atlas/content/threat-model.json`), submitted as learning-path
          position 1 — the atlas's new front door.

Three concepts enter the gate today (threat-model, ring-module-lwe, ml-kem)
alongside one re-submission. The cadence question from June therefore
applies with full force, and this review reads accordingly: position 1 in
the path is the highest-traffic page in the atlas, and a motivational page
is the easiest place to over-claim.

## Checklist

- [x] **Simple view** exists and earns the front-door slot. The two-clock
      structure (harvest-now-decrypt-later + migration time) makes the
      urgency argument WITHOUT forecasting hardware — the honest move,
      stated outright: "honest experts disagree about when — years and
      decades are both on the table." Mosca's inequality appears as prose
      logic, not as a formula. FIPS 203 is dated correctly (August 2024).
- [x] **Developer view** exists. The breaks/survives ledger is correct:
      Shor ends RSA/DH/ECC on a CRQC; Grover is quadratic-with-caveats and
      AES-256 remains comfortable; the migration targets key establishment
      and signatures. The claim that signature migration is less urgent is
      correctly *reasoned* (forgery must be accepted in the future) rather
      than merely asserted.
- [x] **Researcher view** exists. The CRQC definition, the two-stage
      adversary framing for harvest-now-decrypt-later (Bindel et al. 2019),
      the Grover-parallelization caveat, and the FIPS 203/204/205 inventory
      are all accurate as stated. The closing sentence routes the reader to
      Attacks for the lattice-specific quantum picture — correct division
      of labor.
- [x] **Evidence grade** B with a note that splits the grade honestly: the
      algorithms are settled (A-grade on their own); the timeline synthesis
      is not. This is the right use of the grading system.
- [x] **Citations** all registered: shor-1997, mosca-2018, fips-203-2024,
      bindel-2019 (the latter two added to CITATIONS.md this date).
- [x] **Self-checks**: three questions; Q1 re-derives the two-clock
      argument, which is the one thing a reader must retain.
- [x] A newcomer could find footing from the Simple view alone — indeed
      this page is now the designated footing for the whole atlas.

## Notes (not blocking)

- The Simple view's "most estimates of z put long-lived secrets inside the
  danger zone today" (Developer view) is a synthesis claim about a survey
  literature the atlas does not cite in detail. It is hedged ("for x = 10
  and realistic y ≥ 5") and consistent with Mosca 2018; a future revision
  could cite a specific expert-survey source. Carried forward.

## Verdict

`VERDICT: PASS`

Flight-recorder one-liner:
*Teacher PASS on threat-model — the atlas gains a front door that
motivates without forecasting; timeline honesty preserved at all three
depths.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
