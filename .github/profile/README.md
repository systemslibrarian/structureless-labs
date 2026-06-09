# Structureless Labs

**Open research into conservative post-quantum cryptography, cryptanalysis, and long-term digital preservation.**

> We build cryptography research in the open, where every claim is testable, every assumption is documented, and every design is invited to be broken.

---

## What this is

Most projects publish code. Structureless Labs publishes the whole research lifecycle:

- **code** — reference implementations
- **specs** — versioned, citable documents
- **attacks** — break-it-first cryptanalysis
- **failures** — fossilized dead-ends, kept forever
- **simulations** — reproducible experiments
- **predictions** — confidence-scored bets, graded later
- **decisions** — a permanent flight recorder of *why*
- **review prompts** — the AI research personas that vetted each change

This is not a claim that we have solved post-quantum cryptography. It is an **open laboratory** for learning, testing, documenting, and challenging post-quantum cryptographic ideas.

---

## The ecosystem

```
Structureless Labs
│
├─ sl-kem          Experimental KEM — the method's first test subject
├─ slff            Hybrid encrypted file container (Structureless Labs File Format)
├─ sl-atlas        Interactive learning site — explainable PQC
├─ sl-attacklab    Break-it-first cryptanalysis repo
├─ sl-bench        Benchmarks and parameter comparisons
├─ sl-vectors      Reproducible, public test vectors
└─ sl-researchkit  AI-assisted research framework (reusable across all projects)
```

| Repo | Risk | Potential | Status |
|------|------|-----------|--------|
| `sl-researchkit` | Low | Very high | Foundation — built first |
| `sl-atlas` | Low | High | Explainable-PQC, the signature feature |
| `slff` | Low | High | Integration target |
| `sl-bench` | Low | Medium | Tooling |
| `sl-vectors` | Low | Medium | Reproducibility |
| `sl-attacklab` | Medium | High | Where questions come from |
| `sl-kem` | High | High | The first primitive built *with* the framework |

The deliberate bet: the highest-probability contribution is **not** a new hard problem. It is better **analysis, methodology, integration, and tooling**. `sl-researchkit` is therefore the real product; `sl-kem` is its first customer.

---

## Principles

1. **Conservative by default.** Reviewed primitives, hybrid constructions, downgrade protection, authenticated headers.
2. **Break-it-first.** Every design ships with an open invitation to attack it.
3. **Nothing is deleted.** Old designs become fossils; wrong predictions stay on the record.
4. **Explainable at three depths.** Every concept has a *simple*, *developer*, and *researcher* view.
5. **Evidence over hype.** Claims are graded; confidence is stated; humility is built in.

---

## Start here

- New to the field? → **sl-atlas**
- Want to attack something? → **sl-attacklab**
- Want to reuse the research method? → **sl-researchkit**
- Want the experimental KEM? → **sl-kem** *(experimental — not for production)*

---

*Soli Deo Gloria — 1 Corinthians 10:31*
