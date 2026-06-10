Prediction 003
Date:       2026-06-10
Prediction: `sl-kem/decisions/D-0004.md` — the specific-reference-selection
            decision named by [D-0003 (sl-kem)](../decisions/D-0003.md) and
            mapped by
            [`sl-kem/spec/AUTHORING-BRIEF-SPEC-001.md`](../spec/AUTHORING-BRIEF-SPEC-001.md)
            — will be authored, with all six persona verdicts on the record,
            by **2026-07-10** — thirty days from the date of this prediction.
Confidence: 35%
Evidence:   Base rate for "next concrete owner-driven decision" landing
            within 30 days in this project (grade D — too early to be
            meaningfully measurable, but the base rate so far is roughly
            one major decision per several days when the owner is active).
            The 35% figure is deliberately *under* 50% for three reasons:

            1. **D-0004 is the most consequential decision the lab has
               faced so far.** Picking between FrodoKEM-{640, 976, 1344}
               (the conservative-lattice match for `sl-kem`'s stated
               framing), ML-KEM-{512, 768, 1024} (the NIST standard, which
               would require revising the secondary "structureless" axis
               framing), and S-Cloud+ (the lineage match, with the
               tightest non-endorsement fence) is *not* a quick call.
               The Cryptographer + PI personas will demand published
               security arguments at grade ≥ B; the Teacher persona will
               demand the public-facing one-sentence summary
               (D-0003's template); the Archivist will demand the exact
               version / date / section of the source publication. None
               of those is trivial to fill in.

            2. **D-0004 is gated on at least three secondary decisions
               (D-0005..D-0009 per the authoring brief) before SPEC-001
               can actually ship.** A reasonable owner may decide to
               author D-0004 in the same 30-day window as the encoder /
               hash / serialization decisions, in which case the
               authoring brief's full chain takes more than 30 days
               even if individual decisions are quick. The prediction
               is about D-0004 specifically, not the whole chain.

            3. **June 2026 was the lab's first operational month; tempo
               is not yet established.** A 30-day prediction inherits
               the tempo uncertainty — the only signal is the previous
               two weeks of activity, which is a noisy estimator.

            A confidence above 50% would imply higher conviction than the
            evidence supports. A confidence below ~20% would suggest the
            authoring brief was futile work, which is not what the
            evidence shows (it converted a deferred TODO into an
            actionable map). 35% is the honest midpoint.
Grade by:   2026-07-10 (the prediction grades itself at the 30-day mark;
            no extensions).

Falsification rule: On 2026-07-10, the prediction is graded by inspecting
`sl-kem/decisions/`. The prediction held if and only if a file named
`D-0004.md` exists at that path AND the file contains six distinct
persona verdicts (Principal Investigator, Cryptographer, Attacker,
Engineer, Archivist, Teacher) in the format established by D-0001
through D-0003. A draft committed but with persona votes still marked
TODO does NOT satisfy the prediction — the verdicts are the load-bearing
part of the decision format, not the existence of the file.

Outcome:    (unresolved)
Resolved:   —
Lesson:     —

Provenance:
Filed under the Time Capsules workflow
([`sl-researchkit/workflows/TIME-CAPSULE-PREDICTIONS.md`](../../sl-researchkit/workflows/TIME-CAPSULE-PREDICTIONS.md))
with an explicit Grade-by date (the same additive extension PREDICTION-002
introduced). The prediction is filed *after* the authoring brief landed
(see [`AUTHORING-BRIEF-SPEC-001.md`](../spec/AUTHORING-BRIEF-SPEC-001.md))
so the bet is honest about what the lab knows when it places it: D-0004
is well-mapped, but the owner has not yet started authoring it.

Why this prediction matters more than its 35% suggests:
A LOW-confidence prediction graded WRONG is a stronger signal than a
HIGH-confidence prediction graded RIGHT. If 2026-07-10 arrives without
D-0004 on the record, the lab's standing answer to the million-dollar
question (*"can `sl-kem`'s parameter answer be one decision away
indefinitely?"*) gets the most informative possible data point: a
recorded falsification. That is the bet behind filing this prediction
under-confidence rather than at a face-saving ~50%.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
