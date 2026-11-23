/* Study & Test hub (practice/exam.html).
   One place to study and test for the day: readiness meter, a guided daily session,
   exam-style multiple choice + PBQs with the answer shown right away (answer, why, why-not,
   memory clue, exam trigger), a trap-pairs speed drill, and a printable cram sheet.
   Question bank: assets/js/exam/*.js push into window.NP_EXAM; the original 90 quiz
   questions are upgraded by assets/js/exam/legacy.js. Progress: localStorage "np-exam-v1". */
(function () {
  "use strict";
  const BANK = window.NP_EXAM || { mc: [], pbq: [] };
  const D = window.NP_DATA || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // Plain text from bank HTML (tags removed, entities decoded) so callers can esc() it exactly once.
  const strip = (h) => { const t = document.createElement("textarea"); t.innerHTML = String(h).replace(/<[^>]+>/g, " "); return t.value.replace(/\s+/g, " ").trim(); };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const L = "ABCDEFGH";
  const DOMAINS = { 1: "Networking concepts", 2: "Network implementation", 3: "Network operations", 4: "Network security", 5: "Network troubleshooting" };
  const WEIGHT = { 1: 23, 2: 20, 3: 19, 4: 14, 5: 24 };
  const PASS = 83, CLOSE = 70;              // ~720/900 ≈ 80–83% correct; aim for the top of that range
  const PACE = { mc: 60, pbq: 180 };        // seconds before the pace clock turns amber
  const dom = (q) => Number(String(q.o).split(".")[0]);

  /* ---------- question pool ---------- */
  const LEG = window.NP_EXAM_LEGACY || {};
  const legacy = (D.questions || []).filter((q) => LEG[q.id]).map((q) => ({
    id: "q" + q.id, o: q.objective, q: esc(q.question), c: q.choices, a: q.answer, why: q.explanation, ...LEG[q.id]
  }));
  const MC = [...BANK.mc, ...legacy].map((q) => ({ ...q, kind: "mc" }));
  const PBQ = BANK.pbq.map((q) => ({ ...q, kind: "pbq" }));
  const ALL = [...MC, ...PBQ];
  const BY_ID = Object.fromEntries(ALL.map((q) => [q.id, q]));

  /* ---------- progress ---------- */
  const KEY = "np-exam-v1";
  let P;
  try { P = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { P = {}; }
  const norm = () => { P.q = P.q || {}; P.log = P.log || []; P.trap = P.trap || {}; P.day = P.day || {}; };
  norm();
  const save = () => {
    const keep = Object.keys(P.day).sort().slice(-14);
    P.day = Object.fromEntries(keep.map((k) => [k, P.day[k]]));
    try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* private mode */ }
  };
  // Another tab saved: adopt its progress so this tab doesn't overwrite it with stale data.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) { try { P = JSON.parse(e.newValue); norm(); } catch (err) { /* ignore */ } }
  });
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const rec = (id) => P.q[id] || { seen: 0, right: 0, streak: 0, guess: 0 };
  const mastered = (id) => rec(id).streak >= 2;
  const needsWork = (id) => { const r = rec(id); return r.seen > 0 && r.streak < 2; };
  const wasGuessed = (id) => rec(id).last === 2;
  function mark(q, ok, secs) {
    const r = rec(q.id);
    r.seen++; if (ok) { r.right++; r.streak++; } else r.streak = 0;
    r.last = ok ? 1 : 0; r.t = secs; P.q[q.id] = r;
    P.log.push({ d: dom(q), ok: ok ? 1 : 0, ts: Date.now(), t: secs, k: q.kind === "pbq" ? 1 : 0 });
    if (P.log.length > 1500) P.log = P.log.slice(-1500);
    save();
  }
  function markGuess(q, on) {
    const r = rec(q.id), last = P.log[P.log.length - 1];
    if (on) { r.prevStreak = r.streak; r.streak = 0; r.guess = (r.guess || 0) + 1; r.last = 2; if (last) last.ok = 0; }
    else { r.streak = r.prevStreak ?? r.streak; r.guess = Math.max(0, (r.guess || 1) - 1); r.last = 1; if (last) last.ok = 1; }
    P.q[q.id] = r; save();
  }
  // Unseen first, then the ones to fix, then the rest. Shuffled inside each group.
  const prioritize = (qs) => {
    const g = [[], [], []];
    qs.forEach((q) => { const r = rec(q.id); g[r.seen === 0 ? 0 : r.streak < 2 ? 1 : 2].push(q); });
    return [...shuffle(g[0]), ...shuffle(g[1]), ...shuffle(g[2])];
  };
  function weightedMC(n) {
    const out = [];
    [1, 2, 3, 4, 5].forEach((d) => out.push(...prioritize(MC.filter((q) => dom(q) === d)).slice(0, Math.round((n * WEIGHT[d]) / 100))));
    return shuffle(out);
  }

  /* ---------- readiness ---------- */
  function readiness() {
    const per = {};
    [1, 2, 3, 4, 5].forEach((d) => {
      const rs = P.log.filter((x) => x.d === d).slice(-30);
      per[d] = { n: rs.length, pct: rs.length ? Math.round((rs.filter((x) => x.ok).length / rs.length) * 100) : null };
    });
    const have = [1, 2, 3, 4, 5].filter((d) => per[d].n >= 5);
    const overall = have.length ? Math.round(have.reduce((s, d) => s + per[d].pct * WEIGHT[d], 0) / have.reduce((s, d) => s + WEIGHT[d], 0)) : null;
    const recent = P.log.slice(-50), times = recent.filter((x) => !x.k && x.t != null).map((x) => x.t);
    return { per, overall, have: have.length, total: P.log.length, pace: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null };
  }
  const status = (pct) => pct == null ? { cls: "none", icon: "–", label: "Not enough data" }
    : pct >= PASS ? { cls: "good", icon: "✓", label: "On track" }
    : pct >= CLOSE ? { cls: "warn", icon: "▲", label: "Close" } : { cls: "bad", icon: "✕", label: "Not yet" };
  function weakestDomain() {
    const r = readiness();
    // Least practiced first (under 10 answers), then lowest score, ties broken by exam weight.
    return [1, 2, 3, 4, 5].sort((a, b) => {
      const A = r.per[a], B = r.per[b];
      const ua = A.n < 10, ub = B.n < 10;
      if (ua !== ub) return ua ? -1 : 1;
      if (ua && ub) return A.n - B.n || WEIGHT[b] - WEIGHT[a];
      return A.pct - B.pct || WEIGHT[b] - WEIGHT[a];
    })[0];
  }
  function daysLeft() {
    let date = "2026-11-30";
    try { date = JSON.parse(localStorage.getItem("np-guide-v1") || "{}").examDate || date; } catch (e) { /* ignore */ }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = "2026-11-30";
    return { n: Math.round((new Date(date + "T09:00:00") - new Date(today() + "T09:00:00")) / 864e5), date };
  }

  // Keyboard: 1–8 / A–F pick a choice, Enter = next. Ignores typing and browser shortcuts (Cmd/Ctrl/Alt).
  function bindKeys(extra) {
    document.onkeydown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.matches("input, select, textarea")) return;
      if (e.key === "Enter" && $("#ex-nextbtn")) { e.preventDefault(); $("#ex-nextbtn").click(); return; }
      if (extra && extra(e)) return;
      const k = e.key.toUpperCase(), idx = /^[1-8]$/.test(k) ? Number(k) - 1 : "ABCDEF".indexOf(k);
      const btns = $$("#ex-q .choice:not(:disabled)");
      if (k.length === 1 && idx >= 0 && btns[idx]) btns[idx].click();
    };
  }

  /* ---------- today's session ---------- */
  function sessionSteps() {
    const work = ALL.filter((q) => needsWork(q.id)).length;
    const wd = weakestDomain();
    return [
      { key: "trap", title: "Warm up: trap pairs", sub: "20 look-alike terms, fast. About 5 min.", go: () => start("trap") },
      { key: "missed", title: "Fix my misses", sub: work ? `${Math.min(work, 25)} of ${work} questions to lock in.` : "Nothing to fix yet. This gets ticked off automatically.", auto: !work, go: () => start("missed") },
      { key: "weak", title: `Weakest area: Domain ${wd}`, sub: `20 questions on ${DOMAINS[wd]}.`, go: () => start("dom", wd, "weak") },
      { key: "pbq", title: "PBQ set", sub: "4 hands-on questions, like the start of the real exam.", go: () => start("pbq4") },
      { key: "mock", title: "Mini mock exam", sub: "30 questions, 30-minute clock, weighted like the exam.", go: () => start("mini") },
      { key: "cram", title: "Read your cram sheet", sub: "Clues and trigger words for everything you've missed.", go: () => cram() }
    ];
  }
  const dayDone = () => (P.day[today()] = P.day[today()] || {});
  const stepDone = (k) => { dayDone()[k] = 1; save(); };

  /* ---------- network-themed visuals ---------- */
  const svgIc = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICON = {
    terminal: svgIc('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15H17"/>'),
    timer: svgIc('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 2M9.5 2.5h5"/>'),
    wrench: svgIc('<path d="M14.5 4a4.5 4.5 0 0 0-4.2 6.1L4 16.4 7.6 20l6.3-6.3A4.5 4.5 0 0 0 20 9.5l-2.8 2.8-3.3-.7-.7-3.3L16 5.5A4.5 4.5 0 0 0 14.5 4z"/>'),
    dice: svgIc('<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" stroke-width="3"/>'),
    split: svgIc('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 11 15.7 7M8.3 13l7.4 4"/>'),
    topology: svgIc('<rect x="9" y="3" width="6" height="5" rx="1.2"/><rect x="3" y="16" width="6" height="5" rx="1.2"/><rect x="15" y="16" width="6" height="5" rx="1.2"/><path d="M12 8v4M6 16v-4h12v4"/>'),
    bolt: svgIc('<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>'),
    sheet: svgIc('<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12h7M9 15.5h7M9 19h4"/>'),
    switch: svgIc('<rect x="2.5" y="8" width="19" height="8" rx="2"/><path d="M6.5 12h.01M9.5 12h.01M12.5 12h.01M15.5 12h.01" stroke-width="2.6"/><path d="M18.5 10.8v2.4"/>')
  };
  // Animated topology banner: packets moving through WAN → firewall → router → switches → hosts.
  function banner(r, st, dl, nDone, total) {
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = { wan: [48, 112, "WAN"], fw: [150, 112, "FW"], r1: [258, 112, "R1"], sw1: [374, 58, "SW1"], sw2: [374, 166, "SW2"], ap: [496, 24, "AP"], srv: [496, 88, "SRV"], pc1: [496, 140, "PC"], pc2: [496, 200, "PC"] };
    const LINKS = [["wan", "fw"], ["fw", "r1"], ["r1", "sw1"], ["r1", "sw2"], ["sw1", "ap"], ["sw1", "srv"], ["sw2", "pc1"], ["sw2", "pc2"]];
    const COL = ["#60a5fa", "#2dd4bf", "#fb923c", "#fb7185", "#a78bfa", "#4ade80"];
    const path = (a, b) => `M${N[a][0]} ${N[a][1]} L${N[b][0]} ${N[b][1]}`;
    const PK = [["wan", "fw", 0, 2.2, 0], ["fw", "r1", 1, 1.6, 0.4], ["r1", "sw1", 2, 1.8, 0.9], ["r1", "sw2", 3, 1.8, 0.2], ["sw1", "srv", 4, 1.4, 1.1], ["sw2", "pc1", 5, 1.5, 0.6],
      ["sw1", "ap", 0, 1.5, 1.6], ["sw2", "pc2", 2, 1.7, 1.3], ["r1", "fw", 4, 1.6, 1.2], ["srv", "sw1", 1, 1.4, 0.3], ["pc2", "sw2", 5, 1.7, 0.8], ["fw", "wan", 3, 2.2, 1.5]];
    const node = (id) => { const [x, y, t] = N[id], w = id === "wan" ? 64 : 46;
      return `<g class="nn ${id === "wan" ? "wan" : ""}" transform="translate(${x},${y})"><rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="8"/><text y="4.5" text-anchor="middle">${t}</text>${id === "wan" ? "" : `<circle class="nled" cx="${w / 2 - 6}" cy="-9" r="2.4" style="animation-delay:${(x + y) % 17 / 10}s"/>`}</g>`; };
    const chip = (cls, txt) => `<span class="chip-noc"><i class="led ${cls}"></i>${txt}</span>`;
    return `<section class="noc" aria-label="Study and Test overview">
      <div class="noc-text">
        <div class="noc-eyebrow">CompTIA Network+ · N10-009</div>
        <h1>Study &amp; Test</h1>
        <p class="noc-prompt"><span class="ps">netplus@study:~$</span> <span class="cmd">start session --today</span><span class="cursor" aria-hidden="true"></span></p>
        <div class="noc-chips">
          ${chip(dl.n <= 3 ? "warn" : "good", `${Math.max(dl.n, 0)} day${dl.n === 1 ? "" : "s"} to exam`)}
          ${chip(st.cls === "none" ? "off" : st.cls, `Readiness ${r.overall == null ? "–" : r.overall + "%"}`)}
          ${chip(nDone === total ? "good" : "warn", `Session ${nDone}/${total}`)}
        </div>
      </div>
      <svg class="noc-map" viewBox="0 0 560 224" aria-hidden="true" focusable="false">
        ${LINKS.map(([a, b]) => `<path class="nlink" d="${path(a, b)}"/>`).join("")}
        ${still ? "" : PK.map(([a, b, c, d, s]) => `<circle class="pkt" r="3.2" fill="${COL[c]}"><animateMotion dur="${d}s" begin="-${s}s" repeatCount="indefinite" path="${path(a, b)}"/></circle>`).join("")}
        ${Object.keys(N).map(node).join("")}
      </svg>
    </section>`;
  }

  /* ---------- home ---------- */
  const root = $("#exam");
  function home() {
    stopClocks(); document.onkeydown = null;
    const r = readiness(), st = status(r.overall), dl = daysLeft();
    const steps = sessionSteps(), done = dayDone();
    const isDone = (s) => !!(done[s.key] || s.auto);   // "auto" = nothing to do right now; not saved, so it reopens when misses appear
    const nextStep = steps.find((s) => !isDone(s));
    const nDone = steps.filter(isDone).length;
    const work = ALL.filter((q) => needsWork(q.id)).length;
    const guessed = ALL.filter((q) => wasGuessed(q.id) && needsWork(q.id)).length;
    const mast = ALL.filter((q) => mastered(q.id)).length;
    const seen = ALL.filter((q) => rec(q.id).seen).length;

    const meters = [1, 2, 3, 4, 5].map((d) => {
      const x = r.per[d], s = status(x.n >= 5 ? x.pct : null);
      const w = x.pct == null ? 0 : x.pct;
      return `<div class="rd-row" title="Domain ${d}: ${x.n ? `${x.pct}% on your last ${x.n} answers` : "no answers yet"}. Pass line ${PASS}%.">
        <span class="rd-name"><b>D${d}</b> ${DOMAINS[d]} <small>${WEIGHT[d]}%</small></span>
        <span class="rd-track ${s.cls}" role="img" aria-label="Domain ${d} ${x.n ? x.pct + " percent" : "no data"}"><span class="rd-fill" style="width:${w}%"></span><span class="rd-goal" style="left:${PASS}%"></span></span>
        <span class="rd-fig">${x.n ? `${x.pct}%` : "–"} <small>${x.n ? `${s.icon} ${x.n} ans` : "no data"}</small></span>
      </div>`;
    }).join("");

    const port = (d) => {
      const qs = ALL.filter((q) => dom(q) === d), m = qs.filter((q) => mastered(q.id)).length, x = r.per[d];
      const led = x.n >= 5 ? status(x.pct).cls : x.n ? "warn" : "off";
      return `<button class="ex-dom port-card" type="button" data-dom="${d}" style="--c:var(--d${d})">
        <span class="port-top"><span class="rj45" aria-hidden="true"><i class="led ${led}"></i><i class="led act"></i></span><span class="port-id">Gi0/${d}</span></span>
        <span class="k">Domain ${d} · ${WEIGHT[d]}% of exam</span><b>${DOMAINS[d]}</b>
        <span class="bar" role="img" aria-label="${m} of ${qs.length} locked in"><span style="width:${qs.length ? Math.round((m / qs.length) * 100) : 0}%"></span></span>
        <small>${m}/${qs.length} locked in${x.n ? ` · last ${x.n}: ${x.pct}%` : ""}</small></button>`;
    };
    const mode = (key, icon, k, title, body, dis) => `<button class="ex-mode" type="button" data-mode="${key}" ${dis ? "disabled" : ""}>
        <span class="mode-ic" aria-hidden="true">${ICON[icon]}</span><span class="k">${k}</span><b>${title}</b><span class="mode-body">${body}</span></button>`;

    root.innerHTML = `
      ${banner(r, st, dl, nDone, steps.length)}
      <div class="hub-top">
        <section class="panel rd">
          <div class="panel-h"><span class="eyebrow">Readiness · link health</span><span class="led ${st.cls === "none" ? "off" : st.cls}" aria-hidden="true"></span></div>
          <div class="rd-hero">
            <span class="rd-big">${r.overall == null ? "–" : r.overall + "%"}</span>
            <span class="rd-status ${st.cls}">${st.icon} ${st.label}</span>
          </div>
          <p class="muted rd-note">${r.overall == null ? "Answer at least 5 questions in a domain to start the meter." : `Weighted by exam domain, from your last 30 answers per domain. Guesses count as misses. Pass line is about ${PASS}%.`}</p>
          <div class="rd-list">${meters}</div>
          <div class="spec" aria-label="Real exam format">
            <div><span class="n">≤ 90</span>questions</div><div><span class="n">90</span>minutes</div>
            <div><span class="n">720</span>to pass /900</div><div><span class="n">~${PASS}%</span>correct</div>
          </div>
          <div class="rd-key"><span><i class="goal"></i>Pass line ${PASS}%</span><span>✓ on track</span><span>▲ close (${CLOSE}–${PASS - 1}%)</span><span>✕ not yet</span></div>
        </section>
        <section class="panel today">
          <div class="today-head">
            <div><div class="eyebrow">Today's session</div><div class="what">${nDone === steps.length ? "Session complete ✓" : `Step ${nDone + 1} of ${steps.length}`}</div></div>
            <span class="tr-cmd" aria-hidden="true">traceroute exam-day</span>
          </div>
          <ol class="steps hops">${steps.map((s, n) => { const c = isDone(s) ? "done" : s === nextStep ? "now" : ""; return `<li class="${c}"><button type="button" data-step="${s.key}"><span class="hop">${n + 1}</span><span class="led ${c === "done" ? "good" : c === "now" ? "warn blink" : "off"}" aria-hidden="true"></span><span class="txt"><b>${esc(s.title)}</b><small>${esc(s.sub)}</small></span><span class="hop-st">${c === "done" ? "done" : c === "now" ? "next" : "* * *"}</span></button></li>`; }).join("")}</ol>
          ${nextStep ? `<button class="btn primary big wide" type="button" id="go-next">Start: ${esc(nextStep.title)} →</button>` : `<p class="muted">Done for today. Run a <b>full practice exam</b> or <b>Fix my misses</b> again if you have energy left.</p>`}
        </section>
      </div>

      <div class="kpis">
        <div class="kpi"><span class="n">${seen}<small>/${ALL.length}</small></span>questions answered</div>
        <div class="kpi"><span class="n">${mast}</span>locked in <small>(right twice in a row)</small></div>
        <div class="kpi"><span class="n">${work}</span>to fix${guessed ? ` <small>(${guessed} guessed)</small>` : ""}</div>
        <div class="kpi"><span class="n">${r.pace == null ? "–" : r.pace + "s"}</span>avg per question <small>(aim ≤ ${PACE.mc}s)</small></div>
      </div>

      <h2 class="ex-h"><span class="h-ic" aria-hidden="true">${ICON.terminal}</span>Test yourself</h2>
      <div class="ex-modes">
        <button class="ex-mode main" type="button" data-mode="full">
          <span class="main-grid" aria-hidden="true"></span>
          <span class="k"><span class="led good blink"></span> Most like the real thing</span><b>Full practice exam</b>
          <span class="mode-body">5 PBQs, then multiple choice. 90 questions, 90-minute clock, weighted like the exam.</span>
          <span class="main-cta">Start exam →</span></button>
        ${mode("mini", "timer", "30 minutes", "Mini mock exam", "30 questions with a clock.")}
        ${mode("missed", "wrench", "Best use of time", "Fix my misses", work ? `${work} to lock in. They keep coming back until you get each right twice in a row.` : "Nothing yet. Misses and guesses land here.", !work)}
        ${mode("guessed", "dice", "Lucky guesses", "Guessed ones", guessed ? `${guessed} you got right but marked as a guess.` : "Tap 'I guessed' after a lucky answer and it shows up here.", !guessed)}
        ${mode("trap", "split", "Speed drill", "Trap pairs", `${trapDeck().length} look-alike terms (RPO vs RTO, SSE vs SASE…). 8 seconds each.`)}
        ${mode("pbq", "topology", "Hands-on", "All PBQs", `${PBQ.length} performance-based questions: configs, diagrams, CLI output, ordering.`)}
        ${mode("quick", "bolt", "10 minutes", "Quick 20", "20 multiple choice, new ones first.")}
        ${mode("cram", "sheet", "Night before", "Cram sheet", "Every clue and trigger for what you've missed, on one printable page.")}
      </div>

      <h2 class="ex-h"><span class="h-ic" aria-hidden="true">${ICON.switch}</span>Patch into a domain</h2>
      <div class="ex-doms">${[1, 2, 3, 4, 5].map(port).join("")}</div>

      <h2 class="ex-h"><span class="h-ic" aria-hidden="true">${ICON.wrench}</span>Quick tools</h2>
      <div class="tools-row">
        <a class="tool-link" href="subnetting.html"><span class="cmd">subnet</span><b>Subnetting</b><small>timed drill</small></a>
        <a class="tool-link" href="ports.html"><span class="cmd">netstat</span><b>Ports</b><small>speed drill</small></a>
        <a class="tool-link" href="flashcards.html"><span class="cmd">cards</span><b>Flashcards</b><small>430+ cards</small></a>
        <a class="tool-link" href="../dictionary.html"><span class="cmd">man</span><b>Dictionary</b><small>look up a term</small></a>
        <a class="tool-link" href="../index.html#chapters"><span class="cmd">cat</span><b>Chapters</b><small>re-read a topic</small></a>
      </div>

      <p class="muted ex-note">All ${ALL.length} questions are original, written to match the style, difficulty and topics of the real N10-009 exam. CompTIA's real questions are confidential, and sites that sell them are braindumps that can get a cert revoked. Progress is saved in this browser only.</p>
      <p><button class="btn small ghost" type="button" id="ex-reset">Reset Study &amp; Test progress</button></p>`;

    $$("[data-mode]", root).forEach((b) => (b.onclick = () => start(b.dataset.mode)));
    $$("[data-dom]", root).forEach((b) => (b.onclick = () => start("dom", Number(b.dataset.dom))));
    $$("[data-step]", root).forEach((b) => (b.onclick = () => steps.find((s) => s.key === b.dataset.step).go()));
    if (nextStep) $("#go-next").onclick = nextStep.go;
    $("#ex-reset").onclick = () => { if (confirm("Clear all Study & Test progress (answers, readiness, trap pairs)?")) { P = {}; norm(); save(); home(); } };
    save();
  }

  /* ---------- start a run ---------- */
  function start(mode, d, step) {
    let qs = [], title = "", minutes = 0;
    step = step || { missed: "missed", trap: "trap", pbq4: "pbq", mini: "mock" }[mode];
    if (mode === "trap") return trap(step);
    if (mode === "cram") return cram();
    if (mode === "full") {
      const pbqs = prioritize(PBQ).slice(0, 5);
      qs = [...pbqs, ...weightedMC(90 - pbqs.length)]; title = "Full practice exam"; minutes = 90;
    } else if (mode === "mini") {
      const pbqs = prioritize(PBQ).slice(0, 2);
      qs = [...pbqs, ...weightedMC(28)]; title = "Mini mock exam"; minutes = 30;
    } else if (mode === "missed") {
      const work = ALL.filter((q) => needsWork(q.id));
      qs = shuffle(work).sort((a, b) => rec(a.id).streak - rec(b.id).streak).slice(0, 25); title = "Fix my misses";
    } else if (mode === "guessed") {
      qs = shuffle(ALL.filter((q) => wasGuessed(q.id) && needsWork(q.id))); title = "Guessed ones";
    } else if (mode === "quick") {
      qs = prioritize(MC).slice(0, 20); title = "Quick 20";
    } else if (mode === "pbq") {
      qs = prioritize(PBQ); title = "All PBQs";
    } else if (mode === "pbq4") {
      qs = prioritize(PBQ).slice(0, 4); title = "PBQ set";
    } else if (mode === "dom") {
      qs = prioritize(ALL.filter((q) => dom(q) === d)); if (step === "weak") qs = qs.slice(0, 20);
      title = `Domain ${d}: ${DOMAINS[d]}`;
    }
    if (!qs.length) return home();   // nothing to do; empty steps show as done without being saved
    run({ qs, title, minutes, step });
  }

  /* ---------- clocks ---------- */
  let examClock = null, qClock = null;
  function stopClocks() { clearInterval(examClock); clearInterval(qClock); examClock = qClock = null; }
  const mmss = (s) => `${s < 0 ? "−" : ""}${Math.floor(Math.abs(s) / 60)}:${String(Math.abs(s) % 60).padStart(2, "0")}`;
  function startExamClock(el, minutes, onTimeUp) {
    const end = Date.now() + minutes * 60e3;
    let fired = false;
    const tick = () => {
      const s = Math.round((end - Date.now()) / 1000);
      el.textContent = mmss(s); el.classList.toggle("late", s < minutes * 6.67);
      if (s <= 0 && !fired) { fired = true; onTimeUp(); }
    };
    tick(); examClock = setInterval(tick, 1000);
  }

  /* ---------- run ---------- */
  function run(R) {
    stopClocks();
    let i = 0, qStart = 0;
    const results = [];
    root.innerHTML = `<div class="ex-bar">
        <button class="btn small ghost" type="button" id="ex-quit">← Hub</button>
        <span class="ex-title">${esc(R.title)}</span>
        <span class="ex-prog" id="ex-prog"></span>
        <span class="ex-pace" id="ex-pace" title="Time on this question. Aim for about ${PACE.mc}s on multiple choice."></span>
        ${R.minutes ? `<span class="ex-timer" id="ex-timer" title="Time left"></span>` : ""}
      </div>
      <div class="ex-track"><span id="ex-fill"></span></div>
      <div id="ex-q"></div>`;
    $("#ex-quit").onclick = () => { if (!results.length || confirm("Leave this run? Answers so far are saved.")) home(); };
    // At 0:00 the real exam ends. Say so and offer to score now; carrying on untimed is allowed but flagged.
    if (R.minutes) startExamClock($("#ex-timer"), R.minutes, () => {
      const bar = document.createElement("div");
      bar.className = "timeup";
      bar.innerHTML = `<b>⏱ Time's up.</b> The real exam would end here. <button class="btn small primary" type="button">See my score now</button><span class="muted">or keep going untimed</span>`;
      $(".ex-track").after(bar);
      $("button", bar).onclick = () => done();
    });
    const prog = () => {
      const right = results.filter((r) => r.ok && !r.guess).length;
      $("#ex-prog").textContent = `${Math.min(i + 1, R.qs.length)} / ${R.qs.length} · ${right} right`;
    };
    const show = () => {
      const q = R.qs[i];
      prog();
      $("#ex-fill").style.width = `${(i / R.qs.length) * 100}%`;
      const box = $("#ex-q"); box.innerHTML = "";
      qStart = Date.now();
      const pace = $("#ex-pace"), limit = PACE[q.kind];
      clearInterval(qClock);
      const tickQ = () => { const s = Math.round((Date.now() - qStart) / 1000); pace.textContent = `⏱ ${mmss(s)}`; pace.classList.toggle("slow", s > limit); };
      tickQ(); qClock = setInterval(tickQ, 1000);
      const onDone = (ok) => {
        clearInterval(qClock);
        const secs = Math.round((Date.now() - qStart) / 1000);
        const res = { q, ok, secs, guess: false };
        results.push(res);
        mark(q, ok, secs);
        prog();
        const nav = document.createElement("div");
        nav.className = "ex-next";
        nav.innerHTML = `${ok ? `<button class="btn guess" type="button" aria-pressed="false" title="Keyboard: G">🎲 I guessed — bring it back</button>` : ""}
          <span class="sp"></span>${secs > limit ? `<span class="slow-note">${secs}s. Over the ${limit}s pace</span>` : ""}
          <button class="btn primary big" type="button" id="ex-nextbtn">${i + 1 < R.qs.length ? "Next →" : "See my score"}</button>`;
        box.appendChild(nav);
        $("#ex-nextbtn", nav).onclick = next;
        const g = $(".guess", nav);
        if (g) g.onclick = () => {
          res.guess = !res.guess; markGuess(q, res.guess);
          g.setAttribute("aria-pressed", res.guess); g.classList.toggle("on", res.guess);
          g.textContent = res.guess ? "🎲 Marked as a guess. It'll come back" : "🎲 I guessed — bring it back";
          prog();
        };
      };
      box.appendChild(q.kind === "pbq" ? pbqEl(q, onDone) : mcEl(q, onDone));
      window.scrollTo({ top: root.offsetTop - 70, behavior: "smooth" });
    };
    const next = () => { i++; i < R.qs.length ? show() : done(); };
    const done = () => { stopClocks(); document.onkeydown = null; if (R.step) stepDone(R.step); results_(R, results); };
    bindKeys((e) => { if (e.key.toLowerCase() === "g" && $(".ex-next .guess")) { $(".ex-next .guess").click(); return true; } });
    show();
  }

  /* ---------- multiple choice ---------- */
  const headEl = (q, extra = "") => `<div class="ex-meta"><span class="chip dchip" style="--c:var(--d${dom(q)})">Domain ${dom(q)}</span><span class="chip">Objective ${esc(q.o)}</span>${extra}${rec(q.id).seen && !mastered(q.id) ? `<span class="chip warn">Seen before</span>` : ""}</div>`;
  function mcEl(q, onDone) {
    const multi = Array.isArray(q.a), answers = multi ? q.a : [q.a];
    const order = shuffle(q.c.map((_, k) => k));
    const el = document.createElement("article");
    el.className = "ex-card";
    el.innerHTML = `${headEl(q, multi ? `<span class="chip warn">Choose ${answers.length}</span>` : "")}
      <div class="ex-stem">${q.q}</div>
      <div class="choices">${order.map((k, n) => `<button class="choice" type="button" data-k="${k}"><span class="k">${L[n]}</span><span>${esc(q.c[k])}</span></button>`).join("")}</div>
      ${multi ? `<p><button class="btn primary" type="button" id="ex-submit" disabled>Submit answer</button></p>` : ""}`;
    const picked = new Set();
    const finish = () => {
      const ok = answers.length === picked.size && answers.every((a) => picked.has(a));
      $$(".choice", el).forEach((b) => {
        const k = Number(b.dataset.k); b.disabled = true;
        b.classList.add(answers.includes(k) ? "right" : picked.has(k) ? "wrong" : "dim");
      });
      if ($("#ex-submit", el)) $("#ex-submit", el).remove();
      el.appendChild(feedbackMC(q, order, answers, picked, ok));
      onDone(ok);
    };
    $$(".choice", el).forEach((b) => (b.onclick = () => {
      const k = Number(b.dataset.k);
      if (!multi) { picked.add(k); return finish(); }
      picked.has(k) ? picked.delete(k) : picked.add(k);
      b.classList.toggle("picked", picked.has(k));
      $("#ex-submit", el).disabled = picked.size !== answers.length;
    }));
    if (multi) $("#ex-submit", el).onclick = finish;
    return el;
  }
  function feedbackMC(q, order, answers, picked, ok) {
    const letter = (k) => L[order.indexOf(k)];
    const wrong = order.filter((k) => !answers.includes(k));
    const fb = document.createElement("div");
    fb.className = `ex-fb ${ok ? "ok" : "no"}`;
    fb.innerHTML = `
      <div class="ex-verdict"><span>${ok ? "✓ Correct" : `✗ Not this time. You picked ${[...picked].map(letter).sort().join(", ")}`}</span><span class="pkt-tag">${ok ? "ACK" : "DROP"}</span></div>
      <section><h4><span>1</span>The answer</h4><p class="ex-ans">${answers.map((k) => `${letter(k)}. ${esc(q.c[k])}`).join(" + ")}</p></section>
      <section><h4><span>2</span>Why it's right</h4><p>${q.why}</p></section>
      <section><h4><span>3</span>Why the others can't be it</h4><ul class="ex-no">${wrong.map((k) => `<li class="${picked.has(k) ? "you" : ""}"><b>${letter(k)}. ${esc(q.c[k])}</b>${picked.has(k) ? ` <em>your pick</em>` : ""}<br>${q.no[k] || ""}</li>`).join("")}</ul></section>
      <section class="ex-clue"><h4><span>4</span>Remember it</h4><p>${q.clue}</p></section>
      ${q.trig ? `<section class="ex-trig"><h4><span>5</span>Exam trigger</h4><p>${q.trig}</p></section>` : ""}`;
    return fb;
  }

  /* ---------- PBQs ---------- */
  function pbqEl(q, onDone) {
    const label = { order: "put in order", match: "match", spot: "find the fault" }[q.type];
    const el = document.createElement("article");
    el.className = "ex-card pbq";
    el.innerHTML = `${headEl(q, `<span class="chip warn">PBQ · ${label}</span>`)}
      <h3 class="ex-pbq-title">${esc(q.title)}</h3>
      <div class="ex-stem">${q.setup}</div>
      <p class="ex-ask">${q.prompt}</p>
      <div class="ex-pbq-body"></div>
      <p><button class="btn primary" type="button" id="ex-submit">Submit answer</button></p>`;
    const body = $(".ex-pbq-body", el), submit = $("#ex-submit", el);
    if (q.type === "order") {
      let cur = shuffle(q.items.map((_, k) => k));
      if (cur.every((v, k) => v === k)) cur.reverse();
      const draw = () => {
        body.innerHTML = `<ol class="ex-order">${cur.map((k, n) => `<li data-k="${k}"><span class="ex-pos">${n + 1}</span><span class="t">${esc(q.items[k].t)}</span>
          <span class="ex-mv"><button class="btn small icon-only" type="button" data-up="${n}" aria-label="Move up" ${n === 0 ? "disabled" : ""}>↑</button><button class="btn small icon-only" type="button" data-dn="${n}" aria-label="Move down" ${n === cur.length - 1 ? "disabled" : ""}>↓</button></span></li>`).join("")}</ol>`;
        $$("[data-up]", body).forEach((b) => (b.onclick = () => { const n = +b.dataset.up; [cur[n - 1], cur[n]] = [cur[n], cur[n - 1]]; draw(); $(`[data-up="${n - 1}"]`, body)?.focus(); }));
        $$("[data-dn]", body).forEach((b) => (b.onclick = () => { const n = +b.dataset.dn; [cur[n + 1], cur[n]] = [cur[n], cur[n + 1]]; draw(); $(`[data-dn="${n + 1}"]`, body)?.focus(); }));
      };
      draw();
      submit.onclick = () => {
        submit.remove();
        const nRight = cur.filter((k, n) => k === n).length, ok = nRight === cur.length;
        $$(".ex-order li", body).forEach((li, n) => { li.classList.add(Number(li.dataset.k) === n ? "right" : "wrong"); $(".ex-mv", li).remove(); });
        el.appendChild(feedbackPBQ(q, ok, nRight, cur.length, `<ol class="ex-steps">${q.items.map((it, n) => {
          const at = cur.indexOf(n);
          return `<li class="${at === n ? "" : "you"}"><b>${esc(it.t)}</b>${at === n ? "" : ` <em>you had it at #${at + 1}</em>`}<br>${it.why}</li>`;
        }).join("")}</ol>`));
        onDone(ok);
      };
    } else if (q.type === "spot") {
      spotBody(q, body, submit, el, onDone);
    } else {
      body.innerHTML = `<div class="ex-match">${q.rows.map((r, n) => `<label class="ex-row"><span class="t">${r.label}</span>
        <select data-n="${n}"><option value="">Choose…</option>${(r.options || q.options).map((o) => `<option>${esc(o)}</option>`).join("")}</select></label>`).join("")}</div>`;
      const sync = () => { submit.disabled = $$("select", body).some((s) => !s.value); };
      $$("select", body).forEach((s) => (s.onchange = sync)); sync();
      submit.onclick = () => {
        submit.remove();
        let nRight = 0;
        const picks = $$("select", body).map((s) => s.value);
        $$(".ex-row", body).forEach((row, n) => {
          const good = picks[n] === q.rows[n].a; if (good) nRight++;
          row.classList.add(good ? "right" : "wrong"); $("select", row).disabled = true;
          if (!good) row.insertAdjacentHTML("beforeend", `<span class="ex-fix">→ ${esc(q.rows[n].a)}</span>`);
        });
        const ok = nRight === q.rows.length;
        el.appendChild(feedbackPBQ(q, ok, nRight, q.rows.length, `<ul class="ex-steps">${q.rows.map((r, n) => `<li class="${picks[n] === r.a ? "" : "you"}"><b>${r.label} → ${esc(r.a)}</b>${picks[n] === r.a ? "" : ` <em>you picked ${esc(picks[n])}</em>`}<br>${r.why}</li>`).join("")}</ul>`));
        onDone(ok);
      };
    }
    return el;
  }
  // "Find the fault": click devices on a diagram to inspect them, pick the faulty one, then pick the fix.
  function spotBody(q, body, submit, el, onDone) {
    const W = q.w || 640, H = q.h || 300;
    const node = (n) => { const w = Math.max(124, n.label.length * 7.4 + 24); return `<g class="sp-node" data-id="${n.id}" tabindex="0" role="button" aria-label="${esc(n.label)}, ${esc(n.kind)}" transform="translate(${n.x},${n.y})">
        <rect x="${-w / 2}" y="-24" width="${w}" height="48" rx="10"></rect>
        <text class="sp-kind" y="-6" text-anchor="middle">${esc(n.kind)}</text>
        <text class="sp-label" y="13" text-anchor="middle">${esc(n.label)}</text></g>`; };
    const pos = Object.fromEntries(q.nodes.map((n) => [n.id, n]));
    body.innerHTML = `<div class="sp-wrap"><svg class="sp-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Network diagram. Select a device to inspect it.">
        ${q.links.map(([a, b, t]) => `<line class="sp-link" x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}"></line>${t ? `<text class="sp-lt" x="${(pos[a].x + pos[b].x) / 2}" y="${(pos[a].y + pos[b].y) / 2 - 6}" text-anchor="middle">${esc(t)}</text>` : ""}`).join("")}
        ${q.nodes.map(node).join("")}</svg></div>
      <div class="sp-panel"><div class="sp-hint">Select a device to see its configuration. Then mark the one causing the problem.</div></div>
      <label class="ex-row sp-fixrow"><span class="t"><b>Fix:</b> what change resolves it?</span><select id="sp-fix"><option value="">Choose…</option>${q.fixes.map((f) => `<option>${esc(f)}</option>`).join("")}</select></label>`;
    let sel = null, faulty = null;
    const panel = $(".sp-panel", body);
    const sync = () => { submit.disabled = !faulty || !$("#sp-fix", body).value; };
    const pick = (id) => {
      sel = id;
      $$(".sp-node", body).forEach((g) => g.classList.toggle("sel", g.dataset.id === id));
      const n = pos[id];
      panel.innerHTML = `<div class="sp-head"><b>${esc(n.label)}</b> <small class="muted">${esc(n.kind)}</small>
          <button class="btn small ${faulty === id ? "primary" : ""}" type="button" id="sp-mark">${faulty === id ? "✓ Marked as the problem" : "Mark as the problem"}</button></div>
        <pre>${esc(n.cfg)}</pre>`;
      $("#sp-mark", panel).onclick = () => {
        faulty = faulty === id ? null : id;
        $$(".sp-node", body).forEach((g) => g.classList.toggle("flag", g.dataset.id === faulty));
        pick(id); sync();
      };
    };
    $$(".sp-node", body).forEach((g) => {
      g.onclick = () => pick(g.dataset.id);
      g.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(g.dataset.id); } };
    });
    $("#sp-fix", body).onchange = sync; sync();
    submit.onclick = () => {
      submit.remove();
      const fix = $("#sp-fix", body).value;
      const okNode = faulty === q.a, okFix = fix === q.fixA, nRight = (okNode ? 1 : 0) + (okFix ? 1 : 0);
      $$(".sp-node", body).forEach((g) => { g.classList.toggle("right", g.dataset.id === q.a); g.classList.toggle("wrong", g.dataset.id === faulty && !okNode); });
      $("#sp-fix", body).disabled = true;
      $(".sp-fixrow", body).classList.add(okFix ? "right" : "wrong");
      if (!okFix) $(".sp-fixrow", body).insertAdjacentHTML("beforeend", `<span class="ex-fix">→ ${esc(q.fixA)}</span>`);
      pick(q.a);
      const parts = `<ul class="ex-steps">
        <li class="${okNode ? "" : "you"}"><b>Faulty device → ${esc(pos[q.a].label)}</b>${okNode ? "" : ` <em>you marked ${esc(faulty ? pos[faulty].label : "nothing")}</em>`}<br>${q.nodeWhy[q.a]}</li>
        <li class="${okFix ? "" : "you"}"><b>Fix → ${esc(q.fixA)}</b>${okFix ? "" : ` <em>you picked ${esc(fix)}</em>`}<br>${q.fixWhy}</li>
        ${q.nodes.filter((n) => n.id !== q.a && q.nodeWhy[n.id]).map((n) => `<li class="${faulty === n.id ? "you" : ""}"><b>${esc(n.label)}: not the problem</b><br>${q.nodeWhy[n.id]}</li>`).join("")}</ul>`;
      el.appendChild(feedbackPBQ(q, nRight === 2, nRight, 2, parts));
      onDone(nRight === 2);
    };
  }
  function feedbackPBQ(q, ok, nRight, n, partsHtml) {
    const fb = document.createElement("div");
    fb.className = `ex-fb ${ok ? "ok" : "no"}`;
    let k = 1;
    fb.innerHTML = `
      <div class="ex-verdict"><span>${ok ? `✓ All ${n} right` : `✗ ${nRight} of ${n} right. Real PBQs give partial credit, but aim for all of them.`}</span><span class="pkt-tag">${ok ? "ACK" : `${nRight}/${n}`}</span></div>
      ${q.answer ? `<section><h4><span>${k++}</span>The answer</h4><p class="ex-ans">${q.answer}</p></section>` : ""}
      <section><h4><span>${k++}</span>Each part, and why</h4>${partsHtml}</section>
      ${q.no ? `<section><h4><span>${k++}</span>Traps they set</h4><p>${q.no}</p></section>` : ""}
      <section class="ex-clue"><h4><span>${k++}</span>Remember it</h4><p>${q.clue}</p></section>
      ${q.trig ? `<section class="ex-trig"><h4><span>${k++}</span>Exam trigger</h4><p>${q.trig}</p></section>` : ""}`;
    return fb;
  }

  /* ---------- results ---------- */
  function results_(R, res) {
    const right = res.filter((r) => r.ok && !r.guess).length, pct = Math.round((right / res.length) * 100);
    const st = status(pct);
    const byDom = [1, 2, 3, 4, 5].map((d) => { const rs = res.filter((r) => dom(r.q) === d); return { d, n: rs.length, ok: rs.filter((r) => r.ok && !r.guess).length }; }).filter((x) => x.n);
    const missed = res.filter((r) => !r.ok), guessed = res.filter((r) => r.guess);
    const mcT = res.filter((r) => r.q.kind === "mc").map((r) => r.secs);
    const avg = mcT.length ? Math.round(mcT.reduce((a, b) => a + b, 0) / mcT.length) : null;
    const slow = res.filter((r) => r.secs > PACE[r.q.kind]).length;
    const redo = [...missed, ...guessed];
    const line = (r) => `<li><span class="chip">${esc(r.q.o)}</span> ${esc(r.q.kind === "pbq" ? "PBQ: " + r.q.title : strip(r.q.q).slice(0, 150))}</li>`;
    root.innerHTML = `<div class="panel ex-result">
      <div class="eyebrow">${esc(R.title)} · results</div>
      <div class="rd-hero"><span class="rd-big">${pct}%</span><span class="rd-status ${st.cls}">${st.icon} ${pct >= PASS ? "Passing range" : pct >= CLOSE ? "Close" : "Below the line"}</span></div>
      <pre class="ping" aria-label="Summary">--- ${esc(R.title.toLowerCase())} statistics ---
${res.length} questions sent, ${right} correct, ${100 - pct}% loss${avg != null ? `\nround-trip avg ${avg}s per question (target ≤ ${PACE.mc}s)` : ""}</pre>
      <p class="muted">${right} of ${res.length} right${guessed.length ? ` (${guessed.length} guesses counted as misses)` : ""}. ${avg != null ? `Average ${avg}s per multiple-choice question` : ""}${slow ? `, ${slow} over pace.` : "."} The real exam needs about ${PASS}%.</p>
      <div class="rd-list">${byDom.map((x) => { const p = Math.round((x.ok / x.n) * 100), s = status(p); return `<div class="rd-row"><span class="rd-name"><b>D${x.d}</b> ${DOMAINS[x.d]}</span><span class="rd-track ${s.cls}"><span class="rd-fill" style="width:${p}%"></span><span class="rd-goal" style="left:${PASS}%"></span></span><span class="rd-fig">${p}% <small>${s.icon} ${x.ok}/${x.n}</small></span></div>`; }).join("")}</div>
      <p class="ex-actions">${redo.length ? `<button class="btn primary big" type="button" id="ex-retry">Redo the ${redo.length} I missed or guessed</button>` : ""}<button class="btn big" type="button" id="ex-home">Back to the hub</button></p>
      ${missed.length ? `<h3>Missed</h3><ul class="ex-missed">${missed.map(line).join("")}</ul>` : ""}
      ${guessed.length ? `<h3>Guessed</h3><ul class="ex-missed">${guessed.map(line).join("")}</ul>` : ""}
    </div>`;
    $("#ex-home").onclick = home;
    if (redo.length) $("#ex-retry").onclick = () => run({ qs: shuffle(redo.map((r) => r.q)), title: "Redo misses and guesses" });
    window.scrollTo({ top: root.offsetTop - 70, behavior: "smooth" });
  }

  /* ---------- trap pairs (speed drill over the dictionary's look-alike groups) ---------- */
  function trapDeck() {
    const out = [];
    (D.mixups || []).forEach((g) => g.items.forEach((it, k) => out.push({ key: g.title + "|" + it.r, g, k })));
    return out;
  }
  const termParts = (r) => { const [a, b] = String(r).split("|"); return { short: a.split("@")[0], long: b || "" }; };
  function trap(step) {
    stopClocks();
    const deck = trapDeck();
    const tr = (k) => P.trap[k] || { seen: 0, streak: 0 };
    const g = [[], [], []];
    deck.forEach((c) => { const r = tr(c.key); g[r.seen === 0 ? 1 : r.streak < 2 ? 0 : 2].push(c); });
    const cards = [...shuffle(g[0]), ...shuffle(g[1]), ...shuffle(g[2])].slice(0, 20);
    if (!cards.length) { if (step) stepDone(step); return home(); }
    const SECS = 8;
    let i = 0, right = 0, timer = null;
    const missed = [];
    root.innerHTML = `<div class="ex-bar"><button class="btn small ghost" type="button" id="ex-quit">← Hub</button><span class="ex-title">Trap pairs</span><span class="ex-prog" id="ex-prog"></span></div>
      <div class="ex-track"><span id="ex-fill"></span></div><div id="ex-q"></div>`;
    $("#ex-quit").onclick = () => { clearInterval(timer); home(); };
    const show = () => {
      const c = cards[i], it = c.g.items[c.k];
      $("#ex-prog").textContent = `${i + 1} / ${cards.length} · ${right} right`;
      $("#ex-fill").style.width = `${(i / cards.length) * 100}%`;
      const opts = shuffle(c.g.items.map((_, k) => k));
      const box = $("#ex-q");
      box.innerHTML = `<article class="ex-card trap">
        <div class="ex-meta"><span class="chip">${esc(c.g.title)}</span></div>
        <div class="trap-clock"><span id="trap-bar"></span></div>
        <p class="trap-desc">“${esc(it.n)}”</p>
        <p class="ex-ask">Which one is this?</p>
        <div class="choices trap-choices">${opts.map((k, n) => { const t = termParts(c.g.items[k].r); return `<button class="choice" type="button" data-k="${k}"><span class="k">${L[n]}</span><span><b>${esc(t.short)}</b>${t.long ? ` <small class="muted">${esc(t.long)}</small>` : ""}</span></button>`; }).join("")}</div>
      </article>`;
      const t0 = Date.now(), bar = $("#trap-bar");
      clearInterval(timer);
      timer = setInterval(() => {
        const left = SECS - (Date.now() - t0) / 1000;
        bar.style.width = `${Math.max(0, (left / SECS) * 100)}%`;
        bar.classList.toggle("low", left < 3);
        if (left <= 0) answer(-1);
      }, 100);
      const answer = (k) => {
        clearInterval(timer);
        const ok = k === c.k, r = tr(c.key);
        r.seen++; r.streak = ok ? r.streak + 1 : 0; P.trap[c.key] = r; save();
        if (ok) right++; else missed.push(c);
        $$(".choice", box).forEach((b) => { const kk = Number(b.dataset.k); b.disabled = true; b.classList.add(kk === c.k ? "right" : kk === k ? "wrong" : "dim"); });
        $("#ex-prog").textContent = `${i + 1} / ${cards.length} · ${right} right`;
        const fb = document.createElement("div");
        fb.className = `ex-fb ${ok ? "ok" : "no"}`;
        fb.innerHTML = `<div class="ex-verdict">${ok ? "✓ Correct" : k < 0 ? `⏱ Time's up. It's ${esc(termParts(it.r).short)}` : `✗ It's ${esc(termParts(it.r).short)}`}</div>
          <section class="ex-clue"><h4><span>✦</span>Rule of thumb</h4><p>${esc(c.g.rule)}</p></section>
          <section><h4><span>≠</span>Tell them apart</h4><ul class="ex-no">${c.g.items.map((x) => `<li class="${x === it ? "" : ""}"><b>${esc(termParts(x.r).short)}</b>${termParts(x.r).long ? ` <small class="muted">${esc(termParts(x.r).long)}</small>` : ""}<br>${esc(x.n)}</li>`).join("")}</ul></section>`;
        box.firstElementChild.appendChild(fb);
        const nav = document.createElement("div");
        nav.className = "ex-next";
        nav.innerHTML = `<span class="sp"></span><button class="btn primary big" type="button" id="ex-nextbtn">${i + 1 < cards.length ? "Next →" : "See my score"}</button>`;
        box.appendChild(nav);
        $("#ex-nextbtn").onclick = next;
        if (ok) { const my = i; setTimeout(() => { if (i === my && document.body.contains(nav)) next(); }, 1400); }
      };
      $$(".choice", box).forEach((b) => (b.onclick = () => answer(Number(b.dataset.k))));
    };
    const next = () => { i++; i < cards.length ? show() : done(); };
    const done = () => {
      document.onkeydown = null; clearInterval(timer);
      if (step) stepDone(step);
      const pct = Math.round((right / cards.length) * 100), st = status(pct);
      root.innerHTML = `<div class="panel ex-result"><div class="eyebrow">Trap pairs · results</div>
        <div class="rd-hero"><span class="rd-big">${pct}%</span><span class="rd-status ${st.cls}">${st.icon} ${right} of ${cards.length}</span></div>
        ${missed.length ? `<h3>Rules to remember</h3><ul class="ex-no">${[...new Set(missed.map((c) => c.g))].map((g) => `<li><b>${esc(g.title)}</b><br>${esc(g.rule)}</li>`).join("")}</ul>` : "<p>Clean sweep. These pairs are locked in.</p>"}
        <p class="ex-actions"><button class="btn primary big" type="button" id="ex-again">Another 20</button><button class="btn big" type="button" id="ex-home">Back to the hub</button></p></div>`;
      $("#ex-home").onclick = home; $("#ex-again").onclick = () => trap();
    };
    bindKeys();
    show();
  }

  /* ---------- cram sheet ---------- */
  function cram(all) {
    stopClocks(); document.onkeydown = null;
    stepDone("cram");
    const list = all ? ALL : ALL.filter((q) => needsWork(q.id));
    const groups = [1, 2, 3, 4, 5].map((d) => ({ d, qs: list.filter((q) => dom(q) === d).sort((a, b) => String(a.o).localeCompare(String(b.o), undefined, { numeric: true })) })).filter((g) => g.qs.length);
    const ans = (q) => q.kind === "pbq" ? (q.answer || q.title) : (Array.isArray(q.a) ? q.a : [q.a]).map((k) => esc(q.c[k])).join(" + ");
    root.innerHTML = `<div class="ex-bar no-print"><button class="btn small ghost" type="button" id="ex-quit">← Hub</button><span class="ex-title">Cram sheet</span><span class="sp"></span>
        <div class="seg" role="group" aria-label="What to include"><button type="button" class="${all ? "" : "on"}" id="cr-miss">My misses (${ALL.filter((q) => needsWork(q.id)).length})</button><button type="button" class="${all ? "on" : ""}" id="cr-all">Everything (${ALL.length})</button></div>
        <button class="btn small" type="button" id="cr-print">Print</button></div>
      <div class="cram">
        <h2 class="print-only">Network+ cram sheet</h2>
        ${groups.length ? groups.map((g) => `<section class="cram-dom" style="--c:var(--d${g.d})"><h3>Domain ${g.d}: ${DOMAINS[g.d]}</h3>
          ${g.qs.map((q) => `<div class="cram-item"><div class="cram-q"><span class="chip">${esc(q.o)}</span> ${esc(q.kind === "pbq" ? "PBQ: " + q.title : strip(q.q).slice(0, 120) + (strip(q.q).length > 120 ? "…" : ""))}</div>
            <div class="cram-a">→ <b>${ans(q)}</b></div>
            <div class="cram-c">${q.clue}</div>${q.trig ? `<div class="cram-t">${q.trig}</div>` : ""}</div>`).join("")}</section>`).join("")
        : `<div class="panel"><p><b>No misses yet.</b> Answer some questions first, or switch to <b>Everything</b> to see every clue and trigger.</p></div>`}
      </div>`;
    $("#ex-quit").onclick = home;
    $("#cr-miss").onclick = () => cram(false);
    $("#cr-all").onclick = () => cram(true);
    $("#cr-print").onclick = () => window.print();
    window.scrollTo({ top: root.offsetTop - 70 });
  }

  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  mode ? start(mode, Number(params.get("domain")) || undefined) : home();
})();
