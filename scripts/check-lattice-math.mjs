#!/usr/bin/env node
// check-lattice-math.mjs — regression test for the 2D lattice visualizer
// (mountLattice2d in sl-atlas/src/app.js).
//
// The visualizer's pedagogical claims are theorems in 2D, so they are tested
// as theorems. Invariants:
//
//   L1  The Skew transform (b2 ← b2 + 2·b1) is unimodular: |det| unchanged.
//   L2  Lagrange-Gauss reduction preserves |det| and outputs a basis with
//       ‖u‖ ≤ ‖v‖ and |⟨u,v⟩| ≤ ‖u‖²/2 (the Lagrange-reduced condition).
//   L3  The reduced u is a SHORTEST nonzero lattice vector (verified by
//       brute force over the coefficient box — the 2D theorem holds exactly).
//   L4  Reduction preserves the lattice: each reduced vector is an integer
//       combination of the original basis and vice versa.
//   L5  Babai round-off returns a lattice point whose distance to the target
//       is ≥ the true CVP distance (brute-forced); with a Lagrange-reduced
//       basis it finds the exact closest point on every tested instance,
//       and with the demo's skewed bases it misses on a healthy fraction —
//       the asymmetry that IS the demo's lesson.
//
// Pure Node, zero dependencies, exits non-zero on any violation. Wired into
// .github/workflows/validate.yml. Mirrors the implementation in app.js — if
// you change one, change both.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const det2 = (u, v) => u[0] * v[1] - u[1] * v[0];
const dot2 = (u, v) => u[0] * v[0] + u[1] * v[1];
const norm = v => Math.hypot(v[0], v[1]);
const sub = (u, v) => [u[0] - v[0], u[1] - v[1]];
const addScaled = (u, v, k) => [u[0] + k * v[0], u[1] + k * v[1]];

function lagrangeReduce(b1, b2) {
  let u = [...b1], v = [...b2];
  if (norm(u) > norm(v)) { const t = u; u = v; v = t; }
  for (let guard = 0; guard < 64; guard++) {
    const mu = Math.round(dot2(u, v) / dot2(u, u));
    v = addScaled(v, u, -mu);
    if (norm(v) >= norm(u)) break;
    const t = u; u = v; v = t;
  }
  return [u, v];
}
function babaiRound(b1, b2, t) {
  const d = det2(b1, b2);
  const x1 = (t[0] * b2[1] - t[1] * b2[0]) / d;
  const x2 = (t[1] * b1[0] - t[0] * b1[1]) / d;
  const a1 = Math.round(x1), a2 = Math.round(x2);
  return { point: [a1 * b1[0] + a2 * b2[0], a1 * b1[1] + a2 * b2[1]], raw: [x1, x2] };
}
function trueClosest(b1, b2, t) {
  const { raw } = babaiRound(b1, b2, t);
  let best = null, bestDist = Infinity;
  for (let a1 = Math.round(raw[0]) - 4; a1 <= Math.round(raw[0]) + 4; a1++) {
    for (let a2 = Math.round(raw[1]) - 4; a2 <= Math.round(raw[1]) + 4; a2++) {
      const p = [a1 * b1[0] + a2 * b2[0], a1 * b1[1] + a2 * b2[1]];
      const dist = norm(sub(p, t));
      if (dist < bestDist - 1e-12) { bestDist = dist; best = p; }
    }
  }
  return { point: best, dist: bestDist };
}
// Is w an integer combination of (b1, b2)? Cramer + integrality check.
function inLattice(w, b1, b2) {
  const d = det2(b1, b2);
  const a1 = (w[0] * b2[1] - w[1] * b2[0]) / d;
  const a2 = (w[1] * b1[0] - w[0] * b1[1]) / d;
  return Math.abs(a1 - Math.round(a1)) < 1e-9 && Math.abs(a2 - Math.round(a2)) < 1e-9;
}

let failures = 0;
function fail(label, msg) {
  console.error(`✗ ${label}: ${msg}`);
  failures++;
}

// Deterministic test bases: the demo's default plus a sweep of random small
// integer bases (seeded, reproducible), each also tested in a skewed form.
const BASES = [[[2, 0], [1, 2]], [[3, 1], [1, 2]], [[2, 1], [1, 3]]];
const prng = mulberry32(0xBA5E5);
while (BASES.length < 20) {
  const b1 = [Math.floor(prng() * 9) - 4, Math.floor(prng() * 9) - 4];
  const b2 = [Math.floor(prng() * 9) - 4, Math.floor(prng() * 9) - 4];
  if (det2(b1, b2) !== 0 && norm(b1) > 0 && norm(b2) > 0) BASES.push([b1, b2]);
}
function skewed(b1, b2, times) {
  let u = [...b1], v = [...b2];
  for (let i = 0; i < times; i++) {
    v = addScaled(v, u, 2);
    const t = u; u = v; v = t; // alternate so both vectors grow
  }
  return [u, v];
}

let l1 = 0, l2 = 0, l3 = 0, l4 = 0, l5 = 0;
let reducedExact = 0, reducedTotal = 0, skewMiss = 0, skewTotal = 0;

for (const [b1, b2] of BASES) {
  const d0 = Math.abs(det2(b1, b2));

  // L1 — skew is unimodular.
  const [s1, s2] = skewed(b1, b2, 3);
  if (Math.abs(det2(s1, s2)) !== d0) fail(`L1/[${b1}],[${b2}]`, `skew changed |det| from ${d0} to ${Math.abs(det2(s1, s2))}`);
  l1++;

  // L2 — reduction invariants.
  const [u, v] = lagrangeReduce(s1, s2);
  if (Math.abs(det2(u, v)) !== d0) fail(`L2/[${b1}],[${b2}]`, `reduction changed |det|`);
  if (norm(u) > norm(v) + 1e-9) fail(`L2/[${b1}],[${b2}]`, `‖u‖ > ‖v‖ after reduction`);
  if (Math.abs(dot2(u, v)) > dot2(u, u) / 2 + 1e-9) fail(`L2/[${b1}],[${b2}]`, `|⟨u,v⟩| > ‖u‖²/2 after reduction`);
  l2++;

  // L3 — reduced u is a shortest nonzero vector (2D theorem, brute-forced).
  let shortest = Infinity;
  for (let a1 = -8; a1 <= 8; a1++) {
    for (let a2 = -8; a2 <= 8; a2++) {
      if (a1 === 0 && a2 === 0) continue;
      shortest = Math.min(shortest, norm([a1 * u[0] + a2 * v[0], a1 * u[1] + a2 * v[1]]));
    }
  }
  if (norm(u) > shortest + 1e-9) fail(`L3/[${b1}],[${b2}]`, `reduced u (‖u‖=${norm(u)}) is not shortest (${shortest})`);
  l3++;

  // L4 — same lattice both ways.
  if (!inLattice(u, s1, s2) || !inLattice(v, s1, s2)) fail(`L4/[${b1}],[${b2}]`, `reduced vectors not in original lattice`);
  if (!inLattice(s1, u, v) || !inLattice(s2, u, v)) fail(`L4/[${b1}],[${b2}]`, `original vectors not in reduced lattice`);
  l4++;

  // L5 — Babai round-off vs true CVP, on deterministic targets.
  const tPrng = mulberry32((d0 * 2654435761) >>> 0);
  for (let k = 0; k < 5; k++) {
    const t = [tPrng() * 12 - 6, tPrng() * 8 - 4];

    const bR = babaiRound(u, v, t);
    const bestR = trueClosest(u, v, t);
    const dR = norm(sub(bR.point, t));
    if (!inLattice(bR.point, u, v)) fail(`L5/[${b1}],[${b2}]`, `Babai returned a non-lattice point`);
    if (dR < bestR.dist - 1e-9) fail(`L5/[${b1}],[${b2}]`, `Babai beat the brute-forced CVP — brute-force window too small or math wrong`);
    reducedTotal++;
    if (Math.abs(dR - bestR.dist) < 1e-9) reducedExact++;

    const bS = babaiRound(s1, s2, t);
    const bestS = trueClosest(s1, s2, t);
    const dS = norm(sub(bS.point, t));
    if (dS < bestS.dist - 1e-9) fail(`L5/[${b1}],[${b2}]`, `Babai(skewed) beat brute force`);
    skewTotal++;
    if (dS > bestS.dist + 1e-9) skewMiss++;
    l5++;
  }
}

// The demo's asymmetry, quantified. Babai ROUND-OFF is a heuristic even with
// a reduced basis — targets near Voronoi-cell boundaries can still round to a
// non-closest point (measured 94/100 exact on this fixed sweep at
// introduction, 2026-07-11). The lesson the demo teaches is the ASYMMETRY:
// with a reduced basis rounding is almost always exact; with a skewed basis
// it usually is not. Both halves are asserted, plus the strict gap.
const reducedMissRate = (reducedTotal - reducedExact) / reducedTotal;
const skewMissRate = skewMiss / skewTotal;
if (reducedMissRate > 0.10) {
  fail("L5/reduced", `Babai with reduced basis missed on ${reducedTotal - reducedExact}/${reducedTotal} instances (expected ≤ 10% on this fixed sweep)`);
}
if (skewMissRate < 0.30) {
  fail("L5/skewed", `Babai with skewed basis missed only ${skewMiss}/${skewTotal} — the skew is not visibly bad enough to teach the lesson`);
}
if (skewMissRate <= reducedMissRate) {
  fail("L5/asymmetry", `skewed-basis miss rate (${skewMiss}/${skewTotal}) not worse than reduced-basis (${reducedTotal - reducedExact}/${reducedTotal}) — the demo's central claim fails`);
}

if (failures) {
  console.error(`\ncheck-lattice-math: FAILED — ${failures} invariant violation(s).`);
  process.exit(1);
}
console.log(`check-lattice-math: PASS — L1..L4 over ${BASES.length} bases; L5 over ${l5} CVP instances (reduced-basis Babai exact ${reducedExact}/${reducedTotal}; skewed-basis misses ${skewMiss}/${skewTotal}).`);
