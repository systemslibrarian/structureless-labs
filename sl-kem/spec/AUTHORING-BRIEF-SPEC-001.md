# Authoring brief — SPEC-001

**Status:** AUTHORING BRIEF (not a spec; not a parameter set; not a security claim).
**Companion to:** [`SPEC-000.md`](SPEC-000.md) (structural draft).
**Frozen at:** the commit that introduces this file.

## What this document is

A step-by-step, constitution-compliant guide for whoever (human or AI agent) writes the next spec — **SPEC-001**. SPEC-000 fixes the algorithmic SHAPE; SPEC-001 binds the parameters. The gap between them is a set of open decisions that this brief enumerates honestly so the next author cannot accidentally skip one.

## What this document is NOT

- **Not a parameter set.** No values for `n, m, q, χ, λ, δ` are committed here.
- **Not a substitute for D-0004.** The reference-selection decision (which published parameter set is being adopted) is reserved for [`sl-kem/decisions/D-0004.md`](../decisions/D-0004.md), which does not yet exist. Authoring SPEC-001 without D-0004 first is out of order.
- **Not a six-persona review.** This brief lists the questions each persona will face on SPEC-001; it does not pre-decide their verdicts. Pretending to vote for personas without their actual review would violate Article 1 (Conservatism) and Article 6 (Provenance) of [CONSTITUTION](../../CONSTITUTION.md).
- **Not endorsed by anyone.** Specifically not by the eventual adoption source — whichever publication's parameter set ends up bound here, that publication has not reviewed `sl-kem`.

---

## The decision chain in order

The next author MUST work these in sequence. Each step is gated on the prior one landing.

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │  D-0004 — Reference selection (THE GATE)                            │
  │  Pick the specific publication + version whose parameters are       │
  │  adopted by SPEC-001. Six-persona review on the merits.             │
  │  Candidates (publicly published, conservative-LWE family):          │
  │    • FrodoKEM-640 / -976 / -1344 (Bos et al. 2021-06-04 spec)       │
  │    • ML-KEM-512 / -768 / -1024 (NIST FIPS 203)                      │
  │    • S-Cloud+ (Wang et al. ePrint 2024/1306) — see lineage note     │
  │  No decision is recorded here. D-0004 records it. This brief only   │
  │  names the candidates so the next author starts from the same map.  │
  └────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  Open decisions on non-parameter axes (the divergence surface)      │
  │  Each is a separate flight-recorder decision (D-0005 .. D-0009).    │
  │  These are the axes on which sl-kem may differ from the adoption    │
  │  source. Per D-0003's SPEC-NNN authoring checklist, SPEC-001 must   │
  │  list each axis explicitly — "no divergence" is also a valid entry. │
  │                                                                     │
  │    D-0005  Encoder E / decoder D (bitwise · Reed-Muller · BW_{2^k}) │
  │    D-0006  Hash function H (SHAKE-256 · SHA-3 family · BLAKE3?)     │
  │    D-0007  Serialization (byte order, length encoding, pk/sk/ct)    │
  │    D-0008  A: transmitted vs. seed-and-expand                       │
  │    D-0009  Side-channel posture (constant-time API contract)        │
  └────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  SPEC-001 authoring proper                                          │
  │  Per D-0003 §"SPEC-NNN authoring checklist":                        │
  │    • Provenance section names the adopted publication + version     │
  │    • Parameter table filled in BY REFERENCE ("per FrodoKEM-640 §x") │
  │      — never by restating numerical values                          │
  │    • Divergence section enumerates every axis where sl-kem differs  │
  │    • Borrows / does-not-borrow paragraph                            │
  │    • Non-endorsement sentence (D-0003 verbatim template)            │
  │  Six-persona review on the spec as a whole.                         │
  └────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  Companion artifacts (in the same PR as SPEC-001)                   │
  │    • sl-attacklab/targets/T-0002.md — SPEC-001 frozen as a target   │
  │      with attackable λ and δ claims.                                │
  │    • sl-vectors/sl-kem/SPEC-001/README.md — directory exists; the   │
  │      vectors themselves require a reference implementation, so the  │
  │      README explains the gap honestly.                              │
  │    • sl-bench/sl-kem/SPEC-001/INTERPRETATION.md — placeholder until │
  │      sl-kem/ref/ exists.                                            │
  └─────────────────────────────────────────────────────────────────────┘
```

---

## Each open decision, in one page

### D-0004 — Reference selection (the gate)

**Question:** Which published, peer-reviewed parameter set does SPEC-001 adopt verbatim?

**Why this is the gate:** D-0003 chose the *framework* (adopt-by-reference) but explicitly deferred reference selection. No subsequent decision can land until D-0004 names the publication and version.

**Candidates worth costing:**

| Candidate | Family | Pro | Con |
|---|---|---|---|
| **FrodoKEM-640 / -976 / -1344** | Unstructured LWE | Designed for conservative-lattice profile; matches `sl-kem`'s stated direction; multiple ROM-IND-CCA proofs in the literature; published spec is stable. | Larger keys / ciphertexts than ring/module variants; NIST Alt 3 — not standardized. |
| **ML-KEM-512 / -768 / -1024** | Module-LWE (ring structure) | NIST FIPS 203 standardized; widest review; widest deployment. | Module structure is *exactly* what the secondary "structureless" axis tries to step away from; adoption would obligate SPEC-001 to disavow that framing or revise it. |
| **S-Cloud+** (Wang et al. 2024/1306) | Unstructured LWE + BW₃₂ encoder | Closest match to `sl-kem`'s named family; the lab's [atlas concept on S-Cloud+](https://systemslibrarian.github.io/structureless-labs/#/scloud-plus) already explains the design. | Newer (2024); less independent review than FrodoKEM; the lineage note in [root README §"Lineage"](../../README.md#lineage-and-related-prior-work) means the credibility-transfer fence has to be tighter. |

**Persona load (anticipated):**
- *Cryptographer* will block any candidate whose hardness argument is not already published with grade ≥ B.
- *Attacker* will require a published attack-cost estimate against the chosen parameters using a named cost model (`core-SVP` classical + Grover quantum at minimum).
- *Engineer* will require the chosen parameter set ship with a clear constant-time sampling story (CBD preferred; tabular Gaussian discrete only with explicit defense).
- *Archivist* will require D-0004 explicitly cite the publication's version + commit hash / date (not "FrodoKEM" but "FrodoKEM-640 from the FrodoKEM 2021-06-04 specification, sections 1.2 and 2.4").
- *Teacher* will require a public-facing one-sentence summary: *"sl-kem's first parameter set is &lt;publication&gt;'s, with full attribution; the security argument belongs to them."*
- *PI* will require the research question advanced ("can this lab honestly attack a parameter set the moment it is bound?") be observable within 30 days.

**Authoring template:** `sl-researchkit/workflows/FLIGHT-RECORDER.md` (verbatim).

**Evidence requirement:** Grade C minimum (published parameter set + cited security argument). Grade A is possible if the choice is ML-KEM (FIPS 203) and the secondary structureless framing is revised accordingly.

---

### D-0005 — Encoder / decoder (E, D)

**Question:** Which message encoder does SPEC-001 use?

**Options:**
- **Bitwise modular** (Regev-style, simplest, lowest decoding radius per dimension).
- **Reed-Muller** (used by Kyber's `Compress`/`Decompress`; well-understood).
- **Barnes-Wall `BW_{2^k}`** (used by S-Cloud+; maximizes τ per dimension; less independent analysis at small k).

**Atlas concept to consult:** [`encoding`](../../sl-atlas/content/encoding.json) — three-depth explainer of the trade-off.

**Persona load:**
- *Cryptographer* will require the chosen encoder's decoding radius enter the decryption-failure analysis (D'Anvers et al. 2019) explicitly.
- *Attacker* will require δ ≤ 2⁻¹⁶⁰ at the bound λ (the adaptive-failure floor).

---

### D-0006 — Hash function (H)

**Question:** Which hash function does SPEC-001 use for the FO derandomization and the KDF?

**Options:** SHAKE-256, SHA3-256, SHA-256 (with care), BLAKE3.

**Default reasoning:** SHAKE-256 is the canonical choice in lattice KEMs (Kyber, FrodoKEM, NTRU). Deviating from it requires *Engineer* justification on constant-time and side-channel grounds.

---

### D-0007 — Serialization

**Question:** How are `pk`, `sk`, `ct` serialized on the wire?

**Constraint:** Whatever format is chosen must be representable in `slff` ([`slff/spec/FORMAT-OVERVIEW.md`](../../slff/spec/FORMAT-OVERVIEW.md)) as a hybrid component. D-0007 must therefore name the `slff` suite descriptor entry (`pq_alg_id`, `params`) it claims.

---

### D-0008 — `A` transport (transmitted vs. seed + expander)

**Question:** Is the public matrix `A` transmitted directly, or as a 32-byte seed plus a deterministic expander?

**Trade-off:** Transmitting `A` simplifies the spec; seed-and-expand reduces `pk` size by ~kB but adds an expander (SHAKE-128) to the spec surface and to the constant-time analysis.

---

### D-0009 — Side-channel posture

**Question:** What does SPEC-001 promise about constant-time behavior?

**Default:** SPEC-001 promises a *constant-time API contract* (all operations on `sk` are independent of `sk` in observable timing and memory access). The reference implementation, when it lands, is responsible for honoring the contract — the spec is responsible for not making it impossible.

**Atlas concept to consult:** [`side-channels`](../../sl-atlas/content/side-channels.json).

---

## Pre-merge checklist (binding on whoever writes SPEC-001)

- [ ] D-0004 recorded with six-persona verdicts and a `CITATIONS.md` entry for the adopted publication.
- [ ] D-0005 .. D-0009 each recorded (some may be one-line "no divergence" decisions; that is still a recorded decision).
- [ ] SPEC-001 published with all five sections D-0003 required (Provenance, Divergence, Borrows / Does-not-borrow, Non-endorsement sentence, parameter table by reference).
- [ ] T-0002 frozen at SPEC-001.
- [ ] `check-no-fabrication` passes (SPEC-001 is no longer a structural draft, so its parameter table cells may carry values — but every value must be either `per <ref>` or a backticked literal whose source is a `CITATIONS.md` entry).
- [ ] `validate-atlas` / `check-atlas-parity` / `check-citations` all PASS.
- [ ] `STATUS.md` regenerated.
- [ ] The atlas concept for the chosen reference (if not already present) authored at all three depths and Teacher-reviewed before SPEC-001 merges. (Authoring a spec for a reference whose atlas concept is BLOCKED would be out of order.)
- [ ] PREDICTION-002's count updated to reflect SPEC-001 having landed (or explicitly note that SPEC-001 is a spec landing, not an atlas concept landing — different counts).

---

## Six-persona review prompt template (for SPEC-001)

```
You are conducting a six-persona Structureless Labs review on SPEC-001
(sl-kem). Read each persona file in sl-researchkit/personas/ in turn, then
respond AS that persona — only that persona, in first person, applying the
persona's mandate and checklist to the specific concerns enumerated below.
End each persona's response with one of:

  VERDICT: PASS
  VERDICT: PASS WITH NOTES
  VERDICT: BLOCK

Specific concerns each persona must address:

- Cryptographer: Does the adopted parameter set carry a published security
  argument at grade B or higher? Is the encoder choice (per D-0005)
  consistent with the decryption-failure analysis at the bound λ?
- Attacker: Is the parameter set attackable today against a named cost
  model (core-SVP classical, BKZ block size β, Grover-style quantum)?
  Are the published attack costs (primal/dual/BKW) cited?
- Engineer: Does the constant-time API contract (per D-0009) survive a
  reading of the algorithm steps in SPEC-000 (KeyGen / Encaps / Decaps)?
  Are there branches on secrets visible in the spec text? Is the chosen χ
  CBD-style (constant-time friendly) or Gaussian-discrete (table-based,
  side-channel hazard)?
- Archivist: Does SPEC-001 name the adoption source by publication, version,
  AND date / commit, in the Provenance section? Are D-0004 .. D-0009
  cross-referenced from SPEC-001's text?
- Teacher: Could a newcomer understand the Provenance / Divergence /
  Borrows / Does-not-borrow / Non-endorsement section structure in one
  reading? Does the atlas already explain the chosen reference at all
  three depths?
- Principal Investigator: What research question does SPEC-001 advance
  beyond SPEC-000? Is the new attackable surface observable within
  30 days of merge?

After all six have spoken, list every BLOCK and the resolution path for
each. Do not propose code changes yet; SPEC-001 is a spec, not an
implementation, and a reference implementation is explicitly out of scope
until sl-kem/ref/ exists per D-0003.
```

---

## What this brief does NOT do

- It does not pick the reference. D-0004 picks the reference.
- It does not vote for any persona. The six personas vote in the actual review.
- It does not advance the `sl-kem` security claim beyond SPEC-000's structural state.
- It does not bind `sl-kem` to any specific lattice family axis beyond what SPEC-000 already commits.
- It does not waive any CI gate. `check-no-fabrication` still enforces the structural-draft contract on SPEC-000; SPEC-001 will be required to honor every gate that applies to non-structural specs.

The brief exists so the next author cannot accidentally skip a step. It is the operational counterpart to the strategic framing already in [`D-0002`](../decisions/D-0002.md) and [`D-0003`](../decisions/D-0003.md).

---

*Soli Deo Gloria — 1 Corinthians 10:31*
