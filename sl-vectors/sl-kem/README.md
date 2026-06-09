# sl-vectors / sl-kem

**Reproducible test vectors for sl-kem, versioned by spec.**

The layout under this directory mirrors `sl-kem/spec/`:

```
sl-vectors/sl-kem/
├── README.md                   (this file)
├── SPEC-000/                   (structural draft — see sl-kem/spec/SPEC-000.md)
│   └── README.md               (explains why this directory contains no vectors)
├── SPEC-NNN/                   (future, when a parameterized spec lands)
│   ├── README.md               (vector index, links to the bound spec)
│   ├── positive/
│   │   ├── SEED-000.json       (input: seed; output: pk, sk, c, K)
│   │   ├── SEED-001.json
│   │   └── ...
│   └── negative/
│       ├── TAMPER-CT-000.json  (input: tampered ciphertext; expected: implicit reject)
│       ├── WRONG-KEY-000.json  (input: ct under different pk; expected: implicit reject)
│       ├── MALFORMED-000.json  (input: malformed bytes; expected: reject + error)
│       └── ...
```

## Generation rule

Every vector is reproducible from a documented generator plus a seed (per
[`sl-vectors/README.md`](../README.md)). The generator for a given `SPEC-NNN` MUST be
runnable from a clean checkout and MUST produce byte-identical output for a fixed seed —
across machines, across years, across reasonable Node versions.

The generator for SPEC-000 does **not exist** because SPEC-000 has no parameters; a
generator for SPEC-NNN lands when SPEC-NNN binds its parameters.

## Negative vectors are first-class

The Engineer persona's checklist
([`sl-researchkit/personas/ENGINEER.md`](../../sl-researchkit/personas/ENGINEER.md))
requires constant-time considerations and misuse-resistance. The negative-vector set
encodes both:

- **Implicit-rejection coverage:** every category of malformed input that the FO
  transform's implicit rejection should silently absorb must have at least one negative
  vector that exercises it. If a negative vector does not exist for category X, an
  implementer can ship a CCA-breaking shortcut for X without anyone noticing.
- **Constant-time coverage:** negative vectors are checked for *output equality* with
  the implicit-rejection key path, not for an *error code* — the implementation must
  not branch its observable behavior on which class of malformation occurred.

## Schema

A vector-set schema (`vector-schema.json`) lands with the first `SPEC-NNN` to fix the
positive/negative vector file formats. The shape will be:

```json
{
  "spec": "SPEC-001",
  "seed_hex": "...",
  "expected": {
    "pk_hex": "...",
    "sk_hex": "...",
    "ct_hex": "...",
    "K_hex":  "..."
  }
}
```

…and the negative form adds `"expected_outcome": "implicit-reject"` (or similar) plus
the input being tested.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
