# Fossil: Org identity, pre-Option-A framing

Status: SUPERSEDED by sl-researchkit/decisions/D-0001.md (2026-06-09). Kept forever.

This is a record of how Structureless Labs framed its own identity *before* the Option A
decision. Per the lab's "nothing is deleted" principle, the prior framing is preserved here
so future readers can see what changed and why.

## What "structureless" meant before Option A

The word was undefined in the root README's prose. Its only noun-pairing in the
ecosystem block was:

```
sl-kem          Experimental structureless-lattice KEM
```

That single phrase did the framing work, and it pointed at the lattice-construction
meaning of "structure" — i.e. *structureless lattice* in the sense of less algebraic
structure for attacks to exploit. As a result, the org's identity could be read by a
casual visitor as "a lab that built a new (structureless) lattice KEM" — which is the
*opposite* of the bet the lab itself states:

> The highest-probability contribution from this lab is not a new hard problem. It is
> better analysis, methodology, integration, and tooling.

## Why this was fossilized rather than rewritten silently

If the framing had simply been replaced with no record, a future reader could not
reconstruct:

- That the original name carried a primitive-forward reading.
- That the primitive-forward reading was identified as a credibility risk against the
  stated bet.
- That the change was a deliberate, reviewed decision (see sl-researchkit/decisions/D-0001.md)
  rather than a quiet retraction.

The lab's first principle of permanence — *nothing is deleted; superseded designs become
fossils* — would have been violated by editing this away. So it lives here.

## The new framing (post-Option A)

See the root README section **"Why 'Structureless'?"** and sl-researchkit/decisions/D-0001.md.
Summary: "structureless" names the **research method** (open lifecycle, no hidden
assumptions, nothing deleted, every claim falsifiable). The lattice-structure echo applies
to sl-kem as one design axis among many. The method and the explainers are the identity;
the KEM is the method's first test subject.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
