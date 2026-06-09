# Workflow: The Cryptography Flight Recorder

A permanent, append-only record of *why* cryptographic decisions were made. Stored as
decision records so the design history can be reconstructed decades later.

## When to record
Any significant choice: parameters, constructions, format fields, trade-offs, rejections.

## Format (one file per decision, `D-XXXX.md`)

```
Decision ID: D-0042
Question:     Should q be increased?
Alternatives: 32768 | 65536 | 131072
Chosen:       32768
Reason:       Simpler implementation and acceptable simulation results.
Risks:        Potentially lower security margin.
Evidence:     Grade C (sl-bench run 2027-02), see link.
Reviewed by:  PI, Cryptographer, Attacker, Engineer, Archivist, Teacher
Date:         2027-02-18
Status:       Active | Superseded by D-XXXX | Reverted
```

Decisions are never edited destructively. Superseding a decision creates a new record
that points back to the old one. The old one stays.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
