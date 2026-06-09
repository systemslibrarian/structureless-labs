# Explainer: Learning With Errors (LWE)

The signature Structureless Labs pattern — every concept, three depths.

## Simple
A puzzle made hard by adding small mistakes. Imagine someone gives you lots of almost-right
answers to a math problem. Each one is off by a tiny, unknown nudge. With enough nudges,
working backwards to the secret becomes practically impossible.

## Developer
A matrix equation with noise added. You publish `(A, b)` where `b = A·s + e (mod q)`.
`A` is public and random, `s` is the secret vector, and `e` is small random noise.
Recovering `s` from `(A, b)` is the hard problem your security rests on. Drop the noise
`e` and it collapses to ordinary linear algebra — solvable instantly. The noise is the lock.

## Researcher
Given samples `(A, A·s + e mod q)` with `A ∈ Z_q^{m×n}` uniform, secret `s ∈ Z_q^n`, and
error `e` drawn from a bounded distribution χ, recover `s`. Decisional-LWE asks to
distinguish such samples from uniform. Hardness is parameterized by `(n, q, χ)`; security
estimates derive from the best known lattice-reduction and combinatorial attacks against
those parameters. *Evidence grade: B (strong consensus; not proven here).*

---
*Soli Deo Gloria — 1 Corinthians 10:31*
