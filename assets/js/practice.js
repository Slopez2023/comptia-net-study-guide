/* Practice tools: quiz, flashcards, subnetting drill, ports drill.
   Uses the helpers guide.js exposes on window.NP. */
(function () {
  "use strict";
  const { D, save, questionEl, shuffle, esc, toast, CHAPTERS, ALL_LESSONS, lessonUrl, objStats, $, $$ } = window.NP;
  const S = () => window.NP.S();
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;

  const objOptions = (sel) => D.objectives.map((o) => `<option value="${o.id}" ${o.id === sel ? "selected" : ""}>${o.id} ${esc(o.title.slice(0, 60))}</option>`).join("");
  const domOptions = (sel) => CHAPTERS.filter((c) => c.weight).map((c) => `<option value="${c.n}" ${String(c.n) === sel ? "selected" : ""}>Domain ${c.n}: ${esc(c.title)}</option>`).join("");

  /* ---------------- Quiz ---------------- */
  function quiz() {
    const box = $("#tool");
    const objs = (params.get("obj") || "").split(",").filter(Boolean);
    box.innerHTML = `<div class="tool-bar">
        <select id="f-dom" aria-label="Domain"><option value="">All domains</option>${domOptions(params.get("domain") || "")}</select>
        <select id="f-obj" aria-label="Objective"><option value="">All objectives</option>${objOptions(objs.length === 1 ? objs[0] : "")}</select>
        <select id="f-n" aria-label="Number of questions">${[10, 20, 30, 90].map((n) => `<option ${String(n) === (params.get("n") || "10") ? "selected" : ""}>${n}</option>`).join("")}</select>
        <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="f-weak" ${params.get("weak") ? "checked" : ""}> Weak spots only</label>
        <button class="btn primary" id="go" type="button">Start</button>
      </div><div id="run"></div><div id="stats"></div>`;
    $("#go").onclick = start;
    renderStats();
    start();

    function pool() {
      const dom = $("#f-dom").value, obj = $("#f-obj").value, weak = $("#f-weak").checked;
      let qs = D.questions;
      if (objs.length > 1 && !obj) qs = qs.filter((q) => objs.includes(q.objective));
      if (obj) qs = qs.filter((q) => q.objective === obj);
      if (dom) qs = qs.filter((q) => q.objective.startsWith(dom + "."));
      if (weak) {
        const st = S();
        qs = qs.filter((q) => {
          const a = st.answers[q.id];
          if (a && !a.ok) return true;
          const os = objStats(q.objective);
          return (st.conf[q.objective] && st.conf[q.objective] <= 3) || (os.n >= 2 && os.ok / os.n < 0.75);
        });
        if (!qs.length) toast("No weak spots yet. Answer more questions first.");
      }
      return shuffle(qs).slice(0, Number($("#f-n").value));
    }
    function start() {
      const qs = pool(), run = $("#run");
      let i = 0, right = 0;
      if (!qs.length) { run.innerHTML = `<p class="muted">No questions match. Try a wider filter.</p>`; return; }
      const missed = {};
      const show = () => {
        run.innerHTML = `<p class="score">Question ${i + 1} of ${qs.length} · ${right} correct</p>`;
        const q = qs[i];
        const el = questionEl(q, (ok) => {
          if (ok) right++; else missed[q.objective] = (missed[q.objective] || 0) + 1;
          const nb = document.createElement("p");
          nb.innerHTML = `<button class="btn primary" type="button">${i + 1 < qs.length ? "Next question →" : "See results"}</button>`;
          el.appendChild(nb);
          $("button", nb).onclick = () => { i++; i < qs.length ? show() : done(); };
          $("button", nb).focus();
          $(".score", run).textContent = `Question ${i + 1} of ${qs.length} · ${right} correct`;
        });
        run.appendChild(el);
      };
      const done = () => {
        const pct = Math.round((right / qs.length) * 100);
        const misses = Object.entries(missed).sort((a, b) => b[1] - a[1]);
        run.innerHTML = `<div class="panel" style="border-top:6px solid ${pct >= 80 ? "var(--good)" : "var(--warn)"}">
          <div class="eyebrow">Result</div><div style="font-size:2.4rem;font-weight:800">${right}/${qs.length} · ${pct}%</div>
          <p>${pct >= 85 ? "Exam-ready on this set. 🎉" : pct >= 70 ? "Close. Review the misses below." : "This is useful data, and now you know where to focus."}</p>
          ${misses.length ? `<h3>Rewatch these</h3><ul>${misses.map(([o, n]) => { const l = ALL_LESSONS.find((x) => x.id === o); return `<li><a href="${lessonUrl(l)}">${o} ${esc(l.title)}</a> (missed ${n})</li>`; }).join("")}</ul>` : ""}
          <button class="btn primary" type="button" id="again">Another round</button></div>`;
        $("#again").onclick = start;
        renderStats();
      };
      show();
    }
    function renderStats() {
      const rows = D.objectives.map((o) => ({ o, s: objStats(o.id) })).filter((r) => r.s.n);
      $("#stats").innerHTML = rows.length ? `<h2 style="margin-top:32px">Your accuracy by objective</h2><div class="table-wrap"><table><tr><th>Objective</th><th>Answered</th><th>Correct</th></tr>${rows.map((r) => {
        const p = Math.round((r.s.ok / r.s.n) * 100);
        return `<tr><td>${r.o.id} ${esc(r.o.title)}</td><td>${r.s.n}</td><td style="color:${p >= 80 ? "var(--good)" : p >= 60 ? "var(--warn)" : "var(--bad)"};font-weight:700">${p}%</td></tr>`;
      }).join("")}</table></div>` : "";
    }
  }

  /* ---------------- Flashcards ---------------- */
  function flashcards() {
    const box = $("#tool");
    const objs = (params.get("obj") || "").split(",").filter(Boolean);
    box.innerHTML = `<div class="tool-bar">
        <select id="f-set" aria-label="Card set">${["concepts", "ports", "acronyms", "all"].map((s) => `<option ${s === (params.get("set") || "concepts") ? "selected" : ""}>${s}</option>`).join("")}</select>
        <select id="f-obj" aria-label="Objective"><option value="">All objectives</option>${objOptions(objs.length === 1 ? objs[0] : "")}</select>
        <button class="btn primary" id="go" type="button">Shuffle &amp; start</button>
        <span class="score" id="count"></span>
      </div>
      <div class="flashcard" id="card" tabindex="0" role="button" aria-label="Flip card"></div>
      <div class="tool-bar center" style="justify-content:center;margin-top:16px">
        <button class="btn" id="again" type="button">↺ Again <kbd>1</kbd></button>
        <button class="btn primary" id="flip" type="button">Flip <kbd>Space</kbd></button>
        <button class="btn done" id="got" type="button">✓ Got it <kbd>2</kbd></button>
      </div>
      <p class="muted center">Cards marked "Again" come back a few cards later. The round ends when every card is "Got it".</p>`;
    let deck = [], cur = null, gotN = 0, total = 0;
    function start() {
      const set = $("#f-set").value, obj = $("#f-obj").value;
      let cards = D.cards.filter((c) => set === "all" || c.set === set);
      if (obj) cards = cards.filter((c) => c.obj === obj);
      else if (objs.length > 1) cards = cards.filter((c) => objs.includes(c.obj));
      deck = shuffle(cards); total = deck.length; gotN = 0; next();
    }
    function next() {
      cur = deck.shift();
      const card = $("#card");
      card.classList.remove("flipped");
      if (!cur) { card.innerHTML = total ? `<div>🎉 Round complete: ${total} cards.<br><small>Shuffle again, or switch sets.</small></div>` : `<div>No cards for that filter.</div>`; $("#count").textContent = ""; return; }
      card.innerHTML = `<div><small>${esc(cur.set)}${cur.obj ? " · " + esc(cur.obj) : ""}</small>${esc(cur.front)}<div class="back">${esc(cur.back)}</div></div>`;
      $("#count").textContent = `${gotN} / ${total} got it`;
    }
    const flip = () => cur && $("#card").classList.toggle("flipped");
    const again = () => { if (!cur) return; deck.splice(Math.min(4, deck.length), 0, cur); next(); };
    const got = () => { if (!cur) return; gotN++; const st = S(); st.cards[cur.front] = Date.now(); save(); next(); };
    $("#go").onclick = start; $("#card").onclick = flip; $("#flip").onclick = flip; $("#again").onclick = again; $("#got").onclick = got;
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("select,input")) return;
      if (e.key === " ") { e.preventDefault(); flip(); } else if (e.key === "1") again(); else if (e.key === "2") got();
    });
    start();
  }

  /* ---------------- Subnetting ---------------- */
  function subnetting() {
    const box = $("#tool");
    const ip2n = (a) => a.split(".").reduce((x, o) => (x * 256) + Number(o), 0);
    const n2ip = (n) => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join(".");
    box.innerHTML = `<div class="tool-bar">
        <select id="f-range" aria-label="Difficulty"><option value="24-30">Easy: /24–/30</option><option value="16-30">Mixed: /16–/30</option><option value="8-30">Hard: /8–/30</option></select>
        <button class="btn primary" id="new" type="button">New problem</button>
        <span class="score" id="sstats"></span>
      </div>
      <div class="panel">
        <div class="eyebrow">Solve for</div>
        <div id="prob" style="font-family:var(--mono);font-size:2rem;font-weight:600;margin-bottom:14px"></div>
        <div class="subnet-grid">
          <label>Network address<input class="mono" type="text" id="a-net" autocomplete="off" inputmode="decimal"></label>
          <label>Broadcast address<input class="mono" type="text" id="a-bc" autocomplete="off" inputmode="decimal"></label>
          <label>First usable host<input class="mono" type="text" id="a-first" autocomplete="off" inputmode="decimal"></label>
          <label>Last usable host<input class="mono" type="text" id="a-last" autocomplete="off" inputmode="decimal"></label>
          <label>Usable hosts<input class="mono" type="text" id="a-hosts" autocomplete="off" inputmode="numeric"></label>
          <label>Subnet mask<input class="mono" type="text" id="a-mask" autocomplete="off" inputmode="decimal"></label>
        </div>
        <p style="margin-top:16px"><button class="btn primary" id="check" type="button">Check (Enter)</button> <button class="btn ghost" id="show" type="button">Show the answer</button> <span class="score" id="timer"></span></p>
        <div id="out"></div>
      </div>`;
    let P, t0, tick;
    function gen() {
      const [lo, hi] = $("#f-range").value.split("-").map(Number);
      const cidr = lo + Math.floor(Math.random() * (hi - lo + 1));
      const firsts = [10, 172, 192];
      const f = firsts[Math.floor(Math.random() * 3)];
      const ip = [f, f === 172 ? 16 + Math.floor(Math.random() * 16) : f === 192 ? 168 : Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), 1 + Math.floor(Math.random() * 254)].join(".");
      const n = ip2n(ip), size = 2 ** (32 - cidr), net = Math.floor(n / size) * size, bc = net + size - 1;
      const maskN = 2 ** 32 - size;
      P = { ip, cidr, net: n2ip(net), bc: n2ip(bc), first: n2ip(net + 1), last: n2ip(bc - 1), hosts: String(size - 2), mask: n2ip(maskN), size };
      $("#prob").textContent = `${ip}/${cidr}`;
      $$(".subnet-grid input").forEach((i) => { i.value = ""; i.style.borderColor = ""; });
      $("#out").innerHTML = "";
      $("#a-net").focus();
      t0 = Date.now(); clearInterval(tick); tick = setInterval(() => { $("#timer").textContent = `⏱ ${Math.round((Date.now() - t0) / 1000)} s`; }, 500);
      stats();
    }
    function explain() {
      const octet = P.cidr >= 24 ? 4 : P.cidr >= 16 ? 3 : 2;
      const block = 2 ** ((octet * 8) - P.cidr);
      return `<p><b>Block size</b> in octet ${octet}: 256 − ${256 - block} = <b>${block}</b>. <b>Network</b> = ${P.net}, <b>broadcast</b> = next network − 1 = ${P.bc}. <b>Hosts</b> = 2<sup>${32 - P.cidr}</sup> − 2 = ${P.hosts}. Mask = ${P.mask}.</p>`;
    }
    function check() {
      const map = { "a-net": "net", "a-bc": "bc", "a-first": "first", "a-last": "last", "a-hosts": "hosts", "a-mask": "mask" };
      let ok = true;
      Object.entries(map).forEach(([id, k]) => {
        const v = $("#" + id).value.trim(), good = v === P[k];
        if (!good) ok = false;
        $("#" + id).style.borderColor = good ? "var(--good)" : "var(--bad)";
      });
      const secs = Math.round((Date.now() - t0) / 1000);
      clearInterval(tick);
      const st = S(); st.subnet.push({ ok, secs, t: Date.now() }); st.subnet = st.subnet.slice(-500); save();
      $("#out").innerHTML = `<div class="result ${ok ? "ok" : "no"}"><strong>${ok ? `✓ All correct in ${secs} s${secs <= 30 ? " ⚡" : ""}` : "✗ Some fields are off (red)."}</strong>${explain()}<button class="btn primary" type="button" id="nx">Next problem →</button></div>`;
      $("#nx").onclick = gen; $("#nx").focus();
      stats();
    }
    function stats() {
      const all = S().subnet, today = all.filter((x) => new Date(x.t).toDateString() === new Date().toDateString());
      const okT = today.filter((x) => x.ok);
      const avg = okT.length ? Math.round(okT.reduce((a, x) => a + x.secs, 0) / okT.length) : 0;
      $("#sstats").textContent = `Today: ${okT.length}/${today.length} correct${avg ? ` · avg ${avg} s` : ""} · Goal: 40 under 30 s`;
    }
    $("#new").onclick = gen; $("#check").onclick = check;
    $("#show").onclick = () => { $("#out").innerHTML = `<div class="result no"><strong>Answer:</strong> ${P.net} – ${P.bc}, hosts ${P.first}–${P.last}${explain()}<button class="btn primary" type="button" id="nx">Next problem →</button></div>`; $("#nx").onclick = gen; clearInterval(tick); };
    box.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("input")) check(); });
    $("#f-range").onchange = gen;
    gen();
  }

  /* ---------------- Ports ---------------- */
  function ports() {
    const box = $("#tool");
    const list = D.ports.filter((p) => !p.port.startsWith("IP"));
    box.innerHTML = `<div class="tool-bar">
        <select id="f-scope" aria-label="Which ports"><option value="official">Official N10-009 list (20)</option><option value="all">All, including extras</option></select>
        <select id="f-dir" aria-label="Direction"><option value="p2n">Port → protocol</option><option value="n2p">Protocol → port</option></select>
        <span class="score" id="pscore"></span>
      </div>
      <div class="panel"><div class="eyebrow">Which one?</div><div id="pq" style="font-size:2rem;font-weight:800;margin-bottom:14px"></div><div class="choices" id="pc"></div><div id="pout"></div></div>
      <h2 style="margin-top:32px">Reference table</h2><div data-ports-table="all" id="ptable"></div>`;
    let right = 0, n = 0, streak = 0;
    function pick() {
      const pool = list.filter((p) => $("#f-scope").value === "all" || p.in_official_n10009_table === "yes");
      const p = pool[Math.floor(Math.random() * pool.length)];
      const dir = $("#f-dir").value;
      const label = (x) => dir === "p2n" ? `${x.acronym} (${x.protocol})` : `${x.port} ${x.transport}`;
      const wrong = shuffle(pool.filter((x) => label(x) !== label(p) && x.port !== p.port)).slice(0, 3);
      const opts = shuffle([p, ...wrong]);
      $("#pq").innerHTML = dir === "p2n" ? `Port <span class="mono">${esc(p.port)}</span>` : esc(`${p.acronym} · ${p.protocol}`);
      $("#pout").innerHTML = "";
      $("#pc").innerHTML = opts.map((o, i) => `<button class="choice" type="button" data-i="${i}"><span class="k">${"ABCD"[i]}</span><span>${esc(label(o))}</span></button>`).join("");
      $$("#pc .choice").forEach((b) => b.onclick = () => {
        const ok = opts[Number(b.dataset.i)] === p;
        n++; if (ok) { right++; streak++; } else streak = 0;
        $$("#pc .choice").forEach((x) => { x.disabled = true; if (opts[Number(x.dataset.i)] === p) x.classList.add("right"); });
        if (!ok) b.classList.add("wrong");
        $("#pscore").textContent = `${right}/${n} · ${Math.round((right / n) * 100)}% · streak ${streak}${streak >= 10 ? " 🔥" : ""}`;
        $("#pout").innerHTML = `<p class="result ${ok ? "ok" : "no"}"><b>${esc(p.port)}</b> = <b>${esc(p.acronym)}</b> (${esc(p.transport)}). ${esc(p.notes || "")}</p>`;
        setTimeout(pick, ok ? 900 : 2600);
      });
    }
    $("#f-scope").onchange = pick; $("#f-dir").onchange = pick;
    pick();
    // re-render the reference table now that the container exists
    const t = $("#ptable");
    t.innerHTML = `<table><tr><th>Port</th><th>Protocol</th><th>TCP/UDP</th><th>Secure?</th><th>Official?</th><th>Remember</th></tr>${D.ports.map((p) =>
      `<tr><td class="mono"><b>${esc(p.port)}</b></td><td><b>${esc(p.acronym)}</b> <span class="muted">${esc(p.protocol)}</span></td><td>${esc(p.transport)}</td><td>${esc(p.secure)}</td><td>${p.in_official_n10009_table === "yes" ? "✓" : `<span class="muted">${esc(p.in_official_n10009_table)}</span>`}</td><td>${esc(p.notes)}</td></tr>`).join("")}</table>`;
    t.className = "table-wrap";
  }

  ({ quiz, flashcards, subnetting, ports })[page]();
})();
