<!--
Pull request template for Structureless Labs.

This lab's culture is documented in:
  - CONTRIBUTING.md
  - sl-researchkit/personas/ (six personas; require all six verdicts for significant changes)
  - sl-researchkit/checklists/PQC-RED-TEAM-CHECKLIST.md (run as a merge gate)

Fill in every section. "N/A — documentation-only" is a valid answer; "I forgot" is not.
-->

## Summary
<!-- One paragraph: what this PR does and why. Link to the research question. -->

## Research question this PR serves
<!-- Required by the PI persona. If you cannot name one, this is a BLOCK. -->

## Linked artifacts
- Decision record(s): <!-- D-XXXX paths or "new — created in this PR" -->
- Finding(s) addressed: <!-- F-XXXX paths -->
- Affected spec(s): <!-- file paths and section/line -->
- Affected atlas concept(s): <!-- ids -->
- Affected test vector(s): <!-- paths -->

## Persona verdicts
<!--
Required for any change touching security-relevant artifacts. For documentation-only
changes, write "N/A" with one-sentence justification per persona.
-->
- [ ] **Principal Investigator** — research question stated; learning observable
- [ ] **Cryptographer** — hardness assumption named; no new primitive without explicit justification
- [ ] **Attacker** — at least one testable attack hypothesis on record; checked downgrade / unknown-critical paths
- [ ] **Engineer** — spec is precise enough to implement; constant-time considered; test vectors exist or scheduled
- [ ] **Archivist** — decision record exists; superseded artifacts fossilized (not deleted); long-term migration considered
- [ ] **Teacher** — Simple / Developer / Researcher views exist for any new concept; jargon defined

## Permanence checklist
- [ ] No artifact was deleted; superseded files moved to `fossils/`
- [ ] All security-relevant claims carry an evidence grade
- [ ] Cross-references to decisions, findings, vectors point at real paths

## CI gates that must pass
- [ ] `validate-atlas` — every concept JSON validates against schema
- [ ] `check-atlas-parity` — concepts.js ↔ content/ in sync
- [ ] `gen-status --check` — STATUS.md is up to date (run `node scripts/gen-status.mjs` and commit if not)
- [ ] Link checker — no broken cross-references

## What this PR is NOT claiming
<!-- Required for any change that touches a security claim. -->
