/* Network+ Study Guide — shared behavior for every page.
   Pages stay plain HTML; this file adds the top bar, videos, quick checks,
   progress tracking and the "what's next" logic. Progress lives in localStorage. */
(function () {
  "use strict";

  const D = window.NP_DATA || { objectives: [], questions: [], videos: [], cards: [] };
  const ROOT = document.body.dataset.root || "";

  /* ---------------- Course map ---------------- */
  const CHAPTERS = [
    { n: 0, slug: "00-start-here", title: "Start Here", blurb: "How the exam works, how this guide works, and your baseline.", lessons: [
      { id: "0.1", title: "How the exam works" },
      { id: "0.2", title: "How to study with ADHD (and this guide)" } ] },
    { n: 1, slug: "01-networking-concepts", title: "Networking Concepts", weight: 23, blurb: "OSI, devices, cloud, ports, media, topologies, IPv4 subnetting, modern networks.", lessons: [
      { id: "1.1", title: "The OSI model" },
      { id: "1.2", title: "Appliances, applications & functions" },
      { id: "1.3", title: "Cloud concepts & connectivity" },
      { id: "1.4", title: "Ports, protocols & traffic types" },
      { id: "1.5", title: "Transmission media & transceivers" },
      { id: "1.6", title: "Topologies, architectures & traffic flows" },
      { id: "1.7", title: "IPv4 addressing & subnetting" },
      { id: "1.8", title: "Modern networks: SDN, VXLAN, zero trust, IaC, IPv6" } ] },
    { n: 2, slug: "02-network-implementation", title: "Network Implementation", weight: 20, blurb: "Routing, switching and VLANs, wireless setup, physical installs.", lessons: [
      { id: "2.1", title: "Routing technologies" },
      { id: "2.2", title: "Switching: VLANs, trunks, STP" },
      { id: "2.3", title: "Wireless devices & technologies" },
      { id: "2.4", title: "Physical installations" } ] },
    { n: 3, slug: "03-network-operations", title: "Network Operations", weight: 19, blurb: "Documentation, monitoring, disaster recovery, DHCP/DNS/NTP, remote access.", lessons: [
      { id: "3.1", title: "Processes, documentation & life cycle" },
      { id: "3.2", title: "Network monitoring" },
      { id: "3.3", title: "Disaster recovery & high availability" },
      { id: "3.4", title: "DHCP, SLAAC, DNS & time" },
      { id: "3.5", title: "VPNs, remote access & management" } ] },
    { n: 4, slug: "04-network-security", title: "Network Security", weight: 14, blurb: "Security concepts, attacks, hardening and defenses.", lessons: [
      { id: "4.1", title: "Security concepts & IAM" },
      { id: "4.2", title: "Attacks & their impact" },
      { id: "4.3", title: "Defenses: hardening, NAC, rules, zones" } ] },
    { n: 5, slug: "05-network-troubleshooting", title: "Network Troubleshooting", weight: 24, blurb: "The 7-step method, cabling, services, performance, tools and commands.", lessons: [
      { id: "5.1", title: "The troubleshooting methodology" },
      { id: "5.2", title: "Cabling & physical interfaces" },
      { id: "5.3", title: "Network services: STP, VLANs, routing, addressing" },
      { id: "5.4", title: "Performance & wireless issues" },
      { id: "5.5", title: "Tools & commands" } ] },
    { n: 6, slug: "06-final-review", title: "Final Review & Exam Day", blurb: "Brain-dump sheet, PBQ practice, practice exams and test-day plan.", lessons: [
      { id: "6.1", title: "Your brain-dump sheet" },
      { id: "6.2", title: "PBQ practice" },
      { id: "6.3", title: "Exam day" } ] },
  ];
  const ALL_LESSONS = CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, chapter: c })));

  /* ---------------- 16-day plan (Day 1 = Sun Nov 15 → exam Mon Nov 30, 2026) ---------------- */
  const PLAN = [
    { date: "2026-11-15", title: "Start here + the OSI model", lessons: ["0.1", "0.2", "1.1"], tasks: [
      { id: "book", text: "Book the exam (Pearson VUE) for Mon Nov 30 or earlier", href: "https://www.comptia.org/en-us/certifications/network/" },
      { id: "base", text: "Baseline: 20 mixed questions, before studying", href: "practice/quiz.html?n=20" } ] },
    { date: "2026-11-16", title: "Devices, cloud and ports", lessons: ["1.2", "1.3", "1.4"], tasks: [
      { id: "ports", text: "Ports drill until 90%+", href: "practice/ports.html" } ] },
    { date: "2026-11-17", title: "Cables and topologies", lessons: ["1.5", "1.6"], tasks: [
      { id: "fc", text: "Flashcards for 1.4–1.6 (10 min)", href: "practice/flashcards.html?obj=1.4,1.5,1.6" } ] },
    { date: "2026-11-18", title: "Subnetting day", lessons: ["1.7"], tasks: [
      { id: "sub", text: "40 subnet drills, aim for under 30 s each", href: "practice/subnetting.html" } ] },
    { date: "2026-11-19", title: "Modern networks + routing", lessons: ["1.8", "2.1"], tasks: [
      { id: "d1", text: "Domain 1 quiz", href: "practice/quiz.html?domain=1" },
      { id: "sub", text: "10 subnet drills", href: "practice/subnetting.html" } ] },
    { date: "2026-11-20", title: "Switching, wireless, the server room", lessons: ["2.2", "2.3", "2.4"], tasks: [
      { id: "d2", text: "Domain 2 quiz", href: "practice/quiz.html?domain=2" } ] },
    { date: "2026-11-21", title: "Documentation, monitoring, recovery", lessons: ["3.1", "3.2", "3.3"], tasks: [
      { id: "due", text: "Clear your due-today review", href: "practice/review.html" } ] },
    { date: "2026-11-22", title: "DHCP, DNS, remote access + practice exam #1", lessons: ["3.4", "3.5"], tasks: [
      { id: "pe1", text: "Full practice exam #1 (sources in 6.2). Log every miss.", href: "chapters/06-final-review.html#L6-2" },
      { id: "ex", text: "Study & Test: today's session (then a full practice exam)", href: "practice/exam.html" } ] },
    { date: "2026-11-23", title: "Security in one day", lessons: ["4.1", "4.2", "4.3"], tasks: [
      { id: "d3", text: "Domain 3 + 4 quiz", href: "practice/quiz.html?domain=4" },
      { id: "ex", text: "Study & Test: today's session", href: "practice/exam.html" } ] },
    { date: "2026-11-24", title: "Troubleshooting part 1", lessons: ["5.1", "5.2", "5.3"], tasks: [
      { id: "sub", text: "10 subnet drills", href: "practice/subnetting.html" },
      { id: "ex", text: "Study & Test: today's session + all PBQs", href: "practice/exam.html" } ] },
    { date: "2026-11-25", title: "Troubleshooting part 2 (biggest domain)", lessons: ["5.4", "5.5"], tasks: [
      { id: "d5", text: "Domain 5 quiz", href: "practice/quiz.html?domain=5" },
      { id: "ex", text: "Study & Test: today's session", href: "practice/exam.html" } ] },
    { date: "2026-11-26", title: "Thanksgiving: light day, weak spots only", lessons: [], tasks: [
      { id: "weak", text: "Weak-spot quiz (auto-picks your misses)", href: "practice/quiz.html?weak=1" },
      { id: "fc", text: "Ports + acronyms flashcards (15 min)", href: "practice/flashcards.html?set=ports" },
      { id: "ex", text: "Study & Test: today's session", href: "practice/exam.html" } ] },
    { date: "2026-11-27", title: "Brain-dump sheet + PBQ day", lessons: ["6.1", "6.2"], tasks: [
      { id: "pe2", text: "Full practice exam #2. Log every miss.", href: "chapters/06-final-review.html#L6-2" },
      { id: "ex", text: "Study & Test: all 21 PBQs, then print your cram sheet", href: "practice/exam.html?mode=pbq" } ] },
    { date: "2026-11-28", title: "Practice exam #3 + fix weak spots", lessons: [], tasks: [
      { id: "pe3", text: "Full practice exam #3. Target 85%+.", href: "chapters/06-final-review.html#L6-2" },
      { id: "ex", text: "Study & Test: full practice exam. Target 85%+.", href: "practice/exam.html?mode=full" },
      { id: "weak", text: "Rewatch videos for anything rated 1–3", href: "index.html#confidence" } ] },
    { date: "2026-11-29", title: "Light review, then rest", lessons: ["6.3"], tasks: [
      { id: "dump", text: "Write the brain-dump sheet from memory twice", href: "chapters/06-final-review.html#L6-1" },
      { id: "sleep", text: "Stop by 8 pm. Sleep.", href: "" } ] },
    { date: "2026-11-30", title: "EXAM DAY", lessons: [], tasks: [
      { id: "exam", text: "Pass Network+", href: "chapters/06-final-review.html#L6-3" } ] },
  ];

  /* ---------------- Storage ---------------- */
  const KEY = "np-guide-v1";
  function load() {
    try { return Object.assign({ lessons: {}, videos: {}, answers: {}, conf: {}, tasks: {}, cards: {}, subnet: [] }, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (e) { return { lessons: {}, videos: {}, answers: {}, conf: {}, tasks: {}, cards: {}, subnet: [] }; }
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: progress just won't persist */ } }
  window.addEventListener("storage", (e) => { if (e.key === KEY) S = load(); });

  /* ---------------- Icons (simple 24px stroke icons) ---------------- */
  const ICONS = {
    pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/>',
    back10: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">10</text>',
    fwd10: '<path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">10</text>',
    volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    muted: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5m0-5-5 5"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2h5"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
    ruler: '<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7 11.5 2 2M10 8.5l2 2M13 5.5l2 2"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-2.6 3.2M6.6 6.7C4.2 8.3 3 12 3 12s4 6 9 6a9.4 9.4 0 0 0 4-.9"/>',
    eye: '<path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
    download: '<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14"/>',
    upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 20h14"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7.5h6"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    printer: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;

  /* ---------------- Helpers ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const anchor = (id) => "L" + id.replace(".", "-");
  const lessonUrl = (l) => ROOT + "chapters/" + l.chapter.slug + ".html#" + anchor(l.id);
  const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id);
  const isDone = (id) => !!S.lessons[id];
  const nextLesson = (afterId) => {
    const start = afterId ? ALL_LESSONS.findIndex((l) => l.id === afterId) + 1 : 0;
    return ALL_LESSONS.slice(start).find((l) => !isDone(l.id)) || (afterId ? null : null);
  };
  const firstUndone = () => ALL_LESSONS.find((l) => !isDone(l.id));
  const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const fmtDate = (iso, opts) => new Date(iso + "T12:00:00").toLocaleDateString(undefined, opts || { weekday: "short", month: "short", day: "numeric" });
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }
  const mins = (dur) => { if (!dur) return 0; const p = dur.split(":").map(Number); return p.length === 3 ? p[0] * 60 + p[1] + p[2] / 60 : p[0] + p[1] / 60; };
  const videosFor = (obj) => D.videos.filter((v) => v.objective === obj && !v.alt);
  const videoMinutes = (obj) => Math.round(videosFor(obj).reduce((a, v) => a + mins(v.duration), 0));
  function chapterProgress(c) { const done = c.lessons.filter((l) => isDone(l.id)).length; return { done, total: c.lessons.length, pct: Math.round((done / c.lessons.length) * 100) }; }
  function examDate() { return S.examDate || "2026-11-30"; }
  function daysLeft() { return Math.round((new Date(examDate() + "T09:00:00") - new Date(todayISO() + "T09:00:00")) / 864e5); }
  function todayPlan() {
    const t = todayISO();
    return PLAN.find((p) => p.date === t) || (t < PLAN[0].date ? PLAN[0] : null);
  }
  /* Spaced review: anything you miss comes back after 1, 3, 7, then 14 days. */
  const SRS_DAYS = [1, 3, 7, 14];
  function srs(key, ok) {
    S.srs = S.srs || {};
    const it = S.srs[key];
    if (!ok) S.srs[key] = { box: 0, due: Date.now() + 864e5 * SRS_DAYS[0] - 36e5 };
    else if (it) {
      if (it.box + 1 >= SRS_DAYS.length) delete S.srs[key];
      else S.srs[key] = { box: it.box + 1, due: Date.now() + 864e5 * SRS_DAYS[it.box + 1] - 36e5 };
    }
    save();
  }
  const srsDue = () => Object.entries(S.srs || {}).filter(([, v]) => v.due <= Date.now()).map(([k]) => k);
  function objStats(obj) {
    const a = Object.values(S.answers).filter((x) => x.obj === obj);
    return { n: a.length, ok: a.filter((x) => x.ok).length };
  }

  /* ---------------- Theme ---------------- */
  if (S.theme) document.documentElement.dataset.theme = S.theme;
  function toggleTheme() {
    const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    S.theme = dark ? "light" : "dark"; save();
    document.documentElement.dataset.theme = S.theme;
  }

  /* ---------------- Network map (decorative banner art) ---------------- */
  function nocMap(cls) {
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = { wan: [48, 112, "WAN"], fw: [150, 112, "FW"], r1: [258, 112, "R1"], sw1: [374, 58, "SW1"], sw2: [374, 166, "SW2"], ap: [496, 24, "AP"], srv: [496, 88, "SRV"], pc1: [496, 140, "PC"], pc2: [496, 200, "PC"] };
    const LINKS = [["wan", "fw"], ["fw", "r1"], ["r1", "sw1"], ["r1", "sw2"], ["sw1", "ap"], ["sw1", "srv"], ["sw2", "pc1"], ["sw2", "pc2"]];
    const COL = ["#60a5fa", "#2dd4bf", "#fb923c", "#fb7185", "#a78bfa", "#4ade80"];
    const path = (a, b) => `M${N[a][0]} ${N[a][1]} L${N[b][0]} ${N[b][1]}`;
    const PK = [["wan", "fw", 0, 2.2, 0], ["fw", "r1", 1, 1.6, 0.4], ["r1", "sw1", 2, 1.8, 0.9], ["r1", "sw2", 3, 1.8, 0.2], ["sw1", "srv", 4, 1.4, 1.1], ["sw2", "pc1", 5, 1.5, 0.6],
      ["sw1", "ap", 0, 1.5, 1.6], ["sw2", "pc2", 2, 1.7, 1.3], ["r1", "fw", 4, 1.6, 1.2], ["srv", "sw1", 1, 1.4, 0.3], ["pc2", "sw2", 5, 1.7, 0.8], ["fw", "wan", 3, 2.2, 1.5]];
    const node = (id) => { const [x, y, t] = N[id], w = id === "wan" ? 64 : 46;
      return `<g class="nn ${id === "wan" ? "wan" : ""}" transform="translate(${x},${y})"><rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="8"/><text y="4.5" text-anchor="middle">${t}</text>${id === "wan" ? "" : `<circle class="nled" cx="${w / 2 - 6}" cy="-9" r="2.4" style="animation-delay:${(x + y) % 17 / 10}s"/>`}</g>`; };
    return `<svg class="noc-map ${cls || ""}" viewBox="0 0 560 224" aria-hidden="true" focusable="false">
      ${LINKS.map(([a, b]) => `<path class="nlink" d="${path(a, b)}"/>`).join("")}
      ${still ? "" : PK.map(([a, b, c, d, st]) => `<circle class="pkt" r="3.2" fill="${COL[c]}"><animateMotion dur="${d}s" begin="-${st}s" repeatCount="indefinite" path="${path(a, b)}"/></circle>`).join("")}
      ${Object.keys(N).map(node).join("")}
    </svg>`;
  }
  const nocChip = (led, txt) => `<span class="chip-noc"><i class="led ${led}"></i>${txt}</span>`;
  /* Every page hero becomes a dark network-operations banner with the map on the right. */
  function decorateHero() {
    const hero = $(".hero"); if (!hero || $(".noc-map", hero)) return;
    hero.classList.add("hero-noc");
    hero.insertAdjacentHTML("beforeend", nocMap("hero-map"));
  }

  /* ---------------- Top bar ---------------- */
  function renderTopbar() {
    const bar = $(".topbar"); if (!bar) return;
    const nxt = firstUndone();
    bar.innerHTML = `<div class="topbar-in">
      <a class="brand" href="${ROOT}index.html"><span class="brand-mark">N+<i class="led good" aria-hidden="true"></i></span><span>Network+ Guide</span></a>
      <div class="crumb">${esc(document.body.dataset.crumb || "")}</div>
      <div class="topbar-actions">
        <a class="btn small primary study-link" href="${ROOT}practice/exam.html" title="Study & Test hub: today's session, practice exams, readiness">${icon("target")}<span>Study &amp; Test</span></a>
        <a class="btn small ghost dict-link" href="${ROOT}dictionary.html" title="Look up any term or acronym">${icon("book")}<span>Dictionary</span></a>
        ${nxt ? `<a class="btn small primary" href="${lessonUrl(nxt)}" title="Your next unfinished lesson">Next: ${esc(nxt.id)} →</a>` : ""}
        <button class="btn small timer" type="button" title="25-minute focus timer">${icon("timer")}<span>25:00</span></button>
        <button class="btn small ghost theme icon-only" type="button" title="Light / dark" aria-label="Toggle light or dark mode">${icon("contrast")}</button>
      </div></div>`;
    $(".theme", bar).onclick = toggleTheme;
    setupTimer($(".timer", bar));
  }

  function setupTimer(btn) {
    let end = Number(sessionStorage.getItem("np-timer") || 0), iv = null;
    const label = btn.querySelector("span");
    const fmt = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
    function tick() {
      const left = end - Date.now();
      if (left <= 0) { stop(); toast("25 minutes done. Stand up, get water, take 5."); return; }
      label.textContent = fmt(left);
    }
    function start() { end = Date.now() + 25 * 60e3; sessionStorage.setItem("np-timer", end); run(); }
    function run() { btn.classList.add("running"); tick(); iv = setInterval(tick, 1000); }
    function stop() { clearInterval(iv); end = 0; sessionStorage.removeItem("np-timer"); btn.classList.remove("running"); label.textContent = "25:00"; }
    btn.onclick = () => (end > Date.now() ? stop() : start());
    if (end > Date.now()) run(); else if (end) stop();
  }

  /* ---------------- Videos (click-to-load) ---------------- */
  function videoCard(v, wide) {
    const watched = !!S.videos[v.id];
    const el = document.createElement("div");
    el.className = "video" + (wide ? " wide" : "") + (watched ? " is-watched" : "");
    el.innerHTML = `<div class="video-frame">
        <img loading="lazy" alt="" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg">
        <button class="video-play" type="button" aria-label="Play ${esc(v.title)}"><span>${icon("play")}</span></button>
      </div>
      <div class="video-info">
        <div class="t"><a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">${esc(v.title)}</a>
          <small>${esc(v.channel)}${v.duration ? " · " + esc(v.duration) : ""} · <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">open on YouTube ↗</a></small></div>
        <button class="btn small watch-toggle ${watched ? "done" : ""}" type="button">${watched ? "✓ Watched" : "Mark watched"}</button>
      </div>`;
    $(".video-play", el).onclick = () => {
      el.classList.add("playing");
      mountPlayer($(".video-frame", el), v, () => markWatched(true));
    };
    const toggleBtn = $(".watch-toggle", el);
    function markWatched(on) {
      S.videos[v.id] = on; save();
      el.classList.toggle("is-watched", on);
      toggleBtn.classList.toggle("done", on);
      toggleBtn.textContent = on ? "✓ Watched" : "Mark watched";
    }
    toggleBtn.onclick = () => markWatched(!S.videos[v.id]);
    return el;
  }

  /* ---------------- Custom player (YouTube IFrame API, no YouTube controls) ---------------- */
  let ytReady;
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise((res) => {
      if (window.YT && YT.Player) return res();
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev && prev(); res(); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
    return ytReady;
  }
  const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
  const clock = (t) => { t = Math.max(0, Math.floor(t || 0)); const m = Math.floor(t / 60), s = t % 60; return m + ":" + String(s).padStart(2, "0"); };
  let activePlayer = null;

  function mountPlayer(frame, v, onFinish) {
    frame.classList.add("np-player", "is-loading");
    frame.tabIndex = 0;
    frame.innerHTML = `<div class="np-yt"><div></div></div>
      <div class="np-cover"><img alt="" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg"><button type="button" class="np-big" aria-label="Play"><span>${icon("play")}</span></button><p class="np-msg"></p></div>
      <div class="np-hit" aria-hidden="true"></div>
      <div class="np-bar">
        <button type="button" class="np-btn np-pp" aria-label="Play">${icon("play")}</button>
        <button type="button" class="np-btn np-back" aria-label="Back 10 seconds">${icon("back10")}</button>
        <button type="button" class="np-btn np-fwd" aria-label="Forward 10 seconds">${icon("fwd10")}</button>
        <span class="np-time"><span class="np-cur">0:00</span> / <span class="np-dur">${esc(v.duration || "0:00")}</span></span>
        <div class="np-seek" role="slider" aria-label="Seek" tabindex="0"><div class="np-buf"></div><div class="np-fill"></div><div class="np-knob"></div></div>
        <button type="button" class="np-btn np-speed" aria-label="Playback speed">1×</button>
        <button type="button" class="np-btn np-cc" aria-label="Captions" aria-pressed="false">CC</button>
        <button type="button" class="np-btn np-mute" aria-label="Mute">${icon("volume")}</button>
        <button type="button" class="np-btn np-fs" aria-label="Full screen">${icon("expand")}</button>
      </div>`;
    const q = (c) => frame.querySelector(c);
    const pp = q(".np-pp"), seek = q(".np-seek"), fill = q(".np-fill"), buf = q(".np-buf"), knob = q(".np-knob");
    const cur = q(".np-cur"), dur = q(".np-dur"), cover = q(".np-cover"), msg = q(".np-msg");
    let p, raf, dragging = false, finished = false, cc = !!S.cc;
    let speed = SPEEDS.includes(S.speed) ? S.speed : 1;
    q(".np-speed").textContent = speed + "×";
    q(".np-cc").setAttribute("aria-pressed", cc);
    const fsEl = frame.requestFullscreen || frame.webkitRequestFullscreen;
    if (!fsEl) q(".np-fs").hidden = true;

    const playing = () => p && p.getPlayerState && p.getPlayerState() === YT.PlayerState.PLAYING;
    const toggle = () => { if (!p || !p.playVideo) return; playing() ? p.pauseVideo() : p.playVideo(); };
    const jump = (d) => { if (p && p.getCurrentTime) { p.seekTo(Math.max(0, p.getCurrentTime() + d), true); paint(); } };
    function paint() {
      if (!p || !p.getDuration) return;
      const d = p.getDuration() || 0, t = dragging ? +seek.dataset.t : p.getCurrentTime();
      const pct = d ? (t / d) * 100 : 0;
      fill.style.width = pct + "%"; knob.style.left = pct + "%";
      buf.style.width = (p.getVideoLoadedFraction() || 0) * 100 + "%";
      cur.textContent = clock(t); if (d) dur.textContent = clock(d);
      seek.setAttribute("aria-valuenow", Math.round(pct));
      if (!finished && d && t / d > 0.9) { finished = true; onFinish && onFinish(); }
    }
    function loop() { paint(); raf = requestAnimationFrame(loop); }
    function setCC(on) {
      cc = on; S.cc = on; save();
      q(".np-cc").setAttribute("aria-pressed", on);
      try { if (on) { p.loadModule("captions"); p.setOption("captions", "track", { languageCode: "en" }); } else p.unloadModule("captions"); } catch (e) {}
    }

    loadYT().then(() => {
      p = new YT.Player(frame.querySelector(".np-yt > div"), {
        host: "https://www.youtube-nocookie.com",
        videoId: v.id,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, cc_load_policy: cc ? 1 : 0, cc_lang_pref: "en", origin: location.origin },
        events: {
          onReady: () => { p.setPlaybackRate(speed); if (!cc) try { p.unloadModule("captions"); } catch (e) {} p.playVideo(); loop(); },
          onStateChange: (e) => {
            const st = e.data, S_ = YT.PlayerState;
            const isPlay = st === S_.PLAYING;
            frame.classList.toggle("is-playing", isPlay);
            frame.classList.toggle("is-loading", st === S_.BUFFERING || st === S_.UNSTARTED);
            frame.classList.toggle("is-paused", st === S_.PAUSED || st === S_.CUED);
            frame.classList.toggle("is-ended", st === S_.ENDED);
            pp.innerHTML = icon(isPlay ? "pause" : "play"); pp.setAttribute("aria-label", isPlay ? "Pause" : "Play");
            if (isPlay) { frame.classList.add("was-started"); if (activePlayer && activePlayer !== p) try { activePlayer.pauseVideo(); } catch (er) {} activePlayer = p; msg.textContent = ""; }
            if (st === S_.ENDED) { msg.textContent = "Done. Marked as watched."; if (!finished) { finished = true; onFinish && onFinish(); } }
          },
          onError: () => { frame.classList.add("is-error"); msg.innerHTML = `This video won't play here. <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Open it on YouTube ↗</a>`; },
        },
      });
    });

    q(".np-hit").onclick = toggle;
    q(".np-big").onclick = () => { if (frame.classList.contains("is-ended")) p.seekTo(0, true); p && p.playVideo(); };
    pp.onclick = toggle;
    q(".np-back").onclick = () => jump(-10);
    q(".np-fwd").onclick = () => jump(10);
    q(".np-speed").onclick = (e) => {
      speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; S.speed = speed; save();
      e.currentTarget.textContent = speed + "×"; p && p.setPlaybackRate(speed);
    };
    q(".np-cc").onclick = () => setCC(!cc);
    q(".np-mute").onclick = (e) => {
      if (!p) return; const m = !p.isMuted(); m ? p.mute() : p.unMute();
      e.currentTarget.innerHTML = icon(m ? "muted" : "volume");
    };
    q(".np-fs").onclick = () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else fsEl.call(frame);
    };
    const at = (x) => { const r = seek.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)) * (p.getDuration() || 0); };
    seek.addEventListener("pointerdown", (e) => {
      if (!p || !p.getDuration) return;
      dragging = true; seek.setPointerCapture(e.pointerId); seek.dataset.t = at(e.clientX); paint();
    });
    seek.addEventListener("pointermove", (e) => { if (dragging) { seek.dataset.t = at(e.clientX); paint(); } });
    seek.addEventListener("pointerup", () => { if (!dragging) return; dragging = false; p.seekTo(+seek.dataset.t, true); paint(); });
    frame.addEventListener("keydown", (e) => {
      if (!p || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase(), map = {
        " ": toggle, k: toggle, j: () => jump(-10), l: () => jump(10), arrowleft: () => jump(-5), arrowright: () => jump(5),
        c: () => setCC(!cc), f: () => q(".np-fs").click(), m: () => q(".np-mute").click(),
      };
      if (map[k] && !(k === " " && e.target.tagName === "BUTTON")) { e.preventDefault(); map[k](); }
    });
    frame.focus({ preventScroll: true });
  }
  function renderVideos() {
    $$("[data-videos]").forEach((box) => {
      const list = videosFor(box.dataset.videos);
      box.classList.add("videos", list.length > 1 ? "list" : "single");
      list.forEach((v) => box.appendChild(videoCard(v, list.length === 1)));
      if (list.length > 1) box.insertAdjacentHTML("afterbegin", `<p class="videos-sum">${list.length} short videos · ${Math.round(list.reduce((a, v) => a + mins(v.duration), 0))} min total. Tip: 1.25–1.5× speed.</p>`);
      if (!list.length) box.innerHTML = `<p class="muted">No video for this one. Read the notes below.</p>`;
    });
    $$("[data-yt]").forEach((box) => {
      const ids = box.dataset.yt.split(",");
      box.classList.add("videos", ids.length > 1 ? "list" : "single");
      ids.forEach((id) => {
        const v = D.videos.find((x) => x.id === id) || { id, title: box.dataset.title || "Video", channel: box.dataset.channel || "YouTube", duration: "" };
        box.appendChild(videoCard(v, ids.length === 1 && box.dataset.wide !== undefined));
      });
    });
  }

  function renderPortTables() {
    $$("[data-ports-table]").forEach((box) => {
      const official = box.dataset.portsTable === "official";
      const rows = D.ports.filter((p) => !p.port.startsWith("IP") && (!official || p.in_official_n10009_table === "yes"));
      box.className = "table-wrap";
      box.innerHTML = `<table><tr><th>Port</th><th>Protocol</th><th>TCP/UDP</th><th>Secure?</th><th>Remember</th></tr>${rows.map((p) =>
        `<tr><td class="mono"><b>${esc(p.port)}</b></td><td><b>${esc(p.acronym)}</b> <span class="muted">${esc(p.protocol)}</span></td><td>${esc(p.transport)}</td><td>${esc(p.secure)}</td><td>${esc(p.notes)}</td></tr>`).join("")}</table>`;
    });
  }

  /* ---------------- Questions ---------------- */
  function questionEl(q, onAnswer) {
    const el = document.createElement("div");
    el.className = "q";
    const order = shuffle(q.choices.map((c, i) => i));
    el.innerHTML = `<p class="q-text">${esc(q.question)} <span class="q-tag">${esc(q.objective)}</span></p>
      <div class="choices">${order.map((i, k) => `<button class="choice" type="button" data-i="${i}"><span class="k">${"ABCD"[k]}</span><span>${esc(q.choices[i])}</span></button>`).join("")}</div>
      <div class="explain"></div>`;
    $$(".choice", el).forEach((b) => b.onclick = () => {
      const pick = Number(b.dataset.i), ok = pick === q.answer;
      $$(".choice", el).forEach((x) => { x.disabled = true; if (Number(x.dataset.i) === q.answer) x.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      el.classList.add("answered", ok ? "ok" : "no");
      $(".explain", el).innerHTML = `<strong>${ok ? "✓ Correct." : "✗ Not quite."}</strong> ${esc(q.explanation)}`;
      S.answers[q.id] = { obj: q.objective, ok, t: Date.now() }; save();
      srs("q:" + q.id, ok);
      onAnswer && onAnswer(ok, q);
    });
    return el;
  }
  function renderChecks() {
    $$(".check[data-obj]").forEach((box) => {
      const obj = box.dataset.obj, n = Number(box.dataset.n || 3);
      const qs = shuffle(D.questions.filter((q) => q.objective === obj)).slice(0, n);
      qs.forEach((q) => box.appendChild(questionEl(q)));
      const more = document.createElement("p");
      more.innerHTML = `<a href="${ROOT}practice/quiz.html?obj=${obj}">More ${obj} questions →</a> · <a href="${ROOT}practice/flashcards.html?obj=${obj}">${obj} flashcards →</a> · <a href="${ROOT}dictionary.html?obj=${obj}">${obj} terms →</a>`;
      box.appendChild(more);
    });
  }

  /* ---------------- Chapter page ---------------- */
  const STEP_NAMES = { goal: "Goal", watch: "Watch", read: "Read", photos: "Real photos", learn: "Key points", visual: "Diagrams", try: "Try it", traps: "Exam traps", scenario: "Scenario", check: "Quick check", sayback: "Say it back", do: "Do it" };

  /* ---------------- Lesson enhancements ---------------- */
  function photosStep(id) {
    const imgs = (D.images || []).filter((im) => im.obj === id);
    if (!imgs.length) return null;
    const st = document.createElement("div");
    st.className = "step"; st.dataset.step = "photos";
    st.innerHTML = `<div class="gallery">${imgs.map((im, k) => `<figure class="photo">
        <button type="button" class="photo-btn" data-k="${k}" aria-label="Enlarge: ${esc(im.topic)}"><img loading="lazy" src="${ROOT}${im.src}" alt="${esc(im.topic)}"></button>
        <figcaption><b>${esc(im.topic)}</b>${esc(im.caption)}</figcaption></figure>`).join("")}</div>`;
    $$(".photo-btn", st).forEach((b) => b.onclick = () => lightbox(imgs, Number(b.dataset.k)));
    return st;
  }
  function lightbox(imgs, k) {
    const ov = document.createElement("div");
    ov.className = "lightbox"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    const show = () => {
      const im = imgs[k];
      ov.innerHTML = `<figure><img src="${ROOT}${im.src}" alt="${esc(im.topic)}"><figcaption><b>${esc(im.topic)}</b> · ${esc(im.caption)}
        <small>Photo: ${esc(im.author || "unknown")} · <a href="${esc(im.license_url || im.page)}" target="_blank" rel="noopener">${esc(im.license || "see source")}</a> · <a href="${esc(im.page)}" target="_blank" rel="noopener">source ↗</a></small></figcaption></figure>
        <div class="lb-nav">${imgs.length > 1 ? `<button class="btn small" type="button" data-d="-1">← Prev</button><button class="btn small" type="button" data-d="1">Next →</button>` : ""}<button class="btn small primary" type="button" data-close>Close (Esc)</button></div>`;
      $$("[data-d]", ov).forEach((b) => b.onclick = (e) => { e.stopPropagation(); k = (k + Number(b.dataset.d) + imgs.length) % imgs.length; show(); });
      $("[data-close]", ov).onclick = close;
    };
    const key = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight" && imgs.length > 1) { k = (k + 1) % imgs.length; show(); } if (e.key === "ArrowLeft" && imgs.length > 1) { k = (k - 1 + imgs.length) % imgs.length; show(); } };
    function close() { ov.remove(); document.removeEventListener("keydown", key); }
    ov.onclick = (e) => { if (e.target === ov) close(); };
    document.addEventListener("keydown", key);
    show(); document.body.appendChild(ov); $("[data-close]", ov).focus();
  }

  function enhanceRead(st) {
    const mins = st.dataset.mins;
    const bar = document.createElement("div");
    bar.className = "read-bar";
    bar.innerHTML = `${mins ? `<span class="muted">≈ ${mins} min read</span>` : ""}
      ${"speechSynthesis" in window ? `<button class="btn small ghost" type="button" data-say="play">${icon("speaker")}Read aloud</button><button class="btn small ghost hide" type="button" data-say="stop">${icon("stop")}Stop</button>` : ""}
      <button class="btn small ghost" type="button" data-ruler>${icon("ruler")}Reading ruler</button>`;
    st.prepend(bar);
    const play = $("[data-say=play]", bar), stop = $("[data-say=stop]", bar);
    if (play) {
      play.onclick = () => {
        speechSynthesis.cancel();
        const text = Array.from(st.querySelectorAll("p, li, h3, td, th")).filter((n) => !n.closest(".read-bar")).map((n) => n.innerText).join(". ");
        const u = new SpeechSynthesisUtterance(text); u.rate = 1.05;
        u.onend = u.onerror = () => { stop.classList.add("hide"); play.classList.remove("hide"); };
        speechSynthesis.speak(u); play.classList.add("hide"); stop.classList.remove("hide");
      };
      stop.onclick = () => { speechSynthesis.cancel(); };
    }
    $("[data-ruler]", bar).onclick = (e) => { st.classList.toggle("ruler"); e.target.classList.toggle("primary"); };
  }

  function enhanceTables(sec) {
    $$('.step[data-step="visual"] table, .step[data-step="learn"] table, .step[data-step="read"] table', sec).forEach((tb) => {
      if (tb.rows.length < 3 || tb.closest(".activity")) return;
      const wrap = tb.closest(".table-wrap") || tb;
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "btn small ghost quizme"; btn.innerHTML = `${icon("eyeoff")}Quiz me on this table`;
      wrap.before(btn);
      btn.onclick = () => {
        const on = !tb.classList.contains("memory");
        tb.classList.toggle("memory", on);
        $$("td", tb).forEach((td) => { if (td.cellIndex > 0) td.classList.toggle("hidden-cell", on); });
        btn.innerHTML = on ? `${icon("eye")}Show all answers` : `${icon("eyeoff")}Quiz me on this table`;
        btn.classList.toggle("primary", on);
      };
      tb.addEventListener("click", (e) => { const td = e.target.closest("td.hidden-cell"); if (td) td.classList.remove("hidden-cell"); });
    });
  }

  function enhanceScenarios(sec) {
    $$(".scenario", sec).forEach((sc, n) => {
      const opts = $$(".options > li", sc);
      if (!opts.length) return;
      const list = document.createElement("div");
      list.className = "choices";
      opts.forEach((li, k) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "choice";
        b.innerHTML = `<span class="k">${"ABCDEF"[k]}</span><span>${li.innerHTML}</span>`;
        b.onclick = () => {
          $$(".choice", list).forEach((x, j) => {
            x.disabled = true;
            if (opts[j].hasAttribute("data-correct")) x.classList.add("right");
            const why = document.createElement("small"); why.className = "why"; why.textContent = opts[j].dataset.why || "";
            x.querySelector("span:last-child").appendChild(why);
          });
          const ok = li.hasAttribute("data-correct");
          if (!ok) b.classList.add("wrong");
          sc.classList.add("answered");
          S.scen = S.scen || {}; S.scen[sec.dataset.obj + "#" + n] = ok; save();
        };
        list.appendChild(b);
      });
      $(".options", sc).replaceWith(list);
    });
  }

  function enhanceSayback(sec) {
    const st = $('.step[data-step="sayback"]', sec); if (!st) return;
    const id = sec.dataset.obj, key = "say:" + id;
    const prompt = $(".prompt", st);
    if (prompt) {
      const ta = document.createElement("textarea");
      ta.className = "sayback-box"; ta.rows = 4; ta.placeholder = "Type it in your own words (or say it out loud), then tick what you covered…";
      ta.value = (S.notes || {})[key] || "";
      ta.oninput = () => { S.notes = S.notes || {}; S.notes[key] = ta.value; save(); };
      prompt.after(ta);
    }
    const cl = $(".checklist", st);
    if (cl) {
      $$("li", cl).forEach((li, k) => {
        const idk = `${key}:${k}`;
        li.innerHTML = `<label><input type="checkbox" ${S.tasks[idk] ? "checked" : ""}> <span>${li.innerHTML}</span></label>`;
        $("input", li).onchange = (e) => { S.tasks[idk] = e.target.checked; save(); };
      });
      cl.insertAdjacentHTML("beforebegin", `<p class="mini-h">A good answer…</p>`);
    }
    const terms = $(".terms", st);
    if (terms) {
      const list = terms.textContent.split(";").map((t) => t.trim()).filter(Boolean);
      terms.innerHTML = `<span class="mini-h">Key terms</span> ` + list.map((t) => `<span class="chip">${esc(t)}</span>`).join("") +
        ` <a class="chip link" href="${ROOT}practice/flashcards.html?obj=${id}">Drill ${id} flashcards →</a>`;
    }
    const deep = $(".deeper", st);
    if (deep) {
      deep.insertAdjacentHTML("beforebegin", `<p class="mini-h">Want to go deeper? (optional)</p>`);
      $$("a", deep).forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });
    }
  }

  function enhanceLesson(sec) {
    const body = $(".lesson-body", sec);
    const ph = photosStep(sec.dataset.obj);
    if (ph) {
      const anchorStep = $('.step[data-step="read"]', body) || $('.step[data-step="watch"]', body) || $('.step[data-step="goal"]', body);
      anchorStep ? anchorStep.after(ph) : body.prepend(ph);
    }
    $$('.step[data-step="read"]', body).forEach(enhanceRead);
    enhanceTables(sec);
    enhanceScenarios(sec);
    enhanceSayback(sec);
  }

  function initChapter() {
    const lessons = $$(".lesson");
    if (!lessons.length) return;
    const chap = CHAPTERS.find((c) => c.n === Number(document.body.dataset.chapter));
    const hero = $(".hero");
    if (hero && chap) hero.insertAdjacentHTML("afterbegin", `<div class="hero-num" aria-hidden="true">${String(chap.n).padStart(2, "0")}</div>`);

    lessons.forEach((sec) => {
      const id = sec.dataset.obj, meta = lessonById(id) || { title: sec.dataset.title };
      sec.id = anchor(id);
      const vm = videoMinutes(id);
      const rm = Number(($('.step[data-step="read"]', sec) || {}).dataset?.mins || 0);
      const est = sec.dataset.mins || (vm ? vm + 20 : 25) + rm;
      const head = document.createElement("button");
      head.type = "button"; head.className = "lesson-head"; head.setAttribute("aria-expanded", "false");
      head.innerHTML = `<span class="obj-chip">${esc(id)}</span>
        <span class="lesson-title"><h2>${esc(sec.dataset.title || meta.title)}</h2>
        <small>≈ ${est} min${vm ? ` · ${vm} min video` : ""}<span class="status"></span></small></span>
        <span class="chev" aria-hidden="true">›</span>`;
      sec.prepend(head);
      sec._cur = 0;
      head.onclick = () => setOpen(sec, !sec.classList.contains("open"), true);

      enhanceLesson(sec);

      // number the steps so every lesson reads the same way
      $$(".lesson-body > .step", sec).forEach((st, i) => {
        const lab = document.createElement("div");
        lab.className = "step-label";
        lab.innerHTML = `<span class="num">${i + 1}</span>${esc(st.dataset.label || STEP_NAMES[st.dataset.step] || "")}`;
        st.prepend(lab);
      });

      // sticky step bar: see every step, jump to one, and know where you are
      const steps = $$(".lesson-body > .step", sec);
      const nav = document.createElement("nav");
      nav.className = "stepnav"; nav.setAttribute("aria-label", "Steps in this lesson");
      nav.innerHTML = steps.map((st, i) => `<button type="button" data-i="${i}"><b>${i + 1}</b>${esc(st.dataset.label ? st.dataset.label.split(":")[0] : STEP_NAMES[st.dataset.step] || "")}</button>`).join("");
      $(".lesson-body", sec).prepend(nav);
      $$("button", nav).forEach((b) => b.onclick = () => steps[Number(b.dataset.i)].scrollIntoView({ behavior: "smooth", block: "start" }));
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((ents) => ents.forEach((en) => {
          if (!en.isIntersecting) return;
          const i = steps.indexOf(en.target);
          sec._cur = i; updateMobileBar();
          $$("button", nav).forEach((b, j) => { b.classList.toggle("on", j === i); b.classList.toggle("past", j < i); });
          const cur = $$("button", nav)[i]; if (cur && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: cur.offsetLeft - 40, behavior: "smooth" });
        }), { rootMargin: "-140px 0px -60% 0px" });
        steps.forEach((st) => io.observe(st));
      }

      // official objective checklist
      const o = D.objectives.find((x) => x.id === id);
      const body = $(".lesson-body", sec);
      if (o) {
        const det = document.createElement("details");
        det.className = "official";
        det.innerHTML = `<summary>Official CompTIA checklist for ${id}</summary><dl>${Object.entries(o.topics).map(([t, subs]) =>
          `<dt>${esc(t)}</dt><dd>${esc(subs.join(" · ") || "—")}</dd>`).join("")}</dl>`;
        body.appendChild(det);
      }

      // done bar
      const bar = document.createElement("div");
      bar.className = "step";
      bar.innerHTML = `<div class="step-label"><span class="num">✓</span>Finish</div>
        <div class="donebar">
          <div class="conf">How sure do you feel? ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-c="${n}" title="${["", "Lost", "Shaky", "OK", "Good", "Could teach it"][n]}">${n}</button>`).join("")}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn done-btn" type="button"></button>
            <a class="btn primary next-btn hide" href="#"></a>
          </div>
        </div>`;
      body.appendChild(bar);
      $$(".conf button", bar).forEach((b) => b.onclick = () => { S.conf[id] = Number(b.dataset.c); save(); paint(sec); });
      $(".done-btn", bar).onclick = () => {
        S.lessons[id] = !S.lessons[id]; save(); paint(sec); paintAll();
        if (S.lessons[id]) {
          if (!S.conf[id]) toast("Done! Tip: rate how sure you feel (1–5).");
          const nx = nextLesson(id);
          if (nx && nx.chapter.n === chap.n) { const el = document.getElementById(anchor(nx.id)); setOpen(el, true, true); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
        }
      };
    });

    // table of contents
    const toc = $(".toc");
    if (toc) {
      toc.innerHTML = `<h4>Chapter ${chap.n} · lessons</h4><ol>${lessons.map((s) =>
        `<li><a href="#${s.id}" data-for="${s.id}"><span class="tick">○</span><span>${esc(s.dataset.obj)} ${esc(s.dataset.title || lessonById(s.dataset.obj).title)}</span></a></li>`).join("")}</ol>
        <p style="margin:14px 0 0"><button class="btn small ghost" type="button" id="showall">Open all lessons</button></p>`;
      $$("a", toc).forEach((a) => a.onclick = (e) => { e.preventDefault(); const el = document.getElementById(a.dataset.for); setOpen(el, true, true); el.scrollIntoView({ behavior: "smooth" }); history.replaceState(null, "", "#" + a.dataset.for); });
      $("#showall", toc).onclick = () => lessons.forEach((s) => setOpen(s, true, false));
    }

    // phone bottom bar: current step + one big "next" button
    const mbar = document.createElement("div");
    mbar.className = "mobilebar"; mbar.setAttribute("aria-label", "Lesson progress");
    mbar.innerHTML = `<div class="mb-where"><span></span><b></b></div><button class="btn primary" type="button">Next step ↓</button>`;
    document.body.appendChild(mbar);
    function openLesson() { return lessons.find((s) => s.classList.contains("open")); }
    function updateMobileBar() {
      const sec = openLesson();
      mbar.classList.toggle("show", !!sec);
      if (!sec) return;
      const steps = $$(".lesson-body > .step", sec).filter((st) => !st.querySelector(".donebar"));
      const i = Math.min(sec._cur || 0, steps.length - 1), st = steps[i];
      $(".mb-where span", mbar).textContent = `${sec.dataset.obj} · step ${i + 1} of ${steps.length}`;
      $(".mb-where b", mbar).textContent = st ? (st.dataset.label ? st.dataset.label.split(":")[0] : STEP_NAMES[st.dataset.step] || "") : "";
      const btn = $("button", mbar), last = i >= steps.length - 1;
      btn.textContent = isDone(sec.dataset.obj) ? "Next lesson →" : last ? "Finish ✓" : "Next step ↓";
      btn.onclick = () => {
        if (isDone(sec.dataset.obj)) { const nx = nextLesson(sec.dataset.obj); if (nx) location.href = lessonUrl(nx); return; }
        const target = last ? $(".donebar", sec) : steps[i + 1];
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    }

    function setOpen(sec, open, single) {
      if (open && single) lessons.forEach((s) => s !== sec && s.classList.remove("open"));
      sec.classList.toggle("open", open);
      setTimeout(updateMobileBar, 0);
      $(".lesson-head", sec).setAttribute("aria-expanded", open);
      $$(".toc a").forEach((a) => a.classList.toggle("current", a.dataset.for === sec.id && open));
    }
    function paint(sec) {
      const id = sec.dataset.obj, done = isDone(id);
      sec.classList.toggle("is-done", done);
      $(".status", sec).textContent = done ? " · ✓ done" : "";
      $$(".conf button", sec).forEach((b) => b.classList.toggle("on", Number(b.dataset.c) === S.conf[id]));
      const db = $(".done-btn", sec);
      db.textContent = done ? "✓ Lesson done (undo)" : "Mark lesson done";
      db.classList.toggle("done", done);
      const nb = $(".next-btn", sec), nx = ALL_LESSONS[ALL_LESSONS.findIndex((l) => l.id === id) + 1];
      if (done && nx) { nb.classList.remove("hide"); nb.href = lessonUrl(nx); nb.textContent = `Next: ${nx.id} ${nx.title} →`; }
      else nb.classList.add("hide");
      const ta = $(`.toc a[data-for="${sec.id}"]`);
      if (ta) { ta.classList.toggle("is-done", done); $(".tick", ta).textContent = done ? "✓" : "○"; }
    }
    function paintAll() {
      lessons.forEach(paint);
      const p = chapterProgress(chap);
      const bar = $(".hero .progress > span"); if (bar) bar.style.width = p.pct + "%";
      const lab = $(".hero .progress-label"); if (lab) lab.textContent = `${p.done} of ${p.total} lessons done`;
      renderTopbar();
      updateMobileBar();
    }
    paintAll();

    // open the lesson from the URL, else the first unfinished one
    function openFromHash() {
      const target = location.hash && document.getElementById(location.hash.slice(1));
      const sec = target && target.classList.contains("lesson") ? target : (lessons.find((s) => !isDone(s.dataset.obj)) || lessons[0]);
      setOpen(sec, true, true);
      if (target) setTimeout(() => sec.scrollIntoView({ block: "start" }), 50);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    // pager to neighbouring chapters
    const pager = $(".pager");
    if (pager) {
      const prev = CHAPTERS.find((c) => c.n === chap.n - 1), next = CHAPTERS.find((c) => c.n === chap.n + 1);
      pager.innerHTML = (prev ? `<a href="${ROOT}chapters/${prev.slug}.html"><small>← Previous chapter</small>${prev.n}. ${esc(prev.title)}</a>` : `<a href="${ROOT}index.html"><small>← Back</small>Home</a>`) +
        (next ? `<a class="next" href="${ROOT}chapters/${next.slug}.html"><small>Next chapter →</small>${next.n}. ${esc(next.title)}</a>` : `<a class="next" href="${ROOT}index.html"><small>Done →</small>Home</a>`);
    }
  }

  /* ---------------- Hub (index.html) ---------------- */
  function initHub() {
    const hub = $("#hub"); if (!hub) return;
    const nx = firstUndone(), dl = daysLeft(), tp = todayPlan();
    const doneCount = ALL_LESSONS.filter((l) => isDone(l.id)).length;

    const due0 = srsDue().length;
    let noc = $("#hub-noc");
    if (!noc) { hub.insertAdjacentHTML("afterbegin", `<section class="noc" id="hub-noc" aria-label="Status"></section>`); noc = $("#hub-noc"); }
    noc.innerHTML = `<div class="noc-text">
        <div class="noc-eyebrow">CompTIA Network+ · N10-009</div>
        <h1>Network+ Study Guide</h1>
        <p class="noc-prompt"><span class="ps">netplus@guide:~$</span> <span class="cmd">show status</span><span class="cursor" aria-hidden="true"></span></p>
        <div class="noc-chips">
          ${nocChip(dl <= 3 ? "warn" : "good", `${Math.max(dl, 0)} day${dl === 1 ? "" : "s"} to exam`)}
          ${nocChip(doneCount === ALL_LESSONS.length ? "good" : doneCount ? "warn" : "off", `Lessons ${doneCount}/${ALL_LESSONS.length}`)}
          ${nocChip(due0 ? "warn" : "good", due0 ? `${due0} due for review` : "Reviews clear")}
        </div>
        <a class="main-cta" href="practice/exam.html">Open Study &amp; Test →</a>
      </div>${nocMap()}`;

    $("#nextup").innerHTML = nx
      ? `<div class="eyebrow">Do this next</div>
         <div class="what">${esc(nx.id)} · ${esc(nx.title)}</div>
         <p class="muted">Chapter ${nx.chapter.n}: ${esc(nx.chapter.title)}${videoMinutes(nx.id) ? ` · ${videoMinutes(nx.id)} min of video` : ""}</p>
         <a class="btn primary big" href="${lessonUrl(nx)}">${icon("play")}Start lesson ${esc(nx.id)}</a>`
      : `<div class="eyebrow">All lessons done</div><div class="what">Practice exams + weak spots</div><a class="btn primary big" href="practice/quiz.html?weak=1">${icon("play")}Weak-spot quiz</a>`;

    $("#countdown").innerHTML = `<div class="countdown"><span class="n">${Math.max(dl, 0)}</span><span>day${dl === 1 ? "" : "s"} until your exam<br><span class="muted">${fmtDate(examDate(), { weekday: "long", month: "long", day: "numeric" })} · <a href="plan.html#exam-date">change</a></span></span></div>
      <div class="progress"><span style="width:${Math.round((doneCount / ALL_LESSONS.length) * 100)}%"></span></div>
      <div class="progress-label">${doneCount} of ${ALL_LESSONS.length} lessons done</div>`;

    const due = srsDue().length, dueBox = $("#due");
    if (dueBox) dueBox.innerHTML = due
      ? `<div class="eyebrow">Due for review</div><div class="what">${due} item${due === 1 ? "" : "s"} to re-check</div><p class="muted">Questions and flashcards you missed, brought back at the right time. ~${Math.max(2, Math.round(due * 0.4))} min.</p><a class="btn primary" href="practice/review.html">${icon("play")}Review now</a>`
      : `<div class="eyebrow">Due for review</div><div class="what">All caught up ✓</div><p class="muted" style="margin:0">Anything you miss in a quiz or mark "Again" in flashcards comes back here after 1, 3, 7 and 14 days.</p>`;
    const today = $("#today");
    if (tp) {
      const items = tp.lessons.map((id) => { const l = lessonById(id); return { done: isDone(id), html: `<a href="${lessonUrl(l)}">${id} ${esc(l.title)}</a>` }; })
        .concat(tp.tasks.map((t) => ({ done: !!S.tasks[tp.date + ":" + t.id], task: tp.date + ":" + t.id, html: t.href ? `<a href="${t.href}" ${t.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(t.text)}</a>` : esc(t.text) })));
      const before = todayISO() < tp.date;
      today.innerHTML = `<h2>${before ? "Day 1 starts" : "Today"} · ${fmtDate(tp.date)}</h2><p class="muted" style="margin-top:-.4em">${esc(tp.title)}</p>
        <ul class="today-list">${items.map((it) => `<li class="${it.done ? "is-done" : ""}"><span class="box" ${it.task ? `role="checkbox" tabindex="0" aria-checked="${it.done}" data-task="${it.task}" style="cursor:pointer"` : `title="Ticks itself when you finish the lesson"`}>${it.done ? "✓" : ""}</span><span class="txt">${it.html}</span></li>`).join("")}</ul>
        <p style="margin:12px 0 0"><a href="plan.html">See the full 16-day plan →</a></p>`;
      $$("[data-task]", today).forEach((b) => { const fn = () => { S.tasks[b.dataset.task] = !S.tasks[b.dataset.task]; save(); initHub(); }; b.onclick = fn; b.onkeydown = (e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), fn()); });
    } else {
      today.innerHTML = `<h2>Today</h2><p>No plan day for today. <a href="plan.html">Open the plan →</a></p>`;
    }

    $("#chapters").innerHTML = CHAPTERS.map((c) => {
      const p = chapterProgress(c);
      return `<a class="chapter-card" href="chapters/${c.slug}.html" style="--c:var(--d${c.n > 5 ? 0 : c.n})">
        <div class="k"><i class="led ${p.pct === 100 ? "good" : p.done ? "warn" : "off"}" aria-hidden="true"></i>Chapter ${c.n}${c.weight ? ` · ${c.weight}% of exam` : ""}<span class="port-id">Gi0/${c.n}</span></div>
        <h3>${esc(c.title)}</h3><p>${esc(c.blurb)}</p>
        <div class="progress"><span style="width:${p.pct}%"></span></div>
        <div class="progress-label">${p.done}/${p.total} lessons</div></a>`;
    }).join("");

    $("#weights").innerHTML = CHAPTERS.filter((c) => c.weight).sort((a, b) => b.weight - a.weight).map((c) =>
      `<div class="weight-row"><span>${c.n}. ${esc(c.title.replace("Network ", ""))}</span><span class="bar"><span style="width:${c.weight * 4}%;background:var(--d${c.n})"></span></span><span class="pct">${c.weight}%</span></div>`).join("");

    const conf = $("#confidence");
    if (conf) {
      const rows = ALL_LESSONS.filter((l) => /^[1-5]/.test(l.id)).map((l) => {
        const st = objStats(l.id), c = S.conf[l.id];
        return { l, c, st, score: (c || 0) + (st.n ? (st.ok / st.n) * 5 : 0) };
      }).sort((a, b) => a.score - b.score).slice(0, 6);
      conf.innerHTML = `<h2>Weakest spots right now</h2><p class="muted" style="margin-top:-.4em">Based on your 1–5 ratings and quiz answers. Revisit these first.</p>
        <div class="table-wrap"><table><tr><th>Lesson</th><th>You rated</th><th>Quiz</th></tr>${rows.map((r) =>
          `<tr><td><a href="${lessonUrl(r.l)}">${r.l.id} ${esc(r.l.title)}</a></td><td>${r.c ? r.c + "/5" : "—"}</td><td>${r.st.n ? `${r.st.ok}/${r.st.n}` : "—"}</td></tr>`).join("")}</table></div>`;
    }

    const ex = $("#export"), im = $("#import");
    if (ex) ex.onclick = () => {
      const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "netplus-progress-" + todayISO() + ".json"; a.click();
    };
    if (im) im.onchange = () => {
      const f = im.files[0]; if (!f) return;
      f.text().then((t) => { S = Object.assign(load(), JSON.parse(t)); save(); toast("Progress restored."); initHub(); renderTopbar(); }).catch(() => toast("That file didn't look right."));
    };
  }

  /* ---------------- Plan page ---------------- */
  function initPlan() {
    const box = $("#plan"); if (!box) return;
    const t = todayISO();
    box.innerHTML = PLAN.map((p, i) => {
      const vm = p.lessons.reduce((a, id) => a + videoMinutes(id), 0);
      const cls = p.date === t ? "today" : p.date < t ? "past" : "";
      return `<div class="plan-day ${cls}" id="d${p.date}">
        <div class="date">${fmtDate(p.date, { weekday: "short" })}<small>${fmtDate(p.date, { month: "short", day: "numeric" })} · Day ${i + 1}</small></div>
        <div><strong>${esc(p.title)}</strong>${p.date === t ? ' <span class="pill" style="background:var(--accent)">TODAY</span>' : ""}
          <ul>${p.lessons.map((id) => { const l = lessonById(id); return `<li>${isDone(id) ? "✓ " : ""}<span class="pill" style="background:var(--d${l.chapter.n > 5 ? 0 : l.chapter.n})">${id}</span><a href="${lessonUrl(l)}">${esc(l.title)}</a></li>`; }).join("")}
          ${p.tasks.map((k) => `<li>${S.tasks[p.date + ":" + k.id] ? "✓ " : ""}${k.href ? `<a href="${k.href}" ${k.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(k.text)}</a>` : esc(k.text)}</li>`).join("")}</ul>
          ${vm ? `<span class="muted" style="font-size:.85rem">${vm} min of video${vm > 60 ? " (watch at 1.25–1.5×)" : ""}</span>` : ""}
        </div></div>`;
    }).join("");
    const inp = $("#exam-date-input");
    if (inp) { inp.value = examDate(); inp.onchange = () => { S.examDate = inp.value; save(); toast("Exam date saved."); }; }
  }

  /* ---------------- Boot ---------------- */
  window.NP = { nocMap, nocChip, D, S: () => S, icon, save, srs, srsDue, CHAPTERS, ALL_LESSONS, PLAN, questionEl, shuffle, esc, toast, lessonUrl, lessonById, videoCard, objStats, $, $$ };
  renderTopbar();
  decorateHero();
  renderVideos();
  renderPortTables();
  renderChecks();
  initChapter();
  initHub();
  initPlan();
  if (document.querySelector("[data-activity]") && !document.querySelector('script[src$="activities.js"]')) {
    const sc = document.createElement("script"); sc.src = ROOT + "assets/js/activities.js"; document.body.appendChild(sc);
  }
  if (document.body.dataset.chapter !== undefined && D.dictionary) {
    const sc = document.createElement("script"); sc.src = ROOT + "assets/js/glossary.js"; document.body.appendChild(sc);
  }
  if (location.protocol === "file:") {
    const n = $(".file-notice");
    if (n) n.classList.remove("hide");
  }
})();
