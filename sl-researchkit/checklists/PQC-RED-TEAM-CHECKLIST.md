# PQC Red Team Checklist

A general-purpose gate for any post-quantum cryptography work in the Structureless Labs
ecosystem (and reusable for the wider PostQuantum.* projects). Run it as a merge gate.

A **No** below the line is a BLOCK until justified in writing.

## Primitive discipline
- [ ] Are you inventing a primitive? *(If yes — stop. Justify explicitly and flag for the Cryptographer.)*
- [ ] Are you using reviewed, standardized algorithms wherever possible?
- [ ] Is the construction hybrid (classical + PQ) where production exposure exists?

## Correctness & reproducibility
- [ ] Do you have public test vectors? (sl-vectors)
- [ ] Are results reproducible from a clean checkout?
- [ ] Are parameters derived from a documented methodology, not chosen ad hoc?

## Protocol hygiene
- [ ] Do you authenticate headers / associated data?
- [ ] Do you have downgrade protection?
- [ ] Do you reject unknown **critical** fields?
- [ ] Are nonces/IVs guaranteed unique under the construction's contract?

## Honesty
- [ ] Do you explain the failure modes openly?
- [ ] Have you stated what you are *not* claiming?
- [ ] Is there an "attack me" path for the public?

## Longevity
- [ ] Is crypto-agility designed in (algorithm IDs, versioned parameters)?
- [ ] Can artifacts be migrated / re-encrypted later?
- [ ] Will the *why* survive (decision records)?

---
*Soli Deo Gloria — 1 Corinthians 10:31*
