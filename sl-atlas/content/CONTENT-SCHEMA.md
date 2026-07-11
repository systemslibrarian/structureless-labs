# Atlas Content Schema

Each concept is one structured document the site renders into three views.

```yaml
id: lwe
title: Learning With Errors
category: foundations
views:
  simple: |
    A puzzle made hard by adding small mistakes...
  developer: |
    A matrix equation with noise: b = A·s + e (mod q)...
  researcher: |
    Given (A, A·s + e mod q), recover s. Hardness in (n, q, χ)...
evidence_grade: B
related: [lattices, noise, parameters]
attack_links: [sl-attacklab/findings/...]
source_spec: ../../sl-kem/spec/EXPLAINER-LWE.md
checks:
  - question: Why does removing the noise make LWE easy?
    answer: Without e, b = A·s is ordinary linear algebra...
```

Rule: if a concept lacks any of the three views, the Teacher persona BLOCKs publication.

`checks` is optional: a list of self-check questions with reveal-on-click answers,
rendered at the end of the concept page. Answers must teach (explain the why), not just
grade. The Teacher gate reviews them like any other prose.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
