/* Dictionary: searchable terms and acronyms, look-alike comparisons, and a drill.
   Data comes from data/dictionary.txt and data/dictionary-extras.txt via D.dictionary and D.mixups.
   Uses the helpers guide.js exposes on window.NP. */
(function () {
  "use strict";
  const { D, S, save, esc, shuffle, icon, CHAPTERS, lessonUrl, lessonById, $, $$ } = window.NP;
  const params = new URLSearchParams(location.search);
  const box = $("#tool");
  if (!box) return;

  const idOf = (t, f) => (t + "|" + f).toLowerCase();
  const entries = D.dictionary.map((e) => Object.assign({}, e, { id: idOf(e.t, e.f), dom: Number(e.o.split(".")[0]) }));
  const byId = new Map(entries.map((e) => [e.id, e]));
  const mixups = D.mixups || [];
  const DOMAINS = CHAPTERS.filter((c) => c.weight);
  const domColor = (n) => `var(--d${n > 5 ? 0 : n})`;
  const letterOf = (t) => { const c = t.trim()[0].toUpperCase(); return c >= "A" && c <= "Z" ? c : "#"; };
  const marks = () => (S().dict = S().dict || {});
  const canSpeak = "speechSynthesis" in window;

  /* Port numbers come straight from the ports table, so they can't drift from the Ports drill. */
  const PORT_SKIP = new Set(["sql"]);
  const portsOf = (e) => (PORT_SKIP.has(e.t.toLowerCase()) ? [] : D.ports.filter((p) => p.acronym.toLowerCase() === e.t.toLowerCase()));
  const portLabel = (p) => (p.port.startsWith("IP") ? p.port : `${p.transport.replace("n/a (IP protocol)", "")} ${p.port}`.trim());

  /* ---------------- Page shell ---------------- */
  box.innerHTML = `
    <div class="hub-grid dict-top">
      <section class="panel" id="d-mastery" aria-label="Your progress through the dictionary"></section>
      <section class="panel dict-today" id="d-today" aria-label="Term of the day"></section>
    </div>
    <div class="dict-tabs" role="tablist" aria-label="Dictionary sections">
      <button type="button" role="tab" id="tab-browse" aria-controls="pane-browse" data-tab="browse">Browse</button>
      <button type="button" role="tab" id="tab-lookalikes" aria-controls="pane-lookalikes" data-tab="lookalikes">Look-alikes <span class="dict-count">${mixups.length}</span></button>
      <button type="button" role="tab" id="tab-drill" aria-controls="pane-drill" data-tab="drill">Drill</button>
    </div>

    <div id="pane-browse" role="tabpanel" aria-labelledby="tab-browse">
      <div class="tool-bar dict-bar">
        <input type="text" id="d-q" placeholder="Search terms or meanings…  (press / to jump here)" aria-label="Search the dictionary" autocomplete="off" spellcheck="false" style="flex:2 1 260px">
        <select id="d-dom" aria-label="Domain"><option value="">All domains</option>${DOMAINS.map((c) => `<option value="${c.n}">Domain ${c.n}: ${esc(c.title)}</option>`).join("")}</select>
        <select id="d-obj" aria-label="Objective"><option value="">All objectives</option>${D.objectives.map((o) => `<option value="${o.id}">${o.id} ${esc(o.title.slice(0, 56))}</option>`).join("")}</select>
        <select id="d-type" aria-label="Kind of term"><option value="">Terms and acronyms</option><option value="acr">Acronyms only</option><option value="exam">Official exam acronym list</option><option value="term">Plain terms only</option><option value="port">Ports and protocols</option></select>
        <select id="d-mark" aria-label="Your progress"><option value="">All, any progress</option><option value="l">Still learning</option><option value="k">Know it</option><option value="n">Not rated yet</option></select>
      </div>
      <div class="tool-bar dict-modes">
        <label><input type="checkbox" id="d-quiz"> Cover the meanings <span class="muted">(tap a term to reveal)</span></label>
        <label><input type="checkbox" id="d-shuf"> Shuffle</label>
        <span class="score" id="d-count" aria-live="polite"></span>
      </div>
      <nav class="dict-jump" id="d-jump" aria-label="Jump to letter"></nav>
      <div id="d-list" class="dict-list"></div>
    </div>

    <div id="pane-lookalikes" role="tabpanel" aria-labelledby="tab-lookalikes" hidden>
      <p class="muted" style="margin-top:0;max-width:68ch">The exam loves pairs and trios that sound alike. Each card gives you the one-line rule that tells them apart.</p>
      <div class="tool-bar"><input type="text" id="m-q" placeholder="Filter look-alikes, for example IPS or backup…" aria-label="Filter look-alike groups" autocomplete="off" spellcheck="false" style="flex:1 1 280px"><span class="score" id="m-count"></span></div>
      <div id="m-list" class="mix-list"></div>
    </div>

    <div id="pane-drill" role="tabpanel" aria-labelledby="tab-drill" hidden>
      <div class="tool-bar">
        <select id="q-dom" aria-label="Domain"><option value="">All domains</option>${DOMAINS.map((c) => `<option value="${c.n}">Domain ${c.n}: ${esc(c.title)}</option>`).join("")}</select>
        <select id="q-kind" aria-label="Question type"><option value="mixed">Mixed questions</option><option value="acr">What does it stand for?</option><option value="def">Which term is this?</option></select>
        <select id="q-focus" aria-label="Which terms"><option value="">Any term</option><option value="l">Still learning</option><option value="n">Not rated yet</option></select>
        <select id="q-n" aria-label="Number of questions"><option>10</option><option>20</option><option>30</option></select>
        <button class="btn primary" id="q-go" type="button">Start</button>
      </div>
      <div id="q-run"></div>
    </div>`;

  /* ---------------- Tabs ---------------- */
  const TABS = ["browse", "lookalikes", "drill"];
  function showTab(name, replace) {
    if (!TABS.includes(name)) name = "browse";
    TABS.forEach((t) => {
      const on = t === name;
      $("#pane-" + t).hidden = !on;
      const b = $("#tab-" + t); b.classList.toggle("on", on); b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
    });
    const url = name === "browse" ? location.pathname + location.search : "#" + name;
    if (replace) history.replaceState(null, "", url); else history.pushState(null, "", url);
  }
  $$("[data-tab]").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
  $(".dict-tabs").addEventListener("keydown", (e) => {
    const i = TABS.indexOf(document.activeElement.dataset.tab);
    if (i < 0 || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    showTab(n); $("#tab-" + n).focus();
  });
  window.addEventListener("popstate", () => { const h = location.hash.slice(1); if (!h || TABS.includes(h)) showTab(h, true); });

  /* ---------------- Mastery map + term of the day ---------------- */
  function renderMastery() {
    const m = marks();
    const rows = DOMAINS.map((c) => {
      const all = entries.filter((e) => e.dom === c.n), k = all.filter((e) => m[e.id] === "k").length, l = all.filter((e) => m[e.id] === "l").length;
      const pct = (x) => (all.length ? (x / all.length) * 100 : 0).toFixed(1);
      return `<div class="mast-row"><span class="mast-name"><i style="background:${domColor(c.n)}"></i>${c.n}. ${esc(c.title)}</span>
        <span class="mast-bar" role="img" aria-label="${k} known and ${l} still learning out of ${all.length}"><b style="width:${pct(k)}%;background:${domColor(c.n)}"></b><b class="l" style="width:${pct(l)}%"></b></span>
        <span class="mast-n">${k}<small>/${all.length}</small></span></div>`;
    }).join("");
    const total = entries.length, kn = entries.filter((e) => m[e.id] === "k").length;
    $("#d-mastery").innerHTML = `<h2>Your word power</h2>
      <p class="muted" style="margin-top:-.4em">${kn ? `${kn} of ${total} terms marked "Know it".` : `Mark terms "Know it" or "Still learning" as you go and this fills in.`}</p>${rows}`;
  }
  function renderToday() {
    const pool = entries.filter((e) => e.a || e.x);
    const d = new Date(), seed = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    const e = pool[(seed * 2654435761 >>> 0) % pool.length];
    $("#d-today").innerHTML = `<div class="eyebrow">Term of the day</div>
      <div class="dict-today-term">${esc(e.t)}</div>${e.f ? `<div class="dict-full">${esc(e.f)}</div>` : ""}
      <p>${esc(e.d)}</p>${e.x ? `<p class="dict-tip"><b>Exam tip</b> ${esc(e.x)}</p>` : ""}
      <button class="btn small" type="button" id="today-open">Show in the list ↓</button>`;
    $("#today-open").onclick = () => { reveal(e); };
  }

  /* ---------------- Browse ---------------- */
  const view = { q: params.get("q") || "", dom: params.get("domain") || "", obj: params.get("obj") || "", type: params.get("type") || "", mark: "", quiz: params.get("quiz") === "1", shuffle: false };
  let order = null;

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
      if (view.type === "port" && !portsOf(e).length) return false;
      const st = m[e.id] || "n";
      return !view.mark || st === view.mark;
    });
    if (q) list = list.map((e) => [e, score(e, q)]).filter((x) => x[1]).sort((a, b) => b[1] - a[1] || a[0].t.localeCompare(b[0].t)).map((x) => x[0]);
    return list;
  }

  function entryHTML(e) {
    const l = lessonById(e.o), st = marks()[e.id] || "", c = l ? l.chapter.n : e.dom, ports = portsOf(e);
    return `<article class="dict-entry${st ? " is-" + st : ""}" id="e-${esc(e.id.replace(/[^a-z0-9]+/g, "-"))}" data-id="${esc(e.id)}" style="--c:${domColor(c)}">
      <div class="dict-head" ${view.quiz ? 'role="button" tabindex="0" aria-label="Reveal the meaning"' : ""}>
        <h3 class="dict-term">${esc(e.t)}</h3>
        ${e.f ? `<span class="dict-full">${esc(e.f)}</span>` : ""}
        ${e.a ? `<span class="dict-badge" title="On CompTIA's official N10-009 acronym list">Exam list</span>` : ""}
      </div>
      <div class="dict-body">
        ${e.s || ports.length ? `<div class="dict-meta">${e.s ? `<span class="dict-say"><span class="say-text">${esc(e.s[0])}</span>${canSpeak ? `<button type="button" class="say-btn" data-say="${esc(e.s[1])}" aria-label="Hear ${esc(e.t)} pronounced">${icon("speaker")}</button>` : ""}</span>` : ""}${ports.map((p) => `<span class="dict-port" title="${esc(p.protocol)}">${esc(portLabel(p))}</span>`).join("")}</div>` : ""}
        <p class="dict-def">${esc(e.d)}</p>
        ${e.x ? `<p class="dict-tip"><b>Exam tip</b> ${esc(e.x)}</p>` : ""}
        ${e.m ? `<div class="dict-mix"><span>Don't mix up:</span>${e.m.map((i) => `<button type="button" class="chip link" data-mix="${i}">${esc(mixups[i].title)}</button>`).join("")}</div>` : ""}
      </div>
      <div class="dict-foot">
        ${l ? `<a class="pill" style="background:${domColor(c)};color:var(--on-dom)" href="${lessonUrl(l)}" title="Open lesson ${esc(e.o)}">${esc(e.o)}</a><a class="dict-lesson" href="${lessonUrl(l)}">${esc(l.title)}</a>` : `<span class="pill" style="background:${domColor(c)}">${esc(e.o)}</span>`}
        <span class="dict-mark" role="group" aria-label="Your progress with ${esc(e.t)}">
          <button type="button" class="btn small${st === "l" ? " on-l" : ""}" data-m="l" aria-pressed="${st === "l"}">↺ Still learning</button>
          <button type="button" class="btn small${st === "k" ? " on-k" : ""}" data-m="k" aria-pressed="${st === "k"}">✓ Know it</button>
        </span>
      </div>
    </article>`;
  }

  function renderBrowse() {
    const list = matches(), q = view.q.trim();
    const grouped = !q && !view.shuffle;
    $("#pane-browse").classList.toggle("dict-quiz", view.quiz);
    let shown = list;
    if (view.shuffle && !q) {
      if (!order) order = shuffle(entries.map((e) => e.id));
      const rank = new Map(order.map((id, i) => [id, i]));
      shown = list.slice().sort((a, b) => rank.get(a.id) - rank.get(b.id));
    }
    updateCount(list);
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
  function updateCount(list) {
    const m = marks();
    $("#d-count").textContent = list.length ? `${list.length} shown · ${list.filter((e) => m[e.id] === "k").length} known · ${list.filter((e) => m[e.id] === "l").length} still learning` : "";
  }

  /* Open the Browse tab on one term, clearing any filter that would hide it. */
  function reveal(e) {
    Object.assign(view, { q: "", dom: "", obj: "", type: "", mark: "", shuffle: false });
    ["#d-q", "#d-dom", "#d-obj", "#d-type", "#d-mark"].forEach((s) => ($(s).value = ""));
    $("#d-shuf").checked = false;
    showTab("browse"); renderBrowse();
    const el = document.getElementById("e-" + e.id.replace(/[^a-z0-9]+/g, "-"));
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1800); }
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
    updateCount(matches()); renderMastery();
  }

  function speak(text) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = 0.85;
    speechSynthesis.speak(u);
  }

  const on = (sel, ev, fn) => $(sel).addEventListener(ev, fn);
  on("#d-q", "input", (e) => { view.q = e.target.value; renderBrowse(); });
  on("#d-dom", "change", (e) => { view.dom = e.target.value; view.obj = ""; $("#d-obj").value = ""; renderBrowse(); });
  on("#d-obj", "change", (e) => { view.obj = e.target.value; if (view.obj) { view.dom = ""; $("#d-dom").value = ""; } renderBrowse(); });
  on("#d-type", "change", (e) => { view.type = e.target.value; renderBrowse(); });
  on("#d-mark", "change", (e) => { view.mark = e.target.value; renderBrowse(); });
  on("#d-quiz", "change", (e) => { view.quiz = e.target.checked; renderBrowse(); });
  on("#d-shuf", "change", (e) => { view.shuffle = e.target.checked; order = null; renderBrowse(); });

  on("#d-list", "click", (e) => {
    const b = e.target.closest("[data-m]");
    if (b) { setMark(b.closest(".dict-entry").dataset.id, b.dataset.m); return; }
    const s = e.target.closest("[data-say]");
    if (s) { speak(s.dataset.say); return; }
    const x = e.target.closest("[data-mix]");
    if (x) { openMix(Number(x.dataset.mix)); return; }
    const head = e.target.closest(".dict-head");
    if (head && view.quiz) head.closest(".dict-entry").classList.toggle("open");
  });
  on("#d-list", "keydown", (e) => {
    const head = e.target.closest(".dict-head");
    if (head && view.quiz && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); head.closest(".dict-entry").classList.toggle("open"); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.target.matches("input,select,textarea")) { e.preventDefault(); showTab("browse"); $("#d-q").focus(); }
    if (e.key === "Escape" && e.target.id === "d-q") { e.target.value = ""; view.q = ""; renderBrowse(); }
  });

  /* ---------------- Look-alikes ---------------- */
  function mixHTML(g, i) {
    const rows = g.items.map((it) => {
      const e = byId.get(it.r.toLowerCase());
      return `<tr><th scope="row"><button type="button" class="mix-term" data-open="${esc(e.id)}">${esc(e.t)}</button>${e.f ? `<small>${esc(e.f)}</small>` : ""}</th><td>${esc(it.n)}</td></tr>`;
    }).join("");
    return `<article class="mix" id="mix-${i}"><h3>${esc(g.title)}</h3><p class="mix-rule"><span>Rule of thumb</span>${esc(g.rule)}</p><table><tbody>${rows}</tbody></table></article>`;
  }
  function renderMix() {
    const q = $("#m-q").value.trim().toLowerCase();
    const list = mixups.map((g, i) => [g, i]).filter(([g]) => !q || (g.title + " " + g.rule + " " + g.items.map((x) => x.r + " " + x.n).join(" ")).toLowerCase().includes(q));
    $("#m-count").textContent = `${list.length} of ${mixups.length} groups`;
    $("#m-list").innerHTML = list.length ? list.map(([g, i]) => mixHTML(g, i)).join("") : `<p class="muted dict-empty">No look-alike group matches that.</p>`;
  }
  function openMix(i) {
    showTab("lookalikes"); $("#m-q").value = ""; renderMix();
    const el = $("#mix-" + i);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1800); }
  }
  on("#m-q", "input", renderMix);
  on("#m-list", "click", (e) => { const b = e.target.closest("[data-open]"); if (b) reveal(byId.get(b.dataset.open)); });

  /* ---------------- Drill ---------------- */
  const mask = (text, e) => {
    const names = [e.t, e.f].filter(Boolean).sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return text.replace(new RegExp("(^|[^A-Za-z0-9])(" + names.join("|") + ")(?![A-Za-z0-9])", "gi"), "$1_____");
  };

  function buildQuestions() {
    const dom = $("#q-dom").value, kind = $("#q-kind").value, focus = $("#q-focus").value, n = Number($("#q-n").value), m = marks();
    let pool = entries.filter((e) => (!dom || String(e.dom) === dom) && (!focus || (m[e.id] || "n") === focus));
    const asked = shuffle(pool);
    const qs = [];
    for (const e of asked) {
      if (qs.length >= n) break;
      const wantAcr = kind === "acr" || (kind === "mixed" && e.f && Math.random() < 0.5);
      if (wantAcr) {
        if (!e.f) continue;
        const wrong = shuffle(entries.filter((x) => x.f && x.id !== e.id && x.f.toLowerCase() !== e.f.toLowerCase())).sort((a, b) => (b.dom === e.dom) - (a.dom === e.dom) || 0).slice(0, 12);
        const opts = shuffle(wrong.slice(0, 3).map((x) => x.f).concat(e.f));
        qs.push({ e, prompt: `What does <b>${esc(e.t)}</b> stand for?`, opts, answer: e.f, why: e.d });
      } else {
        if (kind === "acr" || e.d.length < 40) continue;
        const sameKind = entries.filter((x) => x.id !== e.id && !!x.f === !!e.f && x.t.toLowerCase() !== e.t.toLowerCase());
        const near = shuffle(sameKind.filter((x) => x.dom === e.dom)), far = shuffle(sameKind.filter((x) => x.dom !== e.dom));
        const wrong = near.concat(far).slice(0, 3).map((x) => x.t);
        qs.push({ e, prompt: `Which term fits this meaning?<blockquote>${esc(mask(e.d, e))}</blockquote>`, opts: shuffle(wrong.concat(e.t)), answer: e.t, why: e.d });
      }
    }
    return qs;
  }

  function startDrill() {
    const qs = buildQuestions(), run = $("#q-run");
    if (!qs.length) { run.innerHTML = `<p class="muted dict-empty">No terms match those settings. Try "Any term" or a wider domain.</p>`; return; }
    let i = 0, right = 0, streak = 0; const missed = [];
    const show = () => {
      const q = qs[i];
      run.innerHTML = `<p class="score">Question ${i + 1} of ${qs.length} · ${right} correct${streak > 2 ? ` · streak ${streak} 🔥` : ""}</p>
        <div class="panel drill-q"><div class="drill-prompt">${q.prompt}</div>
        <div class="drill-opts">${q.opts.map((o, k) => `<button type="button" class="btn drill-opt" data-k="${k}"><kbd>${k + 1}</kbd>${esc(o)}</button>`).join("")}</div>
        <div class="drill-fb" aria-live="polite"></div></div>`;
      const btns = $$(".drill-opt", run);
      const pick = (k) => {
        if (run.dataset.done === String(i)) return;
        run.dataset.done = String(i);
        const ok = q.opts[k] === q.answer;
        btns.forEach((b, j) => { b.disabled = true; if (q.opts[j] === q.answer) b.classList.add("ok"); else if (j === k) b.classList.add("no"); });
        if (ok) { right++; streak++; } else { streak = 0; missed.push(q.e); marks()[q.e.id] = "l"; save(); renderMastery(); }
        $(".drill-fb", run).innerHTML = `<p><strong>${ok ? "✓ Correct." : "✗ Not quite."}</strong> <b>${esc(q.e.t)}</b>${q.e.f ? ` = ${esc(q.e.f)}` : ""}. ${esc(q.why)}</p>${ok ? "" : `<p class="muted">Added to "Still learning".</p>`}
          <button class="btn primary" type="button" id="q-next">${i + 1 < qs.length ? "Next →" : "See results"}</button>`;
        $("#q-next").onclick = () => { i++; i < qs.length ? show() : done(); }; $("#q-next").focus();
      };
      btns.forEach((b) => (b.onclick = () => pick(Number(b.dataset.k))));
      run._pick = pick; run._n = q.opts.length;
    };
    const done = () => {
      const pct = Math.round((right / qs.length) * 100);
      run.innerHTML = `<div class="panel"><div class="eyebrow">Round complete</div><h2 style="margin-top:0">${right} / ${qs.length} · ${pct}%</h2>
        <p class="muted">${pct >= 90 ? "Exam-ready on these." : pct >= 70 ? "Solid. The misses below are your next study list." : "Worth another pass. The misses below are now marked Still learning."}</p>
        ${missed.length ? `<h3>Missed</h3><ul class="drill-missed">${missed.map((e) => `<li><button type="button" class="mix-term" data-open="${esc(e.id)}">${esc(e.t)}</button>${e.f ? ` <small>${esc(e.f)}</small>` : ""}</li>`).join("")}</ul>` : ""}
        <p><button class="btn primary" type="button" id="q-again">New round</button></p></div>`;
      $("#q-again").onclick = startDrill;
      $$("[data-open]", run).forEach((b) => (b.onclick = () => reveal(byId.get(b.dataset.open))));
    };
    delete run.dataset.done; show();
  }
  on("#q-go", "click", startDrill);
  document.addEventListener("keydown", (e) => {
    const run = $("#q-run");
    if ($("#pane-drill").hidden || e.target.matches("input,select,textarea") || !run._pick || !/^[1-4]$/.test(e.key)) return;
    if (Number(e.key) <= run._n) run._pick(Number(e.key) - 1);
  });

  /* ---------------- Start up ---------------- */
  $("#d-q").value = view.q; $("#d-dom").value = view.dom; $("#d-obj").value = view.obj; $("#d-type").value = view.type; $("#d-quiz").checked = view.quiz;
  $("#dict-meta").innerHTML = `<li>${entries.length} terms</li><li>${entries.filter((e) => e.a).length} from the official exam acronym list</li><li>${mixups.length} look-alike groups</li>`;
  renderMastery(); renderToday(); renderBrowse(); renderMix();
  showTab(location.hash.slice(1), true);
})();
