# sl-vectors

**Reproducible, public test vectors for the Structureless Labs ecosystem.**

Correctness claims in any repo must point here. Vectors are the contract between the
spec and every implementation.

## Layout
```
sl-kem/      KAT-style vectors for the experimental KEM.
slff/        Container round-trip and rejection vectors (incl. downgrade + bad-tag cases).
```

## Rules
- Every vector is reproducible from a documented generator + seed.
- Negative vectors matter: include cases that MUST fail (tampered headers, unknown
  critical fields, downgrade attempts).
- Versioned with the spec. A vector set names the spec version it validates.

## Relationship to upstream
Methodologically aligned with the wider PostQuantum.* vector work and ongoing ML-KEM KAT
discussions — negative/edge vectors are a first-class citizen here, not an afterthought.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
