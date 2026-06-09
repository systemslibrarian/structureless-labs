# sl-vectors / sl-kem / SPEC-000

**Status:** EMPTY (intentionally).

[`sl-kem/spec/SPEC-000.md`](../../../sl-kem/spec/SPEC-000.md) is a **structural draft**
with no parameter values. KAT-style vectors cannot be generated against it because the
generator's outputs depend on `(n, m, q, χ, η, encoder, H, serialization)` — every one
of which is `TODO` in SPEC-000.

Per the lab's anti-fabrication rule, the directory contains:

- this `README.md` (the absence-explanation)
- and nothing else.

A future `sl-vectors/sl-kem/SPEC-001/` (or whichever spec first binds parameters) will
land alongside the spec that fixes them, with the `positive/` and `negative/` layout
described in [`../README.md`](../README.md).

### Why this exists at all

A skeptical reader navigating the tree might otherwise reasonably expect that "no
SPEC-000 vector directory" means the lab forgot the vectors. The presence of this
empty directory with this explanation removes that ambiguity and makes the absence a
documented choice rather than an oversight.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
