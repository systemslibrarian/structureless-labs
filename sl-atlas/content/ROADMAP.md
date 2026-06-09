# sl-atlas Roadmap

Concepts visible as "Roadmap" stubs in the sidebar but not yet authored. Each must enter
the Teacher gate before it is published — see
[`sl-researchkit/personas/TEACHER.md`](../../sl-researchkit/personas/TEACHER.md).

## Foundations still to author
- ~~**Encoding**~~ — authored 2026-06-09; see `encoding.json` and Teacher review
  `sl-atlas/reviews/TEACHER-2026-06-09-encoding.md`.
- **Reconciliation** — how two parties agree on a shared key from noisy samples.
- **Parameter choices** — the `(n, q, χ)` trade-off space, and the standards' choices.
- **Attacks** — BKZ, sieving, dual attacks; where concrete security comes from.

## Constructions to document (with explicit attribution)

- **S-Cloud+** — *Wang et al.*, ePrint [2024/1306](https://eprint.iacr.org/2024/1306).
  A published structureless-lattice KEM: unstructured LWE with ternary secrets, Barnes-Wall
  (BW₃₂) lattice coding, and a Fujisaki-Okamoto transform. A three-depth treatment of
  S-Cloud+ already largely exists in the owner's separate prior project,
  [crypto-lab-scloud-vault](https://github.com/systemslibrarian/crypto-lab-scloud-vault)
  ([live demo](https://systemslibrarian.github.io/crypto-lab-scloud-vault/)), which
  explains and faithfully reimplements Wang et al.'s design.

  **Status:** `planned`.
  **TODO:** adapt with attribution to Wang et al. — do **not** import scloud-vault content
  into this atlas without an explicit decision; the adaptation must clearly preserve
  Wang et al.'s authorship and must not let the atlas borrow scloud-vault's (or S-Cloud+'s)
  credibility for any other concept.

## Rules for adopting external content

- Every concept whose origin is a specific paper is attributed at the Researcher depth.
- A three-depth Atlas page about someone else's construction is a *teaching artifact* of
  that work — not a claim of authorship, and not a transfer of peer-review status to any
  other lab artifact.
- "Studying X does not validate `sl-kem`." This applies to S-Cloud+, ML-KEM, FrodoKEM,
  Kyber, and any other reviewed design the atlas may explain.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
