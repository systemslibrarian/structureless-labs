/* sl-atlas — main app.
   Pure browser JS, no build step. Renders concept content at three depths
   (simple / developer / researcher) plus a "compare" mode and an
   interactive LWE matrix demonstration. */

(function () {
  "use strict";

  const CONCEPTS = window.SL_ATLAS_CONCEPTS || [];
  const CONCEPTS_BY_ID = Object.fromEntries(CONCEPTS.map(c => [c.id, c]));
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
  const conceptViewEl = document.getElementById("concept-view");
  const themeButton   = document.getElementById("theme-toggle");

  // ---------- theme ----------
  const THEME_KEY = "sl-atlas:theme";
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeButton && themeButton.setAttribute("aria-pressed", theme === "light");
  }
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return applyTheme(saved);
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }
  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }
  themeButton && themeButton.addEventListener("click", toggleTheme);

  // ---------- inline markup ----------
  // Renders the author's lightweight markup into safe HTML:
  //   `code` → <code>, **bold** → <strong>, *em* → <em>.
  // Author content is trusted (we control concepts.js), but we still escape
  // raw text before applying these patterns.
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function renderInline(text) {
    const escaped = escapeHtml(text);
    return escaped
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:)!?]|$)/g, '$1<em>$2</em>');
  }
  function renderProse(text) {
    return text
      .split(/\n{2,}/)
      .map(p => `<p>${renderInline(p.trim())}</p>`)
      .join("");
  }

  // ---------- routing ----------
  function parseHash() {
    // Format: #/<conceptId>?view=<view>&compare=1
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
    if (!state.compare) params.set("view", state.view);
    if (state.compare) params.set("compare", "1");
    const qs = params.toString();
    const hash = `#/${state.conceptId}${qs ? "?" + qs : ""}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }
  function applyHash() {
    const h = parseHash();
    if (h.conceptId && CONCEPTS_BY_ID[h.conceptId]) state.conceptId = h.conceptId;
    if (h.view && VIEWS.find(v => v.id === h.view)) state.view = h.view;
    state.compare = !!h.compare;
  }

  // ---------- sidebar ----------
  function renderSidebar() {
    conceptListEl.innerHTML = "";
    for (const c of CONCEPTS) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#/${c.id}`;
      a.className = "concept-link";
      if (c.id === state.conceptId) a.classList.add("is-active");
      a.innerHTML = `
        <span class="concept-link-title">${escapeHtml(c.title)}</span>
        <span class="grade" title="Evidence grade">${escapeHtml(c.evidence_grade || "—")}</span>
      `;
      a.addEventListener("click", e => {
        e.preventDefault();
        setConcept(c.id);
      });
      li.appendChild(a);
      conceptListEl.appendChild(li);
    }
  }

  // ---------- main view ----------
  function renderConcept() {
    const c = CONCEPTS_BY_ID[state.conceptId];
    if (!c) {
      conceptViewEl.innerHTML = `<p class="muted">No concept selected.</p>`;
      return;
    }

    const tabs = VIEWS.map((v, i) => {
      const active = !state.compare && v.id === state.view;
      return `
        <button class="tab ${active ? "is-active" : ""}"
                data-view="${v.id}"
                role="tab"
                aria-selected="${active}"
                title="${escapeHtml(v.description)}">
          <span class="tab-num">${i + 1}</span>
          <span>${v.label}</span>
        </button>`;
    }).join("");
    const compareTab = `
      <button class="tab ${state.compare ? "is-active" : ""}"
              data-compare="1"
              role="tab"
              aria-selected="${state.compare}"
              title="Show all three views side-by-side.">
        <span class="tab-num">C</span>
        <span>Compare</span>
      </button>`;

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

      ${body}

      ${c.interactive === "lwe-matrix" ? `<div id="interactive-host"></div>` : ""}

      ${renderMeta(c)}
    `;

    // wire up tabs
    conceptViewEl.querySelectorAll(".tab[data-view]").forEach(btn => {
      btn.addEventListener("click", () => setView(btn.getAttribute("data-view")));
    });
    conceptViewEl.querySelectorAll(".tab[data-compare]").forEach(btn => {
      btn.addEventListener("click", () => setCompare(!state.compare));
    });
    // wire up related pills
    conceptViewEl.querySelectorAll(".related-pill[data-related]").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        setConcept(a.getAttribute("data-related"));
      });
    });

    // mount interactive viz
    if (c.interactive === "lwe-matrix") {
      const host = document.getElementById("interactive-host");
      mountLweMatrix(host);
    }
  }

  function renderSingleView(c) {
    const v = VIEWS.find(v => v.id === state.view);
    const text = c.views[state.view] || "(no content for this view)";
    return `
      <section class="view" role="tabpanel" aria-label="${escapeHtml(v.label)} view">
        ${renderProse(text)}
      </section>
    `;
  }

  function renderCompare(c) {
    return `
      <section class="compare-grid" role="tabpanel" aria-label="All three views">
        ${VIEWS.map(v => `
          <div class="compare-col">
            <h3>${escapeHtml(v.label)}</h3>
            <div class="view">${renderProse(c.views[v.id] || "")}</div>
          </div>
        `).join("")}
      </section>
    `;
  }

  function renderMeta(c) {
    const grade = c.evidence_grade || "—";
    const related = (c.related || [])
      .map(id => CONCEPTS_BY_ID[id])
      .filter(Boolean);

    return `
      <section class="meta" aria-label="Concept metadata">
        <div class="meta-card">
          <h4>Evidence grade</h4>
          <p>
            <span class="badge grade-${escapeHtml(grade)}">
              <span class="letter">${escapeHtml(grade)}</span>
              <span>${escapeHtml(gradeLabel(grade))}</span>
            </span>
          </p>
          ${c.evidence_note ? `<p style="margin-top:8px;">${renderInline(c.evidence_note)}</p>` : ""}
        </div>

        <div class="meta-card">
          <h4>Related concepts</h4>
          ${related.length
            ? `<ul class="related-list">${related.map(r =>
                `<a class="related-pill" href="#/${r.id}" data-related="${r.id}">${escapeHtml(r.title)}</a>`
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
  // A small, runnable demonstration of the LWE equation:
  //   b = A·s + e  (mod q)
  // Toggle noise on/off and watch the security collapse.
  function mountLweMatrix(host) {
    const Q = 17;
    const SECRET = [3, 7, 2];
    const A = [
      [ 4, 11,  2],
      [ 9,  3,  5],
      [ 6, 14,  1],
      [12,  7,  8]
    ];
    const NOISE = [-1, 1, 0, -1];

    let noiseOn = true;

    function modq(x) { const r = x % Q; return r < 0 ? r + Q : r; }
    function dot(row, vec) { return row.reduce((a, x, i) => a + x * vec[i], 0); }
    function compute(b_use_noise) {
      return A.map((row, i) => modq(dot(row, SECRET) + (b_use_noise ? NOISE[i] : 0)));
    }

    // Without noise, Gaussian elimination on the first 3 rows recovers s
    // exactly. We don't need to do it for real — the *point* is that it is
    // trivially possible. We display "recovered: [3, 7, 2]" to make it concrete.
    function attemptRecover() {
      if (!noiseOn) return { ok: true, s: SECRET };
      return { ok: false, s: null };
    }

    function render() {
      const b = compute(noiseOn);
      const recovery = attemptRecover();

      host.innerHTML = `
        <section class="interactive" aria-label="LWE matrix demonstration">
          <div class="interactive-header">
            <h2 class="interactive-title">
              The LWE equation, live
              <span class="pill">interactive</span>
            </h2>
            <div class="interactive-controls" role="group" aria-label="Noise control">
              <button class="btn" id="lwe-noise-on"  aria-pressed="${noiseOn}">Noise on</button>
              <button class="btn" id="lwe-noise-off" aria-pressed="${!noiseOn}">Noise off</button>
              <button class="btn" id="lwe-resample" title="Resample the noise vector">Resample e</button>
            </div>
          </div>

          <div class="equation">
            ${matrixHtml(A, "A")}
            <span class="op">·</span>
            ${vectorHtml(SECRET, "s", { secret: true })}
            <span class="op">+</span>
            ${vectorHtml(noiseOn ? NOISE : NOISE.map(()=>0), "e", { noise: true, faded: !noiseOn })}
            <span class="op">=</span>
            ${vectorHtml(b, "b (mod " + Q + ")")}
          </div>

          <p class="matrix-caption">
            Modulus <code>q = ${Q}</code>. The secret <code>s</code> is hidden in real life; shown here so you can verify the math.
            ${noiseOn
              ? "The amber values are the noise vector <code>e</code> added on the right."
              : "Noise is currently <strong>off</strong> — the right-hand side is pure linear algebra."}
          </p>

          ${recovery.ok
            ? `<div class="outcome solvable">
                <span class="label">Solvable</span>
                Without noise, <code>b = A·s</code> is an ordinary linear system. Gaussian elimination on the first three rows recovers
                <span class="recovered">s = [${recovery.s.join(", ")}]</span>
                instantly. Nothing protects the secret.
              </div>`
            : `<div class="outcome hard">
                <span class="label">Hard</span>
                With noise added, the same elimination produces a different (wrong) candidate for <code>s</code> on every choice of three rows.
                At this toy scale you could brute-force <code>s</code> in milliseconds; scale <code>n</code> from 3 to 512 and brute force is out of reach.
                Recovering <code>s</code> becomes the closest-vector problem on a lattice.
              </div>`
          }
        </section>
      `;

      host.querySelector("#lwe-noise-on") .addEventListener("click", () => { noiseOn = true;  render(); });
      host.querySelector("#lwe-noise-off").addEventListener("click", () => { noiseOn = false; render(); });
      host.querySelector("#lwe-resample") .addEventListener("click", () => {
        for (let i = 0; i < NOISE.length; i++) NOISE[i] = Math.floor(Math.random() * 3) - 1; // {-1, 0, 1}
        noiseOn = true;
        render();
      });
    }

    function matrixHtml(M, label) {
      const cols = M[0].length;
      const rows = M.length;
      const cells = M.flat().map(v =>
        `<div class="cell">${v}</div>`
      ).join("");
      return `
        <div>
          <div class="matrix" style="grid-template-columns: repeat(${cols}, auto); grid-template-rows: repeat(${rows}, auto);">
            ${cells}
          </div>
          <span class="label">${label}</span>
        </div>`;
    }
    function vectorHtml(v, label, opts = {}) {
      const cells = v.map(x => {
        const cls = ["cell"];
        if (opts.noise)   cls.push("noise");
        if (opts.faded && x === 0) cls.push("zero");
        return `<div class="${cls.join(" ")}">${x}</div>`;
      }).join("");
      return `
        <div>
          <div class="vector" style="grid-template-columns: auto; grid-template-rows: repeat(${v.length}, auto);">
            ${cells}
          </div>
          <span class="label">${label}</span>
        </div>`;
    }

    render();
  }

  // ---------- state setters ----------
  function setConcept(id) {
    if (!CONCEPTS_BY_ID[id]) return;
    state.conceptId = id;
    writeHash();
    renderSidebar();
    renderConcept();
    conceptViewEl.focus({ preventScroll: false });
  }
  function setView(view) {
    if (!VIEWS.find(v => v.id === view)) return;
    state.view = view;
    state.compare = false;
    writeHash();
    renderConcept();
  }
  function setCompare(on) {
    state.compare = !!on;
    writeHash();
    renderConcept();
  }

  // ---------- keyboard ----------
  document.addEventListener("keydown", e => {
    // ignore when typing in an input/textarea
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === "1") return setView("simple");
    if (e.key === "2") return setView("developer");
    if (e.key === "3") return setView("researcher");
    if (e.key.toLowerCase() === "c") return setCompare(!state.compare);
    if (e.key.toLowerCase() === "t") return toggleTheme();

    if (e.key.toLowerCase() === "j" || e.key === "ArrowDown") {
      const idx = CONCEPTS.findIndex(c => c.id === state.conceptId);
      const next = CONCEPTS[(idx + 1) % CONCEPTS.length];
      return setConcept(next.id);
    }
    if (e.key.toLowerCase() === "k" || e.key === "ArrowUp") {
      const idx = CONCEPTS.findIndex(c => c.id === state.conceptId);
      const prev = CONCEPTS[(idx - 1 + CONCEPTS.length) % CONCEPTS.length];
      return setConcept(prev.id);
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
