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
  const GLOSSARY = window.SL_ATLAS_GLOSSARY || [];
  // Special non-concept pages addressable via the hash router.
  const GLOSSARY_PAGE = "glossary";
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
  //   `code` → <code>, **bold** → <strong>, *em* → <em>,
  //   [text](href) → <a> for internal (#/…), relative (../…) and https? targets.
  // Author content is trusted (we control concepts.js), but we still escape
  // raw text before applying these patterns, and hrefs outside the three safe
  // shapes are left as literal text.
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
      .replace(/(^|[\s(\[])\*([^*\n]+)\*(?=[\s.,;:)\]!?]|$)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
        if (/^#\//.test(href)) return `<a href="${href}">${label}</a>`;
        if (/^(https?:\/\/|\.\.\/)/.test(href)) return `<a href="${href}" target="_blank" rel="noopener">${label}</a>`;
        return m; // unknown href shape: leave as literal text
      });
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
    if (state.conceptId === GLOSSARY_PAGE) {
      const hash = `#/${GLOSSARY_PAGE}`;
      if (window.location.hash !== hash) history.replaceState(null, "", hash);
      return;
    }
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
    if (h.conceptId && (CONCEPTS_BY_ID[h.conceptId] || BLOCKED_BY_ID[h.conceptId] || h.conceptId === GLOSSARY_PAGE)) {
      state.conceptId = h.conceptId;
    }
    if (h.view && VIEWS.find(v => v.id === h.view)) state.view = h.view;
    state.compare = !!h.compare;
  }

  // ---------- search ----------
  // Client-side full-text search over concept titles, prose (all three views),
  // and glossary terms. The whole corpus is already in memory (zero-build site),
  // so the "index" is just a lowercased concatenation per concept.
  const searchInputEl   = document.getElementById("atlas-search");
  const searchResultsEl = document.getElementById("search-results");
  const sidebarSectionsEl = document.getElementById("sidebar-sections");
  const SEARCH_INDEX = CONCEPTS.map(c => ({
    id: c.id,
    title: c.title,
    haystack: [
      c.title, c.subtitle || "",
      c.views.simple || "", c.views.developer || "", c.views.researcher || ""
    ].join("\n").toLowerCase(),
    display: [c.views.simple || "", c.views.developer || "", c.views.researcher || ""].join("\n")
  }));

  function searchSnippet(entry, q) {
    const idx = entry.display.toLowerCase().indexOf(q);
    if (idx === -1) return "";
    const start = Math.max(0, idx - 36);
    const end = Math.min(entry.display.length, idx + q.length + 60);
    const raw = (start > 0 ? "…" : "") + entry.display.slice(start, end).replace(/\s+/g, " ") + (end < entry.display.length ? "…" : "");
    // Highlight the match (escape first, then wrap — offsets recomputed on the escaped string).
    const esc = escapeHtml(raw);
    const escQ = escapeHtml(q);
    const at = esc.toLowerCase().indexOf(escQ.toLowerCase());
    if (at === -1) return esc;
    return esc.slice(0, at) + "<mark>" + esc.slice(at, at + escQ.length) + "</mark>" + esc.slice(at + escQ.length);
  }

  function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (!searchResultsEl || !sidebarSectionsEl) return;
    if (!q) {
      searchResultsEl.hidden = true;
      searchResultsEl.innerHTML = "";
      sidebarSectionsEl.hidden = false;
      return;
    }
    const conceptHits = SEARCH_INDEX
      .map(entry => {
        const inTitle = entry.title.toLowerCase().includes(q);
        const at = entry.haystack.indexOf(q);
        if (!inTitle && at === -1) return null;
        return { entry, inTitle };
      })
      .filter(Boolean)
      .sort((a, b) => (b.inTitle ? 1 : 0) - (a.inTitle ? 1 : 0));
    const termHits = GLOSSARY.filter(g =>
      g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)
    ).slice(0, 6);

    const conceptHtml = conceptHits.map(({ entry }) => `
      <li>
        <a class="search-hit" href="#/${entry.id}" data-search-goto="${entry.id}">
          <span class="search-hit-title">${escapeHtml(entry.title)}</span>
          <span class="search-hit-snippet">${searchSnippet(entry, q) || ""}</span>
        </a>
      </li>`).join("");
    const termHtml = termHits.map(g => `
      <li>
        <a class="search-hit search-hit-term" href="#/${GLOSSARY_PAGE}" data-search-goto="${GLOSSARY_PAGE}" data-term="${escapeHtml(g.term)}">
          <span class="search-hit-title">${escapeHtml(g.term)} <span class="search-hit-kind">glossary</span></span>
          <span class="search-hit-snippet">${escapeHtml(g.definition.length > 110 ? g.definition.slice(0, 110) + "…" : g.definition)}</span>
        </a>
      </li>`).join("");

    searchResultsEl.innerHTML =
      (conceptHits.length + termHits.length === 0)
        ? `<li class="search-empty">No matches for “${escapeHtml(query.trim())}”.</li>`
        : conceptHtml + termHtml;
    searchResultsEl.hidden = false;
    sidebarSectionsEl.hidden = true;

    searchResultsEl.querySelectorAll("[data-search-goto]").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const target = a.getAttribute("data-search-goto");
        clearSearch();
        setConcept(target, { fromUser: true });
      });
    });
    announce(`${conceptHits.length + termHits.length} search result${conceptHits.length + termHits.length === 1 ? "" : "s"}.`);
  }

  function clearSearch() {
    if (searchInputEl) searchInputEl.value = "";
    runSearch("");
  }

  if (searchInputEl) {
    searchInputEl.addEventListener("input", () => runSearch(searchInputEl.value));
    searchInputEl.addEventListener("keydown", e => {
      if (e.key === "Escape") { clearSearch(); searchInputEl.blur(); }
      if (e.key === "Enter") {
        const first = searchResultsEl && searchResultsEl.querySelector("[data-search-goto]");
        if (first) first.click();
      }
    });
  }

  // ---------- sidebar ----------
  // Concepts render as a numbered learning path (ordered by the `path` field
  // set in content/<id>.json). The numbering is a suggested reading order,
  // not a prerequisite lock — everything stays clickable.
  function renderSidebar() {
    conceptListEl.innerHTML = "";
    CONCEPTS.forEach((c, i) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const isActive = c.id === state.conceptId;
      a.href = `#/${c.id}`;
      a.className = "concept-link" + (isActive ? " is-active" : "");
      if (isActive) a.setAttribute("aria-current", "page");
      a.innerHTML = `
        <span class="path-num" aria-label="Step ${i + 1} of ${CONCEPTS.length}">${i + 1}</span>
        <span class="concept-link-title">${escapeHtml(c.title)}</span>
        <span class="grade" aria-label="Evidence grade ${escapeHtml(c.evidence_grade || "ungraded")}">${escapeHtml(c.evidence_grade || "—")}</span>
      `;
      a.addEventListener("click", e => {
        e.preventDefault();
        setConcept(c.id, { fromUser: true });
      });
      li.appendChild(a);
      conceptListEl.appendChild(li);
    });

    const glossaryLink = document.getElementById("glossary-link");
    if (glossaryLink) {
      glossaryLink.classList.toggle("is-active", state.conceptId === GLOSSARY_PAGE);
      if (state.conceptId === GLOSSARY_PAGE) glossaryLink.setAttribute("aria-current", "page");
      else glossaryLink.removeAttribute("aria-current");
    }

    if (blockedListEl) {
      blockedListEl.innerHTML = "";
      if (BLOCKED.length === 0) {
        const li = document.createElement("li");
        li.className = "gate-empty";
        li.innerHTML = `Empty — nothing is currently blocked. Past BLOCKs and their resolutions stay on the record in the <a href="https://github.com/systemslibrarian/structureless-labs/tree/main/sl-researchkit/decisions" target="_blank" rel="noopener">decision log</a>.`;
        blockedListEl.appendChild(li);
      }
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
    if (state.conceptId === GLOSSARY_PAGE) {
      renderGlossary();
      return;
    }
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

      ${renderChecks(c)}

      ${renderMeta(c)}

      ${renderPathNav(c)}
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

  // ---------- self-checks ----------
  // Formative assessment, not a quiz: each concept may carry a few questions
  // whose answers are hidden behind a disclosure. The answers teach (they
  // explain the why), and they are authored in content/<id>.json so the
  // Teacher gate reviews them like any other prose.
  function renderChecks(c) {
    const checks = c.checks || [];
    if (checks.length === 0) return "";
    const items = checks.map((chk, i) => `
      <details class="check-item">
        <summary>
          <span class="check-num" aria-hidden="true">Q${i + 1}</span>
          <span class="check-question">${renderInline(chk.question)}</span>
        </summary>
        <div class="check-answer">${renderProse(chk.answer)}</div>
      </details>
    `).join("");
    return `
      <section class="checks" aria-label="Check your understanding">
        <h3 class="checks-heading">Check your understanding</h3>
        <p class="checks-note">Answer in your head first — committing to a guess before revealing is what makes this work.</p>
        ${items}
      </section>
    `;
  }

  // ---------- learning-path navigation ----------
  // Previous / next footer following the sidebar's numbered order. Plain
  // hash links: the hashchange listener does the routing.
  function renderPathNav(c) {
    const idx = CONCEPTS.findIndex(x => x.id === c.id);
    if (idx === -1) return "";
    const prev = idx > 0 ? CONCEPTS[idx - 1] : null;
    const next = idx < CONCEPTS.length - 1 ? CONCEPTS[idx + 1] : null;
    return `
      <nav class="path-nav" aria-label="Learning path">
        ${prev ? `
          <a class="path-nav-card path-nav-prev" href="#/${prev.id}">
            <span class="path-nav-label">← Previous · step ${idx} of ${CONCEPTS.length}</span>
            <span class="path-nav-title">${escapeHtml(prev.title)}</span>
          </a>` : `<span class="path-nav-spacer" aria-hidden="true"></span>`}
        ${next ? `
          <a class="path-nav-card path-nav-next" href="#/${next.id}">
            <span class="path-nav-label">Next · step ${idx + 2} of ${CONCEPTS.length} →</span>
            <span class="path-nav-title">${escapeHtml(next.title)}</span>
          </a>` : `
          <span class="path-nav-card path-nav-done">
            <span class="path-nav-label">End of the path</span>
            <span class="path-nav-title">You've walked the whole atlas. The <a href="#/${GLOSSARY_PAGE}">glossary</a> is your reference from here.</span>
          </span>`}
      </nav>
    `;
  }

  // ---------- glossary page ----------
  function renderGlossary() {
    const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
    const groups = new Map();
    for (const g of sorted) {
      const letter = g.term[0].toUpperCase();
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(g);
    }
    const sections = [...groups.entries()].map(([letter, terms]) => `
      <section class="glossary-group" aria-label="Terms starting with ${letter}">
        <h2 class="glossary-letter">${letter}</h2>
        <dl class="glossary-list">
          ${terms.map(g => `
            <div class="glossary-entry" id="term-${escapeHtml(g.term.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">
              <dt>${escapeHtml(g.term)}</dt>
              <dd>
                ${renderInline(g.definition)}
                ${g.concept && CONCEPTS_BY_ID[g.concept]
                  ? ` <a class="glossary-concept-link" href="#/${g.concept}">→ ${escapeHtml(CONCEPTS_BY_ID[g.concept].title)}</a>`
                  : ""}
              </dd>
            </div>
          `).join("")}
        </dl>
      </section>
    `).join("");

    conceptViewEl.innerHTML = `
      <header class="concept-header">
        <div class="concept-eyebrow">reference</div>
        <h1 class="concept-title">Glossary</h1>
        <p class="concept-subtitle">${GLOSSARY.length} terms, each linked to the concept that teaches it. Every definition here is a reminder, not a substitute — follow the arrow for the real explanation.</p>
      </header>
      ${sections}
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
      prediction:  null,        // "all" | "forced" | "none" — the reader's pre-attack call
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
      state.prediction = null;
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

          ${state.attack ? "" : predictionHtml()}

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
      const predictBtns = Array.from(host.querySelectorAll("[data-predict]"));
      predictBtns.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
          state.prediction = btn.getAttribute("data-predict");
          render();
          announce(`Prediction recorded. Now press Try to solve.`);
          const again = host.querySelector(`[data-predict="${state.prediction}"]`);
          if (again) again.focus();
        });
        btn.addEventListener("keydown", e => {
          let next = null;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % predictBtns.length;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + predictBtns.length) % predictBtns.length;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End")  next = predictBtns.length - 1;
          if (next === null) return;
          e.preventDefault();
          predictBtns[next].focus();
          predictBtns[next].click();
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
    // Predict-then-verify: committing to a guess before pressing "Try to solve"
    // is what turns the demo from a show into a lesson. Optional — the attack
    // runs either way — but if a prediction was made, the result panel grades it.
    function predictionHtml() {
      const options = [
        { id: "all",    label: `All ${state.m} rows` },
        { id: "forced", label: `Only the first ${state.n} it used` },
        { id: "none",   label: "None" }
      ];
      return `
        <div class="predict-panel" role="group" aria-labelledby="lwe-predict-label">
          <p class="predict-label" id="lwe-predict-label">
            <strong>Predict first</strong> — noise is <strong>${state.noiseOn ? "on" : "off"}</strong>. After Gaussian elimination on the first <code>n = ${state.n}</code> rows, how many of the <code>m = ${state.m}</code> rows will the recovered candidate satisfy?
          </p>
          <div class="predict-options" role="radiogroup" aria-label="Your prediction">
            ${options.map(o => `
              <button class="preset-btn predict-btn" type="button" role="radio"
                      aria-checked="${state.prediction === o.id}"
                      tabindex="${(state.prediction === o.id || (!state.prediction && o.id === "all")) ? "0" : "-1"}"
                      data-predict="${o.id}">${o.label}</button>`).join("")}
          </div>
        </div>
      `;
    }
    function predictionVerdictHtml() {
      if (!state.prediction || !state.attack || state.attack.error) return "";
      const actual = state.attack.matchesSecret ? "all" : "forced";
      const right = state.prediction === actual;
      const labels = { all: "all rows", forced: "only the forced rows", none: "no rows" };
      return `
        <p class="predict-verdict ${right ? "predict-right" : "predict-wrong"}">
          <strong>Your prediction — ${right ? "right" : "not quite"}.</strong>
          You said <em>${labels[state.prediction]}</em>; the attack produced <em>${labels[actual]}</em>.
          ${actual === "forced"
            ? `The first <code>n</code> rows verify <em>by construction</em> — elimination used them, so they cannot disagree. The information is in the rows it did <em>not</em> use.`
            : `With noise off there is nothing to hide behind: the recovered candidate is the true secret, so every row agrees.`}
        </p>
      `;
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
            ${predictionVerdictHtml()}
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
      e: 0,
      predict: null,              // "ok" | "fail" — the reader's call on the NEXT draw
      lastCall: null,             // {predicted, actual, right} once a predicted draw resolves
      score: { right: 0, total: 0 }
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
      // Grade the reader's call, if one was made before drawing.
      if (state.predict) {
        const y = modq(encode(state.bit, state.q) + state.e, state.q);
        const actual = decode(y, state.q) === state.bit ? "ok" : "fail";
        const right = state.predict === actual;
        state.score.total++;
        if (right) state.score.right++;
        state.lastCall = { predicted: state.predict, actual, right };
      }
      render();
      announce(`Resampled noise: e = ${state.e}.${state.lastCall ? ` Your call was ${state.lastCall.right ? "right" : "wrong"}.` : ""}`);
    }
    function setPredict(p) {
      state.predict = state.predict === p ? null : p; // click again to clear
      render();
      if (state.predict) announce(`Prediction: the next draw ${p === "ok" ? "decodes correctly" : "fails"}. Now draw fresh noise.`);
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
            <fieldset class="enc-control-group enc-predict-group">
              <legend>Your call for the next draw</legend>
              <div class="enc-segmented" role="radiogroup" aria-label="Predict whether the next draw decodes correctly">
                <button class="preset-btn" type="button" role="radio"
                        aria-checked="${state.predict === "ok"}" tabindex="${state.predict === "ok" ? "0" : "-1"}"
                        data-enc-predict="ok">decodes</button>
                <button class="preset-btn" type="button" role="radio"
                        aria-checked="${state.predict === "fail"}" tabindex="${state.predict !== "ok" ? "0" : "-1"}"
                        data-enc-predict="fail">fails</button>
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
            ${state.lastCall ? `
            <div class="enc-outcome-line enc-call-line ${state.lastCall.right ? "predict-right" : "predict-wrong"}">
              <span class="enc-tag">your call</span>
              <span>
                ${state.lastCall.right ? "Right" : "Wrong"} — you said <em>${state.lastCall.predicted === "ok" ? "decodes" : "fails"}</em>, the draw <em>${state.lastCall.actual === "ok" ? "decoded" : "failed"}</em>
                <span class="enc-score">(${state.score.right}/${state.score.total} so far)</span>.
                With δ = ${(delta * 100).toFixed(2)}%, "decodes" is the smart bet ${delta === 0 ? "— it can never fail at these settings" : delta < 0.5 ? "on any single draw; the danger is the volume of draws a real KEM makes" : ""}.
              </span>
            </div>` : ""}
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
      wireRadio("[data-enc-predict]", "data-enc-predict", v => setPredict(v));
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

  // ---------- 2D lattice visualizer ----------
  // The lattices concept's runnable claim: SAME lattice, DIFFERENT basis,
  // completely different computational behavior. Drag (or type) the basis
  // vectors, skew them with a unimodular transform (lattice provably
  // unchanged — the determinant is the witness), reduce them with
  // Lagrange-Gauss (exact in 2D), and watch Babai's round-off CVP succeed
  // with the good basis and miss with the bad one.
  //
  // Honest non-claims (mirrors the concept's own framing): 2D is a magnifying
  // glass on the structure, not evidence of hardness — Lagrange-Gauss solves
  // 2D exactly; nothing solves dimension 400 exactly. The caption says so.
  // Math invariants are regression-tested in scripts/check-lattice-math.mjs.
  function mountLattice2d(host) {
    const W = 640, H = 420, CX = W / 2, CY = H / 2, U = 26; // px per lattice unit
    const COORD_LIMIT = 8;      // manual basis entries live in [-8, 8]
    const SKEW_LIMIT = 48;      // skew button refuses to push coords past this
    const MAX_POINTS = 4000;    // safety cap for near-degenerate bases

    const state = {
      b1: [2, 0],
      b2: [1, 2],
      seed: 0x1A77,
      target: null,      // [x, y] floats in lattice-plane coordinates
      cvp: null,         // {babai, babaiDist, best, bestDist, exact} after "Round off"
      degenerate: false
    };

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
    const det2 = (u, v) => u[0] * v[1] - u[1] * v[0];
    const dot2 = (u, v) => u[0] * v[0] + u[1] * v[1];
    const norm = v => Math.hypot(v[0], v[1]);
    const sub = (u, v) => [u[0] - v[0], u[1] - v[1]];
    const addScaled = (u, v, k) => [u[0] + k * v[0], u[1] + k * v[1]];
    const combo = (a1, a2) => [a1 * state.b1[0] + a2 * state.b2[0], a1 * state.b1[1] + a2 * state.b2[1]];

    // Lagrange-Gauss reduction — exact in 2D. Returns a basis of the SAME
    // lattice with ‖u‖ ≤ ‖v‖ and |⟨u,v⟩| ≤ ‖u‖²/2 (u is then a shortest vector).
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

    // Babai round-off: x = B⁻¹t, round the coefficients, map back.
    function babaiRound(b1, b2, t) {
      const d = det2(b1, b2);
      const x1 = (t[0] * b2[1] - t[1] * b2[0]) / d;
      const x2 = (t[1] * b1[0] - t[0] * b1[1]) / d;
      const a1 = Math.round(x1), a2 = Math.round(x2);
      return { coeffs: [a1, a2], point: [a1 * b1[0] + a2 * b2[0], a1 * b1[1] + a2 * b2[1]], raw: [x1, x2] };
    }

    // Exact CVP by brute force around the rounded coefficients — affordable in
    // 2D, which is exactly why 2D is a demo and dimension 400 is cryptography.
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

    function newTarget() {
      const prng = prngFrom(state.seed);
      prng(); prng();
      state.target = [
        Math.round((prng() * 12 - 6) * 10) / 10,
        Math.round((prng() * 8 - 4) * 10) / 10
      ];
      state.cvp = null;
    }

    function setBasis(b1, b2, sourceLabel) {
      const d = det2(b1, b2);
      state.b1 = b1; state.b2 = b2;
      state.degenerate = d === 0;
      state.cvp = null;
      render();
      if (state.degenerate) {
        announce("Degenerate basis: the two vectors are collinear, so they no longer span a lattice. Adjust one of them.");
      } else if (sourceLabel) {
        announce(`${sourceLabel}. Determinant ${Math.abs(d)}, angle ${angleDeg().toFixed(0)} degrees.`);
      }
    }

    function skew() {
      // Unimodular shear: replaces b2 with b2 + 2·b1 (or the other way when
      // that would overflow the canvas math). |det| is unchanged — same lattice.
      let cand2 = addScaled(state.b2, state.b1, 2);
      if (Math.max(Math.abs(cand2[0]), Math.abs(cand2[1])) <= SKEW_LIMIT) {
        setBasis(state.b1, cand2, "Skewed: b2 ← b2 + 2·b1 (unimodular, same lattice)");
        return;
      }
      const cand1 = addScaled(state.b1, state.b2, 2);
      if (Math.max(Math.abs(cand1[0]), Math.abs(cand1[1])) <= SKEW_LIMIT) {
        setBasis(cand1, state.b2, "Skewed: b1 ← b1 + 2·b2 (unimodular, same lattice)");
        return;
      }
      announce("Skewed enough — the vectors are getting numerically unwieldy. Try Reduce to bring them back.");
    }

    function reduce() {
      const [u, v] = lagrangeReduce(state.b1, state.b2);
      setBasis(u, v, "Lagrange-Gauss reduced: shortest possible basis for this lattice");
    }

    function solveCvp() {
      if (state.degenerate) return;
      const babai = babaiRound(state.b1, state.b2, state.target);
      const babaiDist = norm(sub(babai.point, state.target));
      const best = trueClosest(state.b1, state.b2, state.target);
      const exact = Math.abs(babaiDist - best.dist) < 1e-9;
      state.cvp = { babai: babai.point, babaiDist, best: best.point, bestDist: best.dist, exact };
      render();
      announce(exact
        ? `Babai's round-off found the true closest lattice point, distance ${best.dist.toFixed(2)}.`
        : `Babai's round-off missed: its point is at distance ${babaiDist.toFixed(2)}, but the true closest is at ${best.dist.toFixed(2)}. The basis is too skewed for rounding to work.`);
    }

    function angleDeg() {
      const cos = dot2(state.b1, state.b2) / (norm(state.b1) * norm(state.b2));
      return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
    }
    function orthogonalityDefect() {
      const d = Math.abs(det2(state.b1, state.b2));
      return d === 0 ? Infinity : (norm(state.b1) * norm(state.b2)) / d;
    }

    // Enumerate the lattice points that land inside the viewport, by mapping
    // the viewport corners into coefficient space (exact, and immune to the
    // "skewed basis makes the visible points sparse" rendering artifact).
    function visiblePoints() {
      const d = det2(state.b1, state.b2);
      if (d === 0) return [];
      const xMax = CX / U + 1, yMax = CY / U + 1;
      const corners = [[-xMax, -yMax], [xMax, -yMax], [-xMax, yMax], [xMax, yMax]];
      let a1Min = Infinity, a1Max = -Infinity, a2Min = Infinity, a2Max = -Infinity;
      for (const t of corners) {
        const x1 = (t[0] * state.b2[1] - t[1] * state.b2[0]) / d;
        const x2 = (t[1] * state.b1[0] - t[0] * state.b1[1]) / d;
        a1Min = Math.min(a1Min, x1); a1Max = Math.max(a1Max, x1);
        a2Min = Math.min(a2Min, x2); a2Max = Math.max(a2Max, x2);
      }
      const pts = [];
      for (let a1 = Math.floor(a1Min) - 1; a1 <= Math.ceil(a1Max) + 1; a1++) {
        for (let a2 = Math.floor(a2Min) - 1; a2 <= Math.ceil(a2Max) + 1; a2++) {
          const p = combo(a1, a2);
          if (Math.abs(p[0]) <= xMax && Math.abs(p[1]) <= yMax) {
            pts.push(p);
            if (pts.length > MAX_POINTS) return pts;
          }
        }
      }
      return pts;
    }

    const px = p => CX + p[0] * U;
    const py = p => CY - p[1] * U;

    function svgHtml() {
      const pts = visiblePoints();
      const pointsHtml = pts.map(p =>
        `<circle cx="${px(p).toFixed(1)}" cy="${py(p).toFixed(1)}" r="2.4" class="lat-point"/>`).join("");
      const t = state.target;
      const fundParallelogram = state.degenerate ? "" : `
        <polygon class="lat-fund" points="${px([0,0])},${py([0,0])} ${px(state.b1)},${py(state.b1)} ${px(combo(1,1))},${py(combo(1,1))} ${px(state.b2)},${py(state.b2)}"/>`;
      const basisArrow = (v, cls, label) => `
        <line x1="${CX}" y1="${CY}" x2="${px(v)}" y2="${py(v)}" class="lat-basis ${cls}"/>
        <circle cx="${px(v)}" cy="${py(v)}" r="9" class="lat-handle ${cls}" data-handle="${cls}"/>
        <text x="${px(v) + 12}" y="${py(v) - 8}" class="lat-label ${cls}">${label}</text>`;
      let cvpHtml = "";
      if (state.cvp) {
        const { babai, best, exact } = state.cvp;
        cvpHtml = `
          <line x1="${px(t)}" y1="${py(t)}" x2="${px(babai)}" y2="${py(babai)}" class="lat-line-babai"/>
          ${exact ? "" : `<line x1="${px(t)}" y1="${py(t)}" x2="${px(best)}" y2="${py(best)}" class="lat-line-best"/>`}
          <circle cx="${px(babai)}" cy="${py(babai)}" r="7" class="lat-babai ${exact ? "lat-babai-exact" : ""}"/>
          ${exact ? "" : `<circle cx="${px(best)}" cy="${py(best)}" r="9" class="lat-best"/>`}`;
      }
      const targetHtml = t ? `
        <g class="lat-target-g">
          <line x1="${px(t) - 7}" y1="${py(t)}" x2="${px(t) + 7}" y2="${py(t)}" class="lat-target"/>
          <line x1="${px(t)}" y1="${py(t) - 7}" x2="${px(t)}" y2="${py(t) + 7}" class="lat-target"/>
        </g>` : "";
      const aria = state.degenerate
        ? "Degenerate basis: vectors are collinear."
        : `Lattice generated by b1 = (${state.b1}), b2 = (${state.b2}); angle ${angleDeg().toFixed(0)} degrees; target at (${t[0]}, ${t[1]})${state.cvp ? (state.cvp.exact ? "; Babai found the closest point." : "; Babai missed the closest point.") : "."}`;
      return `
        <svg viewBox="0 0 ${W} ${H}" class="lat-svg" role="img" aria-label="${escapeHtml(aria)}">
          <line x1="0" y1="${CY}" x2="${W}" y2="${CY}" class="lat-axis"/>
          <line x1="${CX}" y1="0" x2="${CX}" y2="${H}" class="lat-axis"/>
          ${fundParallelogram}
          ${pointsHtml}
          ${state.degenerate ? "" : basisArrow(state.b1, "b1", "b₁") + basisArrow(state.b2, "b2", "b₂")}
          ${state.degenerate ? `<text x="${CX}" y="${CY - 20}" class="lat-degenerate-text" text-anchor="middle">collinear — not a lattice basis</text>` : ""}
          ${cvpHtml}
          ${targetHtml}
        </svg>`;
    }

    function qualityHtml() {
      if (state.degenerate) {
        return `<div class="lat-quality lat-quality-bad" role="status">Determinant 0 — the vectors are collinear and no longer span the plane. Nudge one of them.</div>`;
      }
      const defect = orthogonalityDefect();
      const grade = defect < 1.3 ? ["good", "near-orthogonal — the honest, private-key kind of basis"]
                  : defect < 2.5 ? ["fair", "usable but visibly skewed"]
                  : ["bad", "long and skewed — the public-key kind of basis"];
      return `
        <div class="lat-quality lat-quality-${grade[0]}" role="status">
          <span>‖b₁‖ = ${norm(state.b1).toFixed(2)}</span>
          <span>‖b₂‖ = ${norm(state.b2).toFixed(2)}</span>
          <span>angle = ${angleDeg().toFixed(0)}°</span>
          <span>|det| = ${Math.abs(det2(state.b1, state.b2))}</span>
          <span>defect = ${defect.toFixed(2)}</span>
          <span class="lat-quality-verdict">${grade[1]}</span>
        </div>`;
    }

    function cvpResultHtml() {
      if (!state.cvp) return "";
      const { babaiDist, bestDist, exact } = state.cvp;
      const goodBasis = orthogonalityDefect() < 1.3;
      return exact
        ? `<div class="outcome solvable" role="status">
             <span class="outcome-icon" aria-hidden="true">✓</span>
             <div class="outcome-body">
               <span class="label">Babai found the closest point</span>
               Round-off CVP hit the true nearest lattice point (distance ${bestDist.toFixed(2)}). With a short, near-orthogonal basis, "round the coefficients" almost always suffices. Now press <strong>Skew</strong> a few times and try again — same lattice, same target.
             </div>
           </div>`
        : `<div class="outcome hard" role="status">
             <span class="outcome-icon" aria-hidden="true">!</span>
             <div class="outcome-body">
               <span class="label">Babai missed</span>
               Round-off returned a point at distance ${babaiDist.toFixed(2)}; the true closest (ringed in green) is at ${bestDist.toFixed(2)}.
               ${goodBasis
                 ? `A near-boundary miss — rounding is a heuristic even with a good basis, and this target sits close to the edge between two cells. Rare with a basis this good; press <strong>New target</strong> and it will usually hit.`
                 : `Identical lattice, identical target — the only thing that changed is the basis. Press <strong>Reduce</strong> and solve again to watch the same algorithm succeed. This asymmetry, scaled to dimension 400+, <em>is</em> the private-key/public-key gap.`}
             </div>
           </div>`;
    }

    function render() {
      host.innerHTML = `
        <section class="interactive lat-interactive" aria-labelledby="lat-title">
          <div class="interactive-header">
            <h2 class="interactive-title" id="lat-title">
              One lattice, two bases, live
              <span class="pill" aria-hidden="true">interactive</span>
            </h2>
          </div>
          <p class="enc-lead">
            The dots are one fixed lattice. <strong>Skew</strong> replaces the basis with a provably equivalent one (a unimodular shear — |det| never changes); <strong>Reduce</strong> runs Lagrange-Gauss, the exact 2-D reduction. <strong>Round off (Babai)</strong> tries to find the lattice point closest to the ✕ target by rounding coordinates — the success of that one step depends entirely on which basis you hold. Drag the handles or type coordinates to build your own basis.
          </p>
          <div class="lwe-controls" role="group" aria-label="Lattice controls">
            <button class="btn" type="button" data-lat="skew" title="b2 ← b2 + 2·b1 — unimodular, lattice unchanged">Skew the basis</button>
            <button class="btn" type="button" data-lat="reduce" title="Lagrange-Gauss reduction — optimal in 2D">Reduce (Lagrange-Gauss)</button>
            <button class="btn" type="button" data-lat="target" title="Move the CVP target">New target</button>
            <button class="btn btn-attack" type="button" data-lat="solve" ${state.degenerate ? "disabled" : ""} title="Babai round-off: solve B·x = t, round x">
              <span aria-hidden="true">⌖</span> Round off (Babai)
            </button>
            <button class="btn btn-ghost" type="button" data-lat="reset">Reset</button>
          </div>
          <div class="lat-coord-row" role="group" aria-label="Basis coordinates">
            ${["b1", "b2"].map(name => `
              <label class="custom-field lat-coord-field">
                <span>${name === "b1" ? "b₁" : "b₂"}</span>
                <input type="number" data-lat-coord="${name}-x" min="${-COORD_LIMIT}" max="${COORD_LIMIT}" step="1" value="${state[name][0]}" aria-label="${name} x coordinate"/>
                <input type="number" data-lat-coord="${name}-y" min="${-COORD_LIMIT}" max="${COORD_LIMIT}" step="1" value="${state[name][1]}" aria-label="${name} y coordinate"/>
              </label>`).join("")}
            <p class="custom-note lat-coord-note">Integer coordinates keep the math checkable; the Skew button may push them beyond the manual range — that is allowed, Reduce brings them home.</p>
          </div>
          ${svgHtml()}
          ${qualityHtml()}
          ${cvpResultHtml()}
          <div class="enc-non-claim" role="note">
            <strong>What this does <em>not</em> show.</strong> Hardness. Lagrange-Gauss solves 2-D lattices <em>exactly</em> and instantly; there is no analogous exact algorithm in dimension 400+, where the best known reduction (BKZ with sieving) costs time exponential in the dimension. This panel demonstrates the <em>structure</em> — good basis easy, bad basis hard — that the <a href="#/parameter-choices">cost explorer</a> then prices at real dimensions. Math invariants are regression-tested in <code>scripts/check-lattice-math.mjs</code>.
          </div>
        </section>
      `;

      host.querySelectorAll("[data-lat]").forEach(btn => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-lat");
          if (act === "skew")   return skew();
          if (act === "reduce") return reduce();
          if (act === "solve")  return solveCvp();
          if (act === "target") { state.seed = (state.seed + 1) >>> 0; newTarget(); render(); announce(`New target at (${state.target[0]}, ${state.target[1]}).`); return; }
          if (act === "reset")  { state.b1 = [2, 0]; state.b2 = [1, 2]; state.degenerate = false; state.cvp = null; render(); announce("Basis reset."); return; }
        });
      });
      host.querySelectorAll("[data-lat-coord]").forEach(inp => {
        inp.addEventListener("change", () => {
          const [name, axis] = inp.getAttribute("data-lat-coord").split("-");
          const v = Math.max(-COORD_LIMIT, Math.min(COORD_LIMIT, Math.round(Number(inp.value) || 0)));
          const b1 = [...state.b1], b2 = [...state.b2];
          (name === "b1" ? b1 : b2)[axis === "x" ? 0 : 1] = v;
          setBasis(b1, b2, `Basis updated: ${name} = (${(name === "b1" ? b1 : b2).join(", ")})`);
        });
      });

    }

    // Pointer dragging on the basis handles (mouse/touch/pen). Attached ONCE
    // to the persistent host element (delegation), because render() replaces
    // the SVG on every state change — listeners on the SVG itself would die
    // after the first drag step. Snaps to the integer grid; the numeric
    // inputs are the keyboard/AT equivalent.
    let dragging = null;
    const toLattice = evt => {
      const svg = host.querySelector(".lat-svg");
      if (!svg) return null;
      const r = svg.getBoundingClientRect();
      const x = (evt.clientX - r.left) * (W / r.width);
      const y = (evt.clientY - r.top) * (H / r.height);
      return [Math.round((x - CX) / U), Math.round((CY - y) / U)];
    };
    host.addEventListener("pointerdown", evt => {
      const h = evt.target.closest && evt.target.closest(".lat-handle");
      if (!h) return;
      dragging = h.getAttribute("data-handle");
      try { host.setPointerCapture(evt.pointerId); } catch (_) { /* capture unsupported: fall back to plain moves */ }
      evt.preventDefault();
    });
    host.addEventListener("pointermove", evt => {
      if (!dragging) return;
      const p = toLattice(evt);
      if (!p) return;
      const cl = v => Math.max(-COORD_LIMIT, Math.min(COORD_LIMIT, v));
      const next = [cl(p[0]), cl(p[1])];
      const cur = state[dragging];
      if (next[0] === cur[0] && next[1] === cur[1]) return;
      if (next[0] === 0 && next[1] === 0) return; // zero vector never allowed
      if (dragging === "b1") setBasis(next, state.b2, null);
      else setBasis(state.b1, next, null);
    });
    host.addEventListener("pointerup", evt => {
      if (dragging) {
        try { host.releasePointerCapture(evt.pointerId); } catch (_) { /* ignore */ }
        announce(`Basis vector moved. ${state.degenerate ? "Degenerate — vectors are collinear." : `Angle ${angleDeg().toFixed(0)} degrees, defect ${orthogonalityDefect().toFixed(2)}.`}`);
      }
      dragging = null;
    });

    newTarget();
    render();
  }

  // ---------- attack-cost explorer ----------
  // The parameter-choices concept's runnable claim: (n, q, σ) → a concrete
  // security estimate, via the SIMPLIFIED primal-attack model — the GSA
  // success condition σ·√β ≤ δ₀^(2β−d−1)·q^(m/d) with core-SVP costing
  // (2^0.292β classical, 2^0.265β quantum). This is the textbook estimate,
  // implemented honestly and labeled honestly: the maintained lattice
  // estimator (Albrecht-Player-Scott lineage) runs many attacks under many
  // cost models and is the authoritative tool; this panel exists to make the
  // SHAPE of the trade-off tangible, not to certify parameters.
  // Model invariants are regression-tested in scripts/check-cost-model.mjs.
  function mountAttackCost(host) {
    const N_MIN = 128, N_MAX = 1408, N_STEP = 64;
    const LOGQ_CHOICES = [12, 13, 14, 15, 16];
    const SIGMA_CHOICES = [
      { v: 1.0,  label: "1.00", hint: "CBD η=2 (Kyber-768/1024-style)" },
      { v: 1.22, label: "1.22", hint: "CBD η=3 (Kyber-512-style)" },
      { v: 1.41, label: "1.41", hint: "CBD η=4" },
      { v: 2.0,  label: "2.00", hint: "wide" },
      { v: 2.8,  label: "2.80", hint: "FrodoKEM-640-style Gaussian" }
    ];
    // Reference points, each priced with its own (n, log₂q, σ) through the SAME
    // simplified model — so they can sit off the current curve. The labels say
    // "-shaped" because e.g. Kyber is Module-LWE treated here at its embedding
    // dimension k·n, per standard estimator practice.
    const REFS = [
      { label: "Kyber-512-shaped",  n: 512,  logq: Math.log2(3329), sigma: 1.22 },
      { label: "Kyber-768-shaped",  n: 768,  logq: Math.log2(3329), sigma: 1.0 },
      { label: "Frodo-640-shaped",  n: 640,  logq: 15,              sigma: 2.8 },
      { label: "Frodo-976-shaped",  n: 976,  logq: 16,              sigma: 2.3 }
    ];

    const state = { n: 640, logq: 15, sigma: 2.8 };

    // log2 of the BKZ root-Hermite factor δ₀(β) under the geometric-series
    // assumption: δ₀ = ((β/2πe)·(πβ)^(1/β))^(1/(2(β−1))).
    function logDelta0(beta) {
      return Math.log2((beta / (2 * Math.PI * Math.E)) * Math.pow(Math.PI * beta, 1 / beta)) / (2 * (beta - 1));
    }
    // Minimal BKZ block size β for which the primal attack succeeds for SOME
    // number of samples m (coarse grid — the estimate is deliberately simple).
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
      return null; // beyond the model's range (≳ 2^400)
    }
    const CLASSICAL = 0.292, QUANTUM = 0.265;

    // Memoized curve per (logq, sigma): security bits vs n.
    let curveCache = null, curveKey = "";
    function curve() {
      const key = `${state.logq}|${state.sigma}`;
      if (curveCache && curveKey === key) return curveCache;
      const pts = [];
      for (let n = N_MIN; n <= N_MAX; n += N_STEP) {
        const r = primalBeta(n, state.logq, state.sigma);
        pts.push({ n, bits: r ? CLASSICAL * r.beta : null });
      }
      curveCache = pts; curveKey = key;
      return pts;
    }

    const PW = 620, PH = 280, PL = 52, PB = 34; // plot box + left/bottom margins
    const Y_MAX = 420;
    const xPix = n => PL + (n - N_MIN) / (N_MAX - N_MIN) * (PW - PL - 12);
    const yPix = bits => (PH - PB) - Math.min(bits, Y_MAX) / Y_MAX * (PH - PB - 12);

    function plotHtml() {
      const pts = curve();
      const line = pts.filter(p => p.bits !== null)
        .map(p => `${xPix(p.n).toFixed(1)},${yPix(p.bits).toFixed(1)}`).join(" ");
      const gridY = [0, 128, 192, 256, 384].map(b => `
        <line x1="${PL}" y1="${yPix(b)}" x2="${PW - 12}" y2="${yPix(b)}" class="cost-grid"/>
        <text x="${PL - 6}" y="${yPix(b) + 4}" class="cost-axis-label" text-anchor="end">${b}</text>`).join("");
      const gridX = [256, 512, 768, 1024, 1280].map(n => `
        <text x="${xPix(n)}" y="${PH - PB + 16}" class="cost-axis-label" text-anchor="middle">${n}</text>`).join("");
      const cur = primalBeta(state.n, state.logq, state.sigma);
      const curMark = cur ? `
        <circle cx="${xPix(state.n)}" cy="${yPix(CLASSICAL * cur.beta)}" r="6" class="cost-current"/>` : "";
      const refMarks = REFS.map(r => {
        const est = primalBeta(r.n, r.logq, r.sigma);
        if (!est) return "";
        return `
          <g class="cost-ref-g">
            <circle cx="${xPix(r.n)}" cy="${yPix(CLASSICAL * est.beta)}" r="4.5" class="cost-ref"/>
            <text x="${xPix(r.n) + 7}" y="${yPix(CLASSICAL * est.beta) - 6}" class="cost-ref-label">${escapeHtml(r.label)}</text>
          </g>`;
      }).join("");
      return `
        <figure class="cost-figure">
          <svg viewBox="0 0 ${PW} ${PH}" class="cost-svg" role="img"
               aria-label="Security estimate curve: classical core-SVP bits versus dimension n, at log2 q = ${state.logq} and sigma = ${state.sigma}. Current point: n = ${state.n}${cur ? `, about ${Math.round(CLASSICAL * cur.beta)} bits` : ""}.">
            <line x1="${PL}" y1="${PH - PB}" x2="${PW - 12}" y2="${PH - PB}" class="cost-axis"/>
            <line x1="${PL}" y1="8" x2="${PL}" y2="${PH - PB}" class="cost-axis"/>
            ${gridY}${gridX}
            <text x="${PL - 38}" y="${(PH - PB) / 2}" class="cost-axis-title" transform="rotate(-90 ${PL - 38} ${(PH - PB) / 2})" text-anchor="middle">classical bits (0.292β)</text>
            <text x="${(PW + PL) / 2}" y="${PH - 4}" class="cost-axis-title" text-anchor="middle">LWE dimension n</text>
            <polyline points="${line}" class="cost-curve"/>
            ${refMarks}
            ${curMark}
          </svg>
          <figcaption class="matrix-caption">
            Reference dots are priced with each scheme's <em>own</em> (n, q, σ) through the same simplified model — they can sit off the current curve, and they show the <em>model's</em> output, not the schemes' official claims.
          </figcaption>
        </figure>`;
    }

    function readoutHtml() {
      const r = primalBeta(state.n, state.logq, state.sigma);
      if (!r) {
        return `<div class="outcome hard" role="status"><span class="outcome-icon" aria-hidden="true">∞</span>
          <div class="outcome-body"><span class="label">Beyond the model's range</span>
          The required block size exceeds β = 1400 (≳ 2⁴⁰⁰ work) — far past any meaningful security target.</div></div>`;
      }
      const cBits = Math.round(CLASSICAL * r.beta), qBits = Math.round(QUANTUM * r.beta);
      const band = cBits < 100 ? ["bad", "below every modern target"]
                 : cBits < 143 ? ["cat1", "category-1 territory (AES-128-comparable)"]
                 : cBits < 207 ? ["cat3", "category-3 territory (AES-192-comparable)"]
                 : ["cat5", "category-5 territory (AES-256-comparable)"];
      return `
        <div class="cost-readout" role="status" aria-live="polite">
          <div class="cost-readout-cell"><span class="cost-readout-label">BKZ block size</span><code>β ≈ ${r.beta}</code></div>
          <div class="cost-readout-cell"><span class="cost-readout-label">classical (0.292β)</span><code>≈ 2^${cBits}</code></div>
          <div class="cost-readout-cell"><span class="cost-readout-label">quantum (0.265β)</span><code>≈ 2^${qBits}</code></div>
          <div class="cost-readout-cell cost-readout-band cost-band-${band[0]}"><span class="cost-readout-label">reading</span>${band[1]}</div>
        </div>`;
    }

    function render() {
      host.innerHTML = `
        <section class="interactive cost-interactive" aria-labelledby="cost-title">
          <div class="interactive-header">
            <h2 class="interactive-title" id="cost-title">
              The (n, q, σ) → security dial, live
              <span class="pill" aria-hidden="true">interactive</span>
            </h2>
          </div>
          <p class="enc-lead">
            The simplified primal estimate, computed live: find the smallest BKZ block size β whose success condition
            <code>σ·√β ≤ δ₀^(2β−d−1)·q^(m/d)</code> holds, then price it with core-SVP (<code>2^0.292β</code> classical, <code>2^0.265β</code> quantum). Move the dials; watch which direction each one pushes.
          </p>
          <div class="cost-controls" role="group" aria-label="Parameter dials">
            <label class="cost-slider-field">
              <span>dimension n = <output>${state.n}</output></span>
              <input type="range" min="${N_MIN}" max="${N_MAX}" step="${N_STEP}" value="${state.n}" data-cost="n" aria-label="LWE dimension n"/>
            </label>
            <fieldset class="enc-control-group">
              <legend>log₂ q</legend>
              <div class="enc-segmented" role="radiogroup" aria-label="Modulus size log2 q">
                ${LOGQ_CHOICES.map(lq => `
                  <button class="preset-btn" type="button" role="radio"
                          aria-checked="${lq === state.logq}" tabindex="${lq === state.logq ? "0" : "-1"}"
                          data-cost-logq="${lq}">${lq}</button>`).join("")}
              </div>
            </fieldset>
            <fieldset class="enc-control-group">
              <legend>noise σ</legend>
              <div class="enc-segmented" role="radiogroup" aria-label="Noise standard deviation sigma">
                ${SIGMA_CHOICES.map(s => `
                  <button class="preset-btn" type="button" role="radio" title="${escapeHtml(s.hint)}"
                          aria-checked="${s.v === state.sigma}" tabindex="${s.v === state.sigma ? "0" : "-1"}"
                          data-cost-sigma="${s.v}">${s.label}</button>`).join("")}
              </div>
            </fieldset>
          </div>
          ${readoutHtml()}
          ${plotHtml()}
          <div class="enc-non-claim" role="note">
            <strong>What this is — and is not.</strong> One deliberately simplified estimate: the primal attack under the geometric-series assumption, core-SVP costing, coarse sample grid. A real parameter analysis runs the maintained <em>lattice estimator</em> (Albrecht-Player-Scott lineage — see the references below) across primal, dual, hybrid, and combinatorial attacks under several cost models, and takes the minimum; its numbers also move as cryptanalysis improves. Use this panel to feel the <em>shape</em> — n up → harder, q up (σ fixed) → easier, σ up → harder — never to certify a parameter set. For scale: the <a href="#/lwe">LWE demo's</a> toy sizes (n ≤ 16) sit so far left of this chart that brute force beats lattice reduction outright.
          </div>
        </section>
      `;

      const slider = host.querySelector("[data-cost='n']");
      if (slider) {
        slider.addEventListener("input", () => {
          state.n = parseInt(slider.value, 10);
          const out = host.querySelector(".cost-slider-field output");
          if (out) out.textContent = state.n;
          // Update readout + plot without rebuilding the slider (keeps drag alive).
          const readout = host.querySelector(".cost-readout, .cost-interactive .outcome");
          if (readout) readout.outerHTML = readoutHtml();
          const fig = host.querySelector(".cost-figure");
          if (fig) fig.outerHTML = plotHtml();
        });
        slider.addEventListener("change", () => {
          const r = primalBeta(state.n, state.logq, state.sigma);
          announce(r ? `n = ${state.n}: block size ${r.beta}, about 2 to the ${Math.round(CLASSICAL * r.beta)} classical.` : `n = ${state.n}: beyond the model's range.`);
        });
      }
      const wireCostRadio = (selector, attr, fn) => {
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
      wireCostRadio("[data-cost-logq]", "data-cost-logq", v => {
        state.logq = parseInt(v, 10); curveCache = null; render();
        const r = primalBeta(state.n, state.logq, state.sigma);
        announce(`log2 q = ${state.logq}.${r ? ` About 2 to the ${Math.round(CLASSICAL * r.beta)} classical.` : ""}`);
      });
      wireCostRadio("[data-cost-sigma]", "data-cost-sigma", v => {
        state.sigma = parseFloat(v); curveCache = null; render();
        const r = primalBeta(state.n, state.logq, state.sigma);
        announce(`sigma = ${state.sigma}.${r ? ` About 2 to the ${Math.round(CLASSICAL * r.beta)} classical.` : ""}`);
      });
    }

    render();
  }

  // ---- interactive dispatch table ----
  // Maps the `interactive` field on a concept to its mount function. Adding a
  // new interactive is one line here plus the concept's metadata.
  const INTERACTIVES = {
    "lwe-matrix":   mountLweMatrix,
    "encoding-1d":  mountEncoding1d,
    "lattice-2d":   mountLattice2d,
    "attack-cost":  mountAttackCost
  };

  // ---------- state setters ----------
  function setConcept(id, opts = {}) {
    const target = CONCEPTS_BY_ID[id] || BLOCKED_BY_ID[id] || (id === GLOSSARY_PAGE ? { title: "Glossary" } : null);
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
        : `${target.title}. ${id === GLOSSARY_PAGE ? "" : stateAnnouncement()}`;
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
    if (e.key.toLowerCase() === "g") { e.preventDefault(); return setConcept(GLOSSARY_PAGE, { fromUser: true }); }
    if (e.key === "/") {
      const input = document.getElementById("atlas-search");
      if (input) { e.preventDefault(); input.focus(); }
      return;
    }

    if (e.key.toLowerCase() === "j") {
      e.preventDefault();
      const idx = CONCEPTS.findIndex(c => c.id === state.conceptId);
      const next = idx === -1 ? CONCEPTS[0] : CONCEPTS[(idx + 1) % CONCEPTS.length];
      return setConcept(next.id, { fromUser: true });
    }
    if (e.key.toLowerCase() === "k") {
      e.preventDefault();
      const idx = CONCEPTS.findIndex(c => c.id === state.conceptId);
      const prev = idx === -1 ? CONCEPTS[CONCEPTS.length - 1] : CONCEPTS[(idx - 1 + CONCEPTS.length) % CONCEPTS.length];
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
