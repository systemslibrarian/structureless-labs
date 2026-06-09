/* GENERATED FILE — DO NOT EDIT.
   Regenerate with: node scripts/gen-atlas-citations.mjs
   Source: CITATIONS.md at the repo root. CI fails if this file drifts. */

window.SL_ATLAS_CITATIONS = {
  "blprs-2013": {
    id: "blprs-2013",
    body: "Zvika Brakerski, Adeline Langlois, Chris Peikert, Oded Regev, Damien Stehlé.\n*\"Classical Hardness of Learning with Errors.\"* STOC 2013. Strengthens the LWE-to-lattice\nreduction.",
    url: null
  },
  "ding-2012": {
    id: "ding-2012",
    body: "Jintai Ding. *\"A Simple Provably Secure Key Exchange Scheme Based on the Learning with\nErrors Problem.\"* ePrint 2012/688. Early helper-bit reconciliation construction.",
    url: "https://eprint.iacr.org/2012/688"
  },
  "dvv-2019": {
    id: "dvv-2019",
    body: "Jan-Pieter D'Anvers, Frederik Vercauteren, Ingrid Verbauwhede. *\"On the Impact of\nDecryption Failures on the Security of LWE/LWR Based Schemes.\"* PKC 2019; ePrint 2018/1089.\nThe adaptive-failure attack constraint cited by sl-atlas Encoding and Noise concepts and\nby SPEC-000.",
    url: "https://eprint.iacr.org/2018/1089"
  },
  "frodokem-2017": {
    id: "frodokem-2017",
    body: "Joppe Bos, Craig Costello, Léo Ducas, Ilya Mironov, Michael Naehrig, Valeria Nikolaenko,\nAnanth Raghunathan, Douglas Stebila. *\"FrodoKEM: Practical Quantum-Secure Key\nEncapsulation from Generic Lattices.\"* Initial submission 2017; specification revisions\nthrough 2021. Unstructured-LWE KEM; the structural reference for `sl-kem`'s family choice.",
    url: "https://frodokem.org"
  },
  "kyber-2018": {
    id: "kyber-2018",
    body: "Joppe Bos, Léo Ducas, Eike Kiltz, Tancrède Lepoint, Vadim Lyubashevsky, John Schanck,\nPeter Schwabe, Gregor Seiler, Damien Stehlé. *\"CRYSTALS-Kyber: A CCA-Secure Module-\nLattice-Based KEM.\"* IEEE EuroS&P 2018. Standardized as ML-KEM (NIST FIPS 203, 2024)\n— the lab's standing production recommendation.",
    url: "https://pq-crystals.org/kyber"
  },
  "newhope-2016": {
    id: "newhope-2016",
    body: "Erdem Alkim, Léo Ducas, Thomas Pöppelmann, Peter Schwabe. *\"Post-Quantum Key Exchange\n— A New Hope.\"* USENIX Security 2016; ePrint 2015/1092. Ring-LWE KEM using helper-bit\nreconciliation.",
    url: "https://eprint.iacr.org/2015/1092"
  },
  "peikert-2009": {
    id: "peikert-2009",
    body: "Chris Peikert. *\"Public-Key Cryptosystems from the Worst-Case Shortest Vector Problem.\"*\nSTOC 2009. Extends Regev's reduction to classical hardness assumptions for a subset of\nparameter regimes.",
    url: null
  },
  "peikert-2014": {
    id: "peikert-2014",
    body: "Chris Peikert. *\"Lattice Cryptography for the Internet.\"* PQCrypto 2014. Develops the\nreconciliation primitive used by NewHope and successors.",
    url: null
  },
  "regev-2005": {
    id: "regev-2005",
    body: "Oded Regev. *\"On Lattices, Learning with Errors, Random Linear Codes, and Cryptography.\"*\nSTOC 2005; journal version: Journal of the ACM, 56(6), 2009. The foundational paper\ndefining the LWE problem and giving the worst-case-to-average-case reduction from\nGapSVP / SIVP.",
    url: null
  },
  "scloud-plus-2024": {
    id: "scloud-plus-2024",
    body: "Wang et al. *\"S-Cloud+: A Lattice-Based Post-Quantum KEM\"* (or analogous title).\nePrint 2024/1306. The published structureless-lattice KEM studied in the owner's prior\nproject [`crypto-lab-scloud-vault`](https://github.com/systemslibrarian/crypto-lab-scloud-vault);\nsee [root README §Lineage](README.md#lineage-and-related-prior-work) for the non-endorsement\nboundary.\n<https://eprint.iacr.org/2024/1306>\n\n---",
    url: "https://eprint.iacr.org/2024/1306"
  },
};
