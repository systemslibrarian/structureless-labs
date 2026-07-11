/* sl-atlas BLOCKED drafts — concepts authored but held by the Teacher gate.
   Mirrors the structure of concepts.js but for drafts that are NOT publishable.
   CI (`scripts/check-atlas-parity.mjs`) verifies parity with the
   `sl-atlas/content/*.json` files whose `status` begins with "BLOCKED".

   Currently EMPTY: the only BLOCK on record (decryption-failure, 2026-06-09,
   D-0003) was resolved on 2026-07-11 by authoring the missing Simple view —
   see sl-atlas/reviews/TEACHER-2026-07-11-decryption-failure.md (PASS) and
   sl-researchkit/decisions/D-0004.md. The gate stays visible in the UI even
   when empty, because "nothing is currently blocked" is itself information. */

window.SL_ATLAS_BLOCKED = [];
