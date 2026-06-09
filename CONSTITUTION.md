# Structureless Labs Research Constitution

This document governs how all Structureless Labs research is conducted. It is binding on
humans and AI agents working in any sub-repo (`sl-researchkit`, `sl-atlas`, `sl-kem`,
`slff`, `sl-bench`, `sl-vectors`, `sl-attacklab`).

> The constitution originally lived in `sl-kem/CONSTITUTION.md` because `sl-kem` was the
> first project to instantiate the method. As the method became the lab's identity (per
> [`sl-researchkit/decisions/D-0001.md`](sl-researchkit/decisions/D-0001.md)), it was
> promoted here to its proper org-level home. The `sl-kem/` location is preserved as a
> pointer per the "nothing is deleted" principle.

## Articles

1. **Conservatism.** Prefer reviewed primitives and hybrid constructions. Inventing a
   primitive requires explicit, recorded justification and a Cryptographer BLOCK-clearance.

2. **Falsifiability.** Every security claim must be falsifiable and evidence-graded.

3. **Break-it-first.** No design merges without an Attacker review and at least one
   testable attack hypothesis on record.

4. **Permanence.** Nothing is deleted. Superseded designs are fossilized; wrong
   predictions remain on the record.

5. **Explainability.** Every concept ships with Simple / Developer / Researcher views.

6. **Provenance.** Every significant decision has a flight-recorder entry.

7. **Humility.** We state what we are not claiming. We re-ask monthly:
   *would we build the same design today?*

## Amendment

This constitution may be amended only by a recorded decision
([flight-recorder format](sl-researchkit/workflows/FLIGHT-RECORDER.md)) reviewed by all
six personas in [`sl-researchkit/personas/`](sl-researchkit/personas/). An amendment
that succeeds without a full six-persona review is invalid.

## Enforcement

The constitution is enforced in two ways:

1. **By humans and AI personas at review time.** The six-persona review at
   [`sl-researchkit/personas/`](sl-researchkit/personas/) is the merge gate. Each
   persona maps to specific Articles: Cryptographer to (1), Attacker to (2)+(3),
   Engineer to (5)+(6), Archivist to (4)+(6), Teacher to (5), Principal Investigator
   to all of them.

2. **By CI on every push.** Automated gates catch the failure modes a tired reviewer
   misses — schema, content parity, citation resolution, status-surface freshness,
   link integrity, anti-fabrication. See [`scripts/`](scripts/) for the gate
   implementations and [`.github/workflows/`](.github/workflows/) for the runners.

A change that bypasses both human and automated enforcement is, by definition,
unaccountable to this constitution.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
