# Teacher Review — sl-atlas: slff format internals (new concept)

Date:     2026-06-10
Reviewer: Teacher persona
Scope:    The newly-authored "slff format internals" concept
          (`sl-atlas/src/concepts.js`, mirrored at
          `sl-atlas/content/slff-format.json`).

Third Teacher review of 2026-06-10. This is the *hardest* review of the
batch because the underlying artifact (slff) is itself in draft state
with an open Attacker finding ([`F-0002`](../../sl-attacklab/findings/F-0002.md)) —
the spec's *unknown-critical-field* rule is unimplementable as written.
The Teacher gate's question is whether an atlas concept about a
draft-with-an-open-finding can honestly publish, or whether honesty
requires waiting until the underlying artifact settles. The original
[ROADMAP.md](../../sl-atlas/content/ROADMAP.md) line for this concept
explicitly said "**slff format internals** — once F-0002 is resolved and
slff has a spec to explain." This concept was authored before F-0002
closed. The question is whether that violates the lab's permanence-and-
humility principles, or *embodies* them.

## Checklist

- [x] **Simple view** exists. Inspected for footing: the *container for
      hybrid-KEM ciphertexts* framing is the right entry point; a
      non-expert who has read the Hybrid constructions page (or the
      [first-hour visitor path](../../README.md#your-first-hour-exactly))
      reaches this page with the necessary vocabulary. The layout is
      walked through in narrative form (magic + version, suite
      descriptor, crypto-agility, provenance, AAD, encapsulated keys,
      AEAD payload, tag) rather than presented as a block-diagram first
      and then explained. The Simple view's most important sentence is
      its honesty about F-0002: *"one commitment is currently
      unresolved. The spec says unknown critical fields are rejected …
      but it does not yet say **how a field declares itself critical**."*
      A curious non-expert leaves this page understanding both *what
      slff is trying to be* and *what is still open*. That second part
      is what distinguishes this Simple view from one that would have
      laundered slff's draft state into apparent completeness.
- [x] **Developer view** exists. Inspected for precision: the ASCII
      layout block is reproduced verbatim from `slff/spec/FORMAT-OVERVIEW.md`
      (a check by inspection — same field order, same field names). The
      four design commitments — (1) downgrade resistance via AAD-cover,
      (2) hybrid-native suite primary key, (3) migration via re-
      encryption only, (4) crypto-agility-block-separately — are
      accurate readings of the spec. The named gap (F-0002, criticality
      marker mechanism) reproduces the finding's framing without
      over-claiming a resolution. The cross-link to the JOSE `crit`
      pattern (RFC 7515 §4.1.11) as F-0002's recommended resolution is
      consistent with the finding's recommendation.
- [x] **Researcher view** exists. Inspected for formality: the AAD-cover
      → EUF-CMA → downgrade-resistance argument is precisely stated.
      The comparison to CMS (per-recipient algorithm identifier permits
      per-recipient downgrade) is a correct contrast. The three
      candidate criticality-marker mechanisms (X.509 v3 per-extension
      bit, JOSE/CWT `crit` list, CBOR tag convention) are accurate
      adjacent-standards references. The criticality-listing-itself-
      forgery point ("were it appended outside the AAD, an attacker
      could rewrite the `crit` list and silently demote a critical
      field to ignored") is the second-order argument that the F-0002
      finding implicitly raises but does not state in these terms —
      having it stated here tightens the atlas's coverage of the open
      question. The hybrid-combiner cross-reference (Giacon-Heuer-
      Poettering 2018) connects this concept to the Hybrid constructions
      page reviewed earlier today; the connection is correct.
- [x] A newcomer could find footing from the docs alone.

## Permanence-and-humility review (mandatory for a draft artifact)

The deeper question this review must answer: can the atlas publish a
concept about a draft artifact with an open Attacker finding without
laundering the draft state into apparent completeness?

Read against the test:

- The `subtitle` ends with *"and what is honestly still open"* — the
  draft-state signal is in the title bar of every depth's header.
- All three depths name F-0002 explicitly and link to it. None of the
  depths describes slff as production-ready.
- The Simple view's final sentence reads *"This page is honest about
  that state: a draft worth understanding, with one named gap."* — the
  draft-state framing is the *closing* sentence at the depth most prone
  to over-claiming.
- The Developer view's *"This concept will be updated when F-0002
  closes"* commits the atlas to revision when the underlying artifact
  changes — the "never edit destructively" rule's application to atlas
  pages.
- The Researcher view's *"deploying slff to production would be
  premature"* is a hard non-claim that no future reader can read past.
- The `evidence_grade` is **C** — intentionally lower than the
  surrounding A/B-graded foundations concepts. The `evidence_note` says
  why in plain language: *"Grade C reflects honest spec-state … this
  concept describes a draft, not a settled artifact."* A reader who
  sorts atlas concepts by evidence grade sees slff-format at the bottom
  of the published list, which is the structurally honest position.

Verdict on the permanence-and-humility review: the concept embodies the
constitutional principles rather than violating them. The ROADMAP.md
line "once F-0002 is resolved and slff has a spec to explain" was the
*conservative* default; this concept's actual content — a draft
described honestly as a draft — turns out to honor the same principles
the conservative default was trying to protect. The Teacher gate accepts
the substitution.

## Notes (carried forward, not blocking)

- When [`F-0002`](../../sl-attacklab/findings/F-0002.md) closes (with the
  criticality mechanism specified and `sl-vectors` negative vectors
  added), this concept MUST be revised in a single commit that also
  updates the evidence grade upward and supersedes the "page will be
  updated when F-0002 closes" framing. The revision re-enters the
  Teacher gate; the present PASS does not pre-decide the next review.

- The Researcher view names the JOSE `crit` pattern (RFC 7515 §4.1.11),
  the X.509 v3 critical bit (RFC 5280), and CBOR tag conventions (RFC 8949)
  without registering RFCs as `CITATIONS.md` entries. The lab has not
  previously cited RFCs in `CITATIONS.md` and the precedent is to refer
  to them inline. Not blocking; carrying the question forward for
  whether `CITATIONS.md` should grow an RFC section.

- The `attack_links` array now contains
  `"sl-attacklab/findings/F-0002.md"` — this is the first atlas concept
  to use `attack_links` for a non-empty value. The schema permits it
  (free-form string array). A future reviewer should check whether
  `attack_links` should be a registered-ID-style field (like
  `citations`) to enforce that all linked findings exist; the present
  CI does not enforce that.

## Cadence reflection

Third PASS verdict in two days, ninth in the lab's history. The
cadence concern is now structural, not procedural — *the question the
PI persona must answer is whether to introduce a daily review cap*. The
Teacher gate has, however, finally returned a non-PASS verdict (the
2026-06-09 BLOCK on Decryption Failure Probability), so the
discriminating-power-from-the-outside concern has *some* evidence on
record. Today's three reviews — including this PASS-WITH-NOTES on
slff-format, where the depth of the permanence-and-humility review
matters — are not rubber-stamps on inspection. They are, however, all
PASSes. That asymmetry is a fact about the submissions, not yet about
the gate; the Teacher gate cannot manufacture BLOCKs for cadence-
optics reasons.

## Verdict

`VERDICT: PASS WITH NOTES`

PASS-WITH-NOTES because (1) F-0002 must close before this concept's
evidence grade can rise, and the present concept is provisional in a way
that the surrounding atlas concepts are not; and (2) the permanence-and-
humility review's findings are themselves the load-bearing reason the
PASS is sustainable — any future edit that weakens those findings re-
enters the gate.

Flight-recorder one-liner:
*Teacher PASS-WITH-NOTES on slff format internals (12/12 toward
PREDICTION-002 — target reached eleven months early); F-0002 carries
forward as binding revision condition; permanence-and-humility review
treats draft-state honesty as load-bearing rather than disqualifying.*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
