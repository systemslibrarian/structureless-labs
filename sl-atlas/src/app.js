/* sl-atlas — main app.
   Pure browser JS, no build step. Renders concept content at three depths
   (simple / developer / researcher) plus a "compare" mode and an
   interactive LWE matrix demonstration. WCAG-AA accessible. */

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
  }

  // ---------- main view ----------
  function renderConcept() {
    const c = CONCEPTS_BY_ID[state.conceptId];
    if (!c) {
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

      ${c.interactive === "lwe-matrix" ? `<div id="interactive-host"></div>` : ""}

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

    // mount interactive viz
    if (c.interactive === "lwe-matrix") {
      mountLweMatrix(document.getElementById("interactive-host"));
    }
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
    let NOISE = [-1, 1, 0, -1];
    let noiseOn = true;

    function modq(x) { const r = x % Q; return r < 0 ? r + Q : r; }
    function dot(row, vec) { return row.reduce((a, x, i) => a + x * vec[i], 0); }
    function compute(useNoise) {
      return A.map((row, i) => modq(dot(row, SECRET) + (useNoise ? NOISE[i] : 0)));
    }
    function resampleNoise() {
      let total;
      // Avoid the degenerate all-zero draw, which visually mimics noise-off.
      do {
        NOISE = NOISE.map(() => Math.floor(Math.random() * 3) - 1); // {-1, 0, 1}
        total = NOISE.reduce((a, n) => a + Math.abs(n), 0);
      } while (total === 0);
    }

    function render() {
      const b = compute(noiseOn);
      const recoveryOk = !noiseOn;

      host.innerHTML = `
        <section class="interactive" aria-labelledby="lwe-title">
          <div class="interactive-header">
            <h2 class="interactive-title" id="lwe-title">
              The LWE equation, live
              <span class="pill" aria-hidden="true">interactive</span>
            </h2>
            <div class="interactive-controls" role="group" aria-label="Noise control">
              <button class="btn" id="lwe-noise-on"  type="button" aria-pressed="${noiseOn}">Noise on</button>
              <button class="btn" id="lwe-noise-off" type="button" aria-pressed="${!noiseOn}">Noise off</button>
              <button class="btn" id="lwe-resample" type="button" title="Resample the noise vector">Resample <span aria-hidden="true">e</span><span class="visually-hidden"> the noise vector</span></button>
            </div>
          </div>

          <figure class="equation-figure">
            <div class="equation-scroll">
              <div class="equation" role="img" aria-label="${equationAriaLabel(b)}">
                ${matrixHtml(A, "A")}
                <span class="op" aria-hidden="true">·</span>
                ${vectorHtml(SECRET, "s")}
                <span class="op" aria-hidden="true">+</span>
                ${vectorHtml(noiseOn ? NOISE : NOISE.map(()=>0), "e", { noise: true, faded: !noiseOn })}
                <span class="op" aria-hidden="true">=</span>
                ${vectorHtml(b, "b (mod " + Q + ")")}
              </div>
            </div>
            <figcaption class="matrix-caption">
              Modulus <code>q = ${Q}</code>. The secret <code>s</code> is hidden in real life; shown here so you can verify the math.
              ${noiseOn
                ? "The amber values are the noise vector <code>e</code> added on the right."
                : "Noise is currently <strong>off</strong> — the right-hand side is pure linear algebra."}
            </figcaption>
          </figure>

          ${recoveryOk
            ? `<div class="outcome solvable" role="status">
                <span class="outcome-icon" aria-hidden="true">✓</span>
                <div class="outcome-body">
                  <span class="label">Solvable</span>
                  Without noise, <code>b = A·s</code> is an ordinary linear system. Gaussian elimination on the first three rows recovers
                  <span class="recovered">s = [${SECRET.join(", ")}]</span>
                  instantly. Nothing protects the secret.
                </div>
              </div>`
            : `<div class="outcome hard" role="status">
                <span class="outcome-icon" aria-hidden="true">!</span>
                <div class="outcome-body">
                  <span class="label">Hard</span>
                  With noise added, the same elimination produces a different (wrong) candidate for <code>s</code> on every choice of three rows.
                  At this toy scale you could brute-force <code>s</code> in milliseconds; scale <code>n</code> from 3 to 512 and brute force is out of reach.
                  Recovering <code>s</code> becomes the closest-vector problem on a lattice.
                </div>
              </div>`
          }
        </section>
      `;

      host.querySelector("#lwe-noise-on") .addEventListener("click", () => { if (!noiseOn)  { noiseOn = true;  render(); announce("Noise on. The equation is now hard."); } });
      host.querySelector("#lwe-noise-off").addEventListener("click", () => { if ( noiseOn) { noiseOn = false; render(); announce("Noise off. The equation is solvable."); } });
      host.querySelector("#lwe-resample") .addEventListener("click", () => {
        resampleNoise();
        if (!noiseOn) noiseOn = true;
        render();
        announce("Noise vector resampled.");
      });
    }

    function equationAriaLabel(b) {
      // A short, screen-reader-friendly summary of the equation.
      const noiseDesc = noiseOn ? "plus noise vector e" : "with noise turned off";
      return `Equation: A times s ${noiseDesc} equals b modulo ${Q}. Result b is [${b.join(", ")}].`;
    }

    function matrixHtml(M, label) {
      const cols = M[0].length;
      const rows = M.length;
      const cells = M.flat().map(v => `<div class="cell">${v}</div>`).join("");
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
        if (opts.noise)             cls.push("noise");
        if (opts.faded && x === 0)  cls.push("zero");
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
  function setConcept(id, opts = {}) {
    if (!CONCEPTS_BY_ID[id]) return;
    const prev = state.conceptId;
    state.conceptId = id;
    writeHash();
    renderSidebar();
    renderConcept();
    if (opts.fromUser) {
      conceptViewEl.focus({ preventScroll: true });
      announce(`${CONCEPTS_BY_ID[id].title}. ${stateAnnouncement()}`);
    }
    if (prev !== id && window.matchMedia("(max-width: 880px)").matches) {
      // On mobile, scroll the article into view so the user sees content after tapping a chip.
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
