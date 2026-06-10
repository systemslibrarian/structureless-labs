/* sl-atlas — main app.
   Pure browser JS, no build step. Renders concept content at three depths
   (simple / developer / researcher) plus a "compare" mode and an
   interactive LWE matrix demonstration. WCAG-AA accessible. */

(function () {
  "use strict";

  const CONCEPTS = window.SL_ATLAS_CONCEPTS || [];
  const CONCEPTS_BY_ID = Object.fromEntries(CONCEPTS.map(c => [c.id, c]));
  const BLOCKED = window.SL_ATLAS_BLOCKED || [];
  const BLOCKED_BY_ID = Object.fromEntries(BLOCKED.map(b => [b.id, b]));
  const CITATIONS = window.SL_ATLAS_CITATIONS || {};
  const VIEWS = [
    { id: "simple",     label: "Simple",     description: "For a curious non-expert." },
    { id: "developer",  label: "Developer",  description: "For a programmer." },
    { id: "researcher", label: "Researcher", description: "Precise and formal." }
  ];

  const state = {
    conceptId: CONCEPTS[0] ? CONCEPTS[0].id : null,
    view: "simple",
    compare: false
  };

  // ---------- DOM refs ----------
  const conceptListEl = document.getElementById("concept-list");
  const blockedListEl = document.getElementById("blocked-list");
  const conceptViewEl = document.getElementById("concept-view");
  const themeButton   = document.getElementById("theme-toggle");
  const srStatusEl    = document.getElementById("sr-status");

  function announce(msg) {
    if (!srStatusEl) return;
    // Force a re-announcement even if the same string by clearing first.
    srStatusEl.textContent = "";
    setTimeout(() => { srStatusEl.textContent = msg; }, 30);
  }

  // ---------- theme ----------
  const THEME_KEY = "sl-atlas:theme";
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeButton) {
      const isLight = theme === "light";
      themeButton.setAttribute("aria-checked", String(isLight));
      themeButton.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    }
  }
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return applyTheme(saved);
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }
  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* private mode: ignore */ }
    applyTheme(next);
    announce(next === "light" ? "Light theme" : "Dark theme");
  }
  if (themeButton) themeButton.addEventListener("click", toggleTheme);

  // ---------- inline markup ----------
  // Renders the author's lightweight markup into safe HTML:
  //   `code` → <code>, **bold** → <strong>, *em* → <em>.
  // Author content is trusted (we control concepts.js), but we still escape
  // raw text before applying these patterns.
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function renderInline(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(\[])\*([^*\n]+)\*(?=[\s.,;:)\]!?]|$)/g, '$1<em>$2</em>');
  }
  function renderProse(text) {
    return text
      .split(/\n{2,}/)
      .map(p => `<p>${renderInline(p.trim())}</p>`)
      .join("");
  }

  // ---------- routing ----------
  function parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    if (!raw) return {};
    const [path, query] = raw.split("?");
    const params = new URLSearchParams(query || "");
    return {
      conceptId: path || null,
      view: params.get("view"),
      compare: params.get("compare") === "1"
    };
  }
  function writeHash() {
    const params = new URLSearchParams();
    if (state.compare) params.set("compare", "1");
    else params.set("view", state.view);
    const qs = params.toString();
    const hash = `#/${state.conceptId}${qs ? "?" + qs : ""}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }
  function applyHash() {
    const h = parseHash();
    if (h.conceptId && (CONCEPTS_BY_ID[h.conceptId] || BLOCKED_BY_ID[h.conceptId])) state.conceptId = h.conceptId;
    if (h.view && VIEWS.find(v => v.id === h.view)) state.view = h.view;
    state.compare = !!h.compare;
  }

  // ---------- sidebar ----------
  function renderSidebar() {
    conceptListEl.innerHTML = "";
    for (const c of CONCEPTS) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const isActive = c.id === state.conceptId;
      a.href = `#/${c.id}`;
      a.className = "concept-link" + (isActive ? " is-active" : "");
      if (isActive) a.setAttribute("aria-current", "page");
      a.innerHTML = `
        <span class="concept-link-title">${escapeHtml(c.title)}</span>
        <span class="grade" aria-label="Evidence grade ${escapeHtml(c.evidence_grade || "ungraded")}">${escapeHtml(c.evidence_grade || "—")}</span>
      `;
      a.addEventListener("click", e => {
        e.preventDefault();
        setConcept(c.id, { fromUser: true });
      });
      li.appendChild(a);
      conceptListEl.appendChild(li);
    }

    if (blockedListEl) {
      blockedListEl.innerHTML = "";
      for (const b of BLOCKED) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        const isActive = b.id === state.conceptId;
        a.href = `#/${b.id}`;
        a.className = "concept-blocked-link" + (isActive ? " is-active" : "");
        if (isActive) a.setAttribute("aria-current", "page");
        a.setAttribute("title", `BLOCKED ${b.blocked_at}: ${b.blocked_reason}`);
        a.innerHTML = `
          <span>${escapeHtml(b.title)}</span>
          <span class="pill-block" aria-label="Blocked by Teacher review">BLOCK</span>
        `;
        a.addEventListener("click", e => {
          e.preventDefault();
          setConcept(b.id, { fromUser: true });
        });
        li.appendChild(a);
        blockedListEl.appendChild(li);
      }
    }
  }

  // ---------- main view ----------
  function renderConcept() {
    const c = CONCEPTS_BY_ID[state.conceptId];
    if (!c) {
      const blocked = BLOCKED_BY_ID[state.conceptId];
      if (blocked) {
        renderBlockedDraft(blocked);
        return;
      }
      conceptViewEl.innerHTML = `<p>No concept selected.</p>`;
      return;
    }

    const tabs = VIEWS.map((v, i) => {
      const active = !state.compare && v.id === state.view;
      return `
        <button class="tab"
                data-view="${v.id}"
                id="tab-${v.id}"
                role="tab"
                aria-controls="panel-view"
                aria-selected="${active}"
                tabindex="${active ? "0" : "-1"}"
                title="${escapeHtml(v.description)}">
          <span class="tab-num" aria-hidden="true">${i + 1}</span>
          <span>${v.label}</span>
        </button>`;
    }).join("");
    const compareTab = `
      <button class="tab"
              data-compare="1"
              id="tab-compare"
              role="tab"
              aria-controls="panel-view"
              aria-selected="${state.compare}"
              tabindex="${state.compare ? "0" : "-1"}"
              title="Show all three views side-by-side.">
        <span class="tab-num" aria-hidden="true">C</span>
        <span>Compare</span>
      </button>`;

    const labelledBy = state.compare ? "tab-compare" : `tab-${state.view}`;
    const body = state.compare ? renderCompare(c) : renderSingleView(c);

    conceptViewEl.innerHTML = `
      <header class="concept-header">
        <div class="concept-eyebrow">${escapeHtml(c.category || "concept")}</div>
        <h1 class="concept-title">${escapeHtml(c.title)}</h1>
        ${c.subtitle ? `<p class="concept-subtitle">${escapeHtml(c.subtitle)}</p>` : ""}
      </header>

      <div class="tabs" role="tablist" aria-label="Depth of explanation">
        ${tabs}${compareTab}
      </div>

      <div id="panel-view" role="tabpanel" aria-labelledby="${labelledBy}" tabindex="0">
        ${body}
      </div>

      ${INTERACTIVES[c.interactive] ? `<div id="interactive-host"></div>` : ""}

      ${renderMeta(c)}
    `;

    // wire up tabs
    conceptViewEl.querySelectorAll(".tab[data-view]").forEach(btn => {
      btn.addEventListener("click", () => setView(btn.getAttribute("data-view")));
      btn.addEventListener("keydown", onTabKey);
    });
    conceptViewEl.querySelectorAll(".tab[data-compare]").forEach(btn => {
      btn.addEventListener("click", () => setCompare(!state.compare));
      btn.addEventListener("keydown", onTabKey);
    });
    // wire up related pills
    conceptViewEl.querySelectorAll(".related-pill[data-related]").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        setConcept(a.getAttribute("data-related"), { fromUser: true });
      });
    });

    // mount interactive viz (dispatched by concept.interactive id)
    const mounter = INTERACTIVES[c.interactive];
    if (mounter) mounter(document.getElementById("interactive-host"));
  }

  // arrow-key navigation between tabs (WAI-ARIA Authoring Practices)
  function onTabKey(e) {
    const tabs = Array.from(conceptViewEl.querySelectorAll(".tab"));
    const idx = tabs.indexOf(e.currentTarget);
    if (idx === -1) return;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % tabs.length;
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   next = (idx - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End")  next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  }

  function renderSingleView(c) {
    const text = c.views[state.view] || "(no content for this view)";
    return `<div class="view">${renderProse(text)}</div>`;
  }

  function renderBlockedDraft(b) {
    const missing = Object.entries(b.views)
      .filter(([, v]) => v === null || v === "")
      .map(([k]) => k);
    const present = Object.entries(b.views)
      .filter(([, v]) => typeof v === "string" && v.length > 0);

    const missingHtml = missing.map(k => `
      <section class="view view-missing" aria-label="${escapeHtml(k)} view (missing)">
        <h3 class="view-heading">${escapeHtml(k.charAt(0).toUpperCase() + k.slice(1))} view</h3>
        <p class="view-empty"><strong>Missing.</strong> This is why the Teacher gate <span class="pill-block-inline">BLOCKED</span> publication.</p>
      </section>
    `).join("");

    const presentHtml = present.map(([k, text]) => `
      <section class="view view-authored" aria-label="${escapeHtml(k)} view (authored)">
        <h3 class="view-heading">${escapeHtml(k.charAt(0).toUpperCase() + k.slice(1))} view <span class="view-status">authored</span></h3>
        <div class="view">${renderProse(text)}</div>
      </section>
    `).join("");

    conceptViewEl.innerHTML = `
      <header class="concept-header">
        <div class="concept-eyebrow">held by teacher gate</div>
        <h1 class="concept-title">
          ${escapeHtml(b.title)}
          <span class="pill-block pill-block-large" aria-label="Blocked by Teacher review">BLOCKED</span>
        </h1>
        ${b.subtitle ? `<p class="concept-subtitle">${escapeHtml(b.subtitle)}</p>` : ""}
      </header>

      <section class="block-banner" role="status">
        <p>
          <strong>This concept is NOT published.</strong>
          The Teacher persona returned <code>VERDICT: BLOCK</code> on ${escapeHtml(b.blocked_at)} —
          ${renderInline(b.blocked_reason)}
        </p>
        <p class="block-banner-links">
          <a href="${escapeHtml(b.review_path)}" target="_blank" rel="noopener">Read the full Teacher review</a>
          ·
          <a href="${escapeHtml(b.decision_path)}" target="_blank" rel="noopener">Flight-recorder decision D-0003</a>
        </p>
      </section>

      <section class="blocked-views" aria-label="Authored views (kept for the resolution path)">
        <h2 class="blocked-views-heading">Authored content (preserved per never-edit-destructively)</h2>
        <p class="blocked-views-note">The Developer and Researcher views below were authored before the gate ran. They are kept in <code>sl-atlas/content/${escapeHtml(b.id)}.json</code> so a future author can resolve the BLOCK by authoring the missing depth — not by starting over.</p>
        ${presentHtml}
        ${missingHtml}
      </section>

      ${renderReferences(b.citations || [])}
    `;
  }

  function renderCompare(c) {
    return `
      <div class="compare-grid">
        ${VIEWS.map(v => `
          <section class="compare-col" aria-label="${escapeHtml(v.label)} view">
            <h3>${escapeHtml(v.label)}</h3>
            <div class="view">${renderProse(c.views[v.id] || "")}</div>
          </section>
        `).join("")}
      </div>
    `;
  }

  function renderMeta(c) {
    const grade = c.evidence_grade || "—";
    const related = (c.related || [])
      .map(id => CONCEPTS_BY_ID[id])
      .filter(Boolean);
    const citationIds = c.citations || [];

    return `
      <section class="meta" aria-label="Concept metadata">
        <div class="meta-card">
          <h4>Evidence grade</h4>
          <p>
            <span class="badge grade-${escapeHtml(grade)}">
              <span class="letter" aria-hidden="true">${escapeHtml(grade)}</span>
              <span><span class="visually-hidden">Grade ${escapeHtml(grade)}: </span>${escapeHtml(gradeLabel(grade))}</span>
            </span>
          </p>
          ${c.evidence_note ? `<p style="margin-top:8px;">${renderInline(c.evidence_note)}</p>` : ""}
        </div>

        <div class="meta-card">
          <h4>Related concepts</h4>
          ${related.length
            ? `<ul class="related-list">${related.map(r =>
                `<li><a class="related-pill" href="#/${r.id}" data-related="${r.id}">${escapeHtml(r.title)}</a></li>`
              ).join("")}</ul>`
            : `<p>None yet.</p>`}
        </div>

        <div class="meta-card">
          <h4>Source spec</h4>
          ${c.source_spec
            ? `<p><a href="${escapeHtml(c.source_spec)}" target="_blank" rel="noopener">${escapeHtml(c.source_spec)}</a></p>
               <p style="margin-top:6px; font-size:.82rem; color:var(--muted);">Atlas content tracks the spec — never the other way around.</p>`
            : `<p>No upstream spec yet.</p>`}
        </div>
      </section>

      ${renderReferences(citationIds)}
    `;
  }

  function renderReferences(citationIds) {
    if (!citationIds || citationIds.length === 0) return "";
    const items = citationIds.map(id => {
      const entry = CITATIONS[id];
      if (!entry) {
        // Should be impossible if check-citations CI is green, but render defensively.
        return `<li class="reference-item" data-cite-id="${escapeHtml(id)}">
          <span class="ref-id">[${escapeHtml(id)}]</span>
          <span class="ref-body"><em>Unresolved citation</em></span>
        </li>`;
      }
      const link = entry.url
        ? `<a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener" class="ref-link">${escapeHtml(entry.url)}</a>`
        : "";
      return `
        <li class="reference-item" id="cite-${escapeHtml(id)}">
          <span class="ref-id"><a href="../../CITATIONS.md#${escapeHtml(id)}" target="_blank" rel="noopener" class="ref-id-link">[${escapeHtml(id)}]</a></span>
          <div class="ref-body">
            <div class="ref-text">${renderInline(entry.body)}</div>
            ${link ? `<div class="ref-link-row">${link}</div>` : ""}
          </div>
        </li>`;
    }).join("");

    return `
      <section class="references" aria-label="References">
        <h3 class="references-heading">References</h3>
        <p class="references-note">Citations declared in this concept's <code>citations</code> array, resolved against the central <a href="../../CITATIONS.md" target="_blank" rel="noopener">CITATIONS.md</a> registry. CI fails the build on any unresolved ID.</p>
        <ol class="reference-list">${items}</ol>
      </section>
    `;
  }

  function gradeLabel(g) {
    return {
      A: "Well-established",
      B: "Strong evidence",
      C: "Working assumption",
      D: "Speculative"
    }[g] || "Ungraded";
  }

  // ---------- LWE interactive viz ----------
  // A runnable, configurable demonstration of the LWE equation:
  //   b = A·s + e  (mod q)
  // Toggle noise on/off and watch the security collapse; click "Try to solve"
  // to literally run modular Gaussian elimination against the first n rows and
  // verify the recovered s against the remaining rows. With noise off the
  // attack recovers the secret; with noise on the same elimination returns the
  // wrong vector and verification fails on most rows. That is the lesson.
  //
  // All three presets use a PRIME modulus q. Modular inverses (and therefore
  // Gaussian elimination over Z_q) are guaranteed only for prime q; restricting
  // to {17, 97, 257} keeps the attack-surface explorer well-defined without
  // needing a general ring-inverse fallback. Custom q is restricted to that
  // short whitelist for the same reason.
  function mountLweMatrix(host) {

    // ---- presets ----
    const PRESETS = {
      toy:    { label: "Toy",    n: 3, m: 4,  q: 17,  eta: 1,
                hint: "Hand-checkable. Read the math one cell at a time." },
      small:  { label: "Small",  n: 5, m: 8,  q: 97,  eta: 2,
                hint: "Still fits on screen. Noise distribution is visibly wider." },
      medium: { label: "Medium", n: 8, m: 14, q: 257, eta: 3,
                hint: "Closer in shape to a real KEM round. Scroll the equation horizontally if needed." }
    };
    const Q_CHOICES = [17, 97, 257];     // prime moduli only — see header comment.
    const MAX_N = 16;
    const MAX_M = 24;

    // ---- state ----
    // Initial preset can be overridden by ?preset= in the hash so the demo is
    // shareable. parseHash() runs before mount; we read it back here.
    const initialPresetFromHash = (function () {
      try {
        const raw = window.location.hash.replace(/^#\/?/, "");
        const q = (raw.split("?")[1]) || "";
        const p = new URLSearchParams(q).get("preset");
        return PRESETS[p] ? p : null;
      } catch (_) { return null; }
    })();
    const startPresetId = initialPresetFromHash || "toy";
    const state = {
      presetId:    startPresetId,
      n: PRESETS[startPresetId].n,
      m: PRESETS[startPresetId].m,
      q: PRESETS[startPresetId].q,
      eta: PRESETS[startPresetId].eta,
      seed:        0xC0FFEE,
      A: null, s: null, e: null,
      noiseOn:     true,
      attack:      null,        // {recovered, perRowOk, rowsUsed} or {error: "..."}
      exportOpen:  false
    };

    // Push the preset back into the URL hash so users can share /#/lwe?preset=small.
    // We only touch the `preset` parameter; other params (view, compare) are preserved.
    function writePresetToHash() {
      try {
        const raw = window.location.hash.replace(/^#\/?/, "");
        const [path, query] = raw.split("?");
        if (!path) return;
        const params = new URLSearchParams(query || "");
        if (state.presetId === "toy") params.delete("preset"); // default — keep URLs clean
        else                          params.set("preset", state.presetId);
        const qs = params.toString();
        const nextHash = `#/${path}${qs ? "?" + qs : ""}`;
        if (window.location.hash !== nextHash) {
          history.replaceState(null, "", nextHash);
        }
      } catch (_) { /* private mode or hash-replace blocked: ignore */ }
    }

    // ---- pure helpers ----
    // mulberry32: a 32-bit deterministic PRNG. Tiny, well-distributed, and the
    // Export feature can hand back a (seed, params) pair that fully reproduces
    // the instance — important for the "open research" framing.
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
    function modq(x, q) { const r = ((x % q) + q) % q; return r; }
    function dot(row, vec) {
      let s = 0;
      for (let i = 0; i < row.length; i++) s += row[i] * vec[i];
      return s;
    }
    // Modular inverse via Fermat (a^(p-2) mod p). Valid because every q in
    // Q_CHOICES is prime; if you extend Q_CHOICES you must revisit this.
    function modInverse(a, p) {
      a = modq(a, p);
      if (a === 0) return 0;
      let result = 1, base = a, exp = p - 2;
      while (exp > 0) {
        if (exp & 1) result = (result * base) % p;
        base = (base * base) % p;
        exp >>>= 1;
      }
      return result;
    }
    // Centered binomial CBD_η: sum of η Bernoulli(1/2) minus sum of η Bernoulli(1/2).
    // Output is in [-η, η]; this is the constant-time-friendly noise distribution
    // used by Kyber and the natural toy analogue for the atlas.
    function sampleCBD(prng, eta) {
      let a = 0, b = 0;
      for (let i = 0; i < eta; i++) {
        if (prng() < 0.5) a++;
        if (prng() < 0.5) b++;
      }
      return a - b;
    }

    // ---- instance sampling ----
    function sampleInstance() {
      const prng = mulberry32(state.seed);
      const { n, m, q, eta } = state;
      const A = Array.from({ length: m }, () =>
        Array.from({ length: n }, () => Math.floor(prng() * q))
      );
      const s = Array.from({ length: n }, () => Math.floor(prng() * q));
      let e;
      // Avoid the all-zero noise draw, which would visually mimic noise-off.
      do {
        e = Array.from({ length: m }, () => sampleCBD(prng, eta));
      } while (e.every(v => v === 0));
      state.A = A;
      state.s = s;
      state.e = e;
      state.attack = null;
    }

    function computeB() {
      const { A, s, e, q, noiseOn } = state;
      return A.map((row, i) => modq(dot(row, s) + (noiseOn ? e[i] : 0), q));
    }

    // ---- modular Gaussian elimination on the first n rows ----
    // Returns the recovered s vector (length n) or null if the chosen rows are
    // linearly dependent mod q. Operates on a copy; does not mutate state.A.
    function solveModular(rows, target, q) {
      const n = rows[0].length;
      const M = rows.map((row, i) => row.concat([target[i]]).map(v => modq(v, q)));
      for (let col = 0; col < n; col++) {
        // pivot: find a row with non-zero entry in this column
        let pivot = -1;
        for (let r = col; r < n; r++) {
          if (M[r][col] !== 0) { pivot = r; break; }
        }
        if (pivot === -1) return null;     // singular
        if (pivot !== col) { const tmp = M[col]; M[col] = M[pivot]; M[pivot] = tmp; }
        // normalize pivot row
        const inv = modInverse(M[col][col], q);
        for (let c = col; c <= n; c++) M[col][c] = (M[col][c] * inv) % q;
        // eliminate this column from other rows
        for (let r = 0; r < n; r++) {
          if (r === col) continue;
          const factor = M[r][col];
          if (factor === 0) continue;
          for (let c = col; c <= n; c++) {
            M[r][c] = modq(M[r][c] - factor * M[col][c], q);
          }
        }
      }
      return M.map(row => row[n]);
    }

    function runAttack() {
      const b = computeB();
      const rowsUsed = state.n;
      const recovered = solveModular(state.A.slice(0, rowsUsed), b.slice(0, rowsUsed), state.q);
      if (!recovered) {
        state.attack = { error: "singular", rowsUsed };
        return;
      }
      const perRowOk = state.A.map((row, i) => modq(dot(row, recovered), state.q) === b[i]);
      const matchesSecret = recovered.every((v, i) => v === state.s[i]);
      state.attack = { recovered, perRowOk, rowsUsed, matchesSecret };
    }

    // ---- setters (centralize state changes so we can clear stale attack results) ----
    function setPreset(id) {
      const p = PRESETS[id];
      if (!p) return;
      state.presetId = id;
      state.n = p.n; state.m = p.m; state.q = p.q; state.eta = p.eta;
      sampleInstance();
      writePresetToHash();
      render();
      announce(`Preset: ${p.label}. ${p.hint}`);
    }
    function setCustomParam(field, value) {
      if (field === "n")   state.n   = Math.max(2, Math.min(MAX_N, Math.floor(value)));
      if (field === "m")   state.m   = Math.max(state.n, Math.min(MAX_M, Math.floor(value)));
      if (field === "q") {
        const v = Math.floor(value);
        state.q = Q_CHOICES.includes(v) ? v : state.q;
      }
      if (field === "eta") state.eta = Math.max(1, Math.min(4, Math.floor(value)));
      state.presetId = "custom";
      sampleInstance();
      render();
    }
    function setNoise(on) {
      if (state.noiseOn === on) return;
      state.noiseOn = on;
      // Keep the recovered-s on screen when toggling so the "same elimination,
      // different answer" lesson lands. Verification still re-runs.
      if (state.attack && state.attack.recovered) {
        const b = computeB();
        state.attack.perRowOk = state.A.map((row, i) =>
          modq(dot(row, state.attack.recovered), state.q) === b[i]);
        state.attack.matchesSecret = state.attack.recovered.every((v, i) => v === state.s[i]);
      }
      render();
      announce(on ? "Noise on. The equation is hard." : "Noise off. The equation is solvable.");
    }
    function resampleNoise() {
      const prng = mulberry32((state.seed ^ 0xA5A5A5A5) >>> 0);
      // Re-draw only e; keep A and s. Seed-xor keeps it deterministic-on-button.
      let e;
      do { e = Array.from({ length: state.m }, () => sampleCBD(prng, state.eta)); }
      while (e.every(v => v === 0));
      state.e = e;
      state.attack = null;
      // Mutate the seed so the next press gives a different draw.
      state.seed = (state.seed + 1) >>> 0;
      if (!state.noiseOn) state.noiseOn = true;
      render();
      announce("Noise vector resampled.");
    }
    function freshInstance() {
      state.seed = (Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
      sampleInstance();
      render();
      announce(`Fresh instance generated. Seed ${state.seed}.`);
    }
    function tryToSolve() {
      runAttack();
      render();
      if (state.attack && state.attack.error === "singular") {
        announce("Elimination failed: the first n rows are linearly dependent modulo q. Try resample or new instance.");
        return;
      }
      const ok = state.attack.perRowOk.filter(Boolean).length;
      const total = state.attack.perRowOk.length;
      announce(
        state.attack.matchesSecret
          ? `Attack succeeded. Recovered s exactly. ${ok} of ${total} rows verify.`
          : `Attack returned a wrong candidate. Only ${ok} of ${total} rows verify; the noise broke the linear-algebra shortcut.`
      );
    }
    function toggleExport() {
      state.exportOpen = !state.exportOpen;
      render();
    }

    // ---- rendering ----
    function render() {
      const { A, s, e, q, n, m, noiseOn, presetId } = state;
      const b = computeB();
      const noiseShown = noiseOn ? e : e.map(() => 0);
      const recovered = state.attack && state.attack.recovered;
      const perRowOk = state.attack && state.attack.perRowOk;

      // Per-row classes for the matrix's row highlighting (attack visualization)
      const rowClasses = A.map((_, i) => {
        const cls = [];
        if (state.attack && state.attack.recovered) {
          if (i < state.attack.rowsUsed) cls.push("row-used");
          else if (perRowOk && perRowOk[i] === true) cls.push("row-ok");
          else if (perRowOk && perRowOk[i] === false) cls.push("row-fail");
        }
        return cls;
      });

      host.innerHTML = `
        <section class="interactive lwe-interactive" aria-labelledby="lwe-title">
          <div class="interactive-header">
            <h2 class="interactive-title" id="lwe-title">
              The LWE equation, live
              <span class="pill" aria-hidden="true">interactive</span>
            </h2>
          </div>

          <div class="lwe-preset-row" role="radiogroup" aria-label="Instance preset">
            ${["toy","small","medium","custom"].map(id => {
              const checked = state.presetId === id;
              const label = id === "custom" ? "Custom" : escapeHtml(PRESETS[id].label);
              const spec  = id === "custom" ? "advanced"
                                            : `n=${PRESETS[id].n}, q=${PRESETS[id].q}`;
              return `
                <button class="preset-btn"
                        type="button"
                        role="radio"
                        aria-checked="${checked}"
                        tabindex="${checked ? "0" : "-1"}"
                        data-preset="${id}">
                  ${label}
                  <span class="preset-spec" aria-hidden="true">${spec}</span>
                </button>`;
            }).join("")}
          </div>

          ${state.presetId === "custom" ? customControlsHtml() : presetHintHtml(presetId)}

          <div class="lwe-controls" role="group" aria-label="Demonstration controls">
            <div class="control-cluster" role="group" aria-label="Noise toggle">
              <button class="btn" type="button" data-act="noise-on"  aria-pressed="${noiseOn}">Noise on</button>
              <button class="btn" type="button" data-act="noise-off" aria-pressed="${!noiseOn}">Noise off</button>
            </div>
            <button class="btn" type="button" data-act="resample"  title="Draw a fresh noise vector e">Resample <span class="visually-hidden">noise vector </span>e</button>
            <button class="btn" type="button" data-act="new"       title="Generate a fresh random A, s, e">New instance</button>
            <button class="btn btn-attack" type="button" data-act="solve" title="Run modular Gaussian elimination on the first n rows">
              <span aria-hidden="true">⚔</span> Try to solve
            </button>
            <button class="btn btn-ghost" type="button" data-act="export" aria-expanded="${state.exportOpen}">Export</button>
          </div>

          <figure class="equation-figure">
            <div class="equation-scroll">
              <div class="equation" role="img" aria-label="${equationAriaLabel(b)}">
                ${matrixHtml(A, "A", { rowClasses })}
                <span class="op" aria-hidden="true">·</span>
                ${vectorHtml(s, "s", { secret: true })}
                <span class="op" aria-hidden="true">+</span>
                ${vectorHtml(noiseShown, "e", { noise: true, faded: !noiseOn })}
                <span class="op" aria-hidden="true">=</span>
                ${vectorHtml(b, `b (mod ${q})`, { rowClasses })}
              </div>
            </div>
            <figcaption class="matrix-caption">
              Modulus <code>q = ${q}</code>, dimension <code>n = ${n}</code>, samples <code>m = ${m}</code>, noise bound <code>η = ${state.eta}</code> (CBD).
              The secret <code>s</code> is hidden in real deployments; shown here so the math is checkable.
              ${noiseOn
                ? "Amber cells are the noise vector <code>e</code> drawn from a centered binomial."
                : "Noise is <strong>off</strong> — the right-hand side is pure linear algebra."}
            </figcaption>
          </figure>

          ${noiseDistHtml()}

          ${outcomeHtml(b)}

          ${state.attack ? attackResultHtml() : ""}

          ${state.exportOpen ? exportHtml(b) : ""}
        </section>
      `;

      // ---- wire-up ----
      const presetBtns = Array.from(host.querySelectorAll(".preset-btn"));
      presetBtns.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-preset");
          if (id === "custom") {
            state.presetId = "custom";
            writePresetToHash();
            render();
          } else {
            setPreset(id);
          }
        });
        // WAI-ARIA Authoring Practices: arrow keys cycle, Home/End jump, the
        // freshly-focused radio is activated, and only the active one stays
        // in the Tab order.
        btn.addEventListener("keydown", e => {
          let next = null;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % presetBtns.length;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + presetBtns.length) % presetBtns.length;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End")  next = presetBtns.length - 1;
          if (next === null) return;
          e.preventDefault();
          presetBtns[next].focus();
          presetBtns[next].click();
        });
      });
      host.querySelectorAll("[data-act]").forEach(btn => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-act");
          if (act === "noise-on")  return setNoise(true);
          if (act === "noise-off") return setNoise(false);
          if (act === "resample")  return resampleNoise();
          if (act === "new")       return freshInstance();
          if (act === "solve")     return tryToSolve();
          if (act === "export")    return toggleExport();
        });
      });
      host.querySelectorAll("[data-custom]").forEach(inp => {
        inp.addEventListener("change", () => {
          const field = inp.getAttribute("data-custom");
          const v = field === "q" ? parseInt(inp.value, 10) : Number(inp.value);
          setCustomParam(field, v);
        });
      });
      const copyBtn = host.querySelector("#lwe-copy");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          const text = host.querySelector("#lwe-export-text").value;
          // Best-effort: clipboard API exists in modern browsers; degrade silently.
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => announce("Instance copied to clipboard."));
          } else {
            host.querySelector("#lwe-export-text").select();
            announce("Select-all done. Press Ctrl+C / Cmd+C to copy.");
          }
        });
      }
    }

    // ---- subviews ----
    function presetHintHtml(id) {
      return `<p class="preset-hint">${escapeHtml(PRESETS[id].hint)}</p>`;
    }
    function customControlsHtml() {
      return `
        <div class="custom-controls" role="group" aria-label="Custom parameters">
          <label class="custom-field">
            <span>n <small>(secret dim.)</small></span>
            <input type="number" data-custom="n" min="2" max="${MAX_N}" value="${state.n}" />
          </label>
          <label class="custom-field">
            <span>m <small>(rows)</small></span>
            <input type="number" data-custom="m" min="${state.n}" max="${MAX_M}" value="${state.m}" />
          </label>
          <label class="custom-field">
            <span>q <small>(prime modulus)</small></span>
            <select data-custom="q">
              ${Q_CHOICES.map(qq => `<option value="${qq}" ${qq === state.q ? "selected" : ""}>${qq}</option>`).join("")}
            </select>
          </label>
          <label class="custom-field">
            <span>η <small>(CBD bound)</small></span>
            <input type="number" data-custom="eta" min="1" max="4" value="${state.eta}" />
          </label>
          <p class="custom-note">
            <strong>Why these limits?</strong> q is restricted to prime values so modular inverses always exist
            (the attack-surface explorer needs them). Sizes are bounded so the grid stays readable in a browser.
          </p>
        </div>
      `;
    }
    function noiseDistHtml() {
      // Compact horizontal sparkbar of the noise vector, with sign + magnitude.
      // Acts as a visual reminder that "noise" means *small* compared to q.
      const { e, m, q, eta, noiseOn } = state;
      const max = Math.max(1, eta);
      const shownVec = e.map(v => (noiseOn ? v : 0));
      const sumAbs = shownVec.reduce((a, v) => a + Math.abs(v), 0);
      const meanAbs = (sumAbs / m).toFixed(2);
      const items = shownVec.map((shown, i) => {
        const sign = shown > 0 ? "pos" : shown < 0 ? "neg" : "zero";
        const pct = Math.round(100 * Math.abs(shown) / max);
        return `
          <li class="noise-bar-item">
            <span class="noise-bar-label" aria-hidden="true">e${subscriptDigits(i + 1)}</span>
            <span class="noise-bar-track" aria-hidden="true">
              <span class="noise-bar-fill noise-bar-${sign}" style="width:${pct}%"></span>
            </span>
            <span class="noise-bar-value">${shown}</span>
          </li>`;
      }).join("");
      // Σ|e_i| total + mean|e_i|/q ratio quantify "small". A ratio of ~0.06 is
      // what makes Gaussian elimination fail on the remaining rows.
      const ratio = (sumAbs / (m * q)).toFixed(3);
      return `
        <div class="noise-dist" aria-label="Noise vector visualization">
          <div class="noise-dist-head">
            <span>Noise vector <code>e</code></span>
            <span class="noise-dist-scale">|e<sub>i</sub>| ≤ η = ${eta} &nbsp;·&nbsp; q = ${q}</span>
          </div>
          <ol class="noise-bar-list">${items}</ol>
          <div class="noise-dist-summary" aria-label="Noise magnitude summary">
            <span><code>Σ|e<sub>i</sub>|</code> = <strong>${sumAbs}</strong></span>
            <span><code>mean |e<sub>i</sub>|</code> = ${meanAbs}</span>
            <span><code>mean |e<sub>i</sub>| / q</code> = ${ratio}</span>
          </div>
        </div>
      `;
    }
    function outcomeHtml(b) {
      const { noiseOn, attack } = state;
      // Two layers of outcome:
      //   1. The intrinsic-shape claim (Hard / Solvable) tied to noise on/off.
      //   2. The empirical-attack claim (Recovered / Wrong) tied to whether
      //      "Try to solve" has been pressed. Both can be shown simultaneously.
      if (!attack) {
        return noiseOn
          ? `<div class="outcome hard" role="status">
               <span class="outcome-icon" aria-hidden="true">!</span>
               <div class="outcome-body">
                 <span class="label">Hard (with noise)</span>
                 The lattice <em>attack</em> — modular Gaussian elimination — does not recover <code>s</code> while noise is present.
                 At this toy scale brute force still wins in milliseconds, so this is a <em>demonstration</em> of structure, not a claim about real-world hardness.
                 Press <strong>Try to solve</strong> to watch the elimination return a wrong candidate.
               </div>
             </div>`
          : `<div class="outcome solvable" role="status">
               <span class="outcome-icon" aria-hidden="true">✓</span>
               <div class="outcome-body">
                 <span class="label">Solvable (no noise)</span>
                 With noise removed, <code>b = A·s</code> is an ordinary linear system over <code>Z_${state.q}</code>.
                 Press <strong>Try to solve</strong> to run Gaussian elimination on the first <code>n = ${state.n}</code> rows and recover the secret.
               </div>
             </div>`;
      }
      return ""; // when attack ran, attackResultHtml() carries the verdict
    }
    function attackResultHtml() {
      const { attack, s, q, n } = state;
      if (attack.error === "singular") {
        return `
          <div class="outcome hard" role="status">
            <span class="outcome-icon" aria-hidden="true">∅</span>
            <div class="outcome-body">
              <span class="label">Elimination failed</span>
              The first <code>n = ${n}</code> rows are linearly dependent modulo <code>q = ${q}</code>. This is rare for random matrices but possible. Press <strong>New instance</strong> to resample <code>A</code>.
            </div>
          </div>`;
      }
      const ok = attack.perRowOk.filter(Boolean).length;
      const total = attack.perRowOk.length;
      const rec = attack.recovered;
      const match = attack.matchesSecret;
      // Per-cell diff: each s' cell that disagrees with s gets a red outline.
      // Makes "how wrong is the recovered candidate" legible at a glance —
      // a single bad cell vs. every cell bad is a meaningful distinction.
      const recCells = rec.map((v, i) =>
        `<span class="vec-cell ${v === s[i] ? "vec-cell-match" : "vec-cell-diff"}" title="${v === s[i] ? "matches" : "differs from"} s[${i}] = ${s[i]}">${v}</span>`
      ).join("<span class=\"vec-sep\">,</span> ");
      const trueCells = s.map(v => `<span class="vec-cell">${v}</span>`).join("<span class=\"vec-sep\">,</span> ");
      const diffCount = rec.reduce((a, v, i) => a + (v === s[i] ? 0 : 1), 0);
      const verifyDetail = attack.perRowOk
        .map((p, i) => `<span class="verify-pill ${p ? "ok" : "fail"}" title="Row ${i + 1}: A_${i+1}·s' ${p ? "≡" : "≢"} b_${i+1} (mod ${q})">${i + 1}</span>`)
        .join("");
      return `
        <div class="attack-result ${match ? "attack-win" : "attack-lose"}" role="status" aria-live="polite">
          <header class="attack-header">
            <span class="attack-label">${match ? "Attack succeeded" : "Attack returned a wrong candidate"}</span>
            <span class="attack-subscript">Gaussian elimination on rows 1..${n} of A · x = b (mod ${q})</span>
          </header>
          <div class="attack-body">
            <div class="attack-row">
              <span class="attack-tag">recovered</span>
              <code class="attack-vector">s′ = [${recCells}]</code>
              ${match
                ? `<span class="diff-badge diff-badge-ok" aria-label="all cells match">all cells match</span>`
                : `<span class="diff-badge diff-badge-bad" aria-label="${diffCount} of ${n} cells differ from the true secret">${diffCount}/${n} cells differ</span>`}
            </div>
            <div class="attack-row">
              <span class="attack-tag">true</span>
              <code class="attack-vector">s &nbsp;= [${trueCells}]</code>
            </div>
            <div class="attack-row attack-row-verify">
              <span class="attack-tag">verify</span>
              <span class="verify-row" aria-label="${ok} of ${total} rows verify the recovered candidate">${verifyDetail}</span>
              <span class="verify-summary">${ok}/${total} rows verify</span>
            </div>
            <p class="attack-explain">
              ${match
                ? `Every row of <code>A</code> agrees with the recovered <code>s′</code>. With noise off, the equation reduces to plain linear algebra and the secret is recovered in time polynomial in <code>n</code>.`
                : `Only the <span class="row-used-dot" aria-hidden="true"></span> first <code>${n}</code> rows are forced to verify (they were used to solve). The remaining rows agree only by coincidence — usually with probability <code>≈ 1/q</code>. The noise vector <code>e</code> shifted those equations off the lattice that ordinary elimination can reach.`
              }
            </p>
          </div>
        </div>
      `;
    }
    function exportHtml(b) {
      const payload = {
        params: { n: state.n, m: state.m, q: state.q, eta: state.eta },
        seed: state.seed,
        A: state.A,
        s: state.s,
        e: state.e,
        b,
        noiseOn: state.noiseOn,
        note: "Generated by sl-atlas (https://systemslibrarian.github.io/structureless-labs/). Toy LWE instance for teaching only."
      };
      const text = JSON.stringify(payload, null, 2);
      return `
        <details class="export-panel" open>
          <summary>Export instance (JSON)</summary>
          <p class="export-note">
            Copy this object to verify the math externally, attempt your own attack, or share a reproducible example. The <code>seed</code> alone is enough to regenerate <code>A</code>, <code>s</code>, and <code>e</code> deterministically.
          </p>
          <textarea id="lwe-export-text" class="export-text" readonly rows="10" spellcheck="false">${escapeHtml(text)}</textarea>
          <button class="btn" type="button" id="lwe-copy">Copy to clipboard</button>
        </details>
      `;
    }

    // ---- small renderers ----
    function equationAriaLabel(b) {
      const { n, m, q, noiseOn } = state;
      const noiseDesc = noiseOn ? "plus a noise vector e drawn from a centered binomial" : "with noise turned off";
      return `LWE equation: matrix A (${m} by ${n}) times secret s, ${noiseDesc}, equals b modulo ${q}. Result b is [${b.join(", ")}].`;
    }
    function matrixHtml(M, label, opts = {}) {
      const rowClasses = opts.rowClasses || [];
      const cols = M[0].length;
      const rows = M.length;
      const cells = M.map((row, i) => {
        const rc = rowClasses[i] || [];
        return row.map(v => `<div class="cell ${rc.join(" ")}">${v}</div>`).join("");
      }).join("");
      return `
        <div>
          <div class="matrix" style="grid-template-columns: repeat(${cols}, auto); grid-template-rows: repeat(${rows}, auto);">
            ${cells}
          </div>
          <span class="label">${escapeHtml(label)}</span>
        </div>`;
    }
    function vectorHtml(v, label, opts = {}) {
      const rowClasses = opts.rowClasses || [];
      const cells = v.map((x, i) => {
        const cls = ["cell"];
        if (opts.noise)             cls.push("noise");
        if (opts.faded && x === 0)  cls.push("zero");
        if (opts.secret)            cls.push("secret");
        if (rowClasses[i])          cls.push(...rowClasses[i]);
        return `<div class="${cls.join(" ")}">${x}</div>`;
      }).join("");
      return `
        <div>
          <div class="vector" style="grid-template-columns: auto; grid-template-rows: repeat(${v.length}, auto);">
            ${cells}
          </div>
          <span class="label">${escapeHtml(label)}</span>
        </div>`;
    }
    function subscriptDigits(n) {
      // Unicode subscript digits so e₁, e₂, … render without external fonts.
      const map = ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"];
      return String(n).split("").map(d => map[+d]).join("");
    }

    // ---- boot the interactive ----
    sampleInstance();
    render();
  }

  // ---------- Encoding interactive (1-D bitwise modular encoder/decoder) ----------
  // The companion to mountLweMatrix. Demonstrates the encoder/decoder pair
  // (E, D) for one bit in Z_q under bitwise-modular encoding — the simplest
  // and most teachable encoding family from the developer view of the
  // Encoding concept. Codewords sit at 0 and q/2; the decoder rounds the
  // received y to the nearest codeword on the Z_q ring; correctness holds
  // exactly when |e| ≤ q/4 (the bit-by-bit decoding radius τ = q/4). The
  // panel exposes a CBD noise distribution (matching the LWE interactive)
  // and computes the exact decryption-failure probability δ = Pr[|e| > τ]
  // from the CBD PMF.
  //
  // Honest non-claims:
  //   - Reed-Muller and Barnes-Wall codes are NOT simulated here; they are
  //     described in the prose so the trade-off is legible without
  //     pretending this demo implements them. See D-0002 (sl-atlas) for
  //     the reasoning behind scoping the live demo to bitwise.
  //   - This is a single 1-D sample. Real KEMs accumulate noise across
  //     n coordinates and across the KEM round; the panel says so.
  function mountEncoding1d(host) {
    const Q_CHOICES = [16, 32, 64];
    const ETA_CHOICES = [1, 2, 3, 4, 5, 6];

    const state = {
      q: 16,
      eta: 2,
      bit: 0,
      seed: 0xE7C0DE,
      e: 0
    };

    // mulberry32 reused; small helper so each interactive is standalone.
    function prngFrom(seed) {
      let a = seed >>> 0;
      return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function sampleCBD(prng, eta) {
      let a = 0, b = 0;
      for (let i = 0; i < eta; i++) { if (prng() < 0.5) a++; if (prng() < 0.5) b++; }
      return a - b;
    }
    function modq(x, q) { return ((x % q) + q) % q; }

    // Exact CBD PMF on the integer support [-η, η].
    // Pr[X = k] = Σ_{a = max(0,k)}^{min(η, η+k)} C(η,a) * C(η, a-k) / 4^η.
    // Returned as { -η: p, ..., η: p } with floating-point values summing to 1.
    function cbdPmf(eta) {
      const binom = [];
      for (let n = 0; n <= eta; n++) {
        binom[n] = [];
        for (let k = 0; k <= n; k++) {
          if (k === 0 || k === n) binom[n][k] = 1;
          else binom[n][k] = binom[n - 1][k - 1] + binom[n - 1][k];
        }
      }
      const denom = Math.pow(4, eta);
      const pmf = {};
      for (let k = -eta; k <= eta; k++) {
        let s = 0;
        const aMin = Math.max(0, k);
        const aMax = Math.min(eta, eta + k);
        for (let a = aMin; a <= aMax; a++) {
          s += binom[eta][a] * binom[eta][a - k];
        }
        pmf[k] = s / denom;
      }
      return pmf;
    }

    function decryptionFailureProb(eta, q) {
      // τ = q/4 (bit-by-bit decoding radius). Failure iff |e| > τ.
      // For integer e, that's |e| ≥ floor(q/4) + 1 when q/4 is integer; we
      // use the symmetric integer condition |e| > q/4 with strict inequality.
      const pmf = cbdPmf(eta);
      const tau = q / 4;
      let p = 0;
      for (const k of Object.keys(pmf)) {
        if (Math.abs(Number(k)) > tau) p += pmf[k];
      }
      return p;
    }

    function encode(bit, q) { return bit === 0 ? 0 : Math.floor(q / 2); }
    function decode(y, q) {
      // Nearest codeword on the Z_q ring among {0, q/2}.
      const c0 = 0, c1 = Math.floor(q / 2);
      const ringDist = (a, b) => {
        const d = Math.abs(modq(a - b, q));
        return Math.min(d, q - d);
      };
      return ringDist(y, c1) < ringDist(y, c0) ? 1 : 0;
    }

    function newNoise() {
      const prng = prngFrom(state.seed);
      // Discard a few draws so adjacent seeds give visibly different e.
      prng(); prng(); prng();
      state.e = sampleCBD(prng, state.eta);
    }

    function setQ(q) {
      if (!Q_CHOICES.includes(q)) return;
      state.q = q;
      newNoise();
      render();
      announce(`Modulus q set to ${q}. Decoding radius τ = q/4 = ${q / 4}.`);
    }
    function setEta(eta) {
      if (!ETA_CHOICES.includes(eta)) return;
      state.eta = eta;
      newNoise();
      render();
      announce(`Noise bound η set to ${eta}.`);
    }
    function setBit(b) {
      if (state.bit === b) return;
      state.bit = b;
      render();
      announce(`Encoding bit ${b}. Codeword is ${encode(b, state.q)} on Z_${state.q}.`);
    }
    function resample() {
      state.seed = (state.seed + 1) >>> 0;
      newNoise();
      render();
      announce(`Resampled noise: e = ${state.e}.`);
    }

    function render() {
      const { q, eta, bit, e } = state;
      const c0 = encode(0, q), c1 = encode(1, q);
      const codeword = bit === 0 ? c0 : c1;
      const y = modq(codeword + e, q);
      const decoded = decode(y, q);
      const correct = decoded === bit;
      const tau = q / 4;
      const delta = decryptionFailureProb(eta, q);
      const pmf = cbdPmf(eta);

      host.innerHTML = `
        <section class="interactive enc-interactive" aria-labelledby="enc-title">
          <div class="interactive-header">
            <h2 class="interactive-title" id="enc-title">
              Bitwise modular encoding, live
              <span class="pill" aria-hidden="true">interactive</span>
            </h2>
          </div>

          <p class="enc-lead">
            Encode one bit into <code>Z<sub>${q}</sub></code> by placing it at <code>0</code> or <code>q/2 = ${c1}</code>. Add noise <code>e</code>. The decoder rounds the received <code>y</code> to the nearest codeword on the ring. Correctness holds exactly when <code>|e| ≤ τ = q/4 = ${tau}</code> — the bit-by-bit decoding radius.
          </p>

          <div class="enc-controls" role="group" aria-label="Encoding parameters">
            <fieldset class="enc-control-group">
              <legend>Bit</legend>
              <div class="enc-segmented" role="radiogroup" aria-label="Bit to encode">
                <button class="preset-btn" type="button" role="radio"
                        aria-checked="${bit === 0}" tabindex="${bit === 0 ? "0" : "-1"}"
                        data-enc-bit="0">0</button>
                <button class="preset-btn" type="button" role="radio"
                        aria-checked="${bit === 1}" tabindex="${bit === 1 ? "0" : "-1"}"
                        data-enc-bit="1">1</button>
              </div>
            </fieldset>
            <fieldset class="enc-control-group">
              <legend>q (modulus)</legend>
              <div class="enc-segmented" role="radiogroup" aria-label="Modulus q">
                ${Q_CHOICES.map(qq => `
                  <button class="preset-btn" type="button" role="radio"
                          aria-checked="${qq === q}" tabindex="${qq === q ? "0" : "-1"}"
                          data-enc-q="${qq}">${qq}</button>`).join("")}
              </div>
            </fieldset>
            <fieldset class="enc-control-group">
              <legend>η (CBD bound)</legend>
              <div class="enc-segmented" role="radiogroup" aria-label="Noise bound eta">
                ${ETA_CHOICES.map(ee => `
                  <button class="preset-btn" type="button" role="radio"
                          aria-checked="${ee === eta}" tabindex="${ee === eta ? "0" : "-1"}"
                          data-enc-eta="${ee}">${ee}</button>`).join("")}
              </div>
            </fieldset>
            <button class="btn" type="button" data-enc-act="resample">Draw fresh <span aria-hidden="true">e</span><span class="visually-hidden">noise</span></button>
          </div>

          ${ringHtml({ q, c0, c1, y, tau, e })}

          <div class="enc-outcome ${correct ? "enc-ok" : "enc-bad"}" role="status" aria-live="polite">
            <div class="enc-outcome-line">
              <span class="enc-tag">encoded</span>
              <code>E(${bit}) = ${codeword}</code>
            </div>
            <div class="enc-outcome-line">
              <span class="enc-tag">noise</span>
              <code>e = ${e >= 0 ? "+" + e : e}</code>
              <span class="enc-tag-sub">|e| ${Math.abs(e) > tau ? "&gt;" : "≤"} τ = ${tau}</span>
            </div>
            <div class="enc-outcome-line">
              <span class="enc-tag">received</span>
              <code>y = E(b) + e = ${y} (mod ${q})</code>
            </div>
            <div class="enc-outcome-line">
              <span class="enc-tag">decoded</span>
              <code>D(y) = ${decoded}</code>
              <span class="enc-verdict ${correct ? "enc-verdict-ok" : "enc-verdict-bad"}">
                ${correct ? "✓ correct" : "✗ wrong — decryption failure"}
              </span>
            </div>
          </div>

          ${deltaPanelHtml({ q, eta, tau, delta, pmf })}

          <div class="enc-non-claim" role="note">
            <strong>What this does <em>not</em> simulate.</strong>
            Reed-Muller and Barnes-Wall (<code>BW<sub>2<sup>k</sup></sub></code>) lattice codes — the families that drive every modern KEM's encoder choice — are <strong>not</strong> implemented in this demo. They raise the decoding radius τ per dimension by using <em>n &gt; 1</em> coordinates jointly, which is fundamentally a higher-dimensional construction and would not fit a 1-D ring. The trade-off is real and is explained at all three depths in the prose above; pretending to simulate it here would mislead more than it teaches. See <a href="../../sl-atlas/decisions/D-0002.md" target="_blank" rel="noopener">D-0002 (sl-atlas)</a> for the scoping reasoning.
          </div>
        </section>
      `;

      // wiring
      const wireRadio = (selector, attr, fn) => {
        const btns = Array.from(host.querySelectorAll(selector));
        btns.forEach((btn, idx) => {
          btn.addEventListener("click", () => fn(btn.getAttribute(attr)));
          btn.addEventListener("keydown", ev => {
            let next = null;
            if (ev.key === "ArrowRight" || ev.key === "ArrowDown") next = (idx + 1) % btns.length;
            else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") next = (idx - 1 + btns.length) % btns.length;
            else if (ev.key === "Home") next = 0;
            else if (ev.key === "End")  next = btns.length - 1;
            if (next === null) return;
            ev.preventDefault();
            btns[next].focus();
            btns[next].click();
          });
        });
      };
      wireRadio("[data-enc-bit]", "data-enc-bit", v => setBit(parseInt(v, 10)));
      wireRadio("[data-enc-q]",   "data-enc-q",   v => setQ(parseInt(v, 10)));
      wireRadio("[data-enc-eta]", "data-enc-eta", v => setEta(parseInt(v, 10)));
      host.querySelectorAll("[data-enc-act='resample']").forEach(b =>
        b.addEventListener("click", resample));
    }

    // ---- the Z_q ring (rendered as a wrap-around horizontal bar) ----
    function ringHtml({ q, c0, c1, y, tau, e }) {
      // Compute decoding regions on the ring: cells within τ of c0 → "0",
      // cells within τ of c1 → "1", cells exactly at τ (boundary) get the
      // boundary class. We treat the bar as cyclic with q cells.
      const ringDist = (a, b) => {
        const d = Math.abs(((a - b) % q + q) % q);
        return Math.min(d, q - d);
      };
      const cells = [];
      for (let i = 0; i < q; i++) {
        const d0 = ringDist(i, c0), d1 = ringDist(i, c1);
        const cls = ["enc-cell"];
        if (d0 < d1) cls.push("region-0");
        else if (d1 < d0) cls.push("region-1");
        else cls.push("region-tie");
        if (i === c0) cls.push("code-0");
        if (i === c1) cls.push("code-1");
        if (i === y) cls.push("received");
        // boundary: cells at exactly distance τ from a codeword
        if (d0 === tau || d1 === tau) cls.push("region-edge");
        cells.push(`<div class="${cls.join(" ")}" title="${i}: dist(0)=${d0}, dist(${c1})=${d1}"><span>${i}</span></div>`);
      }
      return `
        <figure class="enc-ring-figure" aria-label="Z_${q} ring with codewords, decoding regions, and received y">
          <div class="enc-ring" style="grid-template-columns: repeat(${q}, minmax(0,1fr));">
            ${cells.join("")}
          </div>
          <figcaption class="enc-ring-caption">
            <span class="legend-chip legend-region-0"></span> decoding region for bit 0
            <span class="legend-chip legend-region-1"></span> decoding region for bit 1
            <span class="legend-chip legend-code"></span> codeword
            <span class="legend-chip legend-received"></span> received <code>y</code> (after noise <code>e = ${e}</code>)
          </figcaption>
        </figure>
      `;
    }

    // ---- decryption-failure panel ----
    function deltaPanelHtml({ q, eta, tau, delta, pmf }) {
      // Render the CBD PMF as a sparkbar. Bars outside ±τ are colored as
      // the failure mass so the δ number is visually grounded.
      const maxP = Math.max(...Object.values(pmf));
      const bars = [];
      for (let k = -eta; k <= eta; k++) {
        const p = pmf[k];
        const h = Math.round(100 * p / maxP);
        const outside = Math.abs(k) > tau;
        bars.push(`
          <div class="pmf-bar-col" title="Pr[e = ${k}] = ${(p * 100).toFixed(3)}%${outside ? " (failure mass)" : ""}">
            <div class="pmf-bar ${outside ? "pmf-bar-fail" : "pmf-bar-ok"}" style="height:${h}%"></div>
            <span class="pmf-bar-k">${k > 0 ? "+" + k : k}</span>
          </div>`);
      }
      const deltaPct = (delta * 100).toFixed(4);
      const isSafe = delta === 0;
      return `
        <div class="delta-panel ${isSafe ? "delta-safe" : "delta-unsafe"}">
          <div class="delta-head">
            <div>
              <span class="delta-label">decryption failure probability</span>
              <code class="delta-formula">δ = Pr[|e| &gt; τ] = ${deltaPct}%</code>
            </div>
            <div class="delta-verdict">
              ${isSafe
                ? `<span class="delta-pill delta-pill-ok">η ≤ τ → δ = 0</span>`
                : `<span class="delta-pill delta-pill-bad">η &gt; τ → δ &gt; 0</span>`}
            </div>
          </div>
          <div class="pmf-strip" role="img"
               aria-label="CBD probability mass function for η=${eta}; bars outside ±${tau} contribute to δ.">
            ${bars.join("")}
          </div>
          <p class="delta-explain">
            ${isSafe
              ? `With <code>η ≤ τ</code>, the entire CBD support lies inside the safe band. No realization of <code>e</code> can cross a decoding boundary, so a single-coordinate bitwise scheme decodes <strong>without error</strong>.`
              : `With <code>η &gt; τ</code>, the CBD has mass outside the safe band. A fraction <code>δ ≈ ${deltaPct}%</code> of realizations decode to the wrong bit. In a real KEM you would either lower <code>η</code>, raise <code>q</code>, or switch to a denser code with a different recovery property.`}
            Real KEMs accumulate noise across <code>n</code> coordinates and across the KEM round (key + ciphertext noise), so the operational <code>δ</code> is larger than this single-sample figure — see <a href="#/noise">Noise</a> and the discussion in <a href="#/parameter-choices">Parameter choices</a>.
          </p>
        </div>
      `;
    }

    newNoise();
    render();
  }

  // ---- interactive dispatch table ----
  // Maps the `interactive` field on a concept to its mount function. Adding a
  // new interactive is one line here plus the concept's metadata.
  const INTERACTIVES = {
    "lwe-matrix":   mountLweMatrix,
    "encoding-1d":  mountEncoding1d
  };

  // ---------- state setters ----------
  function setConcept(id, opts = {}) {
    const target = CONCEPTS_BY_ID[id] || BLOCKED_BY_ID[id];
    if (!target) return;
    const prev = state.conceptId;
    state.conceptId = id;
    writeHash();
    renderSidebar();
    renderConcept();
    if (opts.fromUser) {
      conceptViewEl.focus({ preventScroll: true });
      const announcement = BLOCKED_BY_ID[id]
        ? `${target.title}. Blocked by Teacher review.`
        : `${target.title}. ${stateAnnouncement()}`;
      announce(announcement);
    }
    if (prev !== id && window.matchMedia("(max-width: 880px)").matches) {
      conceptViewEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function setView(view) {
    if (!VIEWS.find(v => v.id === view)) return;
    if (state.view === view && !state.compare) return;
    state.view = view;
    state.compare = false;
    writeHash();
    renderConcept();
    announce(`${labelForView(view)} view.`);
  }
  function setCompare(on) {
    if (state.compare === !!on) return;
    state.compare = !!on;
    writeHash();
    renderConcept();
    announce(state.compare ? "Compare view: all three depths." : `${labelForView(state.view)} view.`);
  }
  function labelForView(v) {
    const found = VIEWS.find(x => x.id === v);
    return found ? found.label : v;
  }
  function stateAnnouncement() {
    return state.compare ? "Compare view." : `${labelForView(state.view)} view.`;
  }

  // ---------- keyboard ----------
  document.addEventListener("keydown", e => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // Ignore keys when focus is inside a tab (its own arrow keys handle navigation)
    if (t && t.closest && t.closest('[role="tablist"]')) {
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)) return;
    }

    if (e.key === "1") { e.preventDefault(); return setView("simple"); }
    if (e.key === "2") { e.preventDefault(); return setView("developer"); }
    if (e.key === "3") { e.preventDefault(); return setView("researcher"); }
    if (e.key.toLowerCase() === "c") { e.preventDefault(); return setCompare(!state.compare); }
    if (e.key.toLowerCase() === "t") { e.preventDefault(); return toggleTheme(); }

    if (e.key.toLowerCase() === "j") {
      e.preventDefault();
      const idx = CONCEPTS.findIndex(c => c.id === state.conceptId);
      const next = CONCEPTS[(idx + 1) % CONCEPTS.length];
      return setConcept(next.id, { fromUser: true });
    }
    if (e.key.toLowerCase() === "k") {
      e.preventDefault();
      const idx = CONCEPTS.findIndex(c => c.id === state.conceptId);
      const prev = CONCEPTS[(idx - 1 + CONCEPTS.length) % CONCEPTS.length];
      return setConcept(prev.id, { fromUser: true });
    }
  });

  // ---------- boot ----------
  window.addEventListener("hashchange", () => {
    applyHash();
    renderSidebar();
    renderConcept();
  });

  function boot() {
    initTheme();
    applyHash();
    renderSidebar();
    renderConcept();
    if (!window.location.hash) writeHash();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
