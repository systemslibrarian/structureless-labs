# sl-kem — SPEC-000

**Status:** STRUCTURAL DRAFT. Commits the algorithm SHAPE; commits no parameter values.
**Version:** SPEC-000 (initial structural release)
**Family:** unstructured LWE-based KEM with Fujisaki-Okamoto transform for IND-CCA2.
**Frozen at:** the commit that introduces this file (see `T-0001`).

---

## What this document is

The algorithmic SHAPE of the experimental `sl-kem` primitive, defined precisely enough that
(a) future commits can fill in parameters and (b) a reader can identify what each `TODO`
commits the design to. **This document is not a KEM.** It is a template. The fields marked
`TODO:` are decisions the lab must make through its method (six-persona review + flight
recorder; see [`sl-researchkit/`](../../sl-researchkit/)) before any cryptanalysis or
implementation can be honestly performed.

## What this document is NOT (the honest non-claims)

- **Not a parameter set.** No values for `n`, `m`, `q`, `χ`, `λ`, or `δ` are committed.
- **Not a security claim.** Without parameters, no concrete security level is estimable.
  The "FO transform" line below fixes only the IND-CCA2 *shape*, not its *strength*.
- **Not a reference implementation.** The algorithmic steps are descriptive, not executable.
- **Not a test-vector source.** See `sl-vectors/sl-kem/SPEC-000/README.md` for why the
  vector directory exists but contains no vectors.
- **Not an interoperability target.** The serialization, hash function, and field layout
  will all change as the TODOs resolve.
- **Not endorsed by anyone.** Specifically not by Wang et al. — the lab's lineage to
  S-Cloud+ via [crypto-lab-scloud-vault](https://github.com/systemslibrarian/crypto-lab-scloud-vault)
  is study-only; see [root README §Lineage](../../README.md#lineage-and-related-prior-work).

---

## Family choice

`sl-kem` SPEC-000 commits to the **unstructured-LWE KEM family**: an LWE problem without
ring or module structure, in the spirit of FrodoKEM (Bos et al., 2017) and as one
conservative response to attacks that exploit algebraic structure. The choice aligns with
the lab's stated direction ("conservative, less-structured lattice assumptions"; see
[root README §"Why 'Structureless'?"](../../README.md#why-structureless)). A future spec
revision may reconsider this in a flight-recorder decision; doing so would fossilize
SPEC-000, not edit it.

---

## Parameters (all `TODO`)

| Symbol | Meaning | Value (SPEC-000) |
|---|---|---|
| `n` | LWE secret dimension | `TODO` — derive in `sl-bench/sl-kem/SPEC-NNN/` and bind in next spec |
| `m` | LWE sample count (rows of `A`) | `TODO` |
| `q` | Modulus | `TODO` — decision point: prime vs. power-of-two |
| `χ` | Error distribution | `TODO` — decision point: centered binomial `CBD_η` (constant-time-friendly) vs. discrete Gaussian |
| `η` | CBD parameter (if `χ = CBD_η` is chosen) | `TODO` |
| `λ` | Target security level (bits) | `TODO` — 128 / 192 / 256, to be selected with the lattice-estimator |
| `δ` | Decryption-failure probability bound | `TODO` — must satisfy both correctness (`δ ≤ 2^{-λ_corr}`) and adaptive-failure (`δ ≤ 2^{-λ_sec}`) constraints, per [D'Anvers et al. 2019](https://eprint.iacr.org/2018/1089) |
| `encoder` | Message encoder `E : {0,1}^λ → Z_q^k` | `TODO` — decision point: bit-by-bit / Reed-Muller / Barnes-Wall (`BW_{2^k}`) — see [Encoding](https://systemslibrarian.github.io/structureless-labs/#/encoding) |
| `H` | Hash function (FO transform, KDF) | `TODO` — likely SHAKE-256, but unset until a serialization decision |

**Honesty rule:** any future `SPEC-NNN` that fills in these values **must** pass the
[`F-0001`](../../sl-attacklab/findings/F-0001.md) falsifiability test — i.e. it must state a
falsifiable claim about `λ` with an attack outcome that would disprove it, plus a
lattice-estimator output (from `sl-bench/sl-kem/SPEC-NNN/`) as evidence at grade C or
better.

---

## Algorithm shape

### `KeyGen() → (pk, sk)`

1. Sample `A ← uniform Z_q^{m × n}` (or a seed for `A` plus a deterministic expander).
2. Sample `s ← χ^n`.
3. Sample `e ← χ^m`.
4. Compute `b = A·s + e (mod q)`.
5. Return `pk = (seed_A or A, b)`, `sk = (s, pk_hash, ...)`.

### `Encaps(pk) → (c, K)` — IND-CCA2 via Fujisaki-Okamoto

1. Sample `μ ← uniform {0,1}^λ` (the message seed).
2. Derive `(r, e', e'')  ← H(μ ‖ H(pk))` — the FO derandomization.
3. Compute `c_1 = A^T · r + e' (mod q)`.
4. Compute `c_2 = b^T · r + e'' + E(μ) (mod q)`, where `E` is the message encoder.
5. Compute `K = KDF(μ, H(c_1 ‖ c_2))`.
6. Return `(c = (c_1, c_2), K)`.

### `Decaps(sk, c) → K` — implicit rejection

1. Let `c = (c_1, c_2)`. Compute `v = c_2 − s^T · c_1 (mod q)`.
2. Recover `μ' = D(v)` via the encoder's decoder.
3. Re-derive `(r', e_1', e_2')  ← H(μ' ‖ pk_hash)`; compute `c' = (A^T r' + e_1', b^T r' + e_2' + E(μ'))`.
4. If `c' = c` (constant-time comparison): return `K = KDF(μ', H(c_1 ‖ c_2))`.
5. Else: return `K = KDF(reject_key, H(c_1 ‖ c_2))` — implicit rejection per FO-CCA2.

---

## What SPEC-000 fixes (and what fossilizes if changed)

Fixed by SPEC-000 (any change requires a fossil of SPEC-000):

1. **Family:** unstructured LWE (no algebraic ring).
2. **CCA-resistance approach:** FO transform with implicit rejection.
3. **The shape of `KeyGen` / `Encaps` / `Decaps`** as written above.

Not fixed by SPEC-000 (each item below is a separate flight-recorder decision before SPEC-001):

- The parameter table values (`n, m, q, χ, η, λ, δ`).
- The encoder `E` / decoder `D` choice.
- The hash function `H` and the KDF construction.
- The serialization (byte order, length encoding, pk/sk/ct headers).
- Whether `A` is transmitted directly or as a seed plus expander.
- Constant-time considerations at the API boundary (per the Engineer persona's mandate).

Each open decision should be filed with its own `D-NNNN` in `sl-kem/decisions/` before
SPEC-001 lands.

---

## Attack surface (for `sl-attacklab/targets/T-0001`)

Because SPEC-000 commits no numbers, **no cryptanalytic attack can be attempted against
it.** The attackable surface against SPEC-000 is purely structural:

- Is the algorithmic SHAPE internally consistent? (Does `Decaps` recover `μ` when run
  honestly against `KeyGen` + `Encaps`?)
- Are the open decision points enumerated honestly, or does the SHAPE silently presuppose
  a choice?
- Does the FO step (re-derivation + constant-time compare + implicit rejection) match the
  reference construction precisely enough that an implementer cannot accidentally produce
  a CCA-insecure variant?

A spec-readability finding (`F-NNNN` against `T-0001`) along these lines would be a
legitimate contribution. A cryptanalytic finding against SPEC-000 is **not possible** —
file it against SPEC-NNN when parameters land.

---

## Relationship to F-0001

[`F-0001`](../../sl-attacklab/findings/F-0001.md) flagged that the prior `D-0001` "40-year
archival horizon" claim was unfalsifiable in its current state. SPEC-000 is the structural
half of the response: a draft that *can* be sharpened toward a falsifiable claim by future
parameter decisions, without keeping the unfalsifiable horizon language standing in the
meantime. See [`D-0002`](../decisions/D-0002.md) for the decision that publishes SPEC-000
and reclassifies the horizon language as a research question pending those decisions.

---

*Soli Deo Gloria — 1 Corinthians 10:31*
