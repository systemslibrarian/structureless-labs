# Interpretation — sl-bench / sl-kem / SPEC-000

**No measurements ran.**

[`sl-kem/spec/SPEC-000.md`](../../../sl-kem/spec/SPEC-000.md) is a **structural draft**.
It commits the algorithm SHAPE but commits no values for `(n, m, q, χ, η, encoder, H,
serialization)`. The harness therefore cannot run a keygen/encaps/decaps loop, and the
`results.json` in this directory honestly contains `"TODO"` for every measurement
rather than fabricated numbers.

Per the root [`sl-bench/README.md`](../../README.md): *"Numbers without interpretation
are not a result."* The corollary holds here: *numbers without parameters are not a
result.* SPEC-000 has neither; this directory documents that fact.

## What `results.json` does say

- `iters_run: 0` — the harness ran but performed zero KEM operations.
- `status: "TODO — ..."` — the explicit reason the run produced no numbers.
- `honesty_note: "..."` — the anti-fabrication rule's application restated in the data.

These are values the harness *can* honestly emit, because they describe the state of the
spec and the harness itself — not properties of a parameter set that does not exist.

## When this gets re-run

When a parameterized `SPEC-NNN` lands and `sl-kem/ref/` (the reference implementation) is
wired into `harness.mjs`, the harness will run a real loop against `SPEC-NNN`'s
parameter set and emit:

- Wall-clock timings (`keygen_ms`, `encaps_ms`, `decaps_ms_honest`, `decaps_ms_implicit_reject`)
  at grade C — internal reproducible experiment.
- Wire sizes (`pk_bytes`, `sk_bytes`, `ct_bytes`) at grade A — direct measurement.
- A security estimate (`security_estimate_bits`) at grade C — derived from the lattice
  estimator's output for those parameters, not from the harness itself.
- A decryption-failure exponent (`decryption_failure_log2`) at grade C — derived from
  the convolution-based bound.

At that point, this `INTERPRETATION.md` will be replaced with one that explains what the
numbers mean, what they do *not* mean, and which flight-recorder decision they support
or challenge.

## Forward question

Per the Engineer persona's checklist
([`sl-researchkit/personas/ENGINEER.md`](../../../sl-researchkit/personas/ENGINEER.md)),
secret-dependent branches and memory access must be identified. The first real
`results.json` (for SPEC-NNN) should grow a `constant_time_audit` field naming the
audit tool (or "manual inspection") and the result — `pass | warning | fail`. Not yet
applicable to SPEC-000 because there is no implementation.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
