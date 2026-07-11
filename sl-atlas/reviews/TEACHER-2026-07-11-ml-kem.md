# Teacher Review — sl-atlas: ML-KEM (Kyber) (new concept)

Date:     2026-07-11
Reviewer: Teacher persona
Scope:    The newly-authored `ml-kem` concept
          (`sl-atlas/content/ml-kem.json`), learning-path position 12 and
          category `constructions` — the atlas's second study of someone
          else's published construction, after S-Cloud+.

The S-Cloud+ review established the standard for construction studies:
original three-depth prose, explicit attribution, and a non-endorsement
boundary that survives every depth. This review applies the same standard
plus one new question — ML-KEM is a *standard*, so the page must track the
FIPS text rather than the round-3 paper where they differ.

## Checklist

- [x] **Simple view** exists. The KEM job description ("locks a fresh
      random key inside a small package") is exact at its depth. The
      deployment claim ("a good chance an ML-KEM handshake protected the
      connection") is true as of the authoring date and phrased as
      likelihood, not census. The lab's provenance voice is present:
      "explaining it neither endorses every deployment... nor transfers
      its pedigree."
- [x] **Developer view** exists. KeyGen/Encaps/Decaps are correct at the
      stated altitude: seed-expanded `A`, `t = A·s + e`, derandomized
      encryption from `m ‖ H(ek)`, encode-at-q/2, compression-as-noise,
      re-encryption check with implicit rejection, constant-time
      requirement flagged toward Side channels. Sizes (800/1184/1568 ek;
      768/1088/1568 ct) and failure rates (2⁻¹³⁹/2⁻¹⁶⁴/2⁻¹⁷⁴) match
      FIPS 203. Cross-links stitch the concept to seven prior atlas pages —
      the "capstone" function of this page in the learning path.
- [x] **Researcher view** exists. FO^̸⊥ in the HHK framing, ROM/QROM
      tightness caveat, δ's role in the CCA bound, the FIPS-203-differs-
      from-round-3 warning with "treat the FIPS text and its vectors as the
      contract," and the category claims routed through the estimator
      methodology with the lab's standing caveat. Attribution is complete.
- [x] **Evidence grade A** — the first construction page to carry it. The
      note is careful: A is for the construction-as-published and its
      provenance (a finalized federal standard, eight years of open
      analysis); the concrete-security caveat is explicitly delegated to
      Parameter choices at grade B. This split is correct and the grade is
      earned. S-Cloud+ remains B; the differential (standardized + longer
      scrutiny vs ePrint publication) is exactly what the grading system
      is for.
- [x] **Citations** registered: fips-203-2024 (added this date),
      kyber-2018, dvv-2019, giacon-2018.
- [x] **Self-checks**: three; Q2 (why re-encrypt on decapsulation) is the
      question every implementer should be able to answer and usually
      cannot.
- [x] Non-endorsement boundary survives all three depths.

## Verdict

`VERDICT: PASS`

Flight-recorder one-liner:
*Teacher PASS on ml-kem — the standard explained as a study, graded A for
what is settled and routed to B for what is not; the learning path now
runs from "why" to the deployed artifact.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
