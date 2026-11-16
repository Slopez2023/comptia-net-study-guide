/* Dictionary: searchable terms and acronyms with plain-English meanings.
   Entries come from data/dictionary.txt via D.dictionary. Uses the helpers guide.js exposes on window.NP. */
(function () {
  "use strict";
  const { D, S, save, esc, shuffle, lessonUrl, lessonById, $, $$ } = window.NP;
  const params = new URLSearchParams(location.search);
  const box = $("#tool");
  if (!box) return;

  const entries = D.dictionary.map((e) => Object.assign({}, e, { id: (e.t + "|" + e.f).toLowerCase(), dom: Number(e.o.split(".")[0]) }));
  const DOMAINS = window.NP.CHAPTERS.filter((c) => c.weight);
  const letterOf = (t) => { const c = t.trim()[0].toUpperCase(); return c >= "A" && c <= "Z" ? c : "#"; };
  const MARK = { l: "Still learning", k: "Know it" };
  const marks = () => (S().dict = S().dict || {});

  const view = { q: params.get("q") || "", dom: params.get("domain") || "", obj: params.get("obj") || "", type: params.get("type") || "", mark: "", quiz: params.get("quiz") === "1", shuffle: false };
  let order = null; // fixed random order while shuffle is on

  box.innerHTML = `<div class="tool-bar dict-bar">
      <input type="text" id="d-q" placeholder="Search terms or meanings…  (press / to jump here)" aria-label="Search the dictionary" autocomplete="off" spellcheck="false" style="flex:2 1 260px">
      <select id="d-dom" aria-label="Domain"><option value="">All domains</option>${DOMAINS.map((c) => `<option value="${c.n}">Domain ${c.n}: ${esc(c.title)}</option>`).join("")}</select>
      <select id="d-obj" aria-label="Objective"><option value="">All objectives</option>${D.objectives.map((o) => `<option value="${o.id}">${o.id} ${esc(o.title.slice(0, 56))}</option>`).join("")}</select>
      <select id="d-type" aria-label="Kind of term"><option value="">Terms and acronyms</option><option value="acr">Acronyms only</option><option value="exam">Official exam acronym list</option><option value="term">Plain terms only</option></select>
      <select id="d-mark" aria-label="Your progress"><option value="">All, any progress</option><option value="l">Still learning</option><option value="k">Know it</option><option value="n">Not rated yet</option></select>
    </div>
    <div class="tool-bar dict-modes">
      <label><input type="checkbox" id="d-quiz"> Quiz mode <span class="muted">(hide meanings, tap to reveal)</span></label>
      <label><input type="checkbox" id="d-shuf"> Shuffle</label>
      <span class="score" id="d-count" aria-live="polite"></span>
    </div>
    <nav class="dict-jump" id="d-jump" aria-label="Jump to letter"></nav>
    <div id="d-list" class="dict-list"></div>`;

  $("#d-q").value = view.q; $("#d-dom").value = view.dom; $("#d-obj").value = view.obj; $("#d-type").value = view.type; $("#d-quiz").checked = view.quiz;
  $("#dict-meta").innerHTML = `<li>${entries.length} terms</li><li>${entries.filter((e) => e.f).length} acronyms and spelled-out names</li><li>${entries.filter((e) => e.a).length} from the official exam list</li>`;

  /* Higher score = better match. 0 = no match. */
  function score(e, q) {
    const t = e.t.toLowerCase(), f = e.f.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (f.startsWith(q) || f.split(/[\s-]+/).some((w) => w.startsWith(q))) return 60;
    if (t.includes(q)) return 50;
    if (f.includes(q)) return 40;
    if (e.d.toLowerCase().includes(q)) return 20;
    if (e.x && e.x.toLowerCase().includes(q)) return 10;
    return 0;
  }

  function matches() {
    const q = view.q.trim().toLowerCase(), m = marks();
    const objs = view.obj ? view.obj.split(",") : null;
    let list = entries.filter((e) => {
      if (view.dom && String(e.dom) !== view.dom) return false;
      if (objs && !objs.includes(e.o)) return false;
      if (view.type === "acr" && !e.f) return false;
      if (view.type === "exam" && !e.a) return false;
      if (view.type === "term" && e.f) return false;
      const st = m[e.id] || "n";
      if (view.mark && st !== view.mark) return false;
      return true;
    });
    if (q) list = list.map((e) => [e, score(e, q)]).filter((x) => x[1]).sort((a, b) => b[1] - a[1] || a[0].t.localeCompare(b[0].t)).map((x) => x[0]);
    return list;
  }

  const entryHTML = (e) => {
    const l = lessonById(e.o), st = marks()[e.id] || "";
    const c = l ? l.chapter.n : e.dom;
    return `<article class="dict-entry${st ? " is-" + st : ""}" data-id="${esc(e.id)}">
      <div class="dict-head" role="${view.quiz ? "button" : "presentation"}" ${view.quiz ? 'tabindex="0" aria-label="Reveal the meaning"' : ""}>
        <h3 class="dict-term">${esc(e.t)}</h3>
        ${e.f ? `<span class="dict-full">${esc(e.f)}</span>` : ""}
        ${e.a ? `<span class="dict-badge" title="On CompTIA's official N10-009 acronym list">Exam list</span>` : ""}
      </div>
      <div class="dict-body">
        <p class="dict-def">${esc(e.d)}</p>
        ${e.x ? `<p class="dict-tip"><b>Exam tip</b> ${esc(e.x)}</p>` : ""}
      </div>
      <div class="dict-foot">
        ${l ? `<a class="pill" style="background:var(--d${c > 5 ? 0 : c});color:var(--on-dom)" href="${lessonUrl(l)}" title="Open lesson ${esc(e.o)}">${esc(e.o)}</a><a class="dict-lesson" href="${lessonUrl(l)}">${esc(l.title)}</a>` : `<span class="pill" style="background:var(--d${c})">${esc(e.o)}</span>`}
        <span class="dict-mark" role="group" aria-label="Your progress with ${esc(e.t)}">
          <button type="button" class="btn small${st === "l" ? " on-l" : ""}" data-m="l" aria-pressed="${st === "l"}">↺ ${MARK.l}</button>
          <button type="button" class="btn small${st === "k" ? " on-k" : ""}" data-m="k" aria-pressed="${st === "k"}">✓ ${MARK.k}</button>
        </span>
      </div>
    </article>`;
  };

  function render() {
    const list = matches(), q = view.q.trim();
    const grouped = !q && !view.shuffle;
    box.classList.toggle("dict-quiz", view.quiz);
    let shown = list;
    if (view.shuffle && !q) {
      if (!order) order = shuffle(entries.map((e) => e.id));
      const rank = new Map(order.map((id, i) => [id, i]));
      shown = list.slice().sort((a, b) => rank.get(a.id) - rank.get(b.id));
    }
    const m = marks(), known = list.filter((e) => m[e.id] === "k").length, learning = list.filter((e) => m[e.id] === "l").length;
    $("#d-count").textContent = list.length ? `${list.length} shown · ${known} known · ${learning} still learning` : "";

    if (!list.length) { $("#d-list").innerHTML = `<p class="muted dict-empty">Nothing matches. Try fewer letters, or clear a filter.</p>`; $("#d-jump").innerHTML = ""; return; }

    if (grouped) {
      const by = {};
      shown.forEach((e) => (by[letterOf(e.t)] = by[letterOf(e.t)] || []).push(e));
      const letters = Object.keys(by).sort((a, b) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)));
      $("#d-jump").innerHTML = letters.map((L) => `<a href="#letter-${L === "#" ? "num" : L}">${L}</a>`).join("");
      $("#d-list").innerHTML = letters.map((L) => `<section class="dict-group" id="letter-${L === "#" ? "num" : L}"><h2 class="dict-letter">${L}</h2>${by[L].map(entryHTML).join("")}</section>`).join("");
    } else {
      $("#d-jump").innerHTML = "";
      $("#d-list").innerHTML = shown.map(entryHTML).join("");
    }
  }

  function setMark(id, s) {
    const m = marks();
    if (m[id] === s) delete m[id]; else m[id] = s;
    save();
    const el = $(`.dict-entry[data-id="${CSS.escape(id)}"]`), st = m[id] || "";
    if (el) {
      el.classList.remove("is-l", "is-k"); if (st) el.classList.add("is-" + st);
      $$("[data-m]", el).forEach((b) => { const on = b.dataset.m === st; b.classList.toggle("on-" + b.dataset.m, on); b.setAttribute("aria-pressed", on); });
    }
    const list = matches();
    $("#d-count").textContent = `${list.length} shown · ${list.filter((e) => m[e.id] === "k").length} known · ${list.filter((e) => m[e.id] === "l").length} still learning`;
  }

  const bind = (sel, ev, fn) => $(sel).addEventListener(ev, fn);
  bind("#d-q", "input", (e) => { view.q = e.target.value; render(); });
  bind("#d-dom", "change", (e) => { view.dom = e.target.value; view.obj = ""; $("#d-obj").value = ""; render(); });
  bind("#d-obj", "change", (e) => { view.obj = e.target.value; if (view.obj) { view.dom = ""; $("#d-dom").value = ""; } render(); });
  bind("#d-type", "change", (e) => { view.type = e.target.value; render(); });
  bind("#d-mark", "change", (e) => { view.mark = e.target.value; render(); });
  bind("#d-quiz", "change", (e) => { view.quiz = e.target.checked; render(); });
  bind("#d-shuf", "change", (e) => { view.shuffle = e.target.checked; order = null; render(); });

  $("#d-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]");
    if (b) { setMark(b.closest(".dict-entry").dataset.id, b.dataset.m); return; }
    const head = e.target.closest(".dict-head");
    if (head && view.quiz) head.closest(".dict-entry").classList.toggle("open");
  });
  $("#d-list").addEventListener("keydown", (e) => {
    const head = e.target.closest(".dict-head");
    if (head && view.quiz && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); head.closest(".dict-entry").classList.toggle("open"); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.target.matches("input,select,textarea")) { e.preventDefault(); $("#d-q").focus(); }
    if (e.key === "Escape" && e.target.id === "d-q") { e.target.value = ""; view.q = ""; render(); }
  });

  render();
})();
