#!/usr/bin/env node
// check-cost-model.mjs — regression test for the attack-cost explorer
// (mountAttackCost in sl-atlas/src/app.js).
//
// The explorer implements the SIMPLIFIED primal estimate: minimal BKZ block
// size β satisfying σ·√β ≤ δ₀^(2β−d−1)·q^(m/d) for some sample count m, with
// δ₀ the GSA root-Hermite factor and core-SVP costing (0.292β classical,
// 0.265β quantum). The atlas page labels it as a shape-of-the-tradeoff tool,
// not an authoritative estimator — but the shape itself must be right, and
// must stay right. Invariants:
//
//   C1  δ₀(β) is strictly decreasing on [50, 1400] (BKZ quality improves with β).
//   C2  Monotonicity of the estimate: security non-decreasing in n,
//       non-increasing in log q (σ fixed), non-decreasing in σ (q fixed).
//   C3  Regression anchors: the model's output for four reference shapes,
//       banded ±8 in β around values computed at introduction (2026-07-11).
//       These bands are ANCHORS FOR THIS SIMPLIFIED MODEL, not claims about
//       the schemes — though it is worth recording that they land close to
//       the widely cited core-SVP figures (Kyber-512 ≈ 2^118, Kyber-768
//       ≈ 2^182, FrodoKEM-640 primal ≈ 2^140-145), which is why the model is
//       honest enough to ship as a teaching tool.
//
// Pure Node, zero dependencies, exits non-zero on any violation. Wired into
// .github/workflows/validate.yml. Mirrors the implementation in app.js — if
// you change one, change both.

function logDelta0(beta) {
  return Math.log2((beta / (2 * Math.PI * Math.E)) * Math.pow(Math.PI * beta, 1 / beta)) / (2 * (beta - 1));
}
function primalBeta(n, logq, sigma) {
  const logSigma = Math.log2(sigma);
  for (let beta = 50; beta <= 1400; beta += 1) {
    const ld = logDelta0(beta);
    const lhs = logSigma + 0.5 * Math.log2(beta);
    for (let m = Math.max(64, Math.floor(0.4 * n)); m <= Math.ceil(2.5 * n); m += 8) {
      const d = m + n + 1;
      const rhs = (2 * beta - d - 1) * ld + (m / d) * logq;
      if (lhs <= rhs) return { beta, m };
    }
  }
  return null;
}

let failures = 0;
function fail(label, msg) {
  console.error(`✗ ${label}: ${msg}`);
  failures++;
}

// C1 — δ₀ strictly decreasing.
let c1Checked = 0;
for (let beta = 50; beta < 1400; beta++) {
  if (!(logDelta0(beta + 1) < logDelta0(beta))) {
    fail(`C1/beta=${beta}`, `δ₀ not strictly decreasing at β=${beta}`);
  }
  c1Checked++;
}

// C2 — monotonicity of the estimate along each dial.
const bits = r => (r ? 0.292 * r.beta : Infinity);
let c2Checked = 0;
for (const logq of [12, 14, 16]) {
  for (const sigma of [1.0, 2.0, 2.8]) {
    let prev = -Infinity;
    for (let n = 128; n <= 1408; n += 64) {
      const b = bits(primalBeta(n, logq, sigma));
      if (b < prev - 1e-9) fail(`C2/n/logq=${logq},sigma=${sigma}`, `security decreased raising n to ${n}`);
      prev = b;
      c2Checked++;
    }
  }
}
for (const n of [256, 640, 1024]) {
  for (const sigma of [1.0, 2.8]) {
    let prev = Infinity;
    for (const logq of [12, 13, 14, 15, 16]) {
      const b = bits(primalBeta(n, logq, sigma));
      if (b > prev + 1e-9) fail(`C2/logq/n=${n},sigma=${sigma}`, `security increased raising log q to ${logq}`);
      prev = b;
      c2Checked++;
    }
  }
  let prev = -Infinity;
  for (const sigma of [1.0, 1.22, 1.41, 2.0, 2.8, 3.2]) {
    const b = bits(primalBeta(n, 14, sigma));
    if (b < prev - 1e-9) fail(`C2/sigma/n=${n}`, `security decreased raising σ to ${sigma}`);
    prev = b;
    c2Checked++;
  }
}

// C3 — regression anchors (β computed 2026-07-11; band ±8).
const ANCHORS = [
  { label: "Kyber-512-shaped", n: 512, logq: Math.log2(3329), sigma: 1.22, beta: 406 },
  { label: "Kyber-768-shaped", n: 768, logq: Math.log2(3329), sigma: 1.0,  beta: 624 },
  { label: "Frodo-640-shaped", n: 640, logq: 15,              sigma: 2.8,  beta: 483 },
  { label: "Frodo-976-shaped", n: 976, logq: 16,              sigma: 2.3,  beta: 706 }
];
let c3Checked = 0;
for (const a of ANCHORS) {
  const r = primalBeta(a.n, a.logq, a.sigma);
  if (!r) {
    fail(`C3/${a.label}`, `model returned null; expected β ≈ ${a.beta}`);
    continue;
  }
  if (Math.abs(r.beta - a.beta) > 8) {
    fail(`C3/${a.label}`, `β=${r.beta}, expected ${a.beta} ± 8 — the model changed; recalibrate the anchors intentionally or fix the regression`);
  }
  c3Checked++;
}

if (failures) {
  console.error(`\ncheck-cost-model: FAILED — ${failures} invariant violation(s).`);
  process.exit(1);
}
console.log(`check-cost-model: PASS — C1 (δ₀ decreasing) over ${c1Checked} β; C2 (monotone dials) over ${c2Checked} cases; C3 (anchors) over ${c3Checked} reference shapes.`);
