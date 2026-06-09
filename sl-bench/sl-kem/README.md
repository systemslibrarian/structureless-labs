# sl-bench / sl-kem

**Benchmarks for sl-kem, versioned by spec.**

The layout under this directory mirrors `sl-kem/spec/`:

```
sl-bench/sl-kem/
├── README.md                   (this file)
├── harness.mjs                 (zero-dependency Node runner; emits results.json)
├── SPEC-000/                   (structural draft — see sl-kem/spec/SPEC-000.md)
│   ├── results.json            (status: TODO — no parameter set)
│   └── INTERPRETATION.md       (why there are no measurements)
└── SPEC-NNN/                   (future, when a parameterized spec lands)
    ├── results.json
    └── INTERPRETATION.md
```

## What we measure (when there is something to measure)

For each `SPEC-NNN` with a bound parameter set:

| Metric | Unit | Notes |
|---|---|---|
| `keygen_ms` | milliseconds per call, median over `iters` | wall-clock; constant-time hazards reported separately |
| `encaps_ms` | milliseconds per call, median over `iters` | |
| `decaps_ms` | milliseconds per call, median over `iters` | both honest-input and implicit-reject paths timed |
| `pk_bytes` | bytes | wire-format (post-serialization decision) |
| `sk_bytes` | bytes | wire-format |
| `ct_bytes` | bytes | wire-format |
| `security_estimate_bits` | bits | core-SVP from lychee-estimator or equivalent; grade B–C |
| `decryption_failure_log2` | exponent | log₂(δ) from convolution-based bound; grade C |

Numbers without interpretation are not a result (per the root
[`sl-bench/README.md`](../README.md)). Every `results.json` ships with an
`INTERPRETATION.md` in the same directory that names what the numbers mean, what they do
*not* mean, and what they would have to look like to change a flight-recorder decision.

## How to run

```bash
node sl-bench/sl-kem/harness.mjs --spec SPEC-000 --iters 1000
# → writes sl-bench/sl-kem/SPEC-000/results.json
```

Running against SPEC-000 emits the honest `TODO` placeholders (no parameter set means no
real measurement). Running against a future `SPEC-NNN` will execute the real
keygen/encaps/decaps loop against the bound parameter set and emit real numbers.

## Honesty notes carried forward

- The harness has no dependencies. When SPEC-NNN lands, the reference implementation
  used by the harness lives at `sl-kem/ref/` (per a future engineering decision); the
  benchmark must NOT add a transitive dependency on an external library, because such a
  dependency would silently expand the trusted compute base and make reproducibility
  brittle across years.
- The security-estimate column is graded B–C, not A, because the lattice estimator
  itself evolves; a `results.json` for SPEC-NNN is valid until the estimator updates,
  at which point the estimate is re-run and (per "nothing is deleted") the prior
  results stay on the record as a fossil.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
