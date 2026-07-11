# Teacher Review — sl-atlas: Ring-LWE and Module-LWE (new concept)

Date:     2026-07-11
Reviewer: Teacher persona
Scope:    The newly-authored `ring-module-lwe` concept
          (`sl-atlas/content/ring-module-lwe.json`), learning-path
          position 11 — the bridge from the atlas's unstructured-LWE
          foundations to the ML-KEM the world actually deploys.

## Checklist

- [x] **Simple view** exists. The "one row plus a rule" picture for ring
      structure is accurate at its depth (negacyclic structure rendered as
      "rotate the row, flip a sign as it wraps"). The concrete size contrast
      (800 bytes vs "nearly ten thousand") matches the Developer view's
      exact figures. Crucially, the *risk* half is carried at this depth
      too: "'no attack today' is a weaker statement than 'no structure to
      attack'" — the concept's load-bearing honest sentence, present where
      the non-expert can read it.
- [x] **Developer view** exists. `R_q = Z_q[X]/(X^n + 1)`, NTT at
      `O(n log n)`, q = 3329 NTT-friendliness, module shape as `k×k` over
      `n = 256` with k = 2/3/4, FrodoKEM-640 pk 9,616 bytes vs ML-KEM-512
      ek 800 bytes — all verifiable against the cited specs. The security
      accounting (attacks embed at dimension k·n and ignore structure) is
      the standard estimator practice, correctly stated as *current
      knowledge* rather than fact-of-nature.
- [x] **Researcher view** exists. LPR 2010 → Ideal-SVP reduction,
      Langlois-Stehlé 2015 → Module-SIVP, the rank-interpolation picture,
      and the CDPR-line caveat (quantum Ideal-SVP at large approximation
      factors; explicitly bounded away from deployed parameters) are
      accurate and correctly attributed. The closing "reasonable engineers
      land on both sides" keeps the lab's non-partisan posture.
- [x] **Evidence grade** B with the grade's reason named: the comparative
      claim tracks the cryptanalytic frontier.
- [x] **Citations** all registered, including the two added this date
      (lpr-2010, langlois-stehle-2015).
- [x] **Self-checks**: three; Q2's double-edged answer ("no attack
      advantage today, no proof there never will be") is the concept in
      one sentence.

## Verdict

`VERDICT: PASS`

Flight-recorder one-liner:
*Teacher PASS on ring-module-lwe — the structure trade is made legible
without being settled, which is the only honest way to present it.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
