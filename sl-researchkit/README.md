# sl-researchkit

**A reusable, AI-assisted framework for disciplined cryptography research.**

This is the engine of Structureless Labs. Every other repo is a project *built with* it.
It contains the personas, checklists, and workflows that turn an LLM (Claude Code, Codex,
Gemini, etc.) into a disciplined research team rather than an enthusiastic yes-machine.

## Contents

```
personas/      Six AI reviewer roles. Drop into Claude Code / any agent.
checklists/    Gates a design must pass (e.g. the PQC Red Team Checklist).
workflows/     Repeatable processes — AI-vs-AI cryptanalysis, the monthly journal,
               the flight recorder, the time-capsule prediction loop.
```

## How to use it (in this lab)

Point your coding agent at `personas/` and require that **every significant change be
reviewed by all six personas** before merge. Run the `checklists/` as a merge gate. Use
the `workflows/` to keep the research alive and honest over years, not weeks.

## How to use it (on your own project)

See [`STARTER.md`](STARTER.md) — a single-file bootstrap that walks an external researcher
through adopting this method on a completely different project (ML safety, distributed
systems, biology — anything research-shaped). Nine numbered steps, copyable commands, one
verbatim agent prompt that drives a six-perspective review. About an hour from clone to
first decision.

## The million-dollar question

Re-asked every month, in every project:

> *If we were starting this today, with everything we've learned so far, would we build the same design?*

When the answer becomes **no**, the project has learned something. Record it.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
