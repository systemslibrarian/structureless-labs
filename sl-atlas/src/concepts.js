/* GENERATED FILE — DO NOT EDIT.
   Regenerate with: node scripts/gen-atlas-concepts.mjs
   Source of truth: sl-atlas/content/*.json (one document per concept).
   Only publishable concepts are emitted, sorted by learning-path position.
   CI fails if this file drifts from content/. */

window.SL_ATLAS_CONCEPTS = [
  {
    "id": "threat-model",
    "title": "The quantum threat model",
    "subtitle": "Why post-quantum cryptography exists — and why the migration started before the computer did",
    "category": "foundations",
    "path": 1,
    "views": {
      "simple": "Almost everything private on the internet — messages, bank logins, medical records — is protected by math problems that today's computers cannot solve in any reasonable time. A sufficiently large quantum computer would solve two of the most important ones (factoring large numbers and computing discrete logarithms) quickly, and with them would fall most of the public-key cryptography actually deployed today. No such machine publicly exists, and honest experts disagree about when one will — years and decades are both on the table.\n\nSo why act now? Because of a quiet attack that requires no quantum computer at all: **harvest now, decrypt later**. An adversary can record encrypted traffic today, store it cheaply, and decrypt it the day the machine arrives. If a secret must stay secret for ten years, then encrypting it today with quantum-breakable math is *already* a present-tense failure — the recording is happening now, whether or not the decryption ever does.\n\nThere is a second clock too: migrations are slow. Replacing the cryptography inside browsers, phones, banks, and governments takes on the order of a decade. A useful way to say it (due to Michele Mosca): if the time your secrets must live, *plus* the time the migration takes, exceeds the time until a big enough quantum computer — you are already late. That inequality, not a prediction about hardware, is why the field moved: an open standards competition ran from 2016, and in August 2024 the first post-quantum standards were published, including ML-KEM — the lattice-based scheme most of this atlas builds toward understanding. The rest of the atlas explains the math that replacement rests on.",
      "developer": "What breaks and what survives, concretely. **Breaks outright:** RSA, finite-field Diffie-Hellman, and all elliptic-curve cryptography (ECDH, ECDSA, Ed25519). Shor's algorithm solves factoring and discrete logarithms in polynomial time on a fault-tolerant quantum computer — these are not weakened, they are *ended* for a sufficiently capable machine. **Mostly survives:** symmetric cryptography. Grover's search gives at most a quadratic speedup against exhaustive key search, so AES-128's effective quantum margin shrinks toward ~64-bit-equivalent work (with severe practical caveats — Grover parallelizes poorly), and AES-256 remains comfortable. SHA-2/SHA-3 similarly survive with margin adjustments. **The engineering consequence:** the migration is about key establishment and signatures, not about replacing your AEAD.\n\nThe operative threat for a working engineer is **harvest-now-decrypt-later**: any TLS session whose key exchange is pure ECDH can be recorded today and opened retroactively. That is why deployed mitigations lead with the KEM side (TLS hybrid key agreement, X25519+ML-KEM-768, shipped in major browsers) while signature migration — where retroactive attack matters less, since a forged signature must be accepted *in the future* — moves slower.\n\nTimeline honesty: there is no public cryptographically-relevant quantum computer, and resource estimates for breaking RSA-2048 have been falling but remain far beyond current hardware. The planning tool is **Mosca's inequality**: if `x` (years your data must stay confidential) + `y` (years your migration takes) > `z` (years until a cryptographically relevant machine), you are already exposed. For `x = 10` and realistic `y ≥ 5`, most estimates of `z` put long-lived secrets inside the danger zone today — which is the actual argument, independent of anyone's hardware forecast. The conservative deployment answer is [hybrid constructions](#/hybrid-constructions): classical + post-quantum combined so that neither assumption is a single point of failure.",
      "researcher": "The adversary model that motivates PQC. A **cryptographically relevant quantum computer (CRQC)** is a fault-tolerant machine large enough to run Shor's algorithm (Shor 1997) against deployed key sizes — polynomial-time factoring and discrete log, including over elliptic-curve groups. Against symmetric primitives, Grover's algorithm gives a provably optimal quadratic black-box speedup; its poor parallelization (the depth-times-width trade-off) means practical quantum advantage against AES-256 is negligible, and NIST's PQC security categories accordingly calibrate against exhaustive key search on AES rather than assuming free Grover.\n\nFormally, the transition literature distinguishes adversaries by *when* quantum capability arrives relative to the protocol run: the harvest-now-decrypt-later adversary is classical at protocol time and quantum later — this is the weakest quantum adversary and already breaks the confidentiality of every recorded pure-ECDH transcript. Bindel et al. (2019) give explicit two-stage models for hybrid authenticated key exchange under exactly this adversary, which is the formal grounding for the hybrid deployments described in [Hybrid constructions](#/hybrid-constructions). Signature security degrades differently: unforgeability must hold against a *future* attacker only for keys still trusted at that time, which is why key-establishment migration is the urgent half.\n\nStandards state: NIST's open post-quantum process (2016–2022 selection) produced FIPS 203 (ML-KEM, lattice KEM), FIPS 204 (ML-DSA, lattice signatures), and FIPS 205 (SLH-DSA, hash-based signatures), all finalized August 2024. Deployment consensus leads with hybrids (X25519+ML-KEM-768 in TLS; CNSA 2.0 mandates ML-KEM for national-security systems on a dated schedule). Migration-planning doctrine follows Mosca (2018): the inequality `x + y > z` is a statement about *risk posture under uncertainty in z*, not a forecast — the lab treats CRQC-arrival estimates as unknowable and grades accordingly. What LWE-based cryptography offers against this adversary — and what it does not (see [Attacks](#/attacks): quantum speedups against lattices are exponent-constant improvements, not Shor-style collapses) — is the subject of the rest of this atlas."
    },
    "evidence_grade": "B",
    "evidence_note": "Shor's and Grover's algorithms and their consequences for deployed cryptography are settled science (grade A on their own). The threat-model synthesis — harvest-now-decrypt-later urgency, migration timelines, CRQC arrival uncertainty — is deliberately graded B: the math is certain, the timeline is not, and the concept says so explicitly.",
    "related": [
      "lwe",
      "hybrid-constructions",
      "attacks",
      "ml-kem"
    ],
    "citations": [
      "shor-1997",
      "mosca-2018",
      "fips-203-2024",
      "bindel-2019"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "Nobody has a quantum computer that can break RSA today. Why does the migration need to happen now anyway?",
        "answer": "Two clocks are running. First, **harvest-now-decrypt-later**: encrypted traffic recorded today can be decrypted the day a big enough machine exists, so anything that must stay secret for years is already exposed to a future adversary — the recording requires no quantum computer. Second, migrations at internet scale take on the order of a decade. Mosca's inequality makes it crisp: if secrecy-lifetime plus migration-time exceeds the time until a cryptographically relevant quantum computer, starting later means arriving late."
      },
      {
        "question": "Which of today's cryptography actually breaks, and which mostly survives?",
        "answer": "Public-key cryptography built on factoring and discrete logarithms — RSA, Diffie-Hellman, all elliptic-curve schemes — breaks outright via Shor's algorithm. Symmetric ciphers and hashes mostly survive: Grover's search only halves the effective security exponent (and parallelizes poorly), so AES-256 stays comfortable. That is why the migration targets key exchange and signatures, not AEAD ciphers."
      },
      {
        "question": "If ML-KEM is standardized, why do serious deployments still pair it with X25519 instead of using it alone?",
        "answer": "Hedging in both directions. Lattice assumptions are younger than the classical ones and their concrete security estimates still move with cryptanalysis; the classical half fails only to a future quantum computer. A hybrid loses only if *both* fall — see [Hybrid constructions](#/hybrid-constructions) for why that is the conservative default rather than an excess of caution."
      }
    ]
  },
  {
    "id": "modular",
    "title": "Modular Arithmetic (mod q)",
    "subtitle": "The clock that every lattice scheme lives on",
    "category": "foundations",
    "path": 2,
    "views": {
      "simple": "Pick a number, say 17. Now agree that whenever you count past 17, you wrap back around to 0. That's all `(mod 17)` means — arithmetic on a clock face with 17 hours instead of 12. Every lattice cryptosystem lives on such a clock; the size of the clock is called `q`. Why bother? Because wrapping makes large numbers stay small, and small numbers are what computers (and noise distributions) actually work with. The clock is the box that keeps everything finite.",
      "developer": "`a mod q` is the unique value in `{0, 1, …, q−1}` congruent to `a` modulo `q`. All LWE operations — matrix multiply, addition, comparison — happen in `Z_q`. Choice of `q` matters: it should be large enough that the noise `e` does not 'wrap around' and destroy the message structure, but small enough that operations remain efficient. Common choices: `q = 3329` (Kyber, a prime), `q = 8192` (Saber, a power of two — fast modular reduction but algebraic structure carries trade-offs). The arithmetic also defines the noise budget: rounding-style decoders typically tolerate `‖e‖_∞ < q/4`.",
      "researcher": "The ring `Z_q = Z / qZ` is the ground ring for unstructured LWE; structured variants live in `R_q = Z_q[X] / (Φ(X))` for a cyclotomic polynomial `Φ`. The choice of `q` interacts with: (1) the *NTT-friendliness* of structured rings (Kyber's `q = 3329` was chosen so that 256-point NTT works directly over `Z_q`); (2) *modulus-switching* techniques that reduce `q` to lower bandwidth at a controlled noise cost; (3) the *core-SVP* security estimate, which is mildly sensitive to `log q / n`. Prime moduli vs. power-of-two moduli have an active design debate; both are deployed in current standards."
    },
    "evidence_grade": "A",
    "evidence_note": "The mathematical content is elementary and uncontested. Engineering choices about specific values of `q` are well-justified in the standards literature.",
    "related": [
      "lwe",
      "noise"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "Why does every lattice scheme work on a \"clock\" (mod q) instead of ordinary integers?",
        "answer": "Wrapping keeps every value inside a fixed finite range {0, …, q−1}, so ciphertexts have a fixed size and — more importantly — \"small noise\" has a precise meaning: small *relative to q*. Without a finite ring there is no clean way to say the noise is small enough to decode through but large enough to hide the secret."
      },
      {
        "question": "A rounding decoder tolerates noise up to about q/4. What happens to that budget if you halve q while keeping the noise distribution the same?",
        "answer": "The absorption budget halves, so the same noise is now twice as large relative to the clock and decryption failures become more likely. That is the bandwidth-versus-correctness tension in one move: a smaller q means smaller keys and ciphertexts, but a tighter noise budget — see Decryption Failure Probability."
      }
    ]
  },
  {
    "id": "lattices",
    "title": "Lattices",
    "subtitle": "Grids of points in high-dimensional space — and why they are hard",
    "category": "foundations",
    "path": 3,
    "views": {
      "simple": "Imagine an infinite sheet of graph paper. The grid points are a *lattice* — a regular, evenly-spaced pattern of dots. Now imagine that same grid in three dimensions. Then in four hundred. The dots are still perfectly regular, but the patterns are no longer something you can picture. Find the dot nearest to a given target in 400 dimensions and you have just solved a problem that protects messages from quantum computers. The simplicity of the picture is what makes the difficulty so surprising: nothing about a grid *looks* hard, until the dimensions stack up.",
      "developer": "A lattice is the set of all integer combinations of a fixed *basis* of vectors: `L = { a₁·b₁ + a₂·b₂ + … + aₙ·bₙ : aᵢ ∈ Z }`. Same lattice, different bases — and the difference matters: a *good* (short, near-orthogonal) basis makes problems easy, a *bad* (long, skewed) basis makes them hard. The public key in a lattice scheme is effectively a bad basis; the private key is a good one. The two canonical hard problems: **SVP** (shortest vector) and **CVP** (closest vector). Approximate versions of these, in high dimensions, are what concrete crypto rests on.",
      "researcher": "A full-rank lattice `L ⊂ R^n` is a discrete additive subgroup generated by a basis `B = (b₁, …, bₙ)`. **SVP_γ**: given `B`, find `v ∈ L \\ {0}` with `‖v‖ ≤ γ · λ₁(L)`. **CVP_γ**: given `B` and target `t`, find `v ∈ L` with `‖v − t‖ ≤ γ · dist(t, L)`. **GapSVP_γ** and **SIVP_γ** are the standard worst-case problems used in reductions. The state-of-the-art attacks are BKZ-style block reduction with sieving subroutines; security estimates are produced by *lattice estimators* (e.g. the LWE-estimator), not by closed-form proofs. The cryptographic story: LWE-hardness reduces (worst-case to average-case) to GapSVP/SIVP, giving structural — not numerical — confidence."
    },
    "interactive": "lattice-2d",
    "evidence_grade": "A",
    "evidence_note": "The mathematical definitions are standard and uncontested. The cryptographic hardness assumptions (GapSVP, SIVP at the parameter regimes we use) are well-studied but, like all hardness assumptions, not proven.",
    "related": [
      "lwe",
      "noise"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "The same lattice can be described by a \"good\" basis or a \"bad\" one. Why does that matter for cryptography?",
        "answer": "The lattice is the same set of points either way, but computations behave completely differently: finding close or short vectors is easy with a short, near-orthogonal basis and hard with a long, skewed one. That asymmetry *is* the key pair — the public key is effectively a bad basis, the private key a good one. The interactive above lets you feel it: Babai's rounding succeeds with the reduced basis and misses with the skewed one, on the same lattice."
      },
      {
        "question": "The demo solves 2-D lattice problems instantly. Why are lattice problems considered hard at all?",
        "answer": "Hardness grows with dimension. In two dimensions, Lagrange-Gauss reduction finds the best possible basis exactly, in microseconds. In dimension 400+ the best known algorithms (BKZ block reduction with sieving) cost time exponential in the dimension, and no known shortcut — classical or quantum — collapses that. The demo is a magnifying glass on the *structure* of the problem, not evidence about its difficulty."
      },
      {
        "question": "What are SVP and CVP, in one sentence each?",
        "answer": "SVP (shortest vector problem): given a basis, find the shortest nonzero lattice vector. CVP (closest vector problem): given a basis and a target point off the lattice, find the lattice point closest to it. Approximate versions of both, in high dimension, are what LWE's security reduces to."
      }
    ]
  },
  {
    "id": "lwe",
    "title": "Learning With Errors",
    "subtitle": "The hard problem at the heart of lattice cryptography",
    "category": "foundations",
    "path": 4,
    "views": {
      "simple": "A puzzle made hard by adding small mistakes. Imagine someone hands you lots of almost-right answers to a math problem — each one off by a tiny, unknown nudge. With enough nudges, working backwards to the secret becomes practically impossible. That deliberate imperfection is the lock. Take it away and the puzzle dissolves into something a calculator could solve. This single idea — *make the linear problem noisy* — is the engine behind a whole family of post-quantum cryptography.",
      "developer": "A linear system with noise added. You publish `(A, b)` where `b = A·s + e (mod q)`. `A` is a public random matrix. `s` is the secret vector. `e` is small random noise drawn from a bounded distribution. Recovering `s` from `(A, b)` is the hard problem your security rests on. **Strip the noise away** and it collapses to ordinary linear algebra — Gaussian elimination solves it in milliseconds. The noise is the lock; the modulus `q` sets the room the math lives in; the dimension `n` sets the difficulty.",
      "researcher": "Given samples `(A, A·s + e mod q)` with `A ∈ Z_q^{m×n}` uniform, secret `s ∈ Z_q^n`, and error `e` drawn from a bounded distribution `χ`, recover `s`. **Decisional-LWE** asks instead to distinguish such samples from uniform over `Z_q^{m×n} × Z_q^m`. Hardness is parameterized by `(n, q, χ)`; concrete security estimates derive from the best known lattice-reduction (BKZ, sieving) and combinatorial (BKW, dual) attacks against those parameters. Worst-case to average-case reductions (Regev '05; Peikert '09; BLP+ '13) connect LWE to standard lattice problems (GapSVP, SIVP) under appropriate parameter regimes — a structural argument for confidence, not a proof of unbreakability."
    },
    "interactive": "lwe-matrix",
    "evidence_grade": "B",
    "evidence_note": "Strong consensus across the lattice-crypto literature; the worst-case-to-average-case reductions are well-studied. Concrete security depends on continued cryptanalysis of the assumed parameters — graded 'strong evidence, not proven here.'",
    "related": [
      "lattices",
      "noise",
      "modular"
    ],
    "citations": [
      "regev-2005",
      "peikert-2009",
      "blprs-2013"
    ],
    "attack_links": [],
    "source_spec": "../../sl-kem/spec/EXPLAINER-LWE.md",
    "checks": [
      {
        "question": "Predict before running the demo: with noise ON, Gaussian elimination on the first n rows returns *some* candidate secret. How many of the m rows will that candidate satisfy?",
        "answer": "Only the n rows used to solve — those are forced to verify by construction. Each remaining row agrees only by coincidence, with probability about 1/q. With noise OFF, the recovered vector is the true secret and every row verifies. That is the demo's whole lesson: noise doesn't make elimination *impossible*, it makes elimination's answer *worthless*."
      },
      {
        "question": "Why can't an attacker just average the noise away?",
        "answer": "Averaging needs repeated measurements of the same quantity, but every LWE sample mixes the secret through a different random row of A. Combining samples to cancel noise is exactly what BKW-style attacks attempt — and the combinations amplify the noise as fast as they simplify the structure, which is why those attacks need astronomically many samples and parameters are chosen to starve them."
      },
      {
        "question": "What breaks if you make the noise much wider to gain security?",
        "answer": "The legitimate decoder shares the noise budget with the attacker's confusion: too much noise and honest decryption starts failing (the toy decoder tolerates about q/4 per coordinate). Failures are not just an inconvenience — they leak information to adaptive attackers. See Noise and Decryption Failure Probability."
      }
    ]
  },
  {
    "id": "noise",
    "title": "Noise",
    "subtitle": "Small, deliberate imperfection — the cryptographic raw material",
    "category": "foundations",
    "path": 5,
    "views": {
      "simple": "Noise here doesn't mean sound. It means a tiny random nudge added on purpose. In daily life, noise is the enemy — it makes signals harder to read. In lattice cryptography, noise is the *friend*: it is what makes the math hard for an attacker. The trick is to add just enough noise to lose the attacker, but not so much that the legitimate decoder cannot still recover the message. This careful balance — *enough but not too much* — is what most of the engineering in a scheme like Kyber is really about.",
      "developer": "Noise is sampled from a bounded distribution `χ` (usually centered binomial or discrete Gaussian) and added to the equation `b = A·s + e`. The standard deviation `σ` is the central knob. Bigger `σ` → harder for an attacker, but also more *decryption failures*: legitimate decoders use an error-correcting structure to absorb the noise, and if `e` ever exceeds the absorption budget, decryption silently produces the wrong message. Modern schemes (Kyber, Saber, FrodoKEM) tune `(n, q, σ)` so that the decryption-failure probability is astronomically small (e.g. `≤ 2⁻¹⁶⁰`) *and* the LWE problem remains hard.",
      "researcher": "Let `χ` be a discrete distribution over `Z` with sub-Gaussian parameter `σ`. The LWE distribution is `{(a, ⟨a,s⟩ + e mod q) : a ← U(Z_q^n), e ← χ}`. The relevant trade-off space is bounded by two constraints: (1) the *attacker's* problem must remain hard, formalized via lattice-estimator output against BKZ/sieving with cost models like `core-SVP`; (2) the *decoder's* failure probability `Pr[‖e_total‖_∞ > q/4]` (for a rounding-style decoder) must satisfy the cryptanalytic bound from decryption-failure attacks (D'Anvers et al., 2019). Choosing `χ` as a centered binomial `CBD_η` is preferred for constant-time sampling — Gaussian-discrete sampling has historically been a side-channel hazard."
    },
    "evidence_grade": "B",
    "evidence_note": "Mature engineering; concrete failure-probability bounds are well-understood. The 'enough noise / not too much' trade-off is actively re-evaluated as new attacks appear.",
    "related": [
      "lwe",
      "lattices"
    ],
    "citations": [
      "kyber-2018",
      "frodokem-2017",
      "dvv-2019"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "Noise is what makes LWE hard — so why not add much more of it?",
        "answer": "Because the legitimate decoder has to absorb the noise too. Widen the distribution and the decryption-failure probability climbs — and failures are an attack surface, not just a nuisance (adaptive attackers exploit them; see Decryption Failure Probability). Parameter selection is the discipline of walking that line."
      },
      {
        "question": "Why do modern schemes sample noise from a centered binomial rather than a mathematically nicer Gaussian?",
        "answer": "Constant-time implementability. CBD sampling is a handful of random bits and additions, identical work for every outcome. Discrete-Gaussian samplers historically used secret-indexed tables or rejection loops, which leak through timing and cache side channels — see Side channels for the published precedents."
      }
    ]
  },
  {
    "id": "encoding",
    "title": "Encoding",
    "subtitle": "How a real message becomes a lattice point — and how the decoder finds it again",
    "category": "foundations",
    "path": 6,
    "views": {
      "simple": "Encoding is how a real message — a number, a key, a word — becomes a *lattice point* that the rest of the math can work with, and how the decoder gets the message back when the point arrives slightly nudged. Imagine the message as a stamped tile dropped into a wide grid. As long as no tile is dropped within bumping distance of another, you can always tell which tile is which, even if the wind has nudged every one of them an inch or two. Pick the spacing badly and a small breeze loses the message; pick it well and a small breeze is harmless. Most of the engineering in a KEM is choosing that spacing.",
      "developer": "An encoding is a pair `(E, D)` where `E : M → L` embeds the message space `M` into the lattice `L`, and `D : L → M` recovers `m` when the received point is the lattice's nearest neighbour of `E(m) + e`. The end-to-end goal: for every `m ∈ M` and every error `e` from the noise budget, `D(E(m) + e) = m`. Common patterns: bit-by-bit modular encoding (early LWE schemes), Reed-Muller / Reed-Solomon codes layered on top of LWE noise, and lattice codes such as Barnes-Wall `BW_{2^k}` in `2^k` dimensions. Denser codes carry more bits per dimension but shrink the decoding radius — which is why encoding choices and noise parameters are tuned together, never separately.",
      "researcher": "Let `L ⊂ R^n` be a lattice with minimum distance `λ₁(L)`, and let `M` be a finite message space. An encoder–decoder pair `(E, D)` satisfies the *recovery property* if for all `m ∈ M` and all `e` with `‖e‖ ≤ τ`, `D(E(m) + e) = m`, where `τ` is the *decoding radius*. The KEM's decryption-failure probability is `Pr_{e∼χ_total}[‖e_total‖ > τ]`, where `χ_total` is the convolution of LWE noise, key noise, and any rounding error. The design knob `(n, τ, |M|)` is what differentiates schemes: denser codes raise `|M|/n` but reduce `τ`, forcing tighter `χ` and altering the lattice-estimator output. Reed-Muller and Barnes-Wall codes (the Barnes-Wall family `BW_{2^k}`) are the dominant choices when the goal is to maximize `τ` per dimension; the `BW₃₂` instance used in S-Cloud+ (Wang et al., 2024) is one concrete realization of that strategy. Encoding choices are not orthogonal to the security argument — they enter the decryption-failure bound, which itself is attackable (D'Anvers et al., 2019)."
    },
    "interactive": "encoding-1d",
    "evidence_grade": "B",
    "evidence_note": "Well-established design discipline: the encoder-decoder pair, the recovery property, and the failure-probability accounting are standard textbook material. Specific code choices (Reed-Muller vs. Barnes-Wall vs. bitwise) are an active engineering debate — graded B because the trade-off space is mature but not closed.",
    "related": [
      "lwe",
      "noise",
      "lattices"
    ],
    "citations": [
      "scloud-plus-2024",
      "dvv-2019"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "In the demo, set q = 16 and η = 6. Why do decryption failures appear, and which two levers stop them?",
        "answer": "The decoding radius is τ = q/4 = 4, but CBD(6) can draw noise as large as |e| = 6 — there is probability mass outside the safe band, so some draws decode to the wrong bit. Shrink the noise (lower η) or widen the spacing (raise q) and the mass disappears. That pair — spacing versus noise — is the entire encoding trade in miniature."
      },
      {
        "question": "Why do real KEMs use denser codes (Reed-Muller, Barnes-Wall) instead of the demo's one-bit-per-coordinate encoding?",
        "answer": "Bandwidth. Denser codes carry more message bits per lattice dimension, so ciphertexts shrink. The cost is a smaller decoding radius per bit, which forces tighter noise — which is why encoding choices and noise parameters are tuned jointly, never separately."
      }
    ]
  },
  {
    "id": "decryption-failure",
    "title": "Decryption Failure Probability",
    "subtitle": "When the decoder gets it wrong even though everyone followed the rules",
    "category": "foundations",
    "path": 7,
    "views": {
      "simple": "Every lattice scheme lives with a strange possibility: the receiver can decode the *wrong message* even though both parties followed the protocol perfectly. No attacker, no bug, no network glitch — the scheme's own deliberate noise, which is what makes it secure in the first place, occasionally adds up past what the decoder can absorb. Picture the stamped tiles from the [Encoding](#/encoding) idea: the wind that nudges each tile is usually a gentle breeze, but once in a very great while every gust happens to push the same way, and a tile drifts into a neighbour's spot. The decoder, seeing the tile there, honestly reports the wrong answer.\n\nTwo things follow from this, and the second is the one people miss. First, \"rare\" is not good enough for correctness: the internet performs billions of encrypted handshakes a day, so a one-in-a-million failure rate would be a constant stream of broken connections. Second — and this is the sharp edge — **failures leak**. A failure is not random noise to an attacker; it is information. Researchers showed that an attacker who can feed a scheme carefully chosen inputs and simply watch *when* decryption fails can, failure by failure, reconstruct the secret key itself. The failure rate is not just a quality metric; it is part of the attack surface.\n\nSo designers do not aim for \"rare.\" They aim for *functionally impossible*: a failure probability so small — a number with dozens of zeros after the decimal point — that no attacker could ever collect enough failures to learn anything, because the first failure is never expected to happen in the lifetime of the system. And because you cannot test your way to a claim like that, the probability is *calculated*, from the noise distribution outward, and published with the scheme. The knobs that make it small are the ones this atlas has already introduced: gentler [noise](#/noise), wider [spacing](#/encoding), a bigger [clock](#/modular). Each costs something. That three-way bargain is the story of [Parameter choices](#/parameter-choices).",
      "developer": "The probability that a legitimate decoder recovers the wrong message even though every party followed the protocol. In LWE-style KEMs, decryption failure happens when the total noise `‖e_total‖` exceeds the decoding radius `τ` — that is, when the noise budget overflows. The end-to-end probability `Pr[‖e_total‖ > τ]` is doubly load-bearing: it controls correctness (users do not silently see wrong messages) **and** security (D'Anvers et al. 2019 showed that adaptive attackers can exploit non-trivial failure rates to recover the secret key). Modern KEMs target failure probabilities `≤ 2⁻¹⁶⁰` or tighter — astronomically small by design.",
      "researcher": "Let `χ_total = χ_LWE * χ_key * χ_round` be the convolution of all noise sources contributing to the decoder's input. For a rounding-style decoder the decryption-failure probability is `δ = Pr_{e ∼ χ_total}[‖e‖_∞ > q/4]` (the precise bound depends on the chosen decoder). `δ` enters the security argument twice: **(1)** the honest-failure constraint `δ ≤ 2^{-λ_corr}` for correctness level `λ_corr`; **(2)** the adaptive-failure constraint — D'Anvers, Vercauteren & Verbauwhede (2019) showed an adversary submitting chosen ciphertexts can learn which inputs cause failure and recover the secret in time roughly `1/δ`, requiring `δ ≤ 2^{-λ_sec}` with `λ_sec` matching the claimed security level (128, 192, 256). The two bounds rarely coincide; the tighter one wins. Decoder design ([Encoding](#/encoding)) and noise sizing ([Noise](#/noise)) are the two knobs that bring `δ` down; both have second-order effects on the lattice estimator and on the size of the public parameters."
    },
    "evidence_grade": "B",
    "evidence_note": "Failure-probability accounting is well-established; the D'Anvers et al. 2019 adaptive attack is widely cited. The specific bound for any given KEM is a careful argument, not a closed-form proof.",
    "related": [
      "noise",
      "encoding",
      "lwe",
      "parameter-choices"
    ],
    "citations": [
      "dvv-2019"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "Both parties follow the protocol perfectly. How can decryption still fail?",
        "answer": "The scheme's own deliberate noise is random, and on rare draws it accumulates past the decoder's absorption radius τ. No attacker or bug is required — the failure mode is built into honest execution. That is exactly why it must be *bounded mathematically* from the noise distribution outward, rather than hunted for in testing: you cannot observe an event designed to be rarer than the lifetime of the system."
      },
      {
        "question": "Why must the failure probability be astronomically small rather than just \"rare\"?",
        "answer": "Two independent reasons. Correctness at scale: billions of handshakes per day turn one-in-a-million into a constant stream of broken sessions. Security: D'Anvers et al. (2019) showed adaptive attackers can hunt for failing ciphertexts and reconstruct the key in time roughly 1/δ — so δ must sit below the *security* target, not merely below the annoyance threshold. The failure rate is part of the attack surface."
      },
      {
        "question": "Which design knobs bring δ down, and what does each cost?",
        "answer": "Shrink the noise distribution — costs security, because the LWE problem gets easier. Widen the decoding radius, via a larger q or a denser/better code — costs bandwidth, because keys and ciphertexts grow. δ, security, and size form the triangle that Parameter choices navigates; no knob is free."
      }
    ]
  },
  {
    "id": "reconciliation",
    "title": "Reconciliation",
    "subtitle": "Two parties holding 'almost the same number' agreeing on exactly the same key",
    "category": "foundations",
    "path": 8,
    "views": {
      "simple": "When Alice and Bob run an LWE-style key exchange, they don't end up with the same key — they end up with two keys that are *close but not identical*. Reconciliation is the small extra trick that lets them agree on the exact same key without either of them revealing much about their secret. The classic move: one party sends a few rounding hints — just enough to nudge the other party's near-match into the right bucket. With the hints, they end up identical; without them, they would be one bit apart and every encryption built on top would silently fail.",
      "developer": "Reconciliation takes two near-equal lattice points `v_A ≈ v_B` (one held by each party after a KEM round) and outputs a shared, exact key. Two dominant patterns: **(1) helper-bit reconciliation** (NewHope, BLISS): Alice publishes a short hint `h` derived from `v_A`, and Bob applies `Rec(v_B, h) = k` such that `Rec(v_A, h) = k` too. **(2) encryption-style** (Kyber/ML-KEM, Saber): the shared 'key' is embedded directly via a message encoding, and reconciliation collapses into the encoding's recovery property — the hint disappears into the [encoding](#/encoding) layer. Modern KEMs increasingly favor (2) because helper bits leak some structure of the noise; (1) survives where every byte of bandwidth matters.",
      "researcher": "Given two lattice points `v_A, v_B ∈ Z_q^n` with `v_A − v_B = e` for noise `e` bounded by `‖e‖ ≤ τ`, the reconciliation problem is to produce a public hint `h` and a function `Rec` such that `Rec(v_A, h) = Rec(v_B, h) = k` for a shared `k ∈ {0,1}^λ`, where the conditional distribution of `k` given `h` carries negligible additional information about Alice's secret beyond what is already exposed by `v_A`. The NewHope construction uses Voronoi-cell-style hint bits (Ding 2012; Peikert 2014; Alkim–Ducas–Pöppelmann–Schwabe 2016) tuned so that `h` is one bit per coefficient at the cost of slightly tighter `χ`. The encryption-style approach (Kyber, ML-KEM) instead embeds a uniform `k` directly via the encoder and lets the encoding's recovery property carry the agreement — the hint is replaced by the structure of the code (cf. [Encoding](#/encoding)). The two approaches differ in how leakage to a passive attacker is quantified: helper bits add a term to the lattice estimator; encryption-style approaches roll the leakage into the standard decryption-failure analysis. Hardware constraints can flip the choice — embedded targets sometimes prefer (1) for its smaller transcript at fixed security."
    },
    "evidence_grade": "B",
    "evidence_note": "Mature design space; both patterns are deployed in published / standardized KEMs. The trade-off (helper bits vs. encoding-embedded) is well-understood but actively re-litigated as standards evolve.",
    "related": [
      "lwe",
      "encoding",
      "noise",
      "lattices"
    ],
    "citations": [
      "ding-2012",
      "peikert-2014",
      "newhope-2016"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "After an LWE key exchange, Alice and Bob hold values that are close but not equal. Why can't they both just round to the nearest bucket?",
        "answer": "Plain rounding fails exactly at bucket boundaries: when the true value sits near an edge, Alice rounds one way and Bob the other, their keys differ by one bit, and neither can tell it happened. Reconciliation handles the boundary cases — a small public hint tells the other party *which side* to round toward without revealing the value itself."
      },
      {
        "question": "What distinguishes helper-bit reconciliation from the encryption-style approach modern standards use?",
        "answer": "Helper-bit: one party publishes explicit rounding hints — cheap in bandwidth per coefficient but the hints leak a bounded amount of noise structure that the security analysis must account for. Encryption-style (Kyber/ML-KEM): the shared key is directly encoded as a message and the encoding's recovery property absorbs the mismatch — the hint disappears into the code. Standards favor the second; helper bits survive where every transcript byte matters."
      }
    ]
  },
  {
    "id": "parameter-choices",
    "title": "Parameter choices",
    "subtitle": "How (n, q, χ) get tuned — the joint optimization of security, bandwidth, and correctness",
    "category": "foundations",
    "path": 9,
    "views": {
      "simple": "Every cryptographic scheme is a balance. Choose parameters that make attacks too expensive — but not so heavy that legitimate users can't run them. In lattice cryptography, the main knobs are the *dimension* (how many numbers in the secret), the *modulus* (the clock size), and the *noise size* (how much imperfection you mix in). Turn them too low and the math is easy to break; too high and your keys won't fit in a network packet. The published standards — ML-KEM, FrodoKEM — represent particular guesses about where the right balance lives, and that balance is publicly auditable: every parameter set ships with a derivation showing why these specific numbers.",
      "developer": "Parameter selection for an LWE-based KEM is the joint optimization of `(n, m, q, χ)` against three constraints: **(1) Security target `λ`** (typically 128 / 192 / 256 classical bits, or 64 / 96 / 128 quantum bits under core-SVP), enforced via the lattice-estimator's output. **(2) Decryption-failure target `δ`** (typically `≤ 2^{-λ_sec}` per the D'Anvers et al. (2019) adaptive-failure bound). **(3) Bandwidth/latency envelope** (public-key size, ciphertext size, ops/sec). The trade is non-monotone: raising `n` raises security *and* bandwidth; tightening `χ` lowers `δ` but can lower security; raising `q` gives noise budget but inflates keys. ML-KEM-512 (Kyber) lives at one point in this triangle; FrodoKEM-640 at another. Choosing between them is choosing a position — not finding a unique answer.",
      "researcher": "The methodology underlying every modern lattice-KEM parameter set: pick a candidate `(n, m, q, χ)`; run the *lattice estimator* (Albrecht, Player, Scott 2015 and the actively-maintained successors at the `lattice-estimator` project) to produce a security cost in some cost model — `core-SVP` being the de facto standard, with `2^{0.292 β}` (classical) and `2^{0.265 β}` (quantum) as the canonical BKZ-block-size mapping. Verify the cost meets `λ`; convolve `χ` (Kyber's CBD_η, FrodoKEM's discrete-Gaussian-approximation table) to bound `δ` and verify the D'Anvers (2019) adaptive-failure constraint. Iterate. The estimator's output is itself a moving target — new lattice-reduction or sieving results (G6K, BDGL 2016) periodically tighten the bound, and a parameter set valid in 2024 may be downgraded in 2027. Hence the lab's [`sl-bench/sl-kem/INTERPRETATION.md`](https://github.com/systemslibrarian/structureless-labs/blob/main/sl-bench/sl-kem/README.md) rule: numbers without the methodology and cost-model assumptions are not a result."
    },
    "interactive": "attack-cost",
    "evidence_grade": "B",
    "evidence_note": "Well-established methodology; the lattice estimator and core-SVP cost model are the canonical reference points. The specific numerical bounds are graded B (not A) because they shift as cryptanalysis improves.",
    "related": [
      "lwe",
      "noise",
      "encoding",
      "modular",
      "reconciliation"
    ],
    "citations": [
      "kyber-2018",
      "frodokem-2017",
      "dvv-2019",
      "albrecht-2015"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "In the cost explorer above, raise n with everything else fixed. Why does the security estimate climb?",
        "answer": "The attacker's lattice problem lives in dimension proportional to n, and the BKZ block size β needed to solve it grows with the dimension — while the attack cost grows exponentially in β (core-SVP ≈ 2^0.292β classical). Dimension is the primary security dial. It is also the primary cost dial: unstructured-LWE keys grow roughly quadratically with n."
      },
      {
        "question": "Why does *raising* q (with the noise σ fixed) lower the security estimate?",
        "answer": "A larger clock makes the same noise proportionally smaller — the gap the attacker must distinguish widens relative to the noise, and lattice reduction needs a smaller β to exploit it. Raising q is bought for correctness (a wider noise budget, lower δ) and must be paid back with more dimension or wider noise. No knob moves alone."
      },
      {
        "question": "Why don't the explorer's numbers match the official claimed security levels exactly?",
        "answer": "The explorer implements one deliberately simplified estimate — the primal attack under the GSA shape with core-SVP costing. A real analysis runs several attacks (primal, dual, hybrid, BKW variants) under several cost models via the maintained lattice estimator and takes the minimum. Same shape, coarser lens — which is precisely why the lab's rule is \"numbers without methodology are not results.\""
      }
    ]
  },
  {
    "id": "attacks",
    "title": "Attacks",
    "subtitle": "Three honest ways to break a lattice KEM (plus side-channels)",
    "category": "foundations",
    "path": 10,
    "views": {
      "simple": "There are three honest ways to break a lattice KEM. First, find the secret *directly* by guessing or computing — the 'find the needle in a high-dimensional haystack' attack, made hard by big dimensions. Second, find a *close* secret that the math thinks is the right one — the 'closest vector' problem, and how almost all real attacks work in practice. Third, get the legitimate decoder to leak information by feeding it strange inputs and watching when it fails — the 'decryption-failure' attack, and the reason every modern scheme makes failure astronomically rare. None of these is a clever twist; they are systematic, named, and well-studied. A fourth family — *side channels* — lives in the implementation, not the math.",
      "developer": "Three formal attack families against LWE-based KEMs, plus implementation hazards. **(1) Lattice attacks.** Embed LWE into a lattice; run BKZ block reduction with sieving subroutines. The 'primal' variant solves the unique-SVP instance (Kannan embedding); the 'dual' solves a related decisional problem. Cost modeled as `core-SVP` against the block size `β`. **(2) Combinatorial attacks.** BKW (Blum-Kalai-Wasserman) and variants — trade space for time; dominant only in narrow parameter regimes. **(3) Adaptive failure attacks** — D'Anvers, Vercauteren, Verbauwhede (2019) showed an adversary submitting chosen ciphertexts can learn which inputs cause decryption failure and recover the secret in time `~1/δ`. (1) sets parameter dimensions; (3) sets noise distributions; (2) is a sanity check. **Side-channels** (timing, power, EM, fault injection) target the *implementation* and require the Engineer persona's review, not the spec author's.",
      "researcher": "The **primal attack** reduces LWE to unique-SVP via the Kannan embedding; standard cost is `core-SVP` with block size `β` chosen to satisfy the GSA root-Hermite condition. The **dual attack** reduces to a Short Integer Solution (SIS) instance and tests distinguishing advantage with `m^* ≥ m` samples; for some regimes, the dual is asymptotically tighter. Both run BKZ (Chen-Nguyen 2011 and successors) with sieving subroutines (BDGL 2016 classically; Grover-style for the quantum cost model). The lattice estimator (Albrecht-Player-Scott 2015) produces concrete cost figures that move with each cryptanalytic update. **Decryption-failure attacks** (D'Anvers et al. 2019, followed by Guo-Johansson 2021, Bindel-Schanck 2020) act as the floor under noise-distribution choice — modern schemes target `δ ≤ 2^{-160}` or tighter precisely to evade this family. **Side-channels** are out of scope for the formal security argument but require constant-time considerations (and where secrets flow through tabular sampling, replacement of Gaussian-discrete sampling with CBD sampling). The lab's `sl-attacklab` is where structural and (eventually) cryptanalytic findings are filed; [F-0001](https://github.com/systemslibrarian/structureless-labs/blob/main/sl-attacklab/findings/F-0001.md) / [F-0003](https://github.com/systemslibrarian/structureless-labs/blob/main/sl-attacklab/findings/F-0003.md) are examples of the structural variety, filed before any parameter set exists to cryptanalyze."
    },
    "evidence_grade": "B",
    "evidence_note": "Attack families and their canonical references are well-established; concrete attack costs are an active research area and graded B because they shift with new results.",
    "related": [
      "lwe",
      "noise",
      "encoding",
      "reconciliation",
      "lattices"
    ],
    "citations": [
      "regev-2005",
      "dvv-2019",
      "albrecht-2015"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "Which attack family constrains which design parameter?",
        "answer": "Lattice-reduction attacks (primal/dual BKZ) set the dimension and the noise-to-modulus ratio; decryption-failure attacks set the noise distribution and the δ target; BKW-style combinatorial attacks are the sanity check that sample exposure and modulus aren't degenerate. Side channels constrain the *implementation*, not the math — which is why they get their own concept and their own reviewer."
      },
      {
        "question": "Why is there no \"quantum attack that breaks lattices\" section on this page?",
        "answer": "Because none is known. Shor's algorithm does not apply to LWE, and known quantum speedups for lattice attacks (Grover-flavored sieving) shave the constant in the exponent — core-SVP 2^0.292β classical versus 2^0.265β quantum — rather than collapsing the exponential. That gap, broken-by-Shor versus merely-cheaper, is the entire reason lattices are a post-quantum candidate. See The quantum threat model."
      }
    ]
  },
  {
    "id": "ring-module-lwe",
    "title": "Ring-LWE and Module-LWE",
    "subtitle": "Adding algebraic structure for speed — what the trade buys, what it costs, and what it risks",
    "category": "foundations",
    "path": 11,
    "views": {
      "simple": "Plain LWE is honest but heavy: the public key is a big grid of random numbers, and grids grow fast — tens of kilobytes for a single key. The structured variants solve this with a pattern. Instead of storing the whole grid, store just one row and a rule for generating the others from it (roughly: rotate the row, flip a sign as it wraps). One row plus a rule is dramatically smaller than a grid, and there is a fast transform that makes the math on such patterned grids hundreds of times quicker. That is the entire reason ML-KEM keys fit in 800 bytes where FrodoKEM's take nearly ten thousand: same underlying idea, structured versus unstructured.\n\nThe catch is philosophical as much as technical: the pattern is *extra structure*, and extra structure is extra surface. An attacker gets the same rule everyone else does. To date, no known attack against the deployed schemes uses the pattern — the best attacks treat the structured problem as if it were the plain one. But \"no attack today\" is a weaker statement than \"no structure to attack,\" and that gap is precisely why unstructured designs like FrodoKEM (and this lab's own interests) exist as the conservative fallback.\n\n**Module**-LWE, the version ML-KEM actually uses, is the compromise position: a small grid *of* patterned blocks — some structure for speed, less than full Ring-LWE. One more benefit: to change security levels you just change the number of blocks, keeping every optimized inner routine identical.",
      "developer": "**Ring-LWE** moves the LWE equation from vectors over `Z_q` into the polynomial ring `R_q = Z_q[X]/(X^n + 1)` (n a power of two). One ring element `a` plays the role of an entire `n×n` matrix — structurally a negacyclic matrix: each row is the previous row rotated with a sign flip at the wrap. Two wins: **size** drops from `O(n²)` matrix entries to `n` coefficients, and **speed** — multiplication in `R_q` runs in `O(n log n)` via the number-theoretic transform (NTT), the finite-field cousin of the FFT, when `q` is chosen NTT-friendly (Kyber's `q = 3329` was picked exactly for this; see [Modular arithmetic](#/modular)).\n\n**Module-LWE** replaces the single ring element with a `k×k` matrix of ring elements of fixed degree `n = 256`. Total dimension is `k·n`: ML-KEM-512/768/1024 are `k = 2, 3, 4`. The point of the module shape is operational: one NTT implementation, one CBD sampler, one constant-time pipeline serves all three security levels — only `k` changes.\n\nConcrete comparison at NIST category 1: FrodoKEM-640 (unstructured) public key ≈ 9,616 bytes; ML-KEM-512 encapsulation key = 800 bytes. Structure is the entire difference.\n\n**Security accounting, honestly stated:** the best known attacks against deployed Ring/Module-LWE parameters do not exploit the structure — they embed the instance as unstructured LWE of dimension `k·n` and run the standard [lattice-reduction machinery](#/attacks). So today the estimate for ML-KEM-768 and a hypothetical unstructured LWE at dimension 768 with matching noise are computed the same way. The residual worry is not a known weakness; it is that ideals and modules in cyclotomic rings carry symmetries that number theorists keep finding new things to say about. If that worry ever materializes, unstructured fallbacks are the insurance policy — which is [FrodoKEM's](#/parameter-choices) stated reason to exist and the design family [S-Cloud+](#/scloud-plus) also occupies.",
      "researcher": "Lyubashevsky, Peikert & Regev (2010) define Ring-LWE over the ring of integers of a cyclotomic number field: for `R = Z[X]/(Φ_m(X))` and `R_q = R/qR`, samples are `(a, a·s + e) ∈ R_q × R_q` with `a` uniform and `e` drawn from a (suitably shaped, coordinate-correlated) error distribution. The worst-case reduction lands on **Ideal-SVP** — approximate SVP restricted to ideal lattices of `R` — rather than on GapSVP over general lattices as for plain LWE (Regev 2005). Langlois & Stehlé (2015) define **Module-LWE** over `R_q^k` and reduce from Module-SIVP; the module rank `k` interpolates: rank-1 recovers Ring-LWE, high rank with degree-1 rings recovers unstructured LWE. ML-KEM's assumption is Module-LWE at `(n, k, q) = (256, {2,3,4}, 3329)` (FIPS 203).\n\nThe structural-risk ledger, as currently known: (1) The reductions for structured variants are to *structured* worst-case problems — a hardness statement about ideal/module lattices, a strictly smaller class than all lattices. (2) Ideal-SVP is quantumly easier than general SVP at large approximation factors in cyclotomics (the Cramer–Ducas–Peikert–Regev line of work on short generators and the subsequent unit-lattice results); these approximation factors are far beyond anything relevant to the parameters of deployed schemes, and the attacks do not extend to Ring-LWE as used. (3) No published attack achieves a better concrete cost against ML-KEM by using its module structure than by ignoring it; consequently, [lattice-estimator](#/parameter-choices) analyses of structured schemes are run at the unstructured embedding dimension `k·n`.\n\nThe honest summary the atlas commits to: *structure is a pure efficiency win under current knowledge, purchased with a strictly stronger assumption whose extra strength has never been needed by an attacker — yet.* The unstructured family (FrodoKEM; the design space this lab studies) prices that residual assumption at roughly an order of magnitude in bandwidth. Reasonable engineers land on both sides; the atlas's job is to make the trade legible, not to settle it."
    },
    "evidence_grade": "B",
    "evidence_note": "The definitions and reductions (LPR 2010, Langlois-Stehlé 2015) are established results. Grade B rather than A because the load-bearing comparative claim — structure gives no attack advantage at deployed parameters — is a statement about the current cryptanalytic frontier, which moves.",
    "related": [
      "lwe",
      "ml-kem",
      "modular",
      "lattices",
      "parameter-choices"
    ],
    "citations": [
      "lpr-2010",
      "langlois-stehle-2015",
      "kyber-2018",
      "frodokem-2017",
      "regev-2005",
      "fips-203-2024"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "What do you actually save by adding ring structure to LWE?",
        "answer": "A factor of roughly n in both key size and multiplication time: one ring element stands in for an n×n structured matrix, and the NTT multiplies ring elements in O(n log n). Concretely at the same security category: FrodoKEM-640's public key is ~9.6 KB, ML-KEM-512's is 800 bytes. Structure is the entire difference."
      },
      {
        "question": "Does any known attack exploit the ring or module structure of ML-KEM?",
        "answer": "No. The best known attacks embed the instance as unstructured LWE of dimension k·n and run standard lattice reduction — the structure is ignored. Known structural results (quantum attacks on Ideal-SVP at huge approximation factors) do not reach deployed parameters. The honest statement is double-edged: no attack advantage from structure today, and no proof there never will be — which is exactly the hedge unstructured designs exist to cover."
      },
      {
        "question": "Where does Module-LWE sit between plain LWE and Ring-LWE?",
        "answer": "It is a k×k grid of ring elements: rank k=1 is Ring-LWE; large k over degree-1 rings recovers plain LWE. Modules dilute the algebraic structure relative to pure Ring-LWE and — operationally — let one optimized ring pipeline serve every security level by changing only k (ML-KEM uses k = 2, 3, 4)."
      }
    ]
  },
  {
    "id": "ml-kem",
    "title": "ML-KEM (Kyber)",
    "subtitle": "The standardized lattice KEM — what actually happens in keygen, encapsulation, and decapsulation",
    "category": "constructions",
    "path": 12,
    "views": {
      "simple": "ML-KEM is the algorithm most of the internet is adopting for post-quantum key exchange. It began life as CRYSTALS-Kyber, won an open eight-year standards competition, and was published by NIST as FIPS 203 in August 2024. If you used a current browser today, there is a good chance an ML-KEM handshake protected the connection — running alongside classical cryptography in a [hybrid](#/hybrid-constructions), the way this atlas recommends thinking about all near-term deployment.\n\nWhat it does is narrow on purpose. ML-KEM is a *key encapsulation mechanism*: one party locks a fresh random key inside a small package only the other party can open; both sides end up holding the same secret key, and everything after that (the actual messages) is ordinary symmetric encryption. Underneath, the lock is exactly the machinery this atlas teaches: a noisy linear equation ([LWE](#/lwe), in its structured [module form](#/ring-module-lwe)), a [clock modulus](#/modular) of 3329, deliberately small [noise](#/noise), a message [encoded](#/encoding) at the widest spacing the ring allows, and parameters tuned so [decryption failure](#/decryption-failure) is functionally impossible.\n\nIt comes in three sizes — 512, 768, 1024 — trading bytes for security margin; 768 is the common default. A study note, in the lab's usual voice: this page explains a published standard; explaining it neither endorses every deployment of it nor transfers its pedigree to anything else in this repo.",
      "developer": "ML-KEM is [Module-LWE](#/ring-module-lwe) with `n = 256`, `q = 3329`, module rank `k ∈ {2, 3, 4}`, CBD noise, everything NTT-native, wrapped in a Fujisaki-Okamoto transform. The three algorithms:\n\n**KeyGen.** Expand a public seed into the matrix `A ∈ R_q^{k×k}` (SHAKE — the seed *is* the matrix, so the public key stores 32 bytes instead of a matrix). Sample small `s, e` from CBD. Publish `t = A·s + e` (with the seed); keep `s`. This is the [LWE equation](#/lwe) verbatim, one level up in structure.\n\n**Encaps.** Pick a random 32-byte message `m`. Derive *all* randomness deterministically from `m` and a hash of the public key. Build the reply-direction ciphertext: `u = Aᵀr + e₁`, `v = tᵀr + e₂ + Encode(m)` — the same trick as [reconciliation's](#/reconciliation) encryption-style pattern: the shared secret rides inside the [encoding](#/encoding), placed at spacing `q/2`. Compress (round) `u` and `v` — rounding error acts as additional noise the [budget](#/decryption-failure) must absorb. The shared key is derived from `m` and the ciphertext context.\n\n**Decaps.** Use `s` to compute `v − sᵀu ≈ Encode(m) + small noise`, decode to recover `m` — then **re-encrypt**: rerun Encaps with the recovered `m` and check the result equals the received ciphertext byte-for-byte. Match → output the real key. Mismatch → output a pseudorandom key derived from a secret rejection value (*implicit rejection* — no error signal an attacker can probe). That re-encryption check is the FO transform, and it is what upgrades a merely-CPA-secure core into an IND-CCA2 KEM. It must run in constant time; branching on it is a canonical [side-channel](#/side-channels) mistake.\n\nSizes: encapsulation keys 800 / 1,184 / 1,568 bytes and ciphertexts 768 / 1,088 / 1,568 bytes for ML-KEM-512 / 768 / 1024. Failure rates δ around `2⁻¹³⁹` / `2⁻¹⁶⁴` / `2⁻¹⁷⁴` per FIPS 203's accounting.",
      "researcher": "Formal shape: ML-KEM = FO^̸⊥ (implicit-rejection Fujisaki-Okamoto, in the Hofheinz-Hövelmanns-Kiltz modular analysis) applied to K-PKE, an IND-CPA public-key scheme whose security is exactly decisional Module-LWE at `(n, k, q) = (256, {2,3,4}, 3329)` — see [Ring/Module-LWE](#/ring-module-lwe) for the assumption and its reductions. Security claims are stated in the ROM with QROM analyses available at some tightness cost; the decapsulation-failure probability enters the CCA bound explicitly, which is one of the two reasons δ is driven to `2⁻¹³⁹` and below (the other being [adaptive failure attacks](#/decryption-failure)).\n\nDesign details that carry the proof and the implementation discipline: derandomized encryption (`r, e₁, e₂` derived from `m ‖ H(ek)`) makes the re-encryption check meaningful; hashing the public key into both the randomness and the shared secret provides contributory behavior and multi-target protection; implicit rejection removes the decryption-failure oracle that explicit-rejection variants leak; ciphertext compression `(d_u, d_v)` trades bandwidth against additional rounding noise in the [failure budget](#/decryption-failure). FIPS 203 differs from round-3 Kyber in small, documented ways (e.g., input-validation requirements and domain-separation tweaks) — implementers should treat the FIPS text, its test vectors, and its known-answer tests as the contract, not the round-3 paper.\n\nConcrete security posture per the standard's own methodology: claimed categories 1 / 3 / 5 for the three parameter sets, with core-SVP-style estimates produced by the [lattice-estimator](#/parameter-choices) machinery at unstructured embedding dimension `k·n`; the numbers move with cryptanalysis and the standard's categories deliberately include margin. Known-risk register: the module *structure* question ([Ring/Module-LWE](#/ring-module-lwe)), implementation leakage ([side-channels](#/side-channels) — masked implementations carry measured overhead), and the generic caveat this lab attaches to every concrete estimate: numbers without methodology are not results. The atlas page is a study of FIPS 203 as published; deployment guidance stays with the [hybrid](#/hybrid-constructions) posture."
    },
    "evidence_grade": "A",
    "evidence_note": "ML-KEM is a finalized federal standard (FIPS 203, August 2024) with eight years of open analysis behind it; the construction description here is checkable against the standard's text. Grade A for the construction and its provenance — while noting, as always, that concrete security *estimates* are a moving frontier (that caveat lives at grade B in Parameter choices).",
    "related": [
      "ring-module-lwe",
      "hybrid-constructions",
      "parameter-choices",
      "encoding",
      "decryption-failure",
      "threat-model"
    ],
    "citations": [
      "fips-203-2024",
      "kyber-2018",
      "dvv-2019",
      "giacon-2018"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "ML-KEM is a \"KEM\", not an encryption scheme. What is the difference, and why does it matter?",
        "answer": "A KEM does one narrow job: transport a single fresh random key. Encapsulation outputs (ciphertext, shared key); decapsulation recovers the shared key; bulk data is then encrypted symmetrically. Narrowing the job is what makes the FO security argument, the failure-probability accounting, and constant-time implementation tractable — general-purpose lattice encryption would have to defend a much wider interface."
      },
      {
        "question": "Why does decapsulation re-encrypt the message it just decrypted?",
        "answer": "That is the Fujisaki-Okamoto transform. Because encryption randomness is derived deterministically from the message, an honest ciphertext is reproducible — so decapsulation re-runs encryption and compares. Any tampered ciphertext fails the comparison and yields a pseudorandom key instead of an error (implicit rejection), giving a chosen-ciphertext attacker no signal. It converts the CPA-secure core into an IND-CCA2 KEM — and the comparison must be constant-time, or it becomes a side channel."
      },
      {
        "question": "What actually changes between ML-KEM-512, -768, and -1024?",
        "answer": "Essentially one knob: the module rank k = 2, 3, 4 (total lattice dimension 256·k), plus small adjustments to noise widths and ciphertext compression. The ring, the modulus q = 3329, and the NTT pipeline are identical across all three — that is the module design paying off operationally (see Ring-LWE and Module-LWE)."
      }
    ]
  },
  {
    "id": "scloud-plus",
    "title": "S-Cloud+",
    "subtitle": "An unstructured-lattice KEM from Wang et al. (2024) — studied here, not endorsed",
    "category": "constructions",
    "path": 13,
    "views": {
      "simple": "S-Cloud+ is a post-quantum KEM published in 2024 by Wang and collaborators. It is *one* example of a 'structureless lattice' design — meaning it relies on plain unstructured LWE without the extra algebraic structure (rings, modules) that some attacks specifically target. It also uses an unusual encoding (the Barnes-Wall BW₃₂ lattice code) and a standard Fujisaki-Okamoto transform for chosen-ciphertext-attack resistance. We study S-Cloud+ here because the lab's own `sl-kem` lives in the same conservative family, and understanding how someone else solved similar problems makes the lab's own design questions clearer. Important: **studying S-Cloud+ does not mean we are endorsing it for production, and it does not make `sl-kem` more trustworthy.**",
      "developer": "S-Cloud+ (*Wang et al.*, ePrint [2024/1306](https://eprint.iacr.org/2024/1306)) is an unstructured-LWE KEM whose distinctive design choices are: **(a) ternary secret distribution** — secrets sampled from `{−1, 0, +1}^n` rather than a wider CBD range, which lowers ciphertext bandwidth without (per the authors' analysis) materially weakening LWE security in the chosen regime; **(b) Barnes-Wall BW₃₂ lattice encoding** — using the BW family in dimension 32 to maximize the decoder's decoding radius `τ` per dimension, lowering `δ` for a given noise budget; **(c) Fujisaki-Okamoto transform** in the standard Hofheinz-Hövelmanns-Kiltz form for IND-CCA2. The headline practical result (per the paper's tables): smaller keys than FrodoKEM at comparable claimed security, without taking on the algebraic ring structure of ML-KEM. This atlas page describes S-Cloud+ as a *study target*; a faithful TypeScript reimplementation exists at [crypto-lab-scloud-vault](https://github.com/systemslibrarian/crypto-lab-scloud-vault). Adopting S-Cloud+'s parameters into `sl-kem` is what [`sl-kem` D-0003](https://github.com/systemslibrarian/structureless-labs/blob/main/sl-kem/decisions/D-0003.md)'s adopt-by-reference framework permits — *with explicit attribution and non-endorsement*.",
      "researcher": "Wang et al. (2024) instantiate the construction `pk = (A, b = A·s + e)` with `A ∈ Z_q^{m×n}` sampled via a deterministic seed-expander, `s` from a ternary `{−1,0,+1}^n` distribution, and `e` from a centered binomial. Encaps uses standard FO derandomization `(r, e', e'') ← H(μ ‖ H(pk))` and produces `(c_1 = A^T r + e', c_2 = b^T r + e'' + E_{BW_{32}}(μ))` where `E_{BW_{32}}` encodes the message into the Barnes-Wall lattice in dimension 32. The Barnes-Wall family `BW_{2^k}` is one of the dominant choices for KEMs that aim to maximize `τ` per dimension; `BW_{32}` reaches the Mordell minimum kissing-number bound for its dimension. The security argument inherits unstructured-LWE hardness (Regev 2005 and successors) with concrete parameters whose `λ` and `δ` are stated in the published spec. **The lab's relationship to S-Cloud+ is methodological-and-pedagogical only** — see [`sl-researchkit/decisions/D-0002`](https://github.com/systemslibrarian/structureless-labs/blob/main/sl-researchkit/decisions/D-0002.md). Atlas content describes the design; the lab borrows neither Wang et al.'s construction nor their credibility for `sl-kem`."
    },
    "evidence_grade": "B",
    "evidence_note": "S-Cloud+'s construction and parameters are published and cited; the security argument is the authors'. Grade B reflects strong public consensus (the paper has been on ePrint since 2024) without formal proof in this atlas. **This page is a study of someone else's published KEM. No security claim is made by Structureless Labs about S-Cloud+ or its parameters.**",
    "related": [
      "lwe",
      "encoding",
      "noise",
      "lattices"
    ],
    "citations": [
      "scloud-plus-2024",
      "frodokem-2017"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "What is distinctive about S-Cloud+ compared to FrodoKEM, its closest structural relative?",
        "answer": "Same conservative unstructured-LWE family, different engineering bets: ternary secrets ({−1, 0, +1}) to cut bandwidth, and a Barnes-Wall BW₃₂ lattice code to maximize decoding radius per dimension — buying smaller keys at the authors' claimed security. A standard Fujisaki-Okamoto transform supplies IND-CCA2, as in ML-KEM."
      },
      {
        "question": "Why does this page repeat its non-endorsement disclaimer so insistently?",
        "answer": "Provenance discipline. A three-depth explainer of someone else's published design is a teaching artifact about that work — it neither validates S-Cloud+ for production nor transfers Wang et al.'s credibility to anything else in this lab. Keeping study and endorsement separate is what lets the atlas explain constructions freely without accumulating implied claims."
      }
    ]
  },
  {
    "id": "hybrid-constructions",
    "title": "Hybrid constructions",
    "subtitle": "Classical and post-quantum, combined so neither one alone is the single point of failure",
    "category": "foundations",
    "path": 14,
    "views": {
      "simple": "The conservative move when nobody is sure which math will hold up: use two locks at once. A hybrid post-quantum construction combines a classical algorithm (ECDH, the workhorse that protects most of the internet today) with a post-quantum algorithm (a lattice-based KEM like ML-KEM or FrodoKEM). The session key is derived from *both* outputs, so that breaking only one of them leaves the secret intact. If quantum computers turn out to break the classical half a decade from now, the post-quantum half still holds. If a future cryptanalyst finds a flaw in the post-quantum scheme, the classical half still holds. You only lose the secret if *both* fall — a much higher bar than either alone. This is the position the lab's [CONSTITUTION Article 1](../../CONSTITUTION.md) commits to: prefer reviewed primitives and hybrid constructions; do not bet a session's security on a single new assumption.",
      "developer": "A hybrid KEM combines two underlying KEMs `KEM₁` (classical, e.g. X25519) and `KEM₂` (post-quantum, e.g. ML-KEM-768) into a composite KEM whose shared secret is a key-derivation-function output over both component secrets and both ciphertexts:\n\n```\n(c₁, K₁) ← KEM₁.Encaps(pk₁)\n(c₂, K₂) ← KEM₂.Encaps(pk₂)\nK         ← KDF(K₁ ‖ K₂ ‖ c₁ ‖ c₂ ‖ context)\nciphertext = (c₁, c₂)\n```\n\nThe KDF input — specifically, including both ciphertexts and a binding context string — is the load-bearing part. A naive `KDF(K₁ ‖ K₂)` is **not** robust: Giacon, Heuer, Poettering (2018) showed that for some component KEMs you also need *ciphertext binding* to defend against mauling / re-encryption attacks that would otherwise break IND-CCA of the combined construction. Real-world hybrid designs — the IETF TLS hybrid-KEM drafts (X25519+ML-KEM-768), CNSA 2.0 (P-256+ML-KEM-768), conservative profiles using X25519+FrodoKEM-976 — all use ciphertext binding and a strong KDF (HKDF-SHA-384 or SHA-512). **Why bother?** Three reasons: **(1) Hedge against cryptanalysis surprise.** The formal security argument for any PQ KEM is concrete, not asymptotic, and could weaken; the classical KEM's argument is well-aged but fails to a future cryptographically-relevant quantum computer. Hybrid covers both bets. **(2) Regulatory + compliance.** Many deployments cannot drop the classical primitive yet (FIPS-140-3 module boundaries, audit trails). Hybrid is the only path that adds PQ protection without breaking those constraints. **(3) Constitutional conservatism.** Inventing a primitive requires a Cryptographer BLOCK-clearance per the [CONSTITUTION](../../CONSTITUTION.md); combining two reviewed primitives in a documented way does not. The hybrid is the conservative default, and it is the construction the lab's [`slff`](../../slff/spec/FORMAT-OVERVIEW.md) container is built to carry natively.",
      "researcher": "The standard hybrid-KEM security target is IND-CCA2 with the property that breaking the hybrid requires breaking **both** underlying KEMs — formally, `Adv^{ind-cca}_{Hybrid}(A) ≤ ε₁ + ε₂` where `ε_i` is the IND-CCA advantage against `KEM_i`, modulo standard model-specific reductions. Giacon, Heuer, Poettering (PKC 2018) proved this for several combiner constructions under different KEM models; the 'concatenate-then-KDF-with-ciphertext-binding' combiner is the standard pattern, with the XOR-then-KDF combiner an alternative in restricted regimes. Bindel, Brendel, Fischlin, Goncalves, Stebila (PQCrypto 2019) extended the analysis to authenticated key exchange in the post-quantum transition setting, with explicit models for forward secrecy, post-quantum security, and the harvest-now-decrypt-later threat. **Ciphertext binding is necessary, not optional.** Without it, a combiner over a malleable or non-binding component KEM — where a ciphertext can be transformed to produce a related shared secret — can lose IND-CCA of the combined construction even though each component is IND-CCA on its own. The Giacon-Heuer-Poettering paper carries the canonical counter-example. **For deployment**, the current consensus instantiations are X25519+ML-KEM-768 (the dominant TLS draft), P-256+ML-KEM-768 (CNSA 2.0), and X25519+FrodoKEM-976 in some conservative profiles where structure-free assumptions are preferred. **The lab's position**: the hybrid construction is the only KEM family the [CONSTITUTION](../../CONSTITUTION.md) endorses without per-instance BLOCK-clearance, and [`slff/spec/FORMAT-OVERVIEW.md`](../../slff/spec/FORMAT-OVERVIEW.md) treats the pair `(classical_alg_id, pq_alg_id)` as the suite primary key — there is no single-primitive suite encoding in the format, by design."
    },
    "evidence_grade": "A",
    "evidence_note": "The hybrid-KEM combiner analysis (Giacon-Heuer-Poettering 2018, Bindel et al. 2019) is the canonical formal basis for current deployments; the ciphertext-binding requirement and the IND-CCA reduction are well-established. Grade A because the underlying proofs are stable; the deployment landscape moves but the construction pattern does not.",
    "related": [
      "lwe",
      "attacks",
      "side-channels"
    ],
    "citations": [
      "giacon-2018",
      "bindel-2019",
      "kyber-2018",
      "frodokem-2017"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "Why is KDF(K₁ ‖ K₂) — without the ciphertexts — not a safe combiner?",
        "answer": "Giacon, Heuer & Poettering (2018) showed that over some component KEMs, a combiner without ciphertext binding loses IND-CCA even though both components have it: a mauled ciphertext can yield a *related* shared secret the KDF cannot distinguish. Feeding c₁ and c₂ into the KDF makes any ciphertext modification change the derived key. The binding is load-bearing, not belt-and-braces."
      },
      {
        "question": "Under what circumstances does a hybrid construction actually fail?",
        "answer": "Only when both components fall within the window the secret must survive: the classical half to a cryptographically relevant quantum computer AND the post-quantum half to new cryptanalysis. Either alone leaves the derived key secure — that conjunction is the entire argument, and it is why the lab's CONSTITUTION endorses hybrids as the only KEM family not requiring per-instance clearance."
      }
    ]
  },
  {
    "id": "side-channels",
    "title": "Side channels",
    "subtitle": "When the math is fine and the implementation leaks anyway",
    "category": "engineering",
    "path": 15,
    "views": {
      "simple": "A cipher can be perfectly secure on paper and still leak its secret in the real world. The leak does not come from the math — it comes from the *physical act* of running the math. A chip that takes a few microseconds longer when its secret happens to contain a 1 than when it contains a 0 is whispering the secret to anyone with a stopwatch. Watching a power meter, listening for electromagnetic emissions, or even nudging the chip with a precisely-timed voltage glitch — all of these have, in published research, extracted cryptographic keys from devices the math believed were safe. The fix is not better math; it is implementation discipline: every operation that touches a secret must take the same time, draw the same power, and follow the same code path regardless of what the secret is. The whole family of techniques is called *constant-time programming*, and getting it right is hard enough that the field still finds new mistakes in old code every year.",
      "developer": "Side-channel attacks recover secret material from a correctly-implemented cryptographic primitive by observing physical or microarchitectural signals the abstract algorithm does not model. Four canonical channels. **(1) Timing.** Execution-time differences that depend on secret data — branching on a secret, indexing a table at a secret address, calling variable-time arithmetic with secret-dependent operand sizes. The seminal demonstration is Kocher (1996) against RSA, DH, and DSS. Defense: constant-time implementations; no branches and no memory accesses with secret-dependent addresses. **(2) Power analysis.** Simple Power Analysis (SPA) reads the trace directly; Differential Power Analysis (DPA, Kocher-Jaffe-Jun 1999) recovers keys statistically across many traces. Defense: *masking* (split secrets into shares so no single intermediate carries the whole secret) and *hiding* (noise injection, dual-rail logic). **(3) Electromagnetic emanations.** Same underlying physics as power analysis but read by a different sensor; harder to defend because EM emissions can sometimes be measured at a distance from the device. **(4) Fault injection.** Voltage or clock glitches, lasers, deliberate undervolting — corrupting the computation to produce a single *faulty* output that, combined with a correct one, leaks the key (the canonical Boneh-DeMillo-Lipton 1997 attack against RSA-CRT). **For lattice KEMs specifically**, the common pitfalls are: secret-dependent rejection sampling, Gaussian-discrete sampling via secret-indexed lookup tables (which is why CBD sampling is preferred), non-constant-time modular reduction, and decapsulation code that branches on the re-encryption check inside the Fujisaki-Okamoto transform. ML-KEM, FrodoKEM, and the lab's candidate `sl-kem` all owe their constant-time guarantees to specific implementation choices, not to the abstract spec. **Side-channels are out of scope for the formal security argument** — they are the [Engineer persona](../../sl-researchkit/personas/ENGINEER.md)'s territory and the reason Article 5 of the [CONSTITUTION](../../CONSTITUTION.md) says *every concept ships with three views* rather than *every concept ships with one proof*.",
      "researcher": "Formally, a side-channel adversary `A^O` interacts with an implementation `Impl(K)` of a primitive `P` parameterized by secret `K`, with access to a leakage oracle `O` modeling the physical channel. The structural problem: the standard IND-CCA proof for `P` bounds `Adv^{ind-cca}_P(A)` against any PPT adversary; it does NOT bound `Adv^{ind-cca}_{Impl(P)}(A^O)` against a leakage-aware adversary unless `Impl` is *leakage-resilient* by construction. Leakage models of varying strength appear in the literature — bounded-leakage, noisy-leakage, simulatable-leakage, threshold-implementation — each with corresponding compiler-style constructions whose overhead and assumptions differ. **For lattice KEMs**, documented attack surfaces include: (i) timing leakage in CBD or discrete-Gaussian sampling (the BLISS-signature timing attack on rejection sampling generalizes to KEM samplers); (ii) cache-timing leakage in number-theoretic-transform implementations and in modular-reduction code; (iii) DPA on the key-decapsulation Hamming-weight signal, with multiple published results against Kyber and Saber implementations; (iv) chosen-ciphertext fault attacks that recover the long-term secret via single-bit faults in decapsulation, again with published results against both Kyber and Saber. The standard defenses — first-order masking with `t+1` shares, table-free sampling (CBD instead of Gaussian-discrete tables), constant-time NTT, FO-transform decapsulation that does not branch on the re-encryption check — are widely deployed but not free: masked Kyber implementations carry a 2–5× cycle penalty for first-order security, more for higher orders. The lab's position: side-channel security is a *contract between the spec and a specific implementation*; an atlas concept cannot ship a side-channel-secure implementation, only a clear statement of what an implementation must promise."
    },
    "evidence_grade": "B",
    "evidence_note": "The four canonical channels and their foundational references (Kocher 1996 timing, Kocher-Jaffe-Jun 1999 DPA, Boneh-DeMillo-Lipton 1997 faults) are well-established. The lattice-KEM-specific attack results cited are real published research; specific paper citations beyond Kocher are named in prose without being individually registered (carried forward as a not-blocking note in the manner of the Attacks review).",
    "related": [
      "attacks",
      "noise",
      "encoding"
    ],
    "citations": [
      "kocher-1996",
      "kocher-1999",
      "pessl-2017"
    ],
    "attack_links": [],
    "source_spec": null,
    "checks": [
      {
        "question": "The math is provably secure. How can the key still leak?",
        "answer": "The proof bounds what an adversary learns from the algorithm's inputs and outputs; it says nothing about the time taken, power drawn, electromagnetic field emitted, or faults induced *while computing*. Those physical signals are extra outputs the security model never covered — and published attacks have recovered keys from every one of them."
      },
      {
        "question": "Why do lattice KEMs prefer CBD sampling over discrete Gaussians in practice?",
        "answer": "Gaussian samplers historically used secret-indexed lookup tables or rejection loops, both of which leak through timing and cache behavior — the BLISS attack (Pessl, Groot Bruinderink & Yarom 2017) is the canonical precedent. Centered-binomial sampling is a fixed handful of bit operations, identical for every secret: constant-time by construction rather than by audit."
      }
    ]
  },
  {
    "id": "slff-format",
    "title": "slff format internals",
    "subtitle": "A draft hybrid-KEM container — what the layout commits to, and what is honestly still open",
    "category": "engineering",
    "path": 16,
    "views": {
      "simple": "slff (the Structureless Labs File Format) is the lab's draft container for encrypted data that uses a hybrid construction: a classical and a post-quantum key encapsulation, glued together at the file level so a single file can survive a future where one of those primitives falls. The layout is sketched. A magic number plus version header at the front, so old readers do not silently misread future files. A suite descriptor naming the two algorithms in use. A crypto-agility block recording *which* version of *which* parameter set was active at encryption time. An optional provenance block — a snapshot of the security estimate the lab held when the file was sealed. The authenticated header covers everything above. The encapsulated keys come next, then the encrypted payload, then the authentication tag. The layout makes real commitments — and one commitment is currently unresolved. The spec says *unknown critical fields are rejected; unknown non-critical fields are recorded and ignored* — but it does not yet say **how a field declares itself critical**. That open question is filed as [`F-0002`](../../sl-attacklab/findings/F-0002.md) and must be resolved before slff has a complete format spec. This page is honest about that state: a draft worth understanding, with one named gap.",
      "developer": "slff's layout, per [`slff/spec/FORMAT-OVERVIEW.md`](../../slff/spec/FORMAT-OVERVIEW.md):\n\n```\n+-----------------------------------------------------------+\n| Magic + format version                                    |\n| Suite descriptor: { classical_alg_id, pq_alg_id, params } |\n| Crypto-agility block: versioned parameter set + grades    |\n| Provenance (optional): security estimate @ encryption time|\n| Authenticated header (AAD) -- covers everything above     |\n| Encapsulated keys (hybrid: classical || PQ)               |\n| AEAD-encrypted payload                                    |\n| Auth tag                                                  |\n+-----------------------------------------------------------+\n```\n\nDesign commitments worth flagging. **(1) Downgrade resistance.** The suite descriptor sits *inside* the authenticated header, so a man-in-the-middle cannot rewrite `pq_alg_id` to a weaker scheme without invalidating the AAD — the standard lesson from TLS downgrade attacks (FREAK, Logjam) applied at the file-format level. **(2) Hybrid is native.** Unlike file formats that bolted PQ on after the fact, slff treats `(classical_alg_id, pq_alg_id)` as the suite primary key. There is no PQ-only or classical-only suite encoding; both slots are mandatory. **(3) Migration via re-encryption.** A v1 file is migrated by decrypting and re-encrypting under a v2 suite; the new container references the old suite version so the audit trail stays coherent. No in-place suite upgrade. **(4) The crypto-agility block exists separately** from the suite descriptor — it carries the parameter-set version and an evidence grade (per `sl-researchkit/checklists/EVIDENCE-GRADING.md`), so a future reader sees both *what algorithm was used* and *what the lab knew about its strength* at encryption time. **The honest gap.** [`F-0002`](../../sl-attacklab/findings/F-0002.md) — Attacker persona, 2026-06-09 — raised that the spec's *unknown critical → reject; unknown non-critical → ignore* rule is unimplementable as written. There is no specified mechanism by which a field declares itself critical: no per-field flag, no `crit` list à la JOSE, no CBOR tag convention. Without that mechanism, two conforming implementations can disagree on which unknown fields to reject — the classic accept-vs-reject divergence. F-0002's recommended resolution is the JOSE `crit`-list pattern (RFC 7515 §4.1.11) inside the suite descriptor, plus paired positive/negative test vectors in `sl-vectors`. This concept will be updated when F-0002 closes.",
      "researcher": "Format-spec analysis of slff (draft, 2026-06-09). **What is fixed.** The canonical encoding of the AAD covers all preceding fields, including the suite descriptor and crypto-agility block. Under the assumption of an EUF-CMA-secure AEAD, this gives the standard hybrid-KEM downgrade-resistance property: any modification to the suite descriptor invalidates the auth tag. The suite descriptor's `(classical_alg_id, pq_alg_id)` pair is structurally a primary key — there is no empty-PQ suite encoding — which prevents a per-message downgrade to a single-primitive ciphertext. Compare CMS, where the algorithm identifier is per-recipient and a per-recipient downgrade is structurally permitted; slff is intentionally tighter. **What is open** (per [`F-0002`](../../sl-attacklab/findings/F-0002.md)). The criticality marker mechanism. The format-overview text states *Unknown critical fields → reject* without defining how `critical` is signaled in the wire format. Three candidate mechanisms exist in adjacent standards: a per-extension `critical` bit (X.509 v3 extensions, RFC 5280); a `crit` array enumerating critical extension names (JOSE, RFC 7515 §4.1.11; CWT, RFC 8392); a CBOR tag-registry convention (RFC 8949). F-0002 recommends the JOSE pattern as the natural fit for slff's suite-descriptor layout. The criticality listing must itself live inside the AAD; were it appended outside, an attacker could rewrite the `crit` list and silently demote a critical field to ignored — the criticality-listing-itself-forgery class. **Hybrid KEM combiner** for the encapsulated-keys field: the draft uses concatenation-with-KDF and ciphertext binding per Giacon-Heuer-Poettering (2018), so each encapsulated-key slot is a full IND-CCA ciphertext, and the derived `K = KDF(K_classical ‖ K_pq ‖ c_classical ‖ c_pq ‖ AAD)` inherits the standard hybrid IND-CCA reduction. The atlas page on [hybrid constructions](#/hybrid-constructions) is the doctrinal half of this analysis; slff is its concrete embodiment. **Status.** This page describes a draft format with one open finding. The page exists to make the draft state legible — not to claim format readiness. When F-0002 closes (with the criticality mechanism specified and `sl-vectors` negative vectors added), this concept gets an update. Until then, deploying slff to production would be premature."
    },
    "evidence_grade": "C",
    "evidence_note": "Grade C reflects honest spec-state: the format layout and design commitments are written, but a load-bearing open finding (F-0002) means slff is not yet a complete spec. The hybrid-combiner reference (Giacon-Heuer-Poettering 2018) is solid; the downgrade-resistance property is the standard AAD-cover argument. The grade is intentionally lower than the surrounding foundations concepts to reflect that this concept describes a *draft*, not a settled artifact.",
    "related": [
      "hybrid-constructions",
      "lwe",
      "parameter-choices"
    ],
    "citations": [
      "giacon-2018",
      "kyber-2018",
      "frodokem-2017"
    ],
    "attack_links": [
      "sl-attacklab/findings/F-0002.md"
    ],
    "source_spec": "../../slff/spec/FORMAT-OVERVIEW.md",
    "checks": [
      {
        "question": "What stops an attacker from rewriting a file's suite descriptor to downgrade it to a weaker algorithm?",
        "answer": "The suite descriptor sits *inside* the authenticated header (AAD), so any modification invalidates the authentication tag. It is the lesson TLS learned from the FREAK and Logjam downgrade attacks, applied at rest: negotiate-able fields must be covered by the integrity check."
      },
      {
        "question": "The design looks solid — why is this concept graded C?",
        "answer": "Because of the open finding F-0002: the spec says \"unknown critical fields → reject\" without defining *how* a field declares itself critical, so two conforming implementations could disagree about what to reject. Until the mechanism is specified and negative test vectors exist, slff is a draft — and the grade's job is to say so rather than let the layout diagram imply more than the spec delivers."
      }
    ]
  },
];
