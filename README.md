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
with an interactive equation you can flip between *solvable* and *hard* by
toggling the noise vector.

If you read nothing else in this repo, click that link. The atlas *is* the bet
this lab is making.

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
| [`sl-atlas`](sl-atlas/) | Low | High | **Live demo** — four concepts authored, LWE interactive |
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
