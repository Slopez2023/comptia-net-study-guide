/* Glossary popovers: the first time an official exam acronym appears in a lesson's reading,
   it gets a dotted underline. Hover, tap or focus it for the meaning and a link to the dictionary. */
(function () {
  "use strict";
  const { D, esc, $, $$ } = window.NP;
  const ROOT = document.body.dataset.root || "";
  const SKIP_TERMS = new Set(["a", "os", "cpu", "usb", "gui", "url", "tx", "rx", "st", "sc", "lc"]);

  const count = {};
  D.dictionary.forEach((e) => { const k = e.t.toLowerCase(); count[k] = (count[k] || 0) + 1; });
  const terms = D.dictionary.filter((e) => e.a && count[e.t.toLowerCase()] === 1 && !SKIP_TERMS.has(e.t.toLowerCase()));
  if (!terms.length) return;
  const byTerm = new Map(terms.map((e) => [e.t, e]));
  const alt = terms.map((e) => e.t).sort((a, b) => b.length - a.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const re = new RegExp("(?<![A-Za-z0-9+\\-/.])(" + alt + ")(?![A-Za-z0-9]|-[A-Za-z0-9])", "g");
  const SKIP_TAGS = "a,button,code,pre,kbd,abbr,svg,script,style,input,select,textarea,h1,h2,h3,h4,h5,[data-activity],.check,.gl";

  function wrap(root, seen) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (!n.nodeValue.trim() || n.parentElement.closest(SKIP_TAGS) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const text = node.nodeValue; let last = 0, hit = false; const frag = document.createDocumentFragment();
      re.lastIndex = 0;
      for (let m; (m = re.exec(text)); ) {
        if (seen.has(m[1])) continue;
        seen.add(m[1]); hit = true;
        frag.append(text.slice(last, m.index));
        const s = document.createElement("span");
        s.className = "gl"; s.tabIndex = 0; s.setAttribute("role", "button"); s.dataset.gl = m[1]; s.textContent = m[1];
        frag.append(s); last = m.index + m[1].length;
      }
      if (hit) { frag.append(text.slice(last)); node.replaceWith(frag); }
    });
  }
  $$(".lesson").forEach((lesson) => {
    const seen = new Set();
    $$('.step[data-step="read"], .step[data-step="learn"], .step[data-step="traps"], .step[data-step="scenario"]', lesson).forEach((st) => wrap(st, seen));
  });

  /* One shared popover */
  const pop = document.createElement("div");
  pop.className = "gl-pop"; pop.hidden = true; pop.setAttribute("role", "dialog");
  document.body.appendChild(pop);
  let current = null, timer = null;

  function open(el) {
    const e = byTerm.get(el.dataset.gl); if (!e) return;
    current = el;
    pop.innerHTML = `<div class="gl-t"><b>${esc(e.t)}</b><span>${esc(e.f)}</span></div><p>${esc(e.d)}</p>${e.x ? `<p class="gl-x">${esc(e.x)}</p>` : ""}<a href="${ROOT}dictionary.html?q=${encodeURIComponent(e.t)}">Open in the dictionary →</a>`;
    pop.hidden = false;
    const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    const left = Math.max(8, Math.min(r.left, innerWidth - w - 8));
    const top = r.bottom + 8 + h > innerHeight && r.top - h - 8 > 0 ? r.top - h - 8 : r.bottom + 8;
    pop.style.left = left + "px"; pop.style.top = top + "px";
  }
  function close() { pop.hidden = true; current = null; clearTimeout(timer); }

  document.addEventListener("click", (ev) => {
    const el = ev.target.closest(".gl");
    if (el) { current === el ? close() : open(el); return; }
    if (!ev.target.closest(".gl-pop")) close();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") close();
    if ((ev.key === "Enter" || ev.key === " ") && ev.target.classList && ev.target.classList.contains("gl")) { ev.preventDefault(); current === ev.target ? close() : open(ev.target); }
  });
  document.addEventListener("pointerover", (ev) => {
    if (ev.pointerType !== "mouse") return;
    const el = ev.target.closest(".gl");
    if (el && el !== current) { clearTimeout(timer); timer = setTimeout(() => open(el), 180); }
    else if (!el && current && !ev.target.closest(".gl-pop")) { clearTimeout(timer); timer = setTimeout(close, 250); }
  });
  window.addEventListener("scroll", () => current && close(), { passive: true });
})();
