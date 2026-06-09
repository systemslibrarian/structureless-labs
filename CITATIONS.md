# CITATIONS

The central registry of external works cited anywhere in Structureless Labs — atlas
concepts, decisions, findings, specs, predictions, fossils. Each entry has a stable
short ID (lowercase kebab-case) used as the reference key from those artifacts.

**Why a central registry, not inline citations?**
A repo whose principle is "every claim has a provenance chain" cannot let citations
rot independently across files. One registry, one URL per work, one canonical form
of the authors-and-venue line — and CI (`scripts/check-citations.mjs`) verifies
that every ID referenced from a concept JSON exists here.

**Honesty about the registry itself.** Where a URL is given, it is the most stable
public location for the work (preprint server, project page) — not necessarily its
canonical-of-record venue, and not necessarily the version a future reader will need.
A future commit may add a `commit:` or `version:` field per entry when version pinning
becomes load-bearing (e.g. for the FrodoKEM specification).

---

## Entries

### regev-2005
Oded Regev. *"On Lattices, Learning with Errors, Random Linear Codes, and Cryptography."*
STOC 2005; journal version: Journal of the ACM, 56(6), 2009. The foundational paper
defining the LWE problem and giving the worst-case-to-average-case reduction from
GapSVP / SIVP.

### peikert-2009
Chris Peikert. *"Public-Key Cryptosystems from the Worst-Case Shortest Vector Problem."*
STOC 2009. Extends Regev's reduction to classical hardness assumptions for a subset of
parameter regimes.

### blprs-2013
Zvika Brakerski, Adeline Langlois, Chris Peikert, Oded Regev, Damien Stehlé.
*"Classical Hardness of Learning with Errors."* STOC 2013. Strengthens the LWE-to-lattice
reduction.

### ding-2012
Jintai Ding. *"A Simple Provably Secure Key Exchange Scheme Based on the Learning with
Errors Problem."* ePrint 2012/688. Early helper-bit reconciliation construction.
<https://eprint.iacr.org/2012/688>

### peikert-2014
Chris Peikert. *"Lattice Cryptography for the Internet."* PQCrypto 2014. Develops the
reconciliation primitive used by NewHope and successors.

### newhope-2016
Erdem Alkim, Léo Ducas, Thomas Pöppelmann, Peter Schwabe. *"Post-Quantum Key Exchange
— A New Hope."* USENIX Security 2016; ePrint 2015/1092. Ring-LWE KEM using helper-bit
reconciliation.
<https://eprint.iacr.org/2015/1092>

### frodokem-2017
Joppe Bos, Craig Costello, Léo Ducas, Ilya Mironov, Michael Naehrig, Valeria Nikolaenko,
Ananth Raghunathan, Douglas Stebila. *"FrodoKEM: Practical Quantum-Secure Key
Encapsulation from Generic Lattices."* Initial submission 2017; specification revisions
through 2021. Unstructured-LWE KEM; the structural reference for `sl-kem`'s family choice.
<https://frodokem.org>

### kyber-2018
Joppe Bos, Léo Ducas, Eike Kiltz, Tancrède Lepoint, Vadim Lyubashevsky, John Schanck,
Peter Schwabe, Gregor Seiler, Damien Stehlé. *"CRYSTALS-Kyber: A CCA-Secure Module-
Lattice-Based KEM."* IEEE EuroS&P 2018. Standardized as ML-KEM (NIST FIPS 203, 2024)
— the lab's standing production recommendation.
<https://pq-crystals.org/kyber>

### dvv-2019
Jan-Pieter D'Anvers, Frederik Vercauteren, Ingrid Verbauwhede. *"On the Impact of
Decryption Failures on the Security of LWE/LWR Based Schemes."* PKC 2019; ePrint 2018/1089.
The adaptive-failure attack constraint cited by sl-atlas Encoding and Noise concepts and
by SPEC-000.
<https://eprint.iacr.org/2018/1089>

### scloud-plus-2024
Wang et al. *"S-Cloud+: A Lattice-Based Post-Quantum KEM"* (or analogous title).
ePrint 2024/1306. The published structureless-lattice KEM studied in the owner's prior
project [`crypto-lab-scloud-vault`](https://github.com/systemslibrarian/crypto-lab-scloud-vault);
see [root README §Lineage](README.md#lineage-and-related-prior-work) for the non-endorsement
boundary.
<https://eprint.iacr.org/2024/1306>

---

## How to add a new citation

1. Pick a short ID: lowercase, kebab-case, ideally `lastname-year` or `acronym-year`
   (e.g. `frodokem-2017`, `dvv-2019`). The ID becomes the stable reference key — it
   should be intelligible to a future reader without context.
2. Add a `### <id>` heading and an entry below it. Author list, title in quotes,
   venue, year. URL on its own line in `<…>` when one is reliably stable.
3. Reference the ID from a concept JSON via a `citations: ["<id>", ...]` array (the
   atlas schema validates this; see `sl-atlas/content/schema.json`).
4. CI (`scripts/check-citations.mjs`) will fail the build if any concept references
   an unregistered ID.

**Never inline the same citation in prose without registering it here.** Inline-only
citations rot silently; registered ones don't.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
