# slff Format Overview (draft)

```
+-----------------------------------------------------------+
| Magic + format version                                    |
| Suite descriptor: { classical_alg_id, pq_alg_id, params } |
| Crypto-agility block: versioned parameter set + grades    |
| Provenance (optional): security estimate @ encryption time|
| Authenticated header (AAD) -- covers everything above     |
| Encapsulated keys (hybrid: classical || PQ)               |
| AEAD-encrypted payload                                    |
| Auth tag                                                  |
+-----------------------------------------------------------+
```

Rules:
- Unknown **critical** fields → reject. Unknown non-critical fields → ignore + record.
- Downgrade protection: suite descriptor is inside the authenticated header.
- Migration: re-encryption produces a new container that references the old suite version.

Three-depth explainers for each field live alongside this file as the format matures.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
