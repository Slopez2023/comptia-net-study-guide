/* Interactive "Try it" activities. A lesson asks for one with
   <div data-activity="NAME"></div>; unknown names render nothing.
   Needs guide.js (window.NP) loaded first. */
(function () {
  "use strict";
  const { D, esc, shuffle, toast, $, $$ } = window.NP;
  const S = () => window.NP.S();
  const save = () => window.NP.save();

  function logActivity(name, ok) {
    const st = S(); st.activities = st.activities || {};
    const a = st.activities[name] || { tries: 0, best: 0 };
    a.tries++; if (ok) a.best = 1; a.t = Date.now();
    st.activities[name] = a; save();
  }
  const shell = (box, title, intro) => {
    box.classList.add("activity");
    box.innerHTML = `<div class="act-head"><span class="act-tag">Try it</span><h3>${esc(title)}</h3></div>${intro ? `<p class="act-intro">${intro}</p>` : ""}<div class="act-body"></div>`;
    return $(".act-body", box);
  };

  /* =====================================================================
     1. Sequence step-throughs: predict the next message, then reveal it.
     ===================================================================== */
  const SEQS = {
    "dhcp-dora": {
      title: "DHCP: watch a laptop get an address",
      intro: "Maya's laptop just plugged into the office network. It has no IP address yet. Predict each message before it appears.",
      actors: ["Maya's laptop<br><small>no IP yet</small>", "DHCP server<br><small>10.0.0.2</small>"],
      steps: [
        { from: 0, to: 1, label: "DISCOVER", bc: true, ask: "The laptop has no IP and doesn't know where the server is. What does it send first?", choices: ["DHCPDISCOVER", "DHCPREQUEST", "DHCPACK"], answer: 0,
          detail: "<b>Broadcast</b> from 0.0.0.0:68 to 255.255.255.255:67. \"Is there a DHCP server out there?\" Routers don't forward broadcasts, which is why remote subnets need a DHCP relay." },
        { from: 1, to: 0, label: "OFFER", ask: "The server picks a free address from its scope. What does it send back?", choices: ["DHCPACK", "DHCPOFFER", "DHCPNAK"], answer: 1,
          detail: "\"You can have <b>10.0.0.57</b>, mask 255.255.255.0, gateway 10.0.0.1, DNS 10.0.0.2, lease 8 hours.\" These extras are DHCP <b>options</b>." },
        { from: 0, to: 1, label: "REQUEST", bc: true, ask: "The laptop wants that address. What does it send?", choices: ["DHCPREQUEST", "DHCPDISCOVER", "ARP request"], answer: 0,
          detail: "Still a broadcast, so any <i>other</i> DHCP servers that offered an address know they weren't picked." },
        { from: 1, to: 0, label: "ACK", ask: "What finalizes the lease?", choices: ["DHCPOFFER", "DHCPACK", "DHCPRELEASE"], answer: 1,
          detail: "The lease is confirmed. The laptop configures 10.0.0.57 and starts using it. At 50% of the lease time it will try to <b>renew</b>." },
      ],
      done: "D-O-R-A: <b>D</b>iscover, <b>O</b>ffer, <b>R</b>equest, <b>A</b>cknowledge. UDP 67 (server) and 68 (client).",
    },
    "dns-lookup": {
      title: "DNS: follow one lookup all the way",
      intro: "Maya types <code>www.example.com</code>. Her laptop's cache and hosts file don't have it. Watch the resolver do the legwork.",
      actors: ["Laptop", "Recursive<br>resolver", "Root<br>server", ".com TLD<br>server", "example.com<br><small>authoritative</small>"],
      steps: [
        { from: 0, to: 1, label: "A? www.example.com", ask: "Where does the laptop send its query?", choices: ["Straight to the root server", "Its configured DNS (recursive) resolver", "The default gateway's ARP table"], answer: 1,
          detail: "A <b>recursive</b> query: \"Get me the final answer, please.\" The resolver's address came from DHCP option 6." },
        { from: 1, to: 2, label: "A? www.example.com", detail: "The resolver has no cache entry, so it starts at the top of the tree." },
        { from: 2, to: 1, label: "Ask .com servers", ask: "Does the root server know the IP of www.example.com?", choices: ["Yes, it returns the A record", "No, it refers the resolver to the .com TLD servers"], answer: 1,
          detail: "Root servers only know who runs each top-level domain. This is a <b>referral</b>." },
        { from: 1, to: 3, label: "A? www.example.com", detail: "An <b>iterative</b> query. The resolver does each hop itself." },
        { from: 3, to: 1, label: "Ask ns1.example.com", detail: "The TLD returns the <b>NS records</b> for example.com: who is authoritative." },
        { from: 1, to: 4, label: "A? www.example.com", detail: "Finally it asks the server that owns the zone." },
        { from: 4, to: 1, label: "A 93.184.215.14", ask: "This server owns the example.com zone. Its answer is…", choices: ["Authoritative", "Non-authoritative", "A referral"], answer: 0,
          detail: "An <b>authoritative</b> answer, straight from the zone's own server, with a <b>TTL</b> that says how long it can be cached." },
        { from: 1, to: 0, label: "A 93.184.215.14", ask: "When the resolver hands this cached copy to the laptop, it's…", choices: ["Authoritative", "Non-authoritative"], answer: 1,
          detail: "To the laptop it's <b>non-authoritative</b>. It came from the resolver, not the zone owner. The next lookup within the TTL is answered from cache instantly." },
      ],
      done: "Recursive query (laptop → resolver), then iterative queries (resolver → root → TLD → authoritative). A record = name → IPv4.",
    },
    "tcp-handshake": {
      title: "TCP: the three-way handshake",
      intro: "Before a browser can send an HTTPS request, TCP opens a connection to port 443. Predict each segment.",
      actors: ["Browser<br><small>port 51544</small>", "Web server<br><small>port 443</small>"],
      steps: [
        { from: 0, to: 1, label: "SYN  seq=100", ask: "What does the client send to open the connection?", choices: ["SYN", "ACK", "FIN"], answer: 0, detail: "\"Let's talk. My starting sequence number is 100.\"" },
        { from: 1, to: 0, label: "SYN/ACK  seq=300 ack=101", ask: "How does the server answer?", choices: ["ACK only", "SYN/ACK", "RST"], answer: 1, detail: "The server acknowledges 100 (expects 101 next) and sends its own starting number." },
        { from: 0, to: 1, label: "ACK  ack=301", ask: "What completes the handshake?", choices: ["SYN", "ACK", "Data immediately, no reply needed"], answer: 1, detail: "Connection is <b>established</b>. Every byte from now on is numbered and acknowledged. That's what makes TCP reliable." },
        { from: 0, to: 1, label: "TLS + HTTP data", detail: "Now the real traffic flows. UDP skips all of this, which is why it's faster but unreliable." },
      ],
      done: "SYN → SYN/ACK → ACK. Connection-oriented = TCP. Connectionless = UDP.",
    },
    "arp-gateway": {
      title: "Leaving the subnet: ARP and the default gateway",
      intro: "PC-A (192.168.1.10/24) pings 8.8.8.8. Watch which addresses change at each hop and which stay the same.",
      actors: ["PC-A<br><small>192.168.1.10</small>", "Router (gateway)<br><small>192.168.1.1</small>", "Internet<br><small>8.8.8.8</small>"],
      steps: [
        { from: 0, to: 0, label: "Is 8.8.8.8 local?", ask: "PC-A compares 8.8.8.8 to its own subnet 192.168.1.0/24. Where should the packet go?", choices: ["Directly to 8.8.8.8", "To the default gateway", "Broadcast to everyone"], answer: 1,
          detail: "It's on a different network, so the packet goes to the <b>default gateway</b>." },
        { from: 0, to: 1, label: "ARP: who has 192.168.1.1?", bc: true, ask: "PC-A knows the gateway's IP but not its MAC. What does it send?", choices: ["DNS query", "ARP request (broadcast)", "DHCP discover"], answer: 1,
          detail: "ARP maps IP → MAC on the local segment. The request goes to broadcast MAC ff:ff:ff:ff:ff:ff." },
        { from: 1, to: 0, label: "ARP reply: 1.1 is at aa:aa…", detail: "A unicast reply. PC-A caches it (see it with <code>arp -a</code>)." },
        { from: 0, to: 1, label: "ICMP echo → 8.8.8.8", ask: "In this frame, what is the destination MAC address?", choices: ["8.8.8.8's MAC", "The router's MAC (aa:aa…)", "ff:ff:ff:ff:ff:ff"], answer: 1,
          detail: "Destination <b>IP</b> = 8.8.8.8 (end to end). Destination <b>MAC</b> = the router (next hop only)." },
        { from: 1, to: 2, label: "Forwarded, TTL−1", ask: "As the router forwards it, what changes?", choices: ["The destination IP", "The source and destination MACs (new frame), TTL drops by 1", "Nothing at all"], answer: 1,
          detail: "Every router builds a <b>new Layer 2 frame</b> and decrements TTL. With NAT, the source IP also becomes the public address." },
      ],
      done: "IP addresses travel end to end. MAC addresses change at every router hop. ARP finds the next hop's MAC.",
    },
  };

  function sequence(box, key) {
    const cfg = SEQS[key];
    const body = shell(box, cfg.title, cfg.intro);
    let i = 0, score = 0, asked = 0;
    const W = 720, colW = W / cfg.actors.length, rowH = 46, top = 44;
    const x = (a) => colW * a + colW / 2;
    body.innerHTML = `<div class="seq-actors" style="grid-template-columns:repeat(${cfg.actors.length},1fr)">${cfg.actors.map((a) => `<div>${a}</div>`).join("")}</div>
      <div class="svg-fig seq-fig"><svg viewBox="0 0 ${W} ${top + rowH * cfg.steps.length + 10}" role="img" aria-label="${esc(cfg.title)}"></svg></div>
      <div class="seq-panel"></div>`;
    const svg = $("svg", body), panel = $(".seq-panel", body);
    function draw() {
      const h = top + rowH * Math.max(i, 1) - 20;
      svg.setAttribute("viewBox", `0 0 ${W} ${h}`);
      const lifelines = cfg.actors.map((_, a) => `<line x1="${x(a)}" y1="0" x2="${x(a)}" y2="${h}" class="wire" stroke-dasharray="3 5"/>`).join("");
      let arrows = "";
      cfg.steps.slice(0, i).forEach((s, k) => {
        const y = top + rowH * k - 20, cur = k === i - 1;
        if (s.from === s.to) {
          arrows += `<g class="${cur ? "seq-cur" : "seq-old"}"><rect x="${x(s.from) - 90}" y="${y - 16}" width="180" height="26" rx="8" class="box"/><text x="${x(s.from)}" y="${y + 2}" text-anchor="middle" font-size="13">${esc(s.label)}</text></g>`;
          return;
        }
        const x1 = x(s.from), x2 = x(s.to), dir = x2 > x1 ? 1 : -1;
        arrows += `<g class="${cur ? "seq-cur" : "seq-old"}">
          <line x1="${x1}" y1="${y}" x2="${x2 - dir * 8}" y2="${y}" class="wire ${cur ? "hot" : ""}" ${s.bc ? 'stroke-dasharray="7 4"' : ""}/>
          <path d="M${x2} ${y} l${-dir * 12} -6 v12 z" class="${cur ? "dombox" : "arrowhead"}"/>
          <text x="${(x1 + x2) / 2}" y="${y - 8}" text-anchor="middle" font-size="13" font-weight="700">${esc(s.label)}${s.bc ? " (broadcast)" : ""}</text></g>`;
      });
      svg.innerHTML = lifelines + arrows;
    }
    function render() {
      draw();
      if (i >= cfg.steps.length) {
        panel.innerHTML = `<div class="result ok"><b>Done!</b> ${asked ? `You predicted ${score} of ${asked}.` : ""}<br>${cfg.done}</div>
          <p><button class="btn small" type="button" data-act="restart">↺ Run it again</button></p>`;
        $("[data-act=restart]", panel).onclick = () => { i = 0; score = 0; asked = 0; render(); };
        logActivity(key, asked ? score === asked : true);
        return;
      }
      const s = cfg.steps[i];
      const reveal = (extra) => {
        i++; draw();
        panel.innerHTML = `${extra || ""}<p class="seq-detail">${s.detail}</p>
          <p><button class="btn primary" type="button" data-act="next">${i < cfg.steps.length ? "Next message →" : "Finish"}</button> <span class="score">Step ${i} of ${cfg.steps.length}</span></p>`;
        $("[data-act=next]", panel).onclick = render;
        $("[data-act=next]", panel).focus({ preventScroll: true });
      };
      if (s.ask) {
        panel.innerHTML = `<p class="q-text"><span class="predict">Predict</span>${esc(s.ask)}</p><div class="choices">${s.choices.map((c, k) => `<button class="choice" type="button" data-k="${k}"><span class="k">${"ABC"[k]}</span><span>${esc(c)}</span></button>`).join("")}</div>
          <p class="score" style="margin-top:8px">Step ${i + 1} of ${cfg.steps.length}</p>`;
        $$(".choice", panel).forEach((b) => b.onclick = () => {
          const ok = Number(b.dataset.k) === s.answer; asked++; if (ok) score++;
          reveal(`<div class="result ${ok ? "ok" : "no"}">${ok ? "✓ Right." : `✗ It's <b>${esc(s.choices[s.answer])}</b>.`}</div>`);
        });
      } else {
        panel.innerHTML = `<p><button class="btn primary" type="button" data-act="show">Show the next message →</button> <span class="score">Step ${i + 1} of ${cfg.steps.length}</span></p>`;
        $("[data-act=show]", panel).onclick = () => reveal();
      }
    }
    render();
  }

  /* =====================================================================
     2. Encapsulation: wrap the data one layer at a time.
     ===================================================================== */
  function encapsulation(box) {
    const body = shell(box, "Encapsulation: build a frame layer by layer", "Maya's browser has an HTTPS request ready to send. Each layer adds its own header. Pick what the layer adds, then watch the frame grow.");
    const L = [
      { layer: "L7–5 Application", block: "DATA", cls: "enc-data", pdu: "data", ask: null, note: "The HTTPS request (encrypted by TLS, which CompTIA files under L6)." },
      { layer: "L4 Transport", block: "TCP hdr", cls: "enc-l4", pdu: "segment", ask: "What does the Transport layer add?", choices: ["Source and destination ports", "Source and destination MAC addresses", "Source and destination IP addresses"], answer: 0, note: "TCP header: src port 51544 → dst port <b>443</b>, plus sequence numbers. Now it's a <b>segment</b>." },
      { layer: "L3 Network", block: "IP hdr", cls: "enc-l3", pdu: "packet", ask: "What does the Network layer add?", choices: ["Port numbers", "Source and destination IP addresses + TTL", "A frame check sequence"], answer: 1, note: "IP header: 192.168.1.10 → 93.184.215.14, TTL 64. Now it's a <b>packet</b>." },
      { layer: "L2 Data link", block: "Eth hdr", trailer: "FCS", cls: "enc-l2", pdu: "frame", ask: "What does the Data link layer add?", choices: ["MAC addresses (header) + FCS (trailer)", "IP addresses", "Encryption"], answer: 0, note: "Ethernet header: PC's MAC → <b>gateway's</b> MAC, plus a trailer (FCS/CRC) to detect corruption. Now it's a <b>frame</b>." },
      { layer: "L1 Physical", block: "", cls: "enc-l1", pdu: "bits", ask: "What does the Physical layer do with the frame?", choices: ["Adds another header", "Sends it as bits: electrical, light or radio signals", "Removes the IP header"], answer: 1, note: "01001011… on copper, fiber or radio. The receiver reverses everything: <b>de-encapsulation</b>." },
    ];
    let i = 0;
    body.innerHTML = `<div class="enc-frame" aria-live="polite"></div><div class="enc-layers"></div><div class="seq-panel"></div>`;
    const frame = $(".enc-frame", body), panel = $(".seq-panel", body), layers = $(".enc-layers", body);
    function draw() {
      const shown = L.slice(0, i);
      const bits = i >= L.length;
      const heads = shown.filter((l) => l.block && l.block !== "DATA").reverse();
      frame.innerHTML = bits ? `<div class="enc-bits">0100101101001110 0101010001010011 0100011001101111 …</div>` :
        heads.map((l) => `<span class="enc ${l.cls}">${l.block}</span>`).join("") + (i ? `<span class="enc enc-data">DATA</span>` : `<span class="muted">(empty)</span>`) + (shown.some((l) => l.trailer) ? `<span class="enc enc-l2">FCS</span>` : "");
      layers.innerHTML = L.map((l, k) => `<span class="${k < i ? "on" : ""}">${l.layer}${k < i ? ` → <b>${l.pdu}</b>` : ""}</span>`).join("");
    }
    function step() {
      draw();
      if (i >= L.length) {
        panel.innerHTML = `<div class="result ok"><b>That's encapsulation.</b> Data → segment → packet → frame → bits. Remember the order with "Don't Some People Fly Bombers" (Data, Segment, Packet, Frame, Bits).</div><p><button class="btn small" type="button">↺ Again</button></p>`;
        $("button", panel).onclick = () => { i = 0; step(); };
        logActivity("encapsulation", true); return;
      }
      const l = L[i];
      const reveal = (msg) => { i++; draw(); panel.innerHTML = `${msg || ""}<p class="seq-detail">${l.note}</p><p><button class="btn primary" type="button">Next layer down →</button></p>`; $("button", panel).onclick = step; };
      if (!l.ask) { panel.innerHTML = `<p><button class="btn primary" type="button">Start at the top →</button></p>`; $("button", panel).onclick = () => reveal(); return; }
      panel.innerHTML = `<p class="q-text"><span class="predict">Predict</span>${esc(l.ask)}</p><div class="choices">${l.choices.map((c, k) => `<button class="choice" type="button" data-k="${k}"><span class="k">${"ABC"[k]}</span><span>${esc(c)}</span></button>`).join("")}</div>`;
      $$(".choice", panel).forEach((b) => b.onclick = () => { const ok = Number(b.dataset.k) === l.answer; reveal(`<div class="result ${ok ? "ok" : "no"}">${ok ? "✓ Right." : `✗ It's: <b>${esc(l.choices[l.answer])}</b>.`}</div>`); });
    }
    step();
  }

  /* =====================================================================
     3. Matching PBQs (dropdown per row, like the real exam)
     ===================================================================== */
  function matching(box, { title, intro, rows, options, name }) {
    const body = shell(box, title, intro);
    const opts = options.slice().sort();
    body.innerHTML = `<div class="match">${rows.map((r, k) => `<label class="match-row"><span class="match-left">${r.left}</span>
        <select data-k="${k}"><option value="">Choose…</option>${opts.map((o) => `<option>${esc(o)}</option>`).join("")}</select><span class="match-mark" aria-live="polite"></span></label>`).join("")}</div>
      <p><button class="btn primary" type="button" data-act="check">Check answers</button> <button class="btn ghost" type="button" data-act="new">New set</button></p><div class="match-out"></div>`;
    $("[data-act=check]", body).onclick = () => {
      let right = 0;
      $$("select", body).forEach((s) => {
        const r = rows[Number(s.dataset.k)], ok = s.value === r.right;
        if (ok) right++;
        const mark = s.parentElement.querySelector(".match-mark");
        mark.innerHTML = ok ? "✓" : `✗ <b>${esc(r.right)}</b>${r.why ? ` <span class="muted">${esc(r.why)}</span>` : ""}`;
        s.parentElement.classList.toggle("ok", ok); s.parentElement.classList.toggle("no", !ok);
      });
      $(".match-out", body).innerHTML = `<div class="result ${right === rows.length ? "ok" : "no"}">${right} of ${rows.length} correct${right === rows.length ? ". Exam-ready on this set." : ". Read the fixes, then try a new set."}</div>`;
      logActivity(name, right === rows.length);
    };
    $("[data-act=new]", body).onclick = () => box.dispatchEvent(new CustomEvent("np-rerender"));
  }

  function matchPorts(box) {
    const official = D.ports.filter((p) => p.in_official_n10009_table === "yes" && !p.port.startsWith("IP"));
    const pick = shuffle(official.filter((p, i, a) => a.findIndex((q) => q.port === p.port) === i)).slice(0, 8);
    matching(box, {
      name: "match-ports", title: "PBQ: match each port to its protocol",
      intro: "This is exactly the kind of drag-and-match task the exam opens with. Pick the protocol for each port.",
      rows: pick.map((p) => ({ left: `<code>${esc(p.port)}</code> <span class="muted">${esc(p.transport)}</span>`, right: p.acronym, why: p.notes })),
      options: pick.map((p) => p.acronym),
    });
  }

  const MEDIA = [
    { left: "Link between two buildings 2 km apart", right: "Single-mode fiber (LC)", why: "Long distance → single-mode." },
    { left: "10G from a top-of-rack switch to a server 3 m away, cheapest option", right: "DAC / twinax", why: "Short, cheap, copper with SFP+ ends built in." },
    { left: "Cable run through the air space above a drop ceiling", right: "Plenum-rated Cat 6", why: "Air-handling space needs fire-rated plenum jacket." },
    { left: "Cable modem from the ISP's wall outlet", right: "RG-6 coax (F-type)", why: "Cable internet = coax with F-type connector." },
    { left: "Desk PC to wall jack, 1 Gbps, normal office", right: "Cat 6 UTP (RJ45)", why: "Standard copper Ethernet, 100 m max." },
    { left: "Factory floor next to big motors, 60 m run", right: "Shielded twisted pair (STP)", why: "Shielding resists EMI. (Fiber would also work.)" },
    { left: "40/100G spine uplink needing many fibers in one connector", right: "MPO multi-fiber", why: "MPO carries 8–24 fibers for QSFP optics." },
    { left: "Within one building's data center, 300 m, 10G fiber, cheaper optics", right: "Multimode fiber (LC)", why: "Short-reach fiber → multimode (OM3/OM4)." },
    { left: "Old analog phone line / DSL to the wall", right: "RJ11", why: "Smaller 6-position phone connector." },
  ];
  function pickMedia(box) {
    const rows = shuffle(MEDIA).slice(0, 6);
    matching(box, { name: "pick-media", title: "PBQ: choose the right cable for the job", intro: "Read each situation and pick the best media. Distance, environment and cost decide.", rows, options: rows.map((r) => r.right) });
  }

  /* =====================================================================
     4. Ordering PBQs (move up / down, plus drag)
     ===================================================================== */
  function ordering(box, { title, intro, items, name, check }) {
    const body = shell(box, title, intro);
    let order = shuffle(items.map((_, i) => i));
    while (items.length > 2 && order.every((v, i) => v === i)) order = shuffle(order);
    body.innerHTML = `<ol class="order-list"></ol><p><button class="btn primary" type="button" data-act="check">Check order</button> <button class="btn ghost" type="button" data-act="shuffle">Shuffle</button></p><div class="order-out"></div>`;
    const list = $(".order-list", body);
    let dragFrom = null;
    function draw(marks) {
      list.innerHTML = order.map((v, pos) => `<li draggable="true" data-pos="${pos}" class="${marks ? (marks[pos] ? "ok" : "no") : ""}">
          <span class="grip" aria-hidden="true">⋮⋮</span><span class="order-text">${items[v].html || esc(items[v].text)}</span>
          <span class="order-btns"><button type="button" class="btn small ghost" data-mv="-1" aria-label="Move up" ${pos === 0 ? "disabled" : ""}>↑</button><button type="button" class="btn small ghost" data-mv="1" aria-label="Move down" ${pos === order.length - 1 ? "disabled" : ""}>↓</button></span></li>`).join("");
      $$("li", list).forEach((li) => {
        const pos = Number(li.dataset.pos);
        $$("[data-mv]", li).forEach((b) => b.onclick = () => { const to = pos + Number(b.dataset.mv); [order[pos], order[to]] = [order[to], order[pos]]; draw(); $$(`li`, list)[to].querySelector(`[data-mv="${b.dataset.mv}"]`)?.focus(); });
        li.ondragstart = () => { dragFrom = pos; li.classList.add("dragging"); };
        li.ondragend = () => li.classList.remove("dragging");
        li.ondragover = (e) => e.preventDefault();
        li.ondrop = (e) => { e.preventDefault(); if (dragFrom === null) return; const [m] = order.splice(dragFrom, 1); order.splice(pos, 0, m); dragFrom = null; draw(); };
      });
    }
    draw();
    $("[data-act=shuffle]", body).onclick = () => { order = shuffle(order); draw(); $(".order-out", body).innerHTML = ""; };
    $("[data-act=check]", body).onclick = () => {
      const res = check(order);
      draw(res.marks);
      $(".order-out", body).innerHTML = res.html;
      logActivity(name, res.ok);
    };
  }

  function orderSteps(box) {
    const steps = ["Identify the problem", "Establish a theory of probable cause", "Test the theory to determine the cause", "Establish a plan of action to resolve the problem and identify potential effects", "Implement the solution or escalate as necessary", "Verify full system functionality and implement preventive measures if applicable", "Document findings, actions, outcomes, and lessons learned"];
    ordering(box, {
      name: "order-steps", title: "PBQ: put the 7 troubleshooting steps in order",
      intro: "Drag, or use the ↑ ↓ buttons. You need this order word for word on the exam.",
      items: steps.map((t) => ({ text: t })),
      check: (order) => {
        const marks = order.map((v, pos) => v === pos), ok = marks.every(Boolean);
        return { ok, marks, html: `<div class="result ${ok ? "ok" : "no"}">${ok ? "✓ Perfect order." : `${marks.filter(Boolean).length} of 7 in the right spot. The red ones are out of place.`}</div>` };
      },
    });
  }

  /* ACL ordering: graded by simulating first-match against test flows */
  function aclOrder(box) {
    const rules = [
      { text: "deny   ip  host 10.0.0.66  any", m: (f) => f.src === "10.0.0.66", act: "deny" },
      { text: "permit tcp 10.0.0.0/24  host 192.168.1.10  eq 443", m: (f) => f.src.startsWith("10.0.0.") && f.dst === "192.168.1.10" && f.proto === "tcp" && f.port === 443, act: "permit" },
      { text: "permit udp 10.0.0.0/24  host 192.168.1.53  eq 53", m: (f) => f.src.startsWith("10.0.0.") && f.dst === "192.168.1.53" && f.proto === "udp" && f.port === 53, act: "permit" },
      { text: "deny   ip  any  any", m: () => true, act: "deny" },
    ];
    const flows = [
      { label: "10.0.0.25 → web server 192.168.1.10, TCP 443", src: "10.0.0.25", dst: "192.168.1.10", proto: "tcp", port: 443, want: "permit" },
      { label: "10.0.0.66 (quarantined laptop) → web server, TCP 443", src: "10.0.0.66", dst: "192.168.1.10", proto: "tcp", port: 443, want: "deny" },
      { label: "10.0.0.25 → DNS server 192.168.1.53, UDP 53", src: "10.0.0.25", dst: "192.168.1.53", proto: "udp", port: 53, want: "permit" },
      { label: "10.0.0.25 → web server, TCP 22 (SSH)", src: "10.0.0.25", dst: "192.168.1.10", proto: "tcp", port: 22, want: "deny" },
    ];
    ordering(box, {
      name: "acl-order", title: "PBQ: fix the firewall rule order",
      intro: "<b>Requirement:</b> users in 10.0.0.0/24 may reach the web server on HTTPS and the DNS server on UDP 53. The quarantined laptop 10.0.0.66 must be blocked from everything. Everything else is denied. Rules are read <b>top-down, first match wins</b>.",
      items: rules.map((r) => ({ html: `<code>${esc(r.text)}</code>` })),
      check: (order) => {
        const res = flows.map((f) => { const r = order.map((i) => rules[i]).find((x) => x.m(f)); return { f, got: r ? r.act : "deny (implicit)" }; });
        const ok = res.every((x) => x.got.startsWith(x.f.want));
        return { ok, marks: null, html: `<div class="table-wrap"><table><tr><th>Test traffic</th><th>Should be</th><th>Your rules do</th></tr>${res.map((x) =>
          `<tr><td>${esc(x.f.label)}</td><td>${x.f.want}</td><td style="font-weight:700;color:${x.got.startsWith(x.f.want) ? "var(--good)" : "var(--bad)"}">${x.got} ${x.got.startsWith(x.f.want) ? "✓" : "✗"}</td></tr>`).join("")}</table></div>
          <div class="result ${ok ? "ok" : "no"}">${ok ? "✓ All traffic handled correctly. Specific rules first, broad deny last." : "Some traffic is handled wrong. Hint: the most specific rules go at the top, and <code>deny any any</code> goes at the bottom."}</div>` };
      },
    });
  }

  /* =====================================================================
     5. Subnet visualizer
     ===================================================================== */
  function subnetVisualizer(box) {
    const body = shell(box, "Subnet visualizer: see the bits", "Change the prefix and watch the line between <span class='bit-net-key'>network bits</span> and <span class='bit-host-key'>host bits</span> move. Click any bit of the IP address to flip it.");
    const ip2n = (a) => a.split(".").reduce((x, o) => x * 256 + Number(o), 0);
    const n2ip = (n) => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join(".");
    let ip = ip2n("192.168.10.77"), prefix = 27;
    body.innerHTML = `<div class="tool-bar">
        <label>IP <input class="mono" type="text" value="192.168.10.77" data-f="ip" size="15" aria-label="IP address"></label>
        <label>Prefix /<input type="range" min="8" max="30" value="27" data-f="pre" aria-label="Prefix length"> <b class="mono" data-f="pre-out">/27</b></label>
      </div>
      <div class="bits" data-f="bits"></div>
      <div class="tiles subnet-out" data-f="out"></div>
      <div class="callout tip" data-f="hint"></div>`;
    const el = (f) => $(`[data-f="${f}"]`, body);
    function draw() {
      const size = 2 ** (32 - prefix), net = Math.floor(ip / size) * size, bc = net + size - 1;
      let bits = "";
      for (let b = 31; b >= 0; b--) {
        const v = Math.floor(ip / 2 ** b) % 2, pos = 31 - b;
        bits += `<button type="button" class="bit ${pos < prefix ? "net" : "host"}" data-b="${b}" aria-label="bit ${pos + 1}: ${v}">${v}</button>${pos % 8 === 7 && pos < 31 ? '<span class="dot">.</span>' : ""}`;
      }
      el("bits").innerHTML = bits;
      $$(".bit", el("bits")).forEach((btn) => btn.onclick = () => {
        const b = Number(btn.dataset.b), v = Math.floor(ip / 2 ** b) % 2;
        ip += v ? -(2 ** b) : 2 ** b; el("ip").value = n2ip(ip); draw();
      });
      const oct = prefix >= 24 ? 4 : prefix >= 16 ? 3 : 2, block = 2 ** (oct * 8 - prefix);
      el("out").innerHTML = [
        ["Mask", n2ip(2 ** 32 - size)], ["Block size", `${block} (octet ${oct})`], ["Network", n2ip(net)],
        ["Broadcast", n2ip(bc)], ["Usable range", `${n2ip(net + 1)} – ${n2ip(bc - 1)}`], ["Usable hosts", `2<sup>${32 - prefix}</sup> − 2 = ${(size - 2).toLocaleString()}`],
      ].map(([k, v]) => `<div class="tile"><b>${k}</b><span class="mono">${v}</span></div>`).join("");
      el("hint").innerHTML = `<b>Notice:</b> moving the prefix 1 bit to the right halves the hosts. All host bits 0 = <b>network</b> address, all host bits 1 = <b>broadcast</b>.`;
      el("pre-out").textContent = "/" + prefix;
    }
    el("pre").oninput = (e) => { prefix = Number(e.target.value); draw(); logActivity("subnet-visualizer", true); };
    el("ip").onchange = (e) => { if (/^(\d{1,3}\.){3}\d{1,3}$/.test(e.target.value) && e.target.value.split(".").every((o) => o <= 255)) { ip = ip2n(e.target.value); draw(); } else toast("That isn't a valid IPv4 address."); };
    draw();
  }

  /* =====================================================================
     6. Practice terminal with broken-network scenarios
     ===================================================================== */
  const PC_HOST = "C:\\Users\\maya>";
  const TERM = [
    {
      id: "dns", title: "\"The internet is down\" (but is it?)",
      brief: "Maya says no websites load. Chat apps that use IP addresses still work. Investigate from her Windows PC.",
      prompt: PC_HOST,
      cmds: [
        [/^ipconfig( \/all)?$/i, `Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . : 10.0.20.57
   Subnet Mask . . . . . . . : 255.255.255.0
   Default Gateway . . . . . : 10.0.20.1
   DNS Servers . . . . . . . : 10.0.99.99`],
        [/^ping 10\.0\.20\.1$/i, `Reply from 10.0.20.1: bytes=32 time=1ms TTL=255
Reply from 10.0.20.1: bytes=32 time=1ms TTL=255
Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`],
        [/^ping (8\.8\.8\.8|1\.1\.1\.1)$/i, `Reply from $1: bytes=32 time=14ms TTL=117
Reply from $1: bytes=32 time=13ms TTL=117
Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`],
        [/^ping 10\.0\.99\.99$/i, `Request timed out.
Request timed out.
Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`],
        [/^ping [a-z]/i, `Ping request could not find host. Please check the name and try again.`],
        [/^nslookup( \S+)?$/i, `DNS request timed out.
    timeout was 2 seconds.
Server:  UnKnown
Address:  10.0.99.99
*** Request to UnKnown timed-out`],
        [/^nslookup (\S+) (8\.8\.8\.8|1\.1\.1\.1)$/i, `Server:  dns.google
Address:  $2
Non-authoritative answer:
Name:    $1
Address:  104.18.10.200`],
        [/^(tracert|traceroute) (8\.8\.8\.8|1\.1\.1\.1)$/i, `  1    1 ms  10.0.20.1
  2    9 ms  100.64.0.1
  3   13 ms  $2
Trace complete.`],
      ],
      ask: "What's the most likely cause?",
      options: ["The default gateway is wrong", "The PC is configured with a DNS server that isn't responding", "The switch port is in the wrong VLAN", "The ISP link is down"],
      answer: 1, why: "Pinging IPs on the internet works, so routing and the gateway are fine. Names fail and 10.0.99.99 doesn't answer → <b>DNS</b>. Fix the DNS server (usually in DHCP option 6).",
    },
    {
      id: "gw", title: "Can reach the printer, not the internet",
      brief: "A tech statically configured a new PC. It can print to the local printer but can't reach anything outside the office.",
      prompt: PC_HOST,
      cmds: [
        [/^ipconfig( \/all)?$/i, `Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . : 192.168.5.40
   Subnet Mask . . . . . . . : 255.255.255.0
   Default Gateway . . . . . : 192.168.5.254
   DNS Servers . . . . . . . : 192.168.5.1`],
        [/^ping 192\.168\.5\.1$/i, `Reply from 192.168.5.1: bytes=32 time<1ms TTL=255
Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`],
        [/^ping 192\.168\.5\.254$/i, `Reply from 192.168.5.40: Destination host unreachable.
Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`],
        [/^ping (8\.8\.8\.8|1\.1\.1\.1)$/i, `Request timed out.
Request timed out.
Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`],
        [/^ping (192\.168\.5\.\d+)$/i, `Reply from $1: bytes=32 time<1ms TTL=128`],
        [/^arp -a$/i, `Interface: 192.168.5.40
  Internet Address      Physical Address      Type
  192.168.5.1           00-1a-2b-3c-4d-01     dynamic
  192.168.5.20          00-80-77-aa-10-20     dynamic   (printer)`],
        [/^(tracert|traceroute) \S+$/i, `  1     *        *        *     Request timed out.
  2     *        *        *     Request timed out.`],
      ],
      ask: "What's the most likely cause?",
      options: ["Wrong subnet mask", "Wrong default gateway (should be 192.168.5.1)", "DNS server is down", "Duplicate IP address"],
      answer: 1, why: "Local hosts work, but nothing answers at 192.168.5.254 and the router that does answer is .1 (it's in the ARP table). Traffic off the subnet goes to a gateway that doesn't exist → <b>incorrect default gateway</b>.",
    },
    {
      id: "vlan", title: "New hire gets the wrong network",
      brief: "A new hire's PC on switch port Gi0/12 gets a 192.168.30.x address and can't reach the file server. Sales PCs should be in 192.168.10.0/24 (VLAN 10). You're on the switch console.",
      prompt: "SW1#",
      cmds: [
        [/^show vlan( brief)?$/i, `VLAN Name        Status    Ports
---- ----------- --------- ------------------------------
1    default     active    Gi0/24
10   SALES       active    Gi0/1-11, Gi0/13-20
30   GUEST       active    Gi0/12, Gi0/21-23`],
        [/^show interfaces? (gi|gigabitethernet)0\/12( status)?$/i, `GigabitEthernet0/12 is up, line protocol is up
  Full-duplex, 1000Mb/s
  0 input errors, 0 CRC, 0 runts, 0 giants`],
        [/^show mac[ -]address-table$/i, `Vlan    Mac Address       Type      Ports
  10    0050.56aa.1001    DYNAMIC   Gi0/3
  30    0050.56aa.1012    DYNAMIC   Gi0/12`],
        [/^show ip route$/i, `% Switch is Layer 2. Ask the router, or check the VLAN first.`],
      ],
      ask: "What's the fix?",
      options: ["Replace the cable on Gi0/12", "Assign Gi0/12 to VLAN 10 (switchport access vlan 10)", "Enable STP on the port", "Add a DHCP relay for VLAN 10"],
      answer: 1, why: "The port is up with no errors, but <code>show vlan</code> puts Gi0/12 in VLAN 30 (GUEST). The PC is getting the guest subnet → <b>incorrect VLAN assignment</b>.",
    },
    {
      id: "duplex", title: "Slow link with errors",
      brief: "Users on the 2nd floor complain the file server is very slow. The uplink is Gi0/5. You're on the switch console.",
      prompt: "SW2#",
      cmds: [
        [/^show interfaces? (gi|gigabitethernet)0\/5$/i, `GigabitEthernet0/5 is up, line protocol is up
  Half-duplex, 100Mb/s, media type is 10/100/1000BaseTX
  5 minute input rate 3200000 bits/sec
     18233 input errors, 17904 CRC, 329 runts, 0 giants
     4120 late collision`],
        [/^show interfaces? (gi|gigabitethernet)0\/5 status$/i, `Port    Status     Vlan  Duplex  Speed  Type
Gi0/5   connected  10    a-half  a-100  10/100/1000BaseTX`],
        [/^show vlan( brief)?$/i, `VLAN Name     Status  Ports
10   USERS    active  Gi0/1-20`],
        [/^show interfaces? ((?:gi|gigabitethernet)0\/\d+)$/i, `$1 is up, line protocol is up
  Full-duplex, 1000Mb/s, 0 input errors`],
      ],
      ask: "What's the most likely cause?",
      options: ["Wrong VLAN on Gi0/5", "Duplex/speed mismatch or a bad cable on Gi0/5", "MTU mismatch causing giants", "The port is err-disabled"],
      answer: 1, why: "The port negotiated <b>half-duplex 100 Mb</b> on a gigabit link, with CRC errors, runts and <b>late collisions</b>: the classic signs of a duplex mismatch or a damaged cable. Replace or test the cable, then set both ends to match.",
    },
  ];
  const HELP = { pc: "Try: ipconfig, ipconfig /all, ping <ip or name>, nslookup <name> [server], tracert <ip>, arp -a", sw: "Try: show vlan brief, show interfaces gi0/X, show interfaces gi0/X status, show mac address-table, show ip route" };

  function terminal(box) {
    const body = shell(box, "Practice terminal: find the fault", "Pick a ticket, type commands like a real tech, then make your call. Type <code>help</code> for hints.");
    body.innerHTML = `<div class="term-tabs">${TERM.map((t, i) => `<button class="btn small ${i ? "" : "primary"}" type="button" data-t="${i}">${esc(t.title)}</button>`).join("")}</div><div class="term-wrap"></div>`;
    const wrap = $(".term-wrap", body);
    $$("[data-t]", body).forEach((b) => b.onclick = () => { $$("[data-t]", body).forEach((x) => x.classList.toggle("primary", x === b)); open(TERM[Number(b.dataset.t)]); });
    function open(t) {
      const isSw = !t.prompt.startsWith("C:");
      wrap.innerHTML = `<div class="callout memory"><div class="callout-title">Ticket</div><p>${esc(t.brief)}</p></div>
        <div class="term" role="log" aria-live="polite"><div class="term-out">${isSw ? "Connected to console.\n" : "Microsoft Windows [Version 10.0.22631]\n"}\n</div>
        <form class="term-line"><span class="term-prompt">${esc(t.prompt)}</span><input type="text" spellcheck="false" autocomplete="off" aria-label="Command"></form></div>
        <div class="term-decide"><p class="q-text">${esc(t.ask)} <span class="muted">(run at least 2 commands first)</span></p>
        <div class="choices">${t.options.map((o, i) => `<button class="choice" type="button" data-i="${i}" disabled><span class="k">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div><div class="term-why"></div></div>`;
      const out = $(".term-out", wrap), inp = $("input", wrap);
      let ran = 0;
      $("form", wrap).onsubmit = (e) => {
        e.preventDefault();
        const cmd = inp.value.trim().replace(/\s+/g, " "); inp.value = "";
        if (!cmd) return;
        let res;
        if (/^(help|\?)$/i.test(cmd)) res = isSw ? HELP.sw : HELP.pc;
        else if (/^(cls|clear)$/i.test(cmd)) { out.textContent = ""; return; }
        else {
          const hit = t.cmds.find(([re]) => re.test(cmd));
          if (hit) { const m = cmd.match(hit[0]); res = hit[1].replace(/\$(\d)/g, (_, k) => m[Number(k)] || ""); ran++; }
          else res = isSw ? `% Invalid or unsupported command in this lab. ${HELP.sw}` : `'${cmd.split(" ")[0]}' isn't available in this lab. ${HELP.pc}`;
        }
        out.textContent += `${t.prompt}${cmd}\n${res}\n\n`;
        out.scrollTop = out.scrollHeight;
        if (ran >= 2) $$(".term-decide .choice", wrap).forEach((b) => b.disabled = false);
      };
      $$(".term-decide .choice", wrap).forEach((b) => b.onclick = () => {
        const ok = Number(b.dataset.i) === t.answer;
        $$(".term-decide .choice", wrap).forEach((x) => { x.disabled = true; if (Number(x.dataset.i) === t.answer) x.classList.add("right"); });
        if (!ok) b.classList.add("wrong");
        $(".term-why", wrap).innerHTML = `<div class="result ${ok ? "ok" : "no"}">${ok ? "✓ Nailed it." : "✗ Not quite."} ${t.why}</div>`;
        logActivity("terminal-" + t.id, ok);
      });
      $(".term", wrap).onclick = () => inp.focus({ preventScroll: true });
    }
    open(TERM[0]);
  }

  /* ---------------- Registry ---------------- */
  const REG = {
    "dhcp-dora": (b) => sequence(b, "dhcp-dora"),
    "dns-lookup": (b) => sequence(b, "dns-lookup"),
    "tcp-handshake": (b) => sequence(b, "tcp-handshake"),
    "arp-gateway": (b) => sequence(b, "arp-gateway"),
    encapsulation, "match-ports": matchPorts, "pick-media": pickMedia,
    "order-steps": orderSteps, "acl-order": aclOrder,
    "subnet-visualizer": subnetVisualizer, terminal,
  };
  $$("[data-activity]").forEach((box) => {
    const fn = REG[box.dataset.activity];
    if (!fn) return;
    const run = () => { box.innerHTML = ""; fn(box); };
    box.addEventListener("np-rerender", run);
    run();
  });
  window.NP.activities = Object.keys(REG);
})();
