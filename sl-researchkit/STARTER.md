# sl-researchkit — Starter

A single-file bootstrap for adopting the Structureless Labs research method on a project that **is not** Structureless Labs. Copy this file to the root of your project, follow the checklist, and you have the method running in under an hour.

The method is domain-agnostic. It was instantiated for post-quantum cryptography, but the personas, gates, and workflows work for anything where you care about disciplined research over enthusiastic activity — distributed systems, ML safety, security tooling, biology, anything.

---

## 0 — What you get

| | |
|---|---|
| **Six personas** | Cryptographer · Attacker · Engineer · Archivist · Teacher · Principal Investigator. Each reviews from one perspective, ends with `PASS` / `PASS WITH NOTES` / `BLOCK`. |
| **Two checklists** | PQC Red Team (replace with your domain) · Evidence Grading (works as-is). |
| **Four workflows** | Flight Recorder (decision records) · Time Capsules (graded predictions) · Research Journal (monthly heartbeat) · AI-vs-AI Cryptanalysis (red/blue split). |
| **One constitution template** | A short, amendable document that names the non-negotiables. |

---

## 1 — Copy the right files

```bash
# from the root of your project
git clone --depth=1 https://github.com/systemslibrarian/structureless-labs ../slabs-source
mkdir -p research/{personas,checklists,workflows,decisions,fossils,journal}
cp ../slabs-source/sl-researchkit/personas/*.md       research/personas/
cp ../slabs-source/sl-researchkit/workflows/*.md      research/workflows/
cp ../slabs-source/sl-researchkit/checklists/EVIDENCE-GRADING.md research/checklists/
cp ../slabs-source/CONSTITUTION.md                    research/CONSTITUTION.md
```

You now have: six persona prompts, four workflow templates, the evidence-grading rubric, and the constitution template. About 25 files, all markdown, all hand-readable, zero dependencies.

---

## 2 — Adapt the constitution (15 minutes)

Open `research/CONSTITUTION.md`. The articles are written for cryptography; the *structure* is what you want. Keep these three articles verbatim — they are domain-agnostic:

> 4. **Permanence.** Nothing is deleted. Superseded designs are fossilized; wrong predictions remain on the record.
>
> 5. **Explainability.** Every concept ships with Simple / Developer / Researcher views.
>
> 6. **Provenance.** Every significant decision has a flight-recorder entry.

Rewrite Articles 1–3 and 7 to name *your* domain's non-negotiables. For an ML-safety project, Article 1 ("Conservatism") might become **"Distillation discipline: prefer published, evaluated models over training from scratch."** For a distributed systems project, Article 3 ("Break-it-first") might become **"Jepsen-first: no consensus claim merges without an adversarial network test."**

---

## 3 — Adapt the personas (30 minutes)

Five of the six personas need no rewrites at all — only a quick scan for domain-specific words:

| Persona | What to change |
|---|---|
| **Cryptographer** | Rename to *Specialist* and rewrite the mandate to name your domain's load-bearing claim (e.g. "Why should this scale?", "Why should this generalize?", "Why should this be safe?"). |
| **Attacker** | Keep verbatim. The adversarial mindset transfers cleanly. |
| **Engineer** | Keep verbatim. Implementation discipline is universal. |
| **Archivist** | Keep verbatim. The permanence principle does not depend on domain. |
| **Teacher** | Keep verbatim. The three-depth requirement (Simple / Developer / Researcher) is the most portable part of the whole method. |
| **Principal Investigator** | Keep verbatim. "What are we trying to learn?" is domain-agnostic. |

The **Output format** block at the bottom of every persona — the `VERDICT:` line and the flight-recorder rationale — is the lever that makes the method enforceable. Do not edit it.

---

## 4 — Wire the merge gate (5 minutes)

Add this to your PR template (`.github/PULL_REQUEST_TEMPLATE.md`):

```markdown
## Six-persona review

Before merge, paste the verdict of each persona below. A `BLOCK` from any persona requires a `WITH NOTES` resolution in this PR or a recorded decision overriding it.

- [ ] Cryptographer / Specialist: VERDICT: …
- [ ] Attacker:                   VERDICT: …
- [ ] Engineer:                   VERDICT: …
- [ ] Archivist:                  VERDICT: …
- [ ] Teacher:                    VERDICT: …
- [ ] Principal Investigator:     VERDICT: …

Flight-recorder decision (if any): research/decisions/D-XXXX.md
```

That single template makes the gate mechanically visible.

---

## 5 — Run a persona review (1 prompt)

Drop this verbatim into Claude Code, Codex, Gemini, Cursor, or whatever coding agent you use. Replace `<change>` with the diff or design you want reviewed.

```
You are conducting a six-persona Structureless Labs review on the following
change. Read each persona file in research/personas/ in turn, then respond
AS that persona — only that persona, in first person, applying the persona's
mandate and checklist. End each persona's response with one of:

  VERDICT: PASS
  VERDICT: PASS WITH NOTES
  VERDICT: BLOCK

Do not summarize or aggregate. The six verdicts speak for themselves.

After all six have spoken, if any returned BLOCK, list the resolution path
(what would change the BLOCK to PASS WITH NOTES). Do not propose code changes
yet; the resolution path is the negotiation surface.

The change under review:

<change>
```

That prompt is the load-bearing artifact of the method. Memorize it.

---

## 6 — Record the first decision (10 minutes)

The flight-recorder format lives in `research/workflows/FLIGHT-RECORDER.md`. The first decision you record should be **the decision to adopt this method**. Open `research/decisions/D-0001.md` and fill in:

```
Decision ID: D-0001
Question:     Should this project adopt the Structureless Labs research method
              (sl-researchkit) as its merge gate?
Alternatives: (A) Ad-hoc review (status quo).
              (B) Adopt the method in full.
              (C) Adopt selectively (e.g. only the Teacher gate).
Chosen:       (B) — adopt in full.
Reason:       <your one-paragraph reason. Likely: the project wants
              disciplined, evidence-graded research over enthusiastic activity,
              and the persona gates are the cheapest way to install that
              discipline mechanically.>
Risks:        Adds review overhead per PR. Mitigated by the fact that small
              changes can resolve all six verdicts in one round.
Evidence:     Grade D (governance decision, not measured).
Reviewed by:  Run the six-persona prompt against THIS decision.
Date:         <today>
Status:       Active
```

That decision is your tripwire. If a future contributor bypasses the method, they are reverting D-0001 by action, and the project's own permanence principle requires them to record *why*.

---

## 7 — Monthly heartbeat

On the first of every month, open `research/journal/YYYY-MM.md` using the template at `research/workflows/RESEARCH-JOURNAL.md`. Re-ask the **million-dollar question**:

> *If we were starting today, with everything we've learned so far, would we build the same design?*

When the answer becomes **no**, the project has learned something. Record a decision, fossilize the old design (move it to `research/fossils/` with a header noting what superseded it), and move forward. The fossil stays forever.

---

## 8 — What you have now (verification)

- A copyable persona prompt that turns any coding agent into a six-perspective review team.
- A flight-recorder format that prevents quiet retractions.
- A constitution that names the non-negotiables of *your* project, not generic ones.
- A journal cadence that prevents the project from feeling dead between commits.
- A fossil directory that catches anything you would otherwise rewrite silently.
- A monthly question that gives the project permission to learn.

That is the method. It transfers to any research-shaped project. If a domain-specific persona is missing, add it (`research/personas/<NAME>.md` with the same structure) and update the merge-gate checklist — the format is the contract, not the count.

---

## 9 — Honest non-claims

- This method does **not** make wrong designs right. It makes the wrongness *visible* before merge.
- It does **not** prevent fabrication on its own. Pair it with mechanical CI gates (linting, type-checking, content-parity checks) — like the four scripts in `scripts/` of the Structureless Labs repo — so the human / AI review focuses on judgment, not hygiene.
- It does **not** scale a team of zero into a team of six. You still have to actually answer each persona honestly.
- It is **not** novel. The format was assembled from prior art (peer review, ADRs, postmortems, Jepsen, Tiger Style); the value is the assembly and the mechanical enforcement, not the parts.

The method is the product. Use it.

---

*Soli Deo Gloria — 1 Corinthians 10:31*
