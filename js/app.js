/* =========================================================
   Interface : menu bar, stage, parcours, compétences,
   carrousel, navigateur projet, Spotlight, Dock
   ========================================================= */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (tag, attrs = {}, html = "") => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v; else if (k === "data") Object.assign(el.dataset, v); else el.setAttribute(k, v);
    }
    if (html) el.innerHTML = html;
    return el;
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Sur téléphone, le site passe en mode « app » : une section par écran, barre d'onglets en bas
  const mobileMQ = window.matchMedia("(max-width: 760px)");
  const isM = () => mobileMQ.matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  const byId = {};
  TIMELINE.forEach(x => (byId[x.id] = { ...x, kind: "timeline" }));
  PROJECTS.forEach(x => (byId[x.id] = { ...x, kind: "project" }));
  const catById = Object.fromEntries(SKILL_CATS.map(c => [c.id, c]));
  const orgById = Object.fromEntries(TIMELINE.map(x => [x.id, x]));
  const orgShort = it => it.org.split(/,| \//)[0].trim();
  function logoTile(it, cls = "") {
    if (!it) return "";
    return it.logo
      ? `<span class="logo-tile has-img ${cls}" data-color="${it.color}"><img src="${it.logo}" alt="${esc(orgShort(it))}" loading="lazy"></span>`
      : `<span class="logo-tile ${cls}" data-color="${it.color}">${esc(it.mono)}</span>`;
  }

  /* ---------- Menu bar : horloge + section courante ---------- */
  const clock = $("#clock");
  function tick() {
    const d = new Date();
    const day = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Toronto" });
    const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Toronto" });
    clock.innerHTML = `<span class="clock__day">${day}</span> ${time}`;
  }
  tick(); setInterval(tick, 10000);
  if (!isMac) $("#kbdHint").textContent = "Ctrl K";

  const sections = ["accueil", "parcours", "competences", "projets", "contact"];
  const navLinks = $$(".menubar__nav a");
  const dockItems = $$(".dock__item");
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navLinks.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id));
      dockItems.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(id => { const el = document.getElementById(id); el && secObs.observe(el); });

  /* ---------- Reveal ---------- */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revObs.unobserve(e.target);
    });
  }, { threshold: .12 });
  $$(".reveal").forEach(el => revObs.observe(el));

  /* ---------- Stage (animations hero) ---------- */
  const tabs = $$("#sceneTabs button");
  const stepEls = $$("#stepper li");
  const stageTitle = $("#stageTitle");
  const playBtn = $("#stagePlay");
  let lastScene = -1;
  const stage = Stage.create($("#stageCanvas"), {
    onScene: (i, sc) => setScene(i, sc),
    onFrame: (i, sc, info) => {
      if (i !== lastScene) setScene(i, sc);
      stepEls.forEach((li, k) => {
        li.classList.toggle("is-active", k === info.step);
        li.classList.toggle("is-done", k < info.step);
        li.querySelector(".stepper__bar i").style.width = k === info.step ? (info.progress * 100).toFixed(1) + "%" : k < info.step ? "100%" : "0%";
      });
    }
  });
  function setScene(i, sc) {
    lastScene = i;

    tabs.forEach((b, k) => b.classList.toggle("is-active", k === i));
    stageTitle.textContent = sc.title;
    stepEls.forEach((li, k) => {
      li.querySelector(".stepper__label").innerHTML = `<b>${sc.steps[k].k}</b>${sc.steps[k].t}`;
    });
  }
  tabs.forEach((b, i) => b.addEventListener("click", () => stage.goto(i)));
  stepEls.forEach((li, k) => li.addEventListener("click", () => stage.goto(stage.index, k)));
  playBtn.addEventListener("click", () => {
    const p = stage.toggle();
    playBtn.classList.toggle("is-paused", !p);
    playBtn.setAttribute("aria-label", p ? "Pause" : "Lecture");
  });
  if (reduced) playBtn.classList.add("is-paused");

  /* ---------- Parcours : une section à la fois, pilotée par le scroll ---------- */
  const typeLabel = { pro: "Expérience", edu: "Formation", asso: "Engagement" };
  const GROUPS = [["pro", "Expériences"], ["edu", "Formation"], ["asso", "Engagements"]];
  const groupsWrap = $("#timelineGroups");
  const setOpen = (li, open) => {
    li.classList.toggle("is-open", open);
    const b = $(".tl__toggle", li);
    if (b) { b.setAttribute("aria-expanded", open); b.firstChild.textContent = open ? "Masquer " : "Détails "; }
  };
  const GROUP_COLORS = ["blue", "green", "yellow"];
  const groupEls = GROUPS.map(([type, label], gi) => {
    const g = h("div", { class: "tl-group", data: { type } });
    g.innerHTML = `<h3 class="tl-group__title">${label}</h3><ol class="timeline"></ol>`;
    // mobile : raccourci vers la partie suivante
    if (gi < GROUPS.length - 1) {
      const [nt, nl] = GROUPS[gi + 1];
      const next = h("button", { class: "tl-next", data: { color: GROUP_COLORS[gi + 1] } },
        `<span class="tl-next__logos">${TIMELINE.filter(x => x.type === nt).slice(0, 2).map(x => logoTile(x)).join("")}</span>
        <span class="tl-next__txt"><small>Partie suivante</small><b>${nl}</b></span>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
      next.addEventListener("click", () => goGroup(gi + 1));
      g.appendChild(next);
    }
    TIMELINE.filter(x => x.type === type).forEach((x, i) => {
      const li = h("li", { class: "tl", id: "tl-" + x.id, data: { type: x.type, color: x.color }, style: `--i:${i}` });
      const hasMore = x.bullets.length > 0;
      li.innerHTML = `
        ${logoTile(x, "tl__logo")}
        <div>
          <h3 class="tl__title">${esc(x.title)}</h3>
          <p class="tl__org">${esc(x.org)}, <span class="tl__place">${esc(x.place)}</span></p>
          <p class="tl__date mono tl__date--m" style="display:none">${esc(x.date)}</p>
          <p class="tl__lead">${esc(x.lead)}</p>
          ${hasMore ? `<div class="tl__more"><div><ul>${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul></div></div>` : ""}
        </div>
        <div class="tl__aside"><span class="tl__date">${esc(x.date)}</span></div>
        <svg class="tl__chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        ${hasMore || x.tags.length ? `<div class="tl__foot">
          ${hasMore ? `<button class="tl__toggle" aria-expanded="false">Détails <svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>` : ""}
          ${x.tags.length ? `<div class="tl__tags">${x.tags.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
        </div>` : ""}`;
      li.addEventListener("click", e => {
        // mobile : la fiche s'ouvre dans une feuille qui monte du bas
        if (isM()) { openTlSheet(x); return; }
        if (!hasMore || e.target.closest("a")) return;
        const open = !li.classList.contains("is-open");
          // une seule carte ouverte à la fois : la partie reste à la hauteur de l'écran
        if (open) $$(".tl.is-open", g).forEach(o => o !== li && setOpen(o, false));
        setOpen(li, open);
      });
      if (!hasMore) li.classList.add("is-static");
      $("ol", g).appendChild(li);
    });
    g.appendChild($(".tl-next", g) || document.createTextNode(""));
    groupsWrap.appendChild(g);
    return g;
  });

  const pin = $("#parcoursPin");
  const pinMQ = window.matchMedia("(min-width: 1061px) and (min-height: 680px)");
  const filterBtns = $$("#timelineFilter button");
  const barH = () => $(".menubar").offsetHeight;
  const pinTop = () => pin.getBoundingClientRect().top + scrollY - barH();
  const pinRange = () => pin.offsetHeight - (innerHeight - barH());
  let curGroup = -1;
  function setGroup(k) {
    if (k === curGroup) return;
    curGroup = k;
    filterBtns.forEach((b, j) => b.classList.toggle("is-active", j === k));
    $$("#tlDots i").forEach((d, j) => d.classList.toggle("on", j === k));
    groupEls.forEach((g, j) => { g.classList.toggle("is-active", j === k); g.classList.toggle("is-past", j < k); });
  }
  function onPinScroll() {
    if (isM()) {
      // mobile : les parties défilent à l'horizontale
      const w = groupsWrap.clientWidth;
      setGroup(w ? Math.max(0, Math.min(2, Math.round(groupsWrap.scrollLeft / w))) : Math.max(curGroup, 0));
    } else if (pinMQ.matches) {
      const p = (scrollY - pinTop()) / pinRange();
      setGroup(Math.max(0, Math.min(2, Math.floor(p * 3))));
    } else {
      let k = 0;
      groupEls.forEach((g, j) => { if (g.getBoundingClientRect().top < innerHeight * .5) k = j; });
      setGroup(k);
    }
  }
  const groupY = k => pinTop() + pinRange() * [0, .5, 1][k];
  function goGroup(k) {
    if (isM()) { groupsWrap.scrollTo({ left: k * groupsWrap.clientWidth, behavior: reduced ? "auto" : "smooth" }); return; }
    const top = pinMQ.matches ? groupY(k) : groupEls[k].getBoundingClientRect().top + scrollY - barH() - 16;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  }
  filterBtns.forEach((b, k) => b.addEventListener("click", () => goGroup(k)));

  // Molette : un geste = une partie, même si on scrolle d'un coup.
  // L'inertie du trackpad est absorbée pour ne sauter aucune partie.
  let lockUntil = 0, lastWheel = 0, wasInside = false;
  window.addEventListener("wheel", e => {
    const now = performance.now(), gap = now - lastWheel;
    lastWheel = now;
    if (!pinMQ.matches || e.ctrlKey || Math.abs(e.deltaY) < 1) return;
    const y = scrollY, top = groupY(0), bottom = groupY(2);
    const inside = y >= top - 2 && y <= bottom + 2;
    // on entre dans la section pendant un même geste (pas après un clic sur le menu)
    const entering = inside && !wasInside && gap < 300;
    wasInside = inside;
    if (!inside) return;
    const dir = Math.sign(e.deltaY);
    const busy = now < lockUntil || (gap < 160 && now < lockUntil + 600);
    if (entering) {
      // on arrive dans la section : on se cale sur la partie affichée
      e.preventDefault();
      lockUntil = now + 900;
      goGroup(curGroup);
      return;
    }
    const g = groupEls[curGroup];
    if (g && g.contains(e.target) && (dir > 0 ? g.scrollTop + g.clientHeight < g.scrollHeight - 1 : g.scrollTop > 0)) return;
    const next = curGroup + dir;
    if (next < 0 || next > 2) { if (busy) e.preventDefault(); return; }
    e.preventDefault();
    if (busy) return;
    lockUntil = now + 900;
    goGroup(next);
  }, { passive: false });
  window.addEventListener("scroll", onPinScroll, { passive: true });
  groupsWrap.addEventListener("scroll", () => { if (isM()) onPinScroll(); }, { passive: true });
  window.addEventListener("resize", onPinScroll);
  onPinScroll();

  /* ---------- Compétences : une colonne par catégorie ---------- */
  const cols = $("#skillCols");
  const inspector = $("#inspectorBody");
  const hoverable = window.matchMedia("(hover: hover)").matches;
  let activeSkill = null;
  const colEls = SKILL_CATS.map(cat => {
    const list = SKILLS.map((s, i) => [s, i]).filter(([s]) => s.cat === cat.id);
    const col = h("div", { class: "scol", data: { cat: cat.id, color: cat.color } });
    col.innerHTML = `
      <button class="scol__head" aria-expanded="false">
        <span class="scol__icon app--${cat.color}"><i></i></span>
        <span class="scol__label"><b>${esc(cat.label)}</b><small>${list.length} compétences</small></span>
        <svg class="scol__chev" viewBox="0 0 24 24" width="16" height="16"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <div class="scol__list"><div></div></div>`;
    const inner = $(".scol__list > div", col);
    list.forEach(([s, i], k) => {
      const b = h("button", { class: "skill", data: { cat: s.cat, i, color: cat.color }, style: `--i:${k}` },
        `<span class="skill__shape skill__shape--${s.cat}"></span><span>${esc(s.name)}</span><span class="skill__count">${s.refs.length}</span>`);
      b.addEventListener("click", () => selectSkill(i));
      b.addEventListener("mouseenter", () => { if (hoverable && activeSkill === null) showSkill(i); });
      inner.appendChild(b);
    });
    $(".scol__head", col).addEventListener("click", () => toggleCol(col));
    cols.appendChild(col);
    return col;
  });
  function toggleCol(col, force) {
    const open = col.classList.toggle("is-open", force);
    $(".scol__head", col).setAttribute("aria-expanded", open);
    if (open) { col.classList.remove("bounce"); void col.offsetWidth; col.classList.add("bounce"); }
  }
  cols.addEventListener("mouseleave", () => { if (activeSkill === null) showSkill(null); });
  // la première colonne s'ouvre seule à l'arrivée sur la section
  const colObs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    colObs.disconnect();
    setTimeout(() => { if (!colEls.some(c => c.classList.contains("is-open"))) toggleCol(colEls[0], true); }, 450);
  }, { threshold: .4 });
  colObs.observe(cols);
  function selectSkill(i) {
    activeSkill = activeSkill === i ? null : i;
    $$(".skill", cols).forEach(el => el.classList.toggle("is-active", +el.dataset.i === activeSkill));
    showSkill(activeSkill);
  }
  function showSkill(i, preview) {
    if (i === null || i === undefined) {
      inspector.innerHTML = `
        <div class="inspector__term"><span class="p">mathéo@mbp</span> <span class="a">~/competences</span> % ls<span class="caret"></span></div>
        <p class="inspector__cat"><span class="sw sw--blue"></span>${SKILLS.length} compétences, ${SKILL_CATS.length} domaines</p>
        <h3>Sélectionnez une compétence</h3>
        <p class="inspector__how">Chaque compétence est reliée aux expériences et projets où elle a été mise en pratique.</p>
        <p class="inspector__label">Répartition</p>
        <div class="evidence">${SKILL_CATS.map(c => {
          const n = SKILLS.filter(s => s.cat === c.id).length;
          return `<div style="display:flex;align-items:center;gap:10px;font-size:13.5px"><span class="sw sw--${c.color}"></span><span style="flex:1">${esc(c.label)}</span><span class="mono" style="color:var(--ink-3);font-size:12px">${n}</span><span style="width:90px;height:6px;border-radius:3px;background:var(--line);overflow:hidden"><span style="display:block;height:100%;width:${(n / 8) * 100}%;background:var(--g-${c.color === "yellow" ? "yellow" : c.color})"></span></span></div>`;
        }).join("")}</div>`;
      return;
    }
    const s = SKILLS[i], cat = catById[s.cat];
    inspector.innerHTML = `
      <div class="inspector__term"><span class="p">mathéo@mbp</span> <span class="a">~</span> % grep -r "${esc(s.name)}" ./parcours ./projets<span class="caret"></span></div>
      <p class="inspector__cat"><span class="sw sw--${cat.color}"></span>${esc(cat.label)}</p>
      <h3>${esc(s.name)}</h3>
      <p class="inspector__how">${esc(s.how)}</p>
      <p class="inspector__label">${s.refs.length} preuve${s.refs.length > 1 ? "s" : ""}</p>
      <ul class="evidence">${s.refs.map((r, k) => {
        const it = byId[r]; if (!it) return "";
        const isP = it.kind === "project";
        const label = isP ? it.title : `${orgShort(it)}, ${it.title}`;
        const sub = isP ? `Projet, ${it.kicker}` : `${typeLabel[it.type]}, ${it.date}`;
        return `<li><a href="#" data-ref="${r}" data-color="${it.color}" style="animation-delay:${k * 60}ms">${logoTile(isP ? orgById[it.org] : it, "evidence__ico")}<span><b>${esc(label)}</b><small>${esc(sub)}</small></span></a></li>`;
      }).join("")}</ul>`;
    $$("a[data-ref]", inspector).forEach(a => a.addEventListener("click", e => { e.preventDefault(); openRef(a.dataset.ref); }));
  }
  showSkill(null);

  function openRef(ref) {
    const it = byId[ref];
    if (!it) return;
    if (it.kind === "project") { openProject(PROJECTS.findIndex(p => p.id === ref)); return; }
    const k = GROUPS.findIndex(g => g[0] === it.type);
    if (isM()) {
      setTab("parcours");
      requestAnimationFrame(() => { groupsWrap.scrollLeft = k * groupsWrap.clientWidth; setGroup(k); openTlSheet(it); });
      return;
    }
    const el = document.getElementById("tl-" + ref);
    if (el.querySelector(".tl__more")) setOpen(el, true);
    if (pinMQ.matches) {
      goGroup(k);
      groupEls[k].scrollTop = el.offsetTop + el.parentElement.offsetTop - 12;
    } else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    el.animate([{ boxShadow: "inset 0 0 0 2px var(--blue), 0 0 0 6px rgba(26,115,232,.15)" }, { boxShadow: "inset 0 0 0 1px var(--line)" }], { duration: 1800, delay: 400, easing: "ease-out" });
  }

  /* ---------- Illustrations des cartes projet (SVG) ---------- */
  const COL = { blue: "#4285f4", red: "#ea4335", yellow: "#fbbc04", green: "#34a853" };
  function art(p) {
    const c = COL[p.color], o = ["#4285f4", "#ea4335", "#fbbc04", "#34a853"].filter(x => x !== c);
    const m = {
      clusters: `<g>${[[70, 70, c], [150, 60, o[0]], [110, 140, o[2]]].map(([x, y, col], g) =>
        Array.from({ length: 9 }, (_, i) => { const a = i * 0.7 + g, r = 10 + (i % 3) * 9; return `<circle cx="${x + Math.cos(a) * r}" cy="${y + Math.sin(a) * r}" r="${5 + (i % 2) * 2}" fill="${col}" opacity="${.55 + (i % 3) * .2}"/>`; }).join("")).join("")}
        <circle cx="70" cy="70" r="38" fill="none" stroke="${c}" stroke-dasharray="3 4"/><circle cx="150" cy="60" r="38" fill="none" stroke="${o[0]}" stroke-dasharray="3 4"/><circle cx="110" cy="140" r="38" fill="none" stroke="${o[2]}" stroke-dasharray="3 4"/></g>`,
      gears: `<g><path d="M20 150 L60 120 L90 132 L130 80 L165 95 L190 40" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        ${[[20, 150], [60, 120], [90, 132], [130, 80], [165, 95]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${c}" stroke-width="4"/>`).join("")}
        <circle cx="190" cy="40" r="11" fill="${o[0]}"/><rect x="25" y="25" width="56" height="56" rx="12" fill="${o[1]}" transform="rotate(12 53 53)"/><path d="M150 140 l22 38 h-44z" fill="${o[2]}"/></g>`,
      stack: `<g>${[0, 1, 2].map(i => `<ellipse cx="105" cy="${60 + i * 34}" rx="60" ry="15" fill="${["#c6dafc", "#a8c7fa", "#8ab4f8"][i]}"/><rect x="45" y="${60 + i * 34}" width="120" height="14" fill="${["#a8c7fa", "#8ab4f8", "#4285f4"][i]}"/><ellipse cx="105" cy="${74 + i * 34}" rx="60" ry="15" fill="${["#a8c7fa", "#8ab4f8", "#4285f4"][i]}"/><ellipse cx="105" cy="${60 + i * 34}" rx="60" ry="15" fill="${["#e8f0fe", "#c6dafc", "#a8c7fa"][i]}"/>`).reverse().join("")}
        <rect x="150" y="18" width="40" height="50" rx="5" fill="#fff" stroke="#dadce0"/><rect x="157" y="48" width="18" height="10" rx="2" fill="${c}"/><rect x="157" y="28" width="24" height="4" rx="2" fill="#dadce0"/><rect x="157" y="36" width="18" height="4" rx="2" fill="#dadce0"/>
        <path d="M182 150 l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6z" fill="${c}"/></g>`,
      bars: `<g>${[60, 95, 75, 130, 110].map((v, i) => `<rect x="${22 + i * 36}" y="${170 - v}" width="26" height="${v}" rx="5" fill="${i === 3 ? c : "#fde293"}"/>`).join("")}
        <line x1="12" y1="172" x2="200" y2="172" stroke="#dadce0" stroke-width="2"/><circle cx="170" cy="30" r="18" fill="none" stroke="${o[0]}" stroke-width="8" stroke-dasharray="70 120"/><circle cx="170" cy="30" r="18" fill="none" stroke="${o[2]}" stroke-width="8" stroke-dasharray="40 120" stroke-dashoffset="-70"/></g>`,
      orbit: `<g><ellipse cx="105" cy="95" rx="85" ry="38" fill="none" stroke="#dadce0" stroke-dasharray="3 5"/><ellipse cx="105" cy="95" rx="55" ry="70" fill="none" stroke="#dadce0" stroke-dasharray="3 5" transform="rotate(30 105 95)"/>
        <circle cx="105" cy="95" r="26" fill="#fff" stroke="${c}" stroke-width="6"/><circle cx="105" cy="95" r="8" fill="${c}"/>
        <circle cx="22" cy="92" r="9" fill="${o[0]}"/><rect x="170" y="78" width="18" height="18" rx="4" fill="${o[1]}"/><path d="M140 22 l11 19 h-22z" fill="${o[2]}"/><circle cx="70" cy="160" r="7" fill="${c}"/></g>`,
      shield: `<g><path d="M105 18 L170 42 V95 C170 135 140 160 105 175 C70 160 40 135 40 95 V42z" fill="#fff" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
        <path d="M78 98 l18 18 l36 -38" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="185" cy="160" r="12" fill="${o[0]}"/><rect x="12" y="140" width="22" height="22" rx="5" fill="${o[2]}" transform="rotate(-12 23 151)"/></g>`,
      triangles: `<g>${[[105, 20, 60, c], [60, 100, 40, o[1]], [150, 100, 40, o[2]], [105, 130, 28, o[0]]].map(([x, y, s, col]) => `<path d="M${x} ${y} l${s} ${s * 1.6} h${-2 * s}z" fill="${col}" opacity=".9"/>`).join("")}
        <circle cx="30" cy="40" r="10" fill="none" stroke="#dadce0" stroke-width="3"/><circle cx="185" cy="35" r="6" fill="#dadce0"/></g>`
    };
    return `<svg viewBox="0 0 210 190" aria-hidden="true">${m[p.motif] || m.orbit}</svg>`;
  }

  /* ---------- Carrousel ---------- */
  const track = $("#carTrack"), carousel = $("#carousel"), dotsWrap = $("#carDots");
  const n = PROJECTS.length;
  let cur = 0, dragX = 0, dragging = false, startX = 0, moved = false;
  const tilts = [-4, 3, -2, 4, -3, 2, -5];
  const cards = PROJECTS.map((p, i) => {
    const el = h("article", { class: "pcard", data: { color: p.color, i }, tabindex: "-1", "aria-label": p.title });
    el.innerHTML = `
      <div class="pcard__art">${art(p)}${logoTile(orgById[p.org], "pcard__logo")}<span class="pcard__open">Ouvrir <svg viewBox="0 0 24 24" width="12" height="12"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span></div>
      <div class="pcard__body">
        <h3 class="pcard__title">${esc(p.title)}</h3>
        <p class="pcard__sum">${esc(p.summary)}</p>
        <div class="pcard__tags">${p.stack.slice(0, 3).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      </div>`;
    el.addEventListener("click", () => {
      if (moved) return;
      const d = rel(i);
      if (d === 0) openProject(i, el); else go(cur + d);
    });
    track.appendChild(el);
    const dot = h("button", { "aria-label": "Projet " + (i + 1) });
    dot.addEventListener("click", () => go(i));
    dotsWrap.appendChild(dot);
    return el;
  });
  function rel(i) { let d = i - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n; return d; }
  function spacing() { return Math.min(300, window.innerWidth * .28); }
  function layout() {
    const sp = spacing(), frac = dragX / sp;
    cards.forEach((el, i) => {
      const d = rel(i) + frac, ad = Math.abs(d);
      const x = d * sp, y = ad * 18, rot = tilts[i % tilts.length] * Math.min(ad, 1.5) + d * 1.5;
      const sc = 1 - Math.min(ad, 3) * .09;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${sc})`;
      el.style.zIndex = 50 - Math.round(ad * 10);
      el.style.opacity = ad > 2.6 ? 0 : 1;
      el.style.pointerEvents = ad > 2.6 ? "none" : "";
      el.style.filter = ad > .5 ? `saturate(${1 - Math.min(ad, 2) * .25})` : "";
      el.classList.toggle("is-center", Math.round(d) === 0 && ad < .5);
    });
    $$("button", dotsWrap).forEach((b, i) => b.classList.toggle("is-active", i === cur));
  }
  function go(i) { cur = ((i % n) + n) % n; dragX = 0; layout(); }
  $("#carPrev").addEventListener("click", () => go(cur - 1));
  $("#carNext").addEventListener("click", () => go(cur + 1));
  carousel.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { go(cur - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { go(cur + 1); e.preventDefault(); }
    if (e.key === "Enter") openProject(cur, cards[cur]);
  });
  carousel.addEventListener("pointerdown", e => {
    if (e.target.closest(".carousel__nav")) return;
    dragging = true; moved = false; startX = e.clientX;
  });
  window.addEventListener("pointermove", e => {
    if (!dragging) return;
    dragX = e.clientX - startX;
    if (Math.abs(dragX) > 6 && !moved) { moved = true; carousel.classList.add("is-dragging"); }
    if (moved) layout();
  });
  window.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false; carousel.classList.remove("is-dragging");
    if (moved) {
      const steps = Math.round(-dragX / spacing());
      go(cur + (steps || (Math.abs(dragX) > 50 ? -Math.sign(dragX) : 0)));
      setTimeout(() => (moved = false), 0);
    }
  });
  let wheelLock = 0;
  carousel.addEventListener("wheel", e => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    const now = Date.now(); if (now - wheelLock < 450) return; wheelLock = now;
    go(cur + Math.sign(e.deltaX));
  }, { passive: false });
  window.addEventListener("resize", layout);
  layout();

  /* ---------- Navigateur (page projet) ---------- */
  const overlay = $("#browserOverlay"), browser = $("#browser"), page = $("#browserPage");
  let openIdx = -1, lastFocus = null;
  function openProject(i, fromEl) {
    const p = PROJECTS[i];
    openIdx = i;
    lastFocus = document.activeElement;
    if (fromEl) {
      const r = fromEl.getBoundingClientRect();
      browser.style.setProperty("--ox", `${r.left + r.width / 2 - (window.innerWidth - Math.min(1080, window.innerWidth - 48)) / 2}px`);
      browser.style.setProperty("--oy", `${r.top + r.height / 2 - 48}px`);
    } else { browser.style.removeProperty("--ox"); browser.style.removeProperty("--oy"); }
    renderProject(p);
    overlay.hidden = false;
    overlay.classList.remove("is-closing", "is-minimizing");
    document.body.style.overflow = "hidden";
    $("#browserClose").focus({ preventScroll: true });
  }
  function renderProject(p) {
    const i = PROJECTS.indexOf(p);
    $("#browserUrl").textContent = `matheo-gros.dev/projets/${p.slug}`;
    $("#browserUrlM").textContent = `matheo-gros.dev/projets/${p.slug}`;
    browser.dataset.color = p.color;
    const prog = $("#browserProgress");
    prog.classList.remove("is-loading"); void prog.offsetWidth; prog.classList.add("is-loading");
    const prev = PROJECTS[(i - 1 + n) % n], next = PROJECTS[(i + 1) % n];
    page.innerHTML = `
      <nav class="pp-nav">
        <span class="pp-nav__brand"><span class="glyph" aria-hidden="true"><i class="c"></i><i class="s"></i><i class="t"></i></span>matheo-gros.dev</span>
        <span class="pp-nav__links"><a href="#pp-probleme">Problème</a><a href="#pp-approche">Approche</a><a href="#pp-livrables">Livrables</a></span>
        <button class="pp-done" data-done>Terminé</button>
      </nav>
      <header class="pp-hero">
        <div class="pp-hero__art">${art(p)}</div>
        <h1 id="browserTitle">${esc(p.title)}</h1>
        <p>${esc(p.summary)}</p>
        <div class="pp-meta">
          <div class="pp-meta__ctx">${logoTile(orgById[p.org])}<div><span class="pp-meta__k">Contexte</span>${esc(p.kicker)}</div></div>
          <div><span class="pp-meta__k">Rôle</span>${esc(p.role)}</div>
          ${p.year ? `<div><span class="pp-meta__k">Période</span>${esc(p.year)}</div>` : ""}
        </div>
      </header>
      <nav class="pp-chips" aria-label="Sections du projet"><a href="#pp-probleme" class="on">Problème</a><a href="#pp-approche">Approche</a><a href="#pp-livrables">Livrables</a><a href="#pp-interet">Intérêt</a></nav>
      <div class="pp-body">
        <div>
          <section id="pp-probleme"><h2><span class="n">01</span>Le problème</h2><p>${esc(p.problem)}</p></section>
          <section id="pp-approche"><h2><span class="n">02</span>L'approche</h2>
            <ol class="steps" style="--n:${p.pipeline.length}">${p.pipeline.map((s, k) => `<li style="--k:${k}"><span class="steps__dot">${k + 1}</span><span class="steps__label">${esc(s)}</span></li>`).join("")}</ol>
          </section>
          <section id="pp-livrables"><h2><span class="n">03</span>Ce que j'ai livré</h2><ul>${p.delivered.map(d => `<li>${esc(d)}</li>`).join("")}</ul></section>
          <section id="pp-interet"><h2><span class="n">04</span>Intérêt stratégique du projet</h2><p class="pp-quote">${esc(p.strategy)}</p>${p.note ? `<p class="pp-note">${esc(p.note)}</p>` : ""}</section>
        </div>
        <aside class="pp-side">
          <div class="pp-card pp-card--keys"><h3>Mots-clés du projet</h3><div class="chips">${SKILLS.filter(s => s.refs.includes(p.id)).map(s => `<span class="chip"><span class="sw sw--${catById[s.cat].color}"></span>${esc(s.name)}</span>`).join("")}</div></div>
          <div class="pp-card pp-card--stack"><h3>Stack technique</h3><div class="chips">${p.stack.map(s => `<code class="tech">${esc(s)}</code>`).join("")}</div></div>
        </aside>
      </div>
      <footer class="pp-foot">
        <button data-go="${(i - 1 + n) % n}"><small>← Projet précédent</small><b>${esc(prev.title)}</b></button>
        <button class="next" data-go="${(i + 1) % n}"><small>Projet suivant →</small><b>${esc(next.title)}</b></button>
      </footer>`;
    page.scrollTop = 0;
    $$("[data-go]", page).forEach(b => b.addEventListener("click", () => { openIdx = +b.dataset.go; go(openIdx); renderProject(PROJECTS[openIdx]); }));
    $$(".pp-nav__links a", page).forEach(a => a.addEventListener("click", e => { e.preventDefault(); page.querySelector(a.getAttribute("href")).scrollIntoView({ behavior: "smooth" }); }));
    $("[data-done]", page).addEventListener("click", () => closeBrowser());
    $$(".pp-chips a", page).forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      const t = page.querySelector(a.getAttribute("href"));
      page.scrollTo({ top: page.scrollTop + t.getBoundingClientRect().top - page.getBoundingClientRect().top - 112, behavior: reduced ? "auto" : "smooth" });
    }));
  }
  // mobile : la pastille de la section visible s'allume pendant la lecture
  page.addEventListener("scroll", () => {
    const chips = $$(".pp-chips a", page);
    if (!chips.length || !isM()) return;
    const top = page.getBoundingClientRect().top;
    let on = 0;
    chips.forEach((a, k) => { const s = page.querySelector(a.getAttribute("href")); if (s && s.getBoundingClientRect().top - top < 140) on = k; });
    chips.forEach((a, k) => a.classList.toggle("on", k === on));
  }, { passive: true });
  function stepProject(d) { openIdx = (openIdx + d + n) % n; go(openIdx); renderProject(PROJECTS[openIdx]); }
  $("#bPrev").addEventListener("click", () => stepProject(-1));
  $("#bNext").addEventListener("click", () => stepProject(1));
  $("#bList").addEventListener("click", () => closeBrowser());
  function closeBrowser(mode = "is-closing") {
    if (overlay.hidden) return;
    overlay.classList.add(mode);
    setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove("is-closing", "is-minimizing");
      browser.classList.remove("is-max");
      document.body.style.overflow = "";
      if (mode === "is-minimizing") { const proj = dockItems.find(d => d.getAttribute("href") === "#projets"); proj && (proj.classList.remove("bounce"), void proj.offsetWidth, proj.classList.add("bounce")); }
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    }, mode === "is-minimizing" ? 430 : 280);
  }
  $("#browserClose").addEventListener("click", () => closeBrowser());
  $("#browserMin").addEventListener("click", () => closeBrowser("is-minimizing"));
  $("#browserMax").addEventListener("click", () => browser.classList.toggle("is-max"));
  overlay.addEventListener("click", e => { if (e.target === overlay) closeBrowser(); });

  /* ---------- Spotlight ---------- */
  const spot = $("#spotlight"), spotIn = $("#spotlightInput"), spotRes = $("#spotlightResults");
  let results = [], sel = 0;
  const index = [
    ...sections.map(id => ({ group: "Sections", label: { accueil: "Accueil", parcours: "Parcours", competences: "Compétences", projets: "Projets", contact: "Contact" }[id], sub: "#" + id, color: "blue", ico: "#", act: () => goSection(id) })),
    ...PROJECTS.map((p, i) => ({ group: "Projets", label: p.title, sub: p.kicker, color: p.color, ico: "▸", kw: p.stack.join(" ") + " " + p.summary, act: () => { go(i); openProject(i); } })),
    ...TIMELINE.map(x => ({ group: "Parcours", label: x.title, sub: orgShort(x), color: x.color, ico: x.mono, kw: x.tags.join(" ") + " " + x.lead, act: () => openRef(x.id) })),
    ...SKILLS.map((s, i) => ({ group: "Compétences", label: s.name, sub: catById[s.cat].label, color: catById[s.cat].color, ico: "◆", kw: s.how, act: () => { if (isM()) { setTab("competences"); openSkillSheet(i); return; } document.getElementById("competences").scrollIntoView({ behavior: "smooth" }); toggleCol(colEls[SKILL_CATS.findIndex(c => c.id === s.cat)], true); if (activeSkill !== i) selectSkill(i); } })),
    { group: "Actions", label: "Télécharger le CV", sub: "PDF", color: "red", ico: "↓", act: () => window.open("assets/Matheo_Gros_CV.pdf", "_blank") },
    { group: "Actions", label: "Envoyer un e-mail", sub: "matheo.gros@outlook.fr", color: "blue", ico: "@", act: () => (location.href = "mailto:matheo.gros@outlook.fr") }
  ];
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function search(q) {
    q = norm(q.trim());
    if (!q) return index.filter(x => x.group === "Sections" || x.group === "Actions");
    return index.map(x => {
      const l = norm(x.label), k = norm((x.kw || "") + " " + x.sub);
      const score = l.startsWith(q) ? 3 : l.includes(q) ? 2 : k.includes(q) ? 1 : 0;
      return { x, score };
    }).filter(r => r.score).sort((a, b) => b.score - a.score).slice(0, 12).map(r => r.x)
      .reduce((acc, x) => { (acc.find(g => g[0].group === x.group) || acc[acc.push([]) - 1]).push(x); return acc; }, [])
      .flat();
  }
  function renderSpot() {
    results = search(spotIn.value);
    sel = Math.min(sel, Math.max(0, results.length - 1));
    let html = "", g = "";
    results.forEach((r, i) => {
      if (r.group !== g) { g = r.group; html += `<li class="spotlight__group">${g}</li>`; }
      html += `<li data-i="${i}" data-color="${r.color}" class="${i === sel ? "is-sel" : ""}"><span class="sh">${esc(r.ico)}</span>${esc(r.label)}<small>${esc(r.sub)}</small></li>`;
    });
    if (!results.length) html = `<li class="spotlight__group">Aucun résultat</li>`;
    spotRes.innerHTML = html;
    $$("li[data-i]", spotRes).forEach(li => {
      li.addEventListener("mousemove", () => { if (sel !== +li.dataset.i) { sel = +li.dataset.i; renderSpot(); } });
      li.addEventListener("click", () => runSpot(+li.dataset.i));
    });
  }
  function runSpot(i) { const r = results[i]; closeSpot(); r && setTimeout(r.act, 60); }
  function openSpot() { spot.hidden = false; spotIn.value = ""; sel = 0; renderSpot(); setTimeout(() => spotIn.focus(), 10); }
  function closeSpot() { spot.hidden = true; }
  $("#spotlightBtn").addEventListener("click", openSpot);
  spot.addEventListener("click", e => { if (e.target === spot) closeSpot(); });
  spotIn.addEventListener("input", () => { sel = 0; renderSpot(); });
  spotIn.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { sel = Math.min(results.length - 1, sel + 1); renderSpot(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); renderSpot(); e.preventDefault(); }
    if (e.key === "Enter") runSpot(sel);
  });
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); spot.hidden ? openSpot() : closeSpot(); }
    if (e.key === "Escape") {
      if (!spot.hidden) closeSpot();
      else if (!sheet.hidden) closeSheet();
      else if (!fold.hidden) closeFolder();
      else closeBrowser();
    }
  });
  $("#spotCancel").addEventListener("click", closeSpot);

  /* ---------- Dock : grossissement façon macOS ---------- */
  const dock = $("#dock");
  const BASE = 50, MAXS = 74, RANGE = 130;
  if (window.matchMedia("(hover: hover) and (min-width: 761px)").matches && !reduced) {
    dock.addEventListener("mousemove", e => {
      dockItems.forEach(it => {
        const r = it.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const s = BASE + (MAXS - BASE) * Math.max(0, Math.cos(Math.min(d / RANGE, 1) * Math.PI / 2));
        it.style.width = it.style.height = s + "px";
      });
    });
    dock.addEventListener("mouseleave", () => dockItems.forEach(it => (it.style.width = it.style.height = BASE + "px")));
  }
  dockItems.forEach(it => it.addEventListener("click", () => { it.classList.remove("bounce"); void it.offsetWidth; it.classList.add("bounce"); }));
  // le Dock s'efface sur le hero, apparaît ensuite
  const heroObs = new IntersectionObserver(([e]) => dock.classList.toggle("is-hidden", e.intersectionRatio > .6), { threshold: [0, .6, 1] });
  heroObs.observe($("#accueil"));

  /* =========================================================
     MOBILE : une app plutôt qu'un site rétréci
     ========================================================= */

  /* ---------- Onglets : une section par écran ---------- */
  const tabLinks = $$("#tabbar a");
  function setTab(id, { url = true, scroll = true } = {}) {
    if (!sections.includes(id)) id = "accueil";
    document.body.dataset.tab = id;
    tabLinks.forEach(a => {
      const on = a.dataset.tab === id;
      a.classList.toggle("is-on", on);
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    if (url) history.replaceState(null, "", id === "accueil" ? location.pathname + location.search : "#" + id);
    if (scroll) window.scrollTo(0, 0);
    if (id === "parcours") requestAnimationFrame(onPinScroll);
  }
  function goSection(id) {
    if (isM()) setTab(id);
    else document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  }
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !isM()) return;
    const id = a.getAttribute("href").slice(1);
    if (!sections.includes(id)) return;
    e.preventDefault();
    setTab(id);
  });
  tabLinks.forEach(a => a.addEventListener("click", () => {
    const ico = $(".app", a);
    ico.classList.remove("bounce"); void ico.offsetWidth; ico.classList.add("bounce");
  }));

  /* ---------- Accueil : texte replié ---------- */
  const heroText = $(".hero__text"), heroMore = $("#heroMore");
  heroMore.addEventListener("click", () => {
    const open = heroText.classList.toggle("is-open");
    heroMore.textContent = open ? "Réduire" : "Lire la suite";
    heroMore.setAttribute("aria-expanded", open);
  });

  /* ---------- Feuille qui monte du bas ---------- */
  const sheet = $("#sheet"), sheetPanel = $("#sheetPanel"), sheetBody = $("#sheetBody");
  let sheetTimer = 0;
  function lockScroll() { document.body.style.overflow = "hidden"; }
  function unlockScroll() { if (sheet.hidden && fold.hidden && overlay.hidden) document.body.style.overflow = ""; }
  function openSheet(html, color) {
    clearTimeout(sheetTimer);
    sheetBody.innerHTML = html;
    sheetPanel.dataset.color = color || "blue";
    sheetPanel.style.transform = "";
    sheetPanel.scrollTop = 0;
    sheet.hidden = false;
    lockScroll();
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add("is-open")));
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove("is-open");
    sheetPanel.style.transform = "";
    sheetTimer = setTimeout(() => { sheet.hidden = true; unlockScroll(); }, reduced ? 0 : 320);
  }
  sheet.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeSheet(); });
  // glisser vers le bas pour fermer
  let dragY = null, dragDy = 0;
  sheetPanel.addEventListener("touchstart", e => { dragY = sheetPanel.scrollTop <= 0 ? e.touches[0].clientY : null; dragDy = 0; }, { passive: true });
  sheetPanel.addEventListener("touchmove", e => {
    if (dragY === null) return;
    dragDy = Math.max(0, e.touches[0].clientY - dragY);
    if (dragDy > 0) { sheetPanel.style.transition = "none"; sheetPanel.style.transform = `translateY(${dragDy}px)`; }
  }, { passive: true });
  sheetPanel.addEventListener("touchend", () => {
    if (dragY === null) return;
    sheetPanel.style.transition = "";
    dragDy > 90 ? closeSheet() : (sheetPanel.style.transform = "");
    dragY = null;
  });

  /* ---------- Parcours : fiche détaillée ---------- */
  function openTlSheet(x) {
    const linked = PROJECTS.map((p, i) => [p, i]).filter(([p]) => p.org === x.id);
    openSheet(`
      <div class="sh-head">${logoTile(x, "sh-logo")}<div><h2>${esc(x.title)}</h2><p>${esc(x.org)}, ${esc(x.place)}</p></div></div>
      <div class="sh-chips"><span class="sh-date">${esc(x.date)}</span><span class="sh-type">${typeLabel[x.type]}</span></div>
      <p class="sh-lead">${esc(x.lead)}</p>
      ${x.bullets.length ? `<h3 class="sh-label">Ce que j'ai fait</h3><ul class="sh-list">${x.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      ${x.tags.length ? `<div class="sh-tags">${x.tags.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
      ${linked.length ? `<h3 class="sh-label">Projet${linked.length > 1 ? "s" : ""} lié${linked.length > 1 ? "s" : ""}</h3>${linked.map(([p, i]) => `
        <button class="sh-link" data-proj="${i}" data-color="${p.color}"><span class="sh-link__ico">${art(p)}</span><span><small>Projet</small><b>${esc(p.title)}</b></span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>`).join("")}` : ""}`, x.color);
    $$("[data-proj]", sheetBody).forEach(b => b.addEventListener("click", () => { closeSheet(); openProject(+b.dataset.proj); }));
  }

  /* ---------- Compétences : dossiers façon iPhone ---------- */
  const mSkills = $("#mSkills");
  const skillsOf = cat => SKILLS.map((s, i) => [s, i]).filter(([s]) => s.cat === cat);
  const topSkills = SKILLS.map((s, i) => [s, i]).sort((a, b) => b[0].refs.length - a[0].refs.length).slice(0, 6);
  mSkills.innerHTML = `
    <div class="folders">${SKILL_CATS.map(c => {
      const list = skillsOf(c.id);
      const peek = list.slice(0, 3).map(([s]) => s.name).join(", ") + (list.length > 3 ? `, +${list.length - 3}` : "");
      return `<button class="folder" data-cat="${c.id}" data-color="${c.color}">
        <span class="folder__icon app--${c.color}"><i></i></span>
        <b>${esc(c.label)}</b><small>${list.length} compétences</small>
        <span class="folder__peek">${esc(peek)}</span></button>`;
    }).join("")}</div>
    <h3 class="m-sub">Les plus utilisées</h3>
    <div class="topskills">${topSkills.map(([s, i]) => `<button class="topskill" data-skill="${i}" data-color="${catById[s.cat].color}"><span class="skill__shape skill__shape--${s.cat}"></span>${esc(s.name)}<span class="n">${s.refs.length}</span></button>`).join("")}</div>
    <p class="m-note">Le chiffre indique le nombre d'expériences et de projets où la compétence a servi.</p>`;
  const fold = $("#fold"), foldPanel = $("#foldPanel");
  function openFolder(catId) {
    const c = catById[catId];
    $("#foldTitle").textContent = c.label;
    foldPanel.innerHTML = skillsOf(catId).map(([s, i]) =>
      `<button class="sk" data-skill="${i}" data-color="${c.color}"><span class="skill__shape skill__shape--${s.cat}"></span><span>${esc(s.name)}</span><span class="skill__count">${s.refs.length}</span></button>`).join("");
    fold.hidden = false;
    lockScroll();
  }
  function closeFolder() { fold.hidden = true; unlockScroll(); }
  fold.addEventListener("click", e => { if (e.target.closest("[data-fclose]")) closeFolder(); });
  $$(".folder", mSkills).forEach(b => b.addEventListener("click", () => openFolder(b.dataset.cat)));
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-skill]");
    if (!b || !(fold.contains(b) || mSkills.contains(b))) return;
    $$("[data-skill]", foldPanel).forEach(x => x.classList.toggle("is-active", x === b));
    openSkillSheet(+b.dataset.skill);
  });
  function openSkillSheet(i) {
    const s = SKILLS[i], cat = catById[s.cat];
    openSheet(`
      <p class="sh-cat"><span class="sw sw--${cat.color}"></span>${esc(cat.label)}</p>
      <h2 class="sh-title">${esc(s.name)}</h2>
      <p class="sh-lead">${esc(s.how)}</p>
      <h3 class="sh-label">${s.refs.length} preuve${s.refs.length > 1 ? "s" : ""}</h3>
      <ul class="evidence">${s.refs.map(r => {
        const it = byId[r]; if (!it) return "";
        const isP = it.kind === "project";
        const label = isP ? it.title : `${orgShort(it)}, ${it.title}`;
        const sub = isP ? `Projet, ${it.kicker}` : `${typeLabel[it.type]}, ${it.date}`;
        return `<li><a href="#" data-ref="${r}" data-color="${it.color}">${logoTile(isP ? orgById[it.org] : it, "evidence__ico")}<span><b>${esc(label)}</b><small>${esc(sub)}</small></span></a></li>`;
      }).join("")}</ul>`, cat.color);
    $$("a[data-ref]", sheetBody).forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      const ref = a.dataset.ref;
      closeSheet(); closeFolder();
      setTimeout(() => openRef(ref), 60);
    }));
  }

  /* ---------- Projets : bande à faire défiler + liste ---------- */
  const mProj = $("#mProj");
  const SHAPES = ["circle", "square", "triangle"];
  mProj.innerHTML = `
    <div class="pstrip" id="pstrip">${PROJECTS.map((p, i) => `
      <button class="mcard" data-open="${i}" data-color="${p.color}">
        <span class="mcard__art">${art(p)}${logoTile(orgById[p.org], "pcard__logo")}<span class="mcard__open">Ouvrir <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></span></span>
        <span class="mcard__body"><b class="mcard__title">${esc(p.title)}</b><span class="mcard__sum">${esc(p.summary)}</span>
        <span class="mcard__tags">${p.stack.slice(0, 3).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</span></span>
      </button>`).join("")}</div>
    <div class="pdots pdots--c" id="pDots" aria-hidden="true">${PROJECTS.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
    <div class="m-head"><h3 class="m-sub">Tous les projets</h3><span class="mono">${PROJECTS.length}</span></div>
    <ul class="plist">${PROJECTS.map((p, i) => `
      <li><button class="prow" data-open="${i}" data-color="${p.color}">
        <span class="prow__ico"><i class="${SHAPES[i % 3]}"></i></span>
        <span class="prow__txt"><b>${esc(p.title)}</b><small>${esc(p.kicker)}</small></span>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button></li>`).join("")}</ul>`;
  $$("[data-open]", mProj).forEach(b => b.addEventListener("click", () => { openIdx = +b.dataset.open; go(openIdx); openProject(openIdx); }));
  const pstrip = $("#pstrip");
  pstrip.addEventListener("scroll", () => {
    const card = pstrip.firstElementChild;
    const k = Math.round(pstrip.scrollLeft / (card.offsetWidth + 12));
    $$("#pDots i").forEach((d, j) => d.classList.toggle("on", j === Math.min(k, n - 1)));
  }, { passive: true });

  // état initial : l'onglet vient de l'adresse (#projets…)
  setTab(location.hash.slice(1) || "accueil", { url: false, scroll: false });
})();
