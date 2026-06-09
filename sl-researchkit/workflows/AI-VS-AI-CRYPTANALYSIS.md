# Workflow: AI vs AI Cryptanalysis

Two agent teams work the same target without seeing each other's output, then converge.
The goal is **not** a security proof — it is *generating questions* that a single
perspective would miss.

## Roles
- **Team Blue** — improves the design. Uses CRYPTOGRAPHER + ENGINEER personas.
- **Team Red** — attempts to break it. Uses ATTACKER persona, adversarial mindset.
- **Referee** — the PRINCIPAL INVESTIGATOR. Holds both outputs, then compares.

## Procedure
1. Freeze a target (a spec version + parameter set). Tag it in sl-attacklab/targets.
2. Blue and Red run in isolation. Neither sees the other's notes.
3. Each produces a written report (findings, hypotheses, confidence).
4. Referee merges: where do they agree? disagree? What did each miss?
5. Confirmed leads → sl-attacklab/findings. New questions → research log.
6. Anything that changes the design → a decision record + persona review.

## Output
A `round-NNNN.md` in sl-attacklab summarizing both reports and the open questions raised.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
