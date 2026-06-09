# slff — Structureless Labs File Format

**A hybrid encrypted file container for long-term preservation, and the integration
target for sl-kem.**

slff exists to answer a practical question: *can we encrypt a file today and still be
able to safely open — or safely migrate — it in 40 years?*

## Design goals
- **Hybrid encryption** (classical + PQ) so a break in one family is not fatal.
- **Crypto-agility**: algorithm IDs and versioned parameters baked into the header.
- **Authenticated headers**: associated data is authenticated; unknown *critical* fields
  are rejected.
- **Migration-friendly**: re-encryption and parameter migration are first-class.
- **Self-describing provenance** (optional): records the parameter version and security
  estimate at encryption time, so future readers know exactly how a file was protected.

## Relationship to the ecosystem
- Uses reviewed primitives by default; can be configured to test **sl-kem** experimentally.
- Conceptually adjacent to the `.pqfe` CBOR hybrid container work — slff is the
  research-format sibling where format ideas get attacked before they harden.

## Status
Spec-first. See `spec/`. Experimental.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
