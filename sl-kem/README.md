# sl-kem

**Experimental KEM exploring conservative, less-structured lattice assumptions. The method's first test subject — NOT for production.**

> ⚠️ This is an open research project. It has not been peer-reviewed, standardized, or
> validated for any real-world use. **For production, use ML-KEM (NIST FIPS 203).** Use
> this repo to *learn* and to *attack*, not to encrypt anything you care about.

**Related (for study, not endorsement):** A published structureless-lattice KEM in this
design family is **S-Cloud+** by *Wang et al.* (ePrint [2024/1306](https://eprint.iacr.org/2024/1306)).
A three-depth explainer of S-Cloud+ exists in the owner's separate prior project,
[crypto-lab-scloud-vault](https://github.com/systemslibrarian/crypto-lab-scloud-vault).
That work is an explainer of Wang et al.'s published KEM; it does **not** confer review,
credibility, or production-readiness on `sl-kem`. See the root README's
[Lineage section](../README.md#lineage-and-related-prior-work) for the full provenance and
the non-endorsement boundary.

sl-kem is not the lab's headline contribution. It is the *first primitive built with*
[sl-researchkit](../sl-researchkit/) — its purpose is to exercise the framework (the six
personas, the flight recorder, the break-it-first culture, the evidence grading) on a real
lattice KEM design. If sl-kem never becomes a deployable primitive, the lab still
succeeds; the method and the explainers are the contribution.

The "structureless" in the lab's name refers primarily to the [research method](../README.md#why-structureless),
not to this primitive. The secondary technical echo — exploring lattice constructions with
less algebraic structure — applies here, but only as one design axis among many.

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
