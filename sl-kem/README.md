# sl-kem

**Experimental structureless-lattice KEM. Research only — NOT for production.**

> ⚠️ This is an open research project. It has not been peer-reviewed, standardized, or
> validated for any real-world use. For production, use ML-KEM. Use this to *learn* and
> to *attack*.

sl-kem is the first primitive built with [sl-researchkit](../sl-researchkit). Its purpose
is to exercise the framework — the personas, the flight recorder, the break-it-first
culture — on a real lattice KEM design.

## Design intent
The goal is **not** the smallest ciphertext or fastest benchmark. The goal is
**long-term, conservative protection** with crypto-agility designed in (see slff). It is
a Long-Term Archive KEM first, a speed contender never.

## Layout
```
spec/         Versioned specification, three-depth explainers.
decisions/    Flight recorder — why every choice was made.
fossils/      Superseded drafts, kept forever and reproducible.
predictions/  Confidence-scored bets, graded over time.
vectors/      Pointers to sl-vectors test vectors.
```

## How a change lands here
1. Open a research question (PI persona).
2. Draft / modify spec.
3. Run the PQC Red Team Checklist.
4. Six-persona review. AI-vs-AI round if security-relevant.
5. Decision record written. Superseded design fossilized.
6. Merge.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
