# Teacher Review — sl-atlas: Hybrid constructions (new concept)

Date:     2026-06-10
Reviewer: Teacher persona
Scope:    The newly-authored "Hybrid constructions" concept
          (`sl-atlas/src/concepts.js`, mirrored at
          `sl-atlas/content/hybrid-constructions.json`).

Second Teacher review of 2026-06-10. The cadence concern carried forward
from yesterday's reviews and from this morning's Side-channels review
applies in the same form. Hybrid constructions is a doctrinally load-
bearing concept for this lab — Article 1 of the [CONSTITUTION](../../CONSTITUTION.md)
names hybrid constructions explicitly as the conservative default — so
this review weighs the concept against the constitutional commitment as
well as the three-depth contract.

## Checklist

- [x] **Simple view** exists. Inspected for footing: the *two locks at
      once* framing lands without requiring any cryptographic vocabulary
      beyond what a curious non-expert already brings. The hedge logic
      ("you only lose the secret if *both* fall") is the right entry
      point — it explains the **why** before any algorithm names appear.
      The Simple view names ECDH, ML-KEM, and FrodoKEM as concrete
      examples but does not require the reader to know how any of them
      work to follow the argument. The explicit constitutional anchor
      ("This is the position the lab's CONSTITUTION Article 1 commits
      to") connects the explanation to the lab's stated method.
- [x] **Developer view** exists. Inspected for precision: the combiner
      construction is stated in full (`K ← KDF(K₁ ‖ K₂ ‖ c₁ ‖ c₂ ‖ context)`)
      with the load-bearing detail — *the KDF input must include both
      ciphertexts* — called out as load-bearing rather than buried. The
      Giacon-Heuer-Poettering (2018) result (ciphertext binding is
      necessary, not optional) is correctly cited as the reason. The
      three real-world deployment classes (X25519+ML-KEM-768 for TLS
      hybrid, P-256+ML-KEM-768 for CNSA 2.0, X25519+FrodoKEM-976 for
      conservative profiles) are accurate as of 2026-06. The "why
      bother" enumeration ((1) cryptanalysis hedge, (2) compliance
      reality, (3) constitutional conservatism) is the correct
      enumeration for a developer audience.
- [x] **Researcher view** exists. Inspected for formality: the IND-CCA
      bound `ε_{Hybrid} ≤ ε₁ + ε₂` is correctly stated as a sum-bound
      (modulo standard model-specific reductions), not as an unqualified
      equality. The Giacon-Heuer-Poettering vs. Bindel-et-al. division of
      labor (combiner proofs vs. AKE-level results, harvest-now-decrypt-
      later) is precise. The ciphertext-binding-is-necessary claim
      points to the canonical counter-example. The deployment paragraph
      avoids a common over-claim — that a particular hybrid is *better*
      than another — and instead names the current consensus
      instantiations without ranking them.
- [x] A newcomer could find footing from the docs alone.

## Honesty-boundary review (mandatory by extension of D-0002)

This concept is not about someone else's specific design (unlike
S-Cloud+), so the D-0002 honesty boundary does not apply verbatim. But a
related boundary does apply: the concept must not allow the lab's
endorsement of *the hybrid pattern* to slide into an implicit
endorsement of any specific deployment as production-ready. Read with
that test:

- The Simple view ends with the constitutional anchor, not with a
  recommendation that the reader use any specific hybrid.
- The Developer view's "current consensus instantiations" sentence lists
  three families and explicitly attributes them to their venues (IETF
  drafts, CNSA 2.0) rather than endorsing any one.
- The Researcher view's "current consensus instantiations" paragraph
  similarly lists without ranking, and explicitly notes that "the
  deployment landscape moves but the construction pattern does not"
  (echoed in the `evidence_note`).

No sentence borrows the credibility of ML-KEM, X25519, or FrodoKEM to
endorse `sl-kem`, `slff`, or any other lab artifact. The slff cross-link
in both depths is correctly bounded as *slff is built to carry hybrid
natively*, not as *slff is itself ready*.

## Notes (carried forward, not blocking)

- The deployment landscape sentence ("the IETF TLS hybrid-KEM drafts,
  CNSA 2.0, conservative profiles using X25519+FrodoKEM-976") is
  accurate as of 2026-06-10. This is the moving-target part of the
  concept; the `evidence_note`'s framing ("Grade A because the
  underlying proofs are stable; the deployment landscape moves but
  the construction pattern does not") is the right disclaimer. **Action
  for a future reviewer:** when CNSA 2.0 or the TLS hybrid drafts ship
  formally, the specific named instantiations in the Developer and
  Researcher views should be re-checked against what was actually
  standardized. Not blocking because the named instantiations were the
  consensus at authoring time and the prose is dated implicitly through
  the citation registry.

- The phrase "harvest-now-decrypt-later" in the Researcher view is the
  load-bearing motivation for near-term hybrid deployment and is
  correctly attributed to Bindel et al. (2019). A future revision might
  reasonably add the threat model as its own atlas concept (a "Threat
  models" page does not yet exist), but the current cross-reference is
  sufficient.

## Cadence reflection

Third new concept across two days. The forward question — *is the gate's
discriminating power readable to a skeptical outside reader?* — gets
sharper with each PASS. Today's two PASS verdicts are not BLOCKable on
content; they are BLOCKable only if the lab decides the cadence itself
is the problem. That decision is not the Teacher's to make; it is the
PI persona's. This review formally requests that decision before any
fourth new concept enters the gate.

## Verdict

`VERDICT: PASS WITH NOTES`

PASS-WITH-NOTES (rather than PASS) because of the moving-target
deployment-landscape sentences in the Developer and Researcher views.
The notes are procedural: any non-trivial change to the named
instantiations re-enters the Teacher gate with the current standards
landscape applied; and the cadence-pacing question is now a formal
outstanding item for the PI persona to address.

Flight-recorder one-liner:
*Teacher PASS-WITH-NOTES on Hybrid constructions (11/12 toward
PREDICTION-002); constitutional anchor explicitly honored; deployment-
landscape sentences flagged as moving targets; cadence-pacing question
formally referred to the PI persona.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
