# Structureless Labs

**Open research into conservative post-quantum cryptography, cryptanalysis, and long-term digital preservation.**

> We build cryptography research in the open, where every claim is testable, every assumption is documented, and every design is invited to be broken.

[![Pages: sl-atlas](https://img.shields.io/badge/sl--atlas-live-f5b14a?style=flat-square&logo=github)](https://systemslibrarian.github.io/structureless-labs/)
[![Method: sl-researchkit](https://img.shields.io/badge/method-sl--researchkit-2563eb?style=flat-square)](sl-researchkit/)
[![Status surface: STATUS.md](https://img.shields.io/badge/status-generated-16a34a?style=flat-square)](STATUS.md)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-6b7280?style=flat-square)](LICENSE)
[![sl-kem: experimental](https://img.shields.io/badge/sl--kem-experimental-d97706?style=flat-square)](sl-kem/)

---

## Why "Structureless"?

"Structureless" names the **research method** before anything else: an open lifecycle with no hidden assumptions, where nothing is deleted, every claim is falsifiable, every design is invited to be broken, and every decision is recorded. The lab is *structureless* in the epistemic sense — no buried priors, no quiet retractions, no convenient amnesia.

There is a secondary, technical echo: in the lattice-cryptography literature, "structure" refers to the algebraic structure (rings, modules) that some attacks specifically exploit. The experimental [`sl-kem`](sl-kem/) explores more conservative, less-structured lattice assumptions on that axis. That work is a *test subject for the method* — not the reason the lab is named what it is.

**Ordering, plainly:** the method ([`sl-researchkit`](sl-researchkit/)) and the explainers ([`sl-atlas`](sl-atlas/)) are the identity and the value. The KEM is the method's first customer.

---

## Lineage and related prior work

This lab did not appear from nowhere. Its method-first thesis grew out of hands-on study of real structureless-lattice designs in the published literature — most directly through [**crypto-lab-scloud-vault**](https://github.com/systemslibrarian/crypto-lab-scloud-vault) ([live demo](https://systemslibrarian.github.io/crypto-lab-scloud-vault/)), a separate prior project that explains and faithfully reimplements **S-Cloud+**, a post-quantum KEM published by *Wang et al.* (ePrint [2024/1306](https://eprint.iacr.org/2024/1306)). S-Cloud+ — unstructured LWE with ternary secrets, Barnes-Wall (BW₃₂) lattice coding, and a Fujisaki-Okamoto transform — is **their** design; scloud-vault is a study of it, not the owner's primitive.

The relationship to Structureless Labs is **theme and demonstrated skill only**. scloud-vault is the conceptual on-ramp for what "structureless" means in the lattice-cryptography literature (security without algebraic ring structure), and the verifiable proof that the lab's owner can read, reimplement, and explain a frontier paper in that family. The lab's own [`sl-kem`](sl-kem/) is a separate, experimental attempt in the same conservative, less-structured family — built and attacked under [`sl-researchkit`](sl-researchkit/)'s method, with none of S-Cloud+'s peer-review carried forward.

> **Studying S-Cloud+ does not validate `sl-kem`. The two share a research family, not a security guarantee.** S-Cloud+ is attributed entirely to Wang et al.; scloud-vault is an explainer of their work; `sl-kem` borrows neither their construction nor their credibility. For production, the recommendation remains ML-KEM (NIST FIPS 203).

---

## Try the demo first

**→ [systemslibrarian.github.io/structureless-labs](https://systemslibrarian.github.io/structureless-labs/)**

The signature feature is live: `sl-atlas`, an interactive learning site that
renders every post-quantum cryptography concept at three synchronized depths —
**Simple**, **Developer**, **Researcher**. The Learning With Errors page ships
with a configurable LWE equation. Pick **Toy / Small / Medium** parameters,
toggle the noise vector, then press **Try to solve** to watch modular Gaussian
elimination *literally execute in your browser*: with noise off it recovers the
secret exactly; with noise on it returns the wrong vector and most rows fail
verification. The attack collapsing in real time is the whole point of lattice
cryptography in one button.

If you read nothing else in this repo, click that link. The atlas *is* the bet
this lab is making.

---

## How a concept is born (and how the Teacher gate prevents shortcuts)

The atlas's "three depths" are not three reformattings of the same paragraph.
They are three independent obligations, and a Teacher review can BLOCK
publication if any one is weak. The shape of the workflow:

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │  Author drafts ONE concept                                          │
  │  ─────────────────────────                                          │
  │   Simple view ───────►  for a curious non-expert (no jargon)        │
  │   Developer view ────►  for a working programmer (code + intuition) │
  │   Researcher view ───►  precise, formal, citation-grounded          │
  │   evidence_grade  ───►  A / B / C / D, with a one-line note         │
  │   citations       ───►  registered IDs that resolve to CITATIONS.md │
  └────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  CI gates (mechanical)                                              │
  │   • validate-atlas       schema-conforming JSON                     │
  │   • check-atlas-parity   concepts.js ↔ content/*.json match         │
  │   • check-citations      every citation ID resolves                 │
  │   • check-no-fabrication structural-draft specs stay number-free    │
  └────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  Six-persona review (human / AI)                                    │
  │   Cryptographer · Attacker · Engineer · Archivist · Teacher · PI    │
  └────────────────────────────────┬────────────────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
       ╔══════════════════╗                  ╔══════════════════╗
       ║  PASS / PASS+    ║                  ║      BLOCK       ║
       ║  WITH NOTES      ║                  ║ (Teacher gate)   ║
       ╚════════╤═════════╝                  ╚════════╤═════════╝
                │                                     │
                ▼                                     ▼
   Published in sl-atlas/src/concepts.js   Held in sl-atlas/content/<id>.json
   (the live site renders it)              (live site shows a "BLOCKED"
                                            stub linking to the Teacher review
                                            and the recorded decision)
```

The BLOCK path is not theoretical. The first one is on the record at
[`sl-researchkit/decisions/D-0003.md`](sl-researchkit/decisions/D-0003.md) —
the `decryption-failure` concept lacked a publishable Simple view and was
held in the sidebar's "Teacher gate" section for 32 days. It was resolved on
2026-07-11 through exactly the path D-0003 specified: the Simple view was
authored to the review's standard, a fresh review PASSed
([`TEACHER-2026-07-11-decryption-failure.md`](sl-atlas/reviews/TEACHER-2026-07-11-decryption-failure.md)),
and a superseding decision was recorded
([`D-0004`](sl-researchkit/decisions/D-0004.md)) — the BLOCK record itself
preserved unchanged. The gate has teeth, and now its full lifecycle
(block → hold → resolve) is on the record.

---

## Your first hour, exactly

A skeptical visitor's six-step tour. Each step is a single artifact and a
single action — designed so that after one hour you have personally
inspected the method, not just read prose about it.

1. **Click the live demo** → [sl-atlas](https://systemslibrarian.github.io/structureless-labs/).
   Press `1`/`2`/`3` to see the three depths; press `c` for compare mode;
   on the LWE page, click *Noise off* and watch the security collapse.
2. **Read one decision** → [`sl-researchkit/decisions/D-0001.md`](sl-researchkit/decisions/D-0001.md).
   The "Why structureless?" pivot; observe that two PASS-WITH-NOTES verdicts
   were *binding* and resolved in the same commit set.
3. **Read one filed finding** → [`sl-attacklab/findings/F-0001.md`](sl-attacklab/findings/F-0001.md).
   A break-it-first attempt against the lab's own `sl-kem`. Note the
   "RESOLVED-PARTIALLY" status — added after the spec it targets landed.
4. **Read the first BLOCK — and its resolution** →
   [`sl-researchkit/decisions/D-0003.md`](sl-researchkit/decisions/D-0003.md),
   then [`D-0004.md`](sl-researchkit/decisions/D-0004.md). The Teacher persona
   prevented publication of a concept lacking its Simple view, held it for 32
   days, and published it only after the named deficiency was fixed and
   re-reviewed. The gate has teeth; the full lifecycle is on the record.
5. **Run the harness** →
   ```bash
   node sl-bench/sl-kem/harness.mjs --spec SPEC-000 --iters 1000
   ```
   It runs, finds no parameters, emits `"TODO"` for every measurement. That's
   the anti-fabrication rule in action: when there's nothing to measure, the
   harness says so rather than making up numbers.
6. **Critique the target** → [`sl-attacklab/targets/T-0001.md`](sl-attacklab/targets/T-0001.md).
   It freezes SPEC-000 as a structural target. The four legitimate attack
   types are listed; [F-0003](sl-attacklab/findings/F-0003.md) is the first
   one filed against it. Read it and find one the lab missed.

By the end, you have inspected: the live artifact, a method-driven decision,
a filed finding, a recorded BLOCK, the harness output, and the only attackable
target. That's the whole loop.

---

## What this is

Most projects publish code. Structureless Labs publishes the whole research
lifecycle — and treats the lifecycle itself as the product:

| Artifact | What we publish |
|---|---|
| **Code** | Reference implementations of every primitive we touch |
| **Specs** | Versioned, citable documents (with a three-depth explainer per concept) |
| **Attacks** | A standing invitation to break the designs, with a templated finding format |
| **Failures** | Fossilized dead-ends — kept forever, never deleted |
| **Simulations** | Reproducible experiments, benchmarks, parameter sweeps |
| **Predictions** | Confidence-scored bets, graded later |
| **Decisions** | A flight recorder of *why* every significant call was made |
| **Review prompts** | The AI research personas that vetted each change |

This is not a claim that we have solved post-quantum cryptography. It is an
**open laboratory** for learning, testing, documenting, and challenging
post-quantum cryptographic ideas — and a reusable *method* for doing so, in
[`sl-researchkit`](sl-researchkit/).

---

## The bet

The deliberate bet behind the whole organization:

> *The highest-probability contribution from this lab is not a new hard problem.
> It is better **analysis, methodology, integration, and tooling**.*

That is why [`sl-researchkit`](sl-researchkit/) is the real product, and
[`sl-kem`](sl-kem/) — the experimental primitive — is its first customer. The
researchkit ships the six AI personas (Cryptographer, Attacker, Engineer,
Archivist, Teacher, Principal Investigator), the PQC Red Team Checklist,
evidence grading, and four research workflows (Flight Recorder, Time Capsules,
AI-vs-AI Cryptanalysis, Research Journal).

Point any coding agent at `sl-researchkit/personas/` and require that every
significant change be reviewed by all six before merge. The point of the lab is
that the method is portable.

---

## The ecosystem

```
Structureless Labs
│
├─ sl-researchkit  AI-assisted research framework — the engine (foundation)
├─ sl-atlas        Interactive learning site — explainable PQC (LIVE)
├─ slff            Hybrid encrypted file container (Structureless Labs File Format)
├─ sl-bench        Benchmarks and parameter comparisons
├─ sl-vectors      Reproducible, public test vectors
├─ sl-attacklab    Break-it-first cryptanalysis
└─ sl-kem          Experimental KEM — the method's first test subject
```

| Repo | Risk | Potential | Status |
|------|------|-----------|--------|
| [`sl-researchkit`](sl-researchkit/) | Low | Very high | Foundation — the method |
| [`sl-atlas`](sl-atlas/) | Low | High | **Live demo** — 16-concept learning path, four interactives, search + glossary |
| [`slff`](slff/) | Low | High | Spec drafted; integration target |
| [`sl-bench`](sl-bench/) | Low | Medium | Tooling |
| [`sl-vectors`](sl-vectors/) | Low | Medium | Reproducibility |
| [`sl-attacklab`](sl-attacklab/) | Medium | High | Where the hardest questions come from |
| [`sl-kem`](sl-kem/) | High | High | Experimental — *not for production* |

---

## Principles

1. **Conservative by default.** Reviewed primitives, hybrid constructions, downgrade protection, authenticated headers.
2. **Break-it-first.** Every design ships with an open invitation to attack it. No design merges without an Attacker review and at least one testable attack hypothesis on record.
3. **Nothing is deleted.** Old designs become fossils; wrong predictions stay on the record.
4. **Explainable at three depths.** Every concept has a *Simple*, *Developer*, and *Researcher* view. If a concept lacks any of the three, the Teacher persona BLOCKs publication.
5. **Evidence over hype.** Claims are evidence-graded (`A`/`B`/`C`/`D`); confidence is stated; humility is built in.
6. **Provenance.** Every significant decision has a flight-recorder entry. Future readers should be able to reconstruct *why*.
7. **Falsifiability.** Every security claim must be falsifiable. Unfalsifiable claims are not claims.

The full version, with amendment rules, lives in [`sl-kem/CONSTITUTION.md`](sl-kem/CONSTITUTION.md).

---

## How to engage

| If you are… | Start here |
|---|---|
| New to post-quantum cryptography | **[sl-atlas](https://systemslibrarian.github.io/structureless-labs/)** — three-depth explainers |
| A cryptographer who wants to attack something | [`sl-attacklab/`](sl-attacklab/) — pick a target, file a finding |
| An engineer who wants to integrate | [`slff/`](slff/) — the hybrid container spec |
| A researcher reusing the method | [`sl-researchkit/`](sl-researchkit/) — personas, checklists, workflows |
| Curious about the experimental KEM | [`sl-kem/`](sl-kem/) — *experimental, not for production* |
| Looking for reproducible test data | [`sl-vectors/`](sl-vectors/) |
| Comparing parameter sets | [`sl-bench/`](sl-bench/) |

Every repo carries the same four files: `README.md`, `LICENSE` (Apache-2.0),
`SECURITY.md`, `CONTRIBUTING.md`. Issues, PRs, and finding templates are open.

---

## What we are *not* claiming

- We have not solved post-quantum cryptography. We are not claiming to.
- `sl-kem` is **experimental**. It is not standardized, not reviewed at scale, and not safe for production data. Use Kyber / ML-KEM for production.
- The PQC hardness assumptions (LWE, MLWE, GapSVP, SIVP) we build on are *strongly studied*, not *proven*. We grade them accordingly and re-evaluate.
- The atlas explains the field as we currently understand it. Cryptography evolves; the atlas is expected to.

The willingness to say *what we are not claiming* is, itself, part of the method.

---

## The million-dollar question

Re-asked every month, in every repo:

> *If we were starting this today, with everything we've learned so far, would we build the same design?*

When the answer becomes **no**, the project has learned something. Record it,
fossilize the old design, and move forward.

---

## Repository layout

```
.
├── .github/profile/README.md   org landing page (mirror to a ".github" repo)
├── .github/workflows/          pages deploy + validate (schema/parity/STATUS) + links
├── .github/ISSUE_TEMPLATE/     finding / spec-gap / doc-drift / research-question
├── sl-atlas/                   the live demo (deploys to Pages)
├── sl-researchkit/             AI research personas, checklists, workflows, decisions
├── sl-kem/                     experimental KEM (constitution + first explainer)
├── slff/                       hybrid container format spec
├── sl-bench/                   benchmarks
├── sl-vectors/                 test vectors
├── sl-attacklab/               targets + filed findings
├── fossils/                    org-level fossils (nothing is deleted)
├── journal/                    monthly research journal entries
├── scripts/                    validate-atlas / check-atlas-parity / gen-status
├── STATUS.md                   generated status surface (CI-enforced)
├── SETUP.md                    pushing the scaffold to GitHub
├── SECURITY.md                 responsible disclosure policy
├── NOTICE                      project attribution
├── CONTRIBUTING.md             how to contribute
└── LICENSE                     Apache-2.0
```

## How the method enforces itself

The lab's stated rigor is backed by CI gates, not just prose:

- **`validate-atlas`** — every concept JSON validates against
  [`sl-atlas/content/schema.json`](sl-atlas/content/schema.json).
- **`check-atlas-parity`** — concepts in `sl-atlas/src/concepts.js` and
  publishable JSON files in `sl-atlas/content/` must match exactly. A BLOCKED
  draft cannot accidentally appear in the live atlas; a published concept
  cannot lose its mirror JSON without the build failing.
- **`gen-status --check`** — [`STATUS.md`](STATUS.md) is regenerated from the
  tree on every push and the build fails if it drifts. Hand-maintained counts
  in prose are not the source of truth; this file is.
- **Link checker** — every markdown file in the repo is checked weekly and on
  every PR.

---

## Run the atlas locally

```bash
python -m http.server 8765 --directory sl-atlas/src
# → http://localhost:8765/
```

Zero build step. Pure HTML / CSS / JS. Opens directly via `file://` too.

---

## License

Apache-2.0. The canonical text is vendored into every sub-repo's `LICENSE` (root,
[`sl-researchkit`](sl-researchkit/LICENSE), [`sl-atlas`](sl-atlas/LICENSE), [`sl-kem`](sl-kem/LICENSE),
[`slff`](slff/LICENSE), [`sl-bench`](sl-bench/LICENSE), [`sl-vectors`](sl-vectors/LICENSE),
[`sl-attacklab`](sl-attacklab/LICENSE)). Project attribution lives in [`NOTICE`](NOTICE).

---

*Soli Deo Gloria — 1 Corinthians 10:31*
