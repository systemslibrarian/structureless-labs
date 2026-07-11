# Teacher Review — sl-atlas: Decryption Failure Probability (re-submission)

Date:     2026-07-11
Reviewer: Teacher persona
Scope:    Re-submission of the `decryption-failure` concept
          (`sl-atlas/content/decryption-failure.json`), BLOCKED on
          2026-06-09 for a missing Simple view. This review evaluates the
          newly-authored Simple view against the standard set in
          `TEACHER-2026-06-09-decryption-failure.md`, and the concept's new
          self-check questions (a feature added atlas-wide on this date).

The original review named three things the Simple view had to do. Each is
checked against the submitted text, not against intent.

## Checklist (from the 2026-06-09 BLOCK, plus the standard gates)

- [x] **Explains the decoder getting it wrong though everyone followed the
      rules.** The opening paragraph carries it: "the receiver can decode
      the *wrong message* even though both parties followed the protocol
      perfectly. No attacker, no bug, no network glitch." The stamped-tiles
      metaphor is reused from Encoding rather than invented fresh — good;
      the reader who followed the path arrives with that picture already
      loaded.
- [x] **Explains why the probability must be astronomically small, for both
      correctness AND security.** The two-reasons structure is explicit,
      and the second reason — "failures leak... an attacker who can feed a
      scheme carefully chosen inputs and simply watch *when* decryption
      fails can, failure by failure, reconstruct the secret key" — is the
      D'Anvers et al. point surviving simplification intact, which the
      original review demanded ("'failures are bad' is necessary but not
      sufficient").
- [x] **"Not tolerate errors but make them functionally impossible."** The
      Simple view says it almost verbatim: designers "do not aim for
      'rare'... they aim for *functionally impossible*" and adds the honest
      epistemics — the probability is *calculated*, not tested for, because
      an event that rare cannot be observed.
- [x] **The Attacker persona's carried note is respected.** D-0003 carried
      forward: the Simple view must not anchor a specific exponent the
      Researcher view does not bind. The submitted Simple view says "a
      number with dozens of zeros after the decimal point" — magnitude
      without a pinned exponent. The Developer view retains its
      `≤ 2⁻¹⁶⁰`-with-"or tighter" phrasing unchanged from the reviewed
      draft. Resolved as specified.
- [x] **Developer and Researcher views** unchanged from the previously
      reviewed draft (which passed on content and failed only on the
      missing depth). Verified against the preserved text.
- [x] **Self-checks** (new schema feature): three questions. Q1 re-tests
      the honest-execution point; Q2 re-tests the two-reasons point and
      names D'Anvers; Q3 connects the knobs to Parameter choices. The
      answers teach rather than grade. PASS on the same standard as prose.
- [x] A newcomer could find footing from the Simple view alone.

## Verdict

`VERDICT: PASS`

Per D-0003's resolution path: the concept enters `sl-atlas/src/concepts.js`
(now generated from content/), the BLOCKED stub leaves the sidebar, and a
superseding decision is recorded at `sl-researchkit/decisions/D-0004.md`.
The original BLOCK record (D-0003, and the 2026-06-09 review) is preserved
unchanged — the gate's first BLOCK and its resolution are both part of the
record now, which is the whole point of having a record.

Flight-recorder one-liner:
*Teacher PASS on the decryption-failure re-submission — the missing Simple
view was authored to the 2026-06-09 standard, the Attacker's
no-anchored-exponent note was respected, and the lab's first BLOCK is now
also its first documented resolution.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
