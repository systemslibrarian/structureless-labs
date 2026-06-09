/* sl-atlas BLOCKED drafts — concepts authored but held by the Teacher gate.
   Mirrors the structure of concepts.js but for drafts that are NOT publishable.
   CI (`scripts/check-atlas-parity.mjs`) verifies parity with the
   `sl-atlas/content/*.json` files whose `status` begins with "BLOCKED". */

window.SL_ATLAS_BLOCKED = [
  {
    id: "decryption-failure",
    title: "Decryption Failure Probability",
    subtitle: "When the decoder gets it wrong even though everyone followed the rules",
    category: "foundations",
    blocked_at: "2026-06-09",
    blocked_reason: "Missing Simple view — three-depth contract not satisfied.",
    review_path: "../reviews/TEACHER-2026-06-09-decryption-failure.md",
    decision_path: "../../sl-researchkit/decisions/D-0003.md",
    views: {
      simple: null,
      developer:
        "The probability that a legitimate decoder recovers the wrong message even though every party followed the protocol. In LWE-style KEMs, decryption failure happens when the total noise `‖e_total‖` exceeds the decoding radius `τ` — that is, when the noise budget overflows. The end-to-end probability `Pr[‖e_total‖ > τ]` is doubly load-bearing: it controls correctness (users do not silently see wrong messages) **and** security (D'Anvers et al. 2019 showed that adaptive attackers can exploit non-trivial failure rates to recover the secret key). Modern KEMs target failure probabilities `≤ 2⁻¹⁶⁰` or tighter — astronomically small by design.",
      researcher:
        "Let `χ_total = χ_LWE * χ_key * χ_round` be the convolution of all noise sources contributing to the decoder's input. For a rounding-style decoder the decryption-failure probability is `δ = Pr_{e ∼ χ_total}[‖e‖_∞ > q/4]` (the precise bound depends on the chosen decoder). `δ` enters the security argument twice: **(1)** the honest-failure constraint `δ ≤ 2^{-λ_corr}` for correctness level `λ_corr`; **(2)** the adaptive-failure constraint — D'Anvers, Vercauteren & Verbauwhede (2019) showed an adversary submitting chosen ciphertexts can learn which inputs cause failure and recover the secret in time roughly `1/δ`, requiring `δ ≤ 2^{-λ_sec}` with `λ_sec` matching the claimed security level (128, 192, 256). The two bounds rarely coincide; the tighter one wins."
    },
    evidence_grade: "B",
    related: ["noise", "encoding", "lwe"],
    citations: ["dvv-2019"]
  }
];
