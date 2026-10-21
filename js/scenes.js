/* =========================================================
   Stage : 3 animations canvas (données → … → décision)
   Toutes les scènes sont dessinées en coordonnées logiques 600×440
   et sont déterministes en fonction du temps t (scrubbables).
   ========================================================= */
(function () {
  const W = 600, H = 440;
  const C = {
    blue: "#4285f4", red: "#ea4335", yellow: "#fbbc04", green: "#34a853",
    ink: "#202124", ink2: "#5f6368", ink3: "#9aa0a6", line: "#e8eaed",
    soft: "#f8f9fb", blueSoft: "#e8f0fe", blueLight: "#a8c7fa", blueInk: "#174ea6"
  };
  const GC = [C.blue, C.red, C.yellow, C.green];
  const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, "Segoe UI", sans-serif';
  const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

  // Découpage temporel commun : A (brut) → B (traitement) → C (valeur)
  const T = { a: 3.4, b: 4.9, c: 7.6, d: 9.1 };

  /* ---------- utilitaires ---------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIn = t => t * t * t;
  const easeBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const fract = x => x - Math.floor(x);
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hexCache = {};
  function hex2rgb(h) {
    if (hexCache[h]) return hexCache[h];
    const s = h.replace("#", "");
    return (hexCache[h] = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]);
  }
  function mix(a, b, t) {
    if (t <= 0) return a; if (t >= 1) return b;
    const A = hex2rgb(a), B = hex2rgb(b);
    return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
  }
  const fr = (n, d = 0) => n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- primitives de dessin ---------- */
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function shape(ctx, type, x, y, s, rot, color, a = 1) {
    if (a <= 0 || s <= .2) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = color;
    if (type === 0) { ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, Math.PI * 2); ctx.fill(); }
    else if (type === 1) { rr(ctx, -s / 2, -s / 2, s, s, s * .2); ctx.fill(); }
    else {
      ctx.beginPath();
      ctx.moveTo(0, -s * .55); ctx.lineTo(s * .55, s * .42); ctx.lineTo(-s * .55, s * .42);
      ctx.closePath(); ctx.lineJoin = "round"; ctx.lineWidth = s * .12; ctx.strokeStyle = color;
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  function card(ctx, x, y, w, h, a, title, r = 12) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.shadowColor = "rgba(60,64,67,.13)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 3;
    ctx.fillStyle = "#fff"; rr(ctx, x, y, w, h, r); ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
    if (title) { text(ctx, title, x + 14, y + 21, { font: `500 9.5px ${MONO}`, color: C.ink3 }); }
    ctx.restore();
  }
  function text(ctx, s, x, y, o = {}) {
    ctx.save();
    if (o.a != null) ctx.globalAlpha *= o.a;
    ctx.font = o.font || `500 12px ${FONT}`;
    ctx.fillStyle = o.color || C.ink;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "alphabetic";
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  function wrap(ctx, s, maxW) {
    const words = s.split(" "), lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  function caption(ctx, s, a, accent) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.font = `500 11px ${MONO}`;
    const w = ctx.measureText(s).width + 24;
    ctx.fillStyle = "rgba(255,255,255,.92)";
    rr(ctx, 12, 10, w, 24, 7); ctx.fill();
    ctx.strokeStyle = C.line; ctx.stroke();
    ctx.fillStyle = accent || C.blue; ctx.beginPath(); ctx.arc(22, 22, 3, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.textBaseline = "middle"; ctx.fillText(s, 31, 22.5);
    ctx.restore();
  }
  function pill(ctx, s, x, y, color, a = 1, font = `600 10.5px ${FONT}`) {
    if (a <= 0) return 0;
    ctx.save(); ctx.globalAlpha *= a; ctx.font = font;
    const w = ctx.measureText(s).width + 14;
    ctx.fillStyle = color + "22"; rr(ctx, x, y - 10, w, 20, 10); ctx.fill();
    ctx.fillStyle = color; ctx.textBaseline = "middle"; ctx.fillText(s, x + 7, y + .5);
    ctx.restore();
    return w;
  }

  /* =======================================================
     SCÈNE 1 : Données brutes → tri → monitoring
     ======================================================= */
  function scene1() {
    const r = rng(11);
    const N = 42, P = [];
    for (let i = 0; i < N; i++) {
      P.push({
        type: i % 3, ci: Math.floor(r() * 4),
        x: 40 + r() * 520, y: 50 + r() * 350,
        ph: r() * 6.28, ph2: r() * 6.28, rot: r() * 6.28, spin: (r() - .5) * 1.8,
        size: 13 + r() * 11, delay: r() * .5, d2: r() * .45
      });
    }
    // B : regroupement par forme, tri par couleur
    const groups = [[], [], []];
    P.forEach(p => groups[p.type].push(p));
    const gx = [138, 300, 462];
    groups.forEach((g, gi) => {
      g.sort((a, b) => a.ci - b.ci);
      g.forEach((p, k) => {
        p.bx = gx[gi] + ((k % 4) - 1.5) * 27;
        p.by = 168 + Math.floor(k / 4) * 27;
      });
    });
    // C : carrés → barres
    const bars = [3, 2, 4, 2, 3];
    let k = 0;
    bars.forEach((hgt, j) => {
      for (let l = 0; l < hgt; l++) {
        const p = groups[1][k++];
        p.cx = 52 + 43.6 * (j + .5); p.cy = 360 - 17 - l * 34; p.cs = 30;
        p.cc = j === 2 ? C.blue : C.blueLight;
      }
    });
    // C : triangles → courbe
    const serie = [.18, .3, .26, .42, .38, .5, .47, .6, .56, .7, .66, .78, .82, .9];
    groups[2].forEach((p, k) => {
      p.cx = 330 + k * (226 / 13); p.cy = 238 - serie[k] * 80; p.cs = 10; p.cc = C.green;
    });
    // C : cercles → donut
    const shares = [.45, .25, .18, .12], shareCol = [C.blue, C.red, C.yellow, C.green];
    const dcx = 376, dcy = 350, dr = 40;
    groups[0].forEach((p, k) => {
      const f = (k + .5) / 14;
      const ang = -Math.PI / 2 + f * Math.PI * 2;
      p.cx = dcx + Math.cos(ang) * dr; p.cy = dcy + Math.sin(ang) * dr; p.cs = 11;
      let acc = 0, idx = 0;
      for (let s = 0; s < 4; s++) { acc += shares[s]; if (f <= acc) { idx = s; break; } }
      p.cc = shareCol[idx];
    });
    const labels = ["events", "tables", "logs"];

    return {
      key: "monitoring", title: "pipeline.app - Données brutes → Monitoring", end: 17,
      steps: [
        { k: "01 / COLLECTE", t: "Données brutes et hétérogènes" },
        { k: "02 / STRUCTURATION", t: "Nettoyage, tri, typage" },
        { k: "03 / MONITORING", t: "Dashboard & KPI pour piloter" }
      ],
      draw(ctx, t) {
        const { a, b, c, d } = T;
        caption(ctx, "raw_data/ : 42 enregistrements non triés", 1 - seg(t, a, a + .4), C.red);
        caption(ctx, "SELECT * GROUP BY type ORDER BY couleur", seg(t, a + .4, a + .9) * (1 - seg(t, c, c + .4)), C.blue);

        // libellés de groupes (B)
        const gl = seg(t, b - .3, b + .3) * (1 - seg(t, c, c + .4));
        labels.forEach((l, i) => {
          if (gl <= 0) return;
          ctx.save(); ctx.globalAlpha *= gl;
          ctx.strokeStyle = C.line; ctx.setLineDash([3, 4]);
          rr(ctx, gx[i] - 64, 146, 128, 128, 14); ctx.stroke();
          ctx.restore();
          text(ctx, `${l}`, gx[i] - 52, 296, { font: `500 11px ${MONO}`, color: C.ink2, a: gl });
          text(ctx, "n=14", gx[i] + 52, 296, { font: `500 11px ${MONO}`, color: C.ink3, align: "right", a: gl });
        });

        // cartes du dashboard (C)
        const ca = easeOut(seg(t, c, c + .9));
        const kp = easeOut(seg(t, c + .6, d + 1.2));
        const kpis = [
          { l: "DISPONIBILITÉ", v: fr(lerp(80, 97.4, kp), 1) + " %", dl: "▲ 2,1 pts", col: C.green },
          { l: "PANNES / MOIS", v: fr(Math.round(lerp(40, 12, kp))), dl: "▼ 18 %", col: C.green },
          { l: "ÉVÉNEMENTS TRAITÉS", v: fr(lerp(0, 1.2, kp), 1) + " M", dl: "● live", col: C.blue }
        ];
        kpis.forEach((kv, i) => {
          const x = 24 + i * 188, y = 22 + (1 - ca) * 14;
          card(ctx, x, y, 176, 80, ca, kv.l);
          text(ctx, kv.v, x + 14, y + 60, { font: `700 25px ${FONT}`, color: C.ink, a: ca });
          ctx.save(); ctx.font = `600 10.5px ${FONT}`; const w = ctx.measureText(kv.dl).width + 14; ctx.restore();
          pill(ctx, kv.dl, x + 176 - 12 - w, y + 52, kv.col, ca * kp);
        });
        const cb = easeOut(seg(t, c + .15, c + 1.05));
        card(ctx, 24, 116 + (1 - cb) * 14, 270, 300, cb, "INTERVENTIONS PAR LIGNE");
        card(ctx, 306, 116 + (1 - cb) * 14, 270, 142, cb, "DISPONIBILITÉ SUR 14 SEMAINES");
        card(ctx, 306, 270 + (1 - cb) * 14, 270, 146, cb, "CAUSES D'ARRÊT");

        // décor du bar chart
        if (cb > 0) {
          ctx.save(); ctx.globalAlpha *= cb;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          for (let g = 0; g < 5; g++) { const y = 360 - g * 34; ctx.beginPath(); ctx.moveTo(44, y + .5); ctx.lineTo(276, y + .5); ctx.stroke(); }
          ["L1", "L2", "L3", "L4", "L5"].forEach((l, j) => text(ctx, l, 52 + 43.6 * (j + .5), 380, { font: `500 10px ${MONO}`, color: C.ink3, align: "center" }));
          ctx.restore();
          // pastille "L3" mise en avant
          pill(ctx, "pic L3", 52 + 43.6 * 2.5 - 22, 198, C.blue, seg(t, d + .8, d + 1.3));
        }
        // courbe
        const lp = easeIO(seg(t, d - .1, d + 1.2));
        if (lp > 0) {
          const pts = groups[2].map(p => [p.cx, p.cy]);
          const n = (pts.length - 1) * lp;
          ctx.save();
          ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i <= Math.floor(n); i++) ctx.lineTo(pts[i][0], pts[i][1]);
          const fi = Math.floor(n), ff = n - fi;
          let ex = pts[fi][0], ey = pts[fi][1];
          if (fi < pts.length - 1) { ex = lerp(pts[fi][0], pts[fi + 1][0], ff); ey = lerp(pts[fi][1], pts[fi + 1][1], ff); ctx.lineTo(ex, ey); }
          ctx.strokeStyle = C.green; ctx.lineWidth = 2.2; ctx.lineJoin = "round"; ctx.stroke();
          ctx.lineTo(ex, 244); ctx.lineTo(pts[0][0], 244); ctx.closePath();
          ctx.fillStyle = "rgba(52,168,83,.10)"; ctx.fill();
          ctx.restore();
        }
        // donut
        const dp = easeIO(seg(t, d + .2, d + 1.4));
        if (dp > 0) {
          let start = -Math.PI / 2;
          ctx.save(); ctx.lineWidth = 15;
          shares.forEach((s, i) => {
            const len = s * Math.PI * 2 * dp;
            ctx.strokeStyle = shareCol[i];
            ctx.beginPath(); ctx.arc(dcx, dcy, dr, start, start + Math.max(0, len - .04)); ctx.stroke();
            start += s * Math.PI * 2;
          });
          ctx.restore();
          ["Mécanique", "Électrique", "Capteurs", "Autre"].forEach((l, i) => {
            const y = 322 + i * 19, la = seg(t, d + .4 + i * .12, d + .9 + i * .12);
            ctx.save(); ctx.globalAlpha *= la; ctx.fillStyle = shareCol[i]; ctx.beginPath(); ctx.arc(444, y - 4, 4, 0, 7); ctx.fill(); ctx.restore();
            text(ctx, l, 454, y, { font: `500 11px ${FONT}`, color: C.ink2, a: la });
            text(ctx, Math.round(shares[i] * 100) + " %", 560, y, { font: `600 11px ${FONT}`, color: C.ink, align: "right", a: la });
          });
          text(ctx, "214", dcx, dcy + 2, { font: `700 15px ${FONT}`, align: "center", a: dp });
          text(ctx, "arrêts", dcx, dcy + 14, { font: `500 9px ${MONO}`, color: C.ink3, align: "center", a: dp });
        }

        // formes
        for (const p of P) {
          const t1 = easeIO(seg(t, a + p.delay, a + p.delay + 1.1));
          const t2 = easeIO(seg(t, c + .25 + p.d2, c + p.d2 + 1.35));
          const ax = p.x + Math.sin(t * .7 + p.ph) * 16;
          const ay = p.y + Math.cos(t * .6 + p.ph2) * 12;
          let x = lerp(ax, p.bx, t1), y = lerp(ay, p.by, t1);
          x = lerp(x, p.cx, t2); y = lerp(y, p.cy, t2);
          // petit arc pendant le déplacement pour un mouvement plus vivant
          y -= Math.sin(t1 * Math.PI) * 26 + Math.sin(t2 * Math.PI) * 30;
          const rot = lerp(p.rot + t * p.spin, 0, t1) + Math.sin(t2 * Math.PI) * 1.4;
          const size = lerp(lerp(p.size, 19, t1), p.cs, t2);
          const col = mix(GC[p.ci], p.cc, t2);
          let al = 1;
          if (p.type === 0) al = 1 - seg(t, d + .5, d + 1.2);
          shape(ctx, p.type, x, y, size, rot, col, al);
        }
      }
    };
  }

  /* =======================================================
     SCÈNE 2 : Données & chiffres → entraînement → décisions
     ======================================================= */
  function scene2() {
    const r = rng(23);
    const pool = ["0.82", "1 024", "42 %", "19,90 €", "user_42", "t+30j", "3.14", "NaN", "+12 %", "id:7781", "Σ", "μ = 0.4", "σ²", "98", "2026", "churn?", "clicks", "∅", "17.5", "sessions", "LTV", "0/1", "p = .05", "Δt", "x̄", "SKU-88", "47 min", "ARPU", "true", "−3,2 %"];
    const toks = pool.map((s, i) => ({
      s, x: 40 + r() * 500, y: 40 + r() * 360,
      ph: r() * 6.28, ph2: r() * 6.28,
      col: i % 5 === 0 ? GC[i % 4] : (i % 3 ? C.ink2 : C.blueInk),
      fs: 11 + r() * 4, delay: r() * .9, mono: r() > .35
    }));
    const neurons = [];
    for (let i = 0; i < 18; i++) {
      const orbit = i % 3;
      neurons.push({
        rx: [78, 118, 158][orbit], tilt: [-.25, .18, -.05][orbit],
        w: (orbit === 1 ? -1 : 1) * (.55 - orbit * .1),
        ph: r() * 6.28, s: 6 + r() * 4, col: GC[i % 4], delay: i * .045
      });
    }
    const decisions = [
      { k: "ANTI-CHURN", col: C.red, main: "Joueur #48 213", val: 87, unit: " %", foot: "→ Offre de rétention ciblée" },
      { k: "RECO PRODUIT", col: C.blue, main: "Top 3 pour ce client", reco: [["Extension", .92], ["Season Pass", .81], ["Bundle", .77]] },
      { k: "MAINTENANCE", col: C.green, main: "Machine L3-07", tag: "panne < 14 j", foot: "→ Intervention planifiée" }
    ];

    return {
      key: "prediction", title: "model.app - Données → Entraînement → Décisions", end: 17,
      steps: [
        { k: "01 / SIGNAUX", t: "Chiffres et événements dispersés" },
        { k: "02 / ENTRAÎNEMENT", t: "Le modèle apprend les relations" },
        { k: "03 / DÉCISIONS", t: "Prédictions actionnables" }
      ],
      draw(ctx, t) {
        const { a, b, c, d } = T;
        caption(ctx, "sources : crm, logs, erp, capteurs", 1 - seg(t, a, a + .4), C.yellow);
        caption(ctx, "model.fit(X_train, y_train)", seg(t, a + .5, a + 1) * (1 - seg(t, c, c + .4)), C.red);

        const mv = easeIO(seg(t, c, d));
        const cx = lerp(300, 148, mv), cy = lerp(212, 222, mv);
        const osc = lerp(1, .72, mv);

        // tokens
        for (const k of toks) {
          const p = seg(t, a - .2 + k.delay, a + .7 + k.delay);
          if (p >= 1) continue;
          const pe = easeIn(p);
          const ax = k.x + Math.sin(t * .5 + k.ph) * 14, ay = k.y + Math.cos(t * .45 + k.ph2) * 10;
          const x = lerp(ax, cx, pe), y = lerp(ay, cy, pe);
          const sc = lerp(1, .3, pe);
          ctx.save();
          ctx.globalAlpha *= 1 - pe;
          ctx.translate(x, y); ctx.scale(sc, sc);
          ctx.font = `${k.mono ? 500 : 600} ${k.fs}px ${k.mono ? MONO : FONT}`;
          const w = ctx.measureText(k.s).width + 14;
          ctx.fillStyle = C.soft; rr(ctx, -w / 2, -11, w, 22, 6); ctx.fill();
          ctx.strokeStyle = C.line; ctx.stroke();
          ctx.fillStyle = k.col; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(k.s, 0, .5);
          ctx.restore();
        }

        // noyau du modèle + neurones
        const appear = seg(t, a + .1, a + 1.1);
        if (appear > 0) {
          const ap = easeBack(appear);
          const pos = neurons.map((n, i) => {
            const na = easeOut(seg(t, a + .5 + n.delay, a + 1.3 + n.delay));
            const ang = n.ph + t * n.w * (1 + .4 * seg(t, b, c));
            const lx = Math.cos(ang) * n.rx * na * osc, ly = Math.sin(ang) * n.rx * .5 * na * osc;
            return { x: cx + lx * Math.cos(n.tilt) - ly * Math.sin(n.tilt), y: cy + lx * Math.sin(n.tilt) + ly * Math.cos(n.tilt), n, na };
          });
          // orbites
          ctx.save();
          ctx.globalAlpha *= appear * .9;
          ctx.strokeStyle = C.line; ctx.setLineDash([2, 5]); ctx.lineWidth = 1;
          [78, 118, 158].forEach((rx, o) => {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx * osc, rx * .5 * osc, [-.25, .18, -.05][o], 0, Math.PI * 2);
            ctx.stroke();
          });
          ctx.restore();
          // relations entre neurones
          ctx.save();
          for (let i = 0; i < pos.length; i++) {
            for (let j = i + 1; j < pos.length; j++) {
              const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y;
              const dist = Math.hypot(dx, dy), lim = 100 * osc;
              if (dist < lim) {
                ctx.strokeStyle = `rgba(66,133,244,${(1 - dist / lim) * .55 * Math.min(pos[i].na, pos[j].na)})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[j].x, pos[j].y); ctx.stroke();
              }
            }
          }
          // impulsions vers le noyau
          pos.forEach((p, i) => {
            if (i % 2) return;
            const f = fract(t * .7 + i * .17);
            ctx.strokeStyle = `rgba(154,160,166,${.25 * p.na})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cx, cy); ctx.stroke();
            ctx.fillStyle = p.n.col; ctx.globalAlpha = p.na * (1 - f);
            ctx.beginPath(); ctx.arc(lerp(p.x, cx, f), lerp(p.y, cy, f), 2.2, 0, 7); ctx.fill();
            ctx.globalAlpha = 1;
          });
          ctx.restore();
          // neurones
          pos.forEach(p => {
            ctx.save();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, p.n.s * p.na * osc + 2.5, 0, 7); ctx.fill();
            ctx.restore();
            shape(ctx, 0, p.x, p.y, p.n.s * 2 * p.na * osc, 0, p.n.col);
          });
          // noyau
          const R = 34 * ap * lerp(1, .85, mv);
          ctx.save();
          ctx.shadowColor = "rgba(26,115,232,.25)"; ctx.shadowBlur = 24;
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
          ctx.restore();
          ctx.save(); ctx.lineWidth = 5; ctx.lineCap = "round";
          const rot = t * 1.4;
          GC.forEach((col, i) => {
            ctx.strokeStyle = col; ctx.beginPath();
            ctx.arc(cx, cy, R, rot + i * Math.PI / 2 + .12, rot + (i + 1) * Math.PI / 2 - .12); ctx.stroke();
          });
          ctx.restore();
          text(ctx, "f(x)", cx, cy + 1, { font: `700 ${Math.max(1, 17 * ap)}px ${FONT}`, color: C.ink, align: "center", base: "middle" });
        }

        // HUD d'entraînement
        const hud = seg(t, a + .8, b) * (1 - seg(t, c, c + .5));
        if (hud > 0) {
          const tp = easeOut(seg(t, a + .8, c));
          const ep = Math.max(1, Math.round(tp * 50));
          const loss = .69 * Math.exp(-3.2 * tp) + .12;
          const auc = .5 + .41 * tp;
          ctx.save(); ctx.globalAlpha *= hud;
          ctx.fillStyle = "rgba(255,255,255,.94)"; rr(ctx, 130, 380, 340, 40, 10); ctx.fill();
          ctx.strokeStyle = C.line; ctx.stroke();
          // sparkline
          ctx.beginPath();
          for (let i = 0; i <= 40; i++) {
            const u = (i / 40) * tp;
            const v = .69 * Math.exp(-3.2 * u) + .12 + Math.sin(i * 1.7) * .012;
            const x = 144 + i * 1.6, y = 388 + (1 - (.81 - v) / .7) * 22;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.strokeStyle = C.red; ctx.lineWidth = 1.6; ctx.stroke();
          ctx.restore();
          text(ctx, `epoch ${String(ep).padStart(2, "0")}/50`, 222, 404, { font: `500 11px ${MONO}`, color: C.ink2, a: hud });
          text(ctx, `loss ${loss.toFixed(3)}`, 322, 404, { font: `500 11px ${MONO}`, color: C.red, a: hud });
          text(ctx, `AUC ${auc.toFixed(2)}`, 456, 404, { font: `600 11px ${MONO}`, color: C.green, align: "right", a: hud });
        }

        // décisions
        decisions.forEach((dc, i) => {
          const ap = easeOut(seg(t, c + .5 + i * .22, d + .4 + i * .22));
          if (ap <= 0) return;
          const x = 300 + (1 - ap) * 40, y = 30 + i * 128, w = 276, h = 108;
          // faisceau
          ctx.save();
          ctx.globalAlpha *= ap;
          ctx.strokeStyle = dc.col; ctx.lineWidth = 1.6; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 30;
          ctx.beginPath(); ctx.moveTo(cx + 30, cy);
          ctx.bezierCurveTo(cx + 90, cy, x - 50, y + h / 2, x, y + h / 2); ctx.stroke();
          ctx.restore();
          card(ctx, x, y, w, h, ap, null);
          ctx.save(); ctx.globalAlpha *= ap; ctx.fillStyle = dc.col; rr(ctx, x, y + 14, 3, h - 28, 2); ctx.fill(); ctx.restore();
          text(ctx, dc.k, x + 18, y + 24, { font: `600 9.5px ${MONO}`, color: dc.col, a: ap });
          text(ctx, dc.main, x + 18, y + 46, { font: `600 14px ${FONT}`, color: C.ink, a: ap });
          const vp = easeOut(seg(t, d + .2 + i * .25, d + 1.4 + i * .25));
          if (dc.val) {
            text(ctx, Math.round(dc.val * vp) + dc.unit, x + w - 16, y + 46, { font: `700 20px ${FONT}`, color: dc.col, align: "right", a: ap });
            ctx.save(); ctx.globalAlpha *= ap;
            ctx.fillStyle = C.line; rr(ctx, x + 18, y + 60, w - 34, 6, 3); ctx.fill();
            ctx.fillStyle = dc.col; rr(ctx, x + 18, y + 60, (w - 34) * dc.val / 100 * vp, 6, 3); ctx.fill();
            ctx.restore();
            text(ctx, "risque de churn à 30 jours", x + 18, y + 82, { font: `500 10.5px ${FONT}`, color: C.ink3, a: ap });
            text(ctx, dc.foot, x + 18, y + 98, { font: `600 11.5px ${FONT}`, color: C.ink2, a: ap * seg(t, d + 1, d + 1.5) });
          } else if (dc.reco) {
            dc.reco.forEach(([n, s], j) => {
              const yy = y + 62 + j * 15;
              text(ctx, n, x + 18, yy + 4, { font: `500 11px ${FONT}`, color: C.ink2, a: ap });
              ctx.save(); ctx.globalAlpha *= ap;
              ctx.fillStyle = C.line; rr(ctx, x + 100, yy - 3, 120, 6, 3); ctx.fill();
              ctx.fillStyle = j ? C.blueLight : C.blue; rr(ctx, x + 100, yy - 3, 120 * s * vp, 6, 3); ctx.fill();
              ctx.restore();
              text(ctx, (s * vp).toFixed(2).replace(".", ","), x + w - 16, yy + 4, { font: `600 11px ${MONO}`, color: C.ink, align: "right", a: ap });
            });
          } else {
            ctx.save(); ctx.font = `600 10.5px ${FONT}`; const tw = ctx.measureText(dc.tag).width + 14; ctx.restore();
            pill(ctx, dc.tag, x + w - 16 - tw, y + 42, C.yellow === dc.col ? C.yellow : "#e37400", ap * vp);
            // mini jauge de santé
            for (let s = 0; s < 12; s++) {
              const on = s < Math.round(9 * vp);
              ctx.save(); ctx.globalAlpha *= ap;
              ctx.fillStyle = on ? (s > 6 ? C.red : s > 3 ? C.yellow : C.green) : C.line;
              rr(ctx, x + 18 + s * 20, y + 58, 16, 8, 2); ctx.fill(); ctx.restore();
            }
            text(ctx, "probabilité de défaillance", x + 18, y + 82, { font: `500 10.5px ${FONT}`, color: C.ink3, a: ap });
            text(ctx, dc.foot, x + 18, y + 98, { font: `600 11.5px ${FONT}`, color: C.ink2, a: ap * seg(t, d + 1.3, d + 1.8) });
          }
        });
      }
    };
  }

  /* =======================================================
     SCÈNE 3 : Non structuré → RAG → LLM
     ======================================================= */
  function scene3() {
    const r = rng(5);
    const docs = [];
    for (let i = 0; i < 18; i++) {
      docs.push({
        type: i % 4, x: 40 + r() * 520, y: 50 + r() * 340,
        ph: r() * 6.28, ph2: r() * 6.28, rot: (r() - .5) * .6, delay: i * .07,
        gap: i % 2, off: (r() - .5) * 90
      });
    }
    const dots = [];
    for (let i = 0; i < 26; i++) dots.push({ ang: r() * 6.28, rad: 104 + r() * 40, sp: .2 + r() * .3, col: GC[i % 4], s: 2 + r() * 2 });
    const Q = "Quelles pannes reviennent le plus sur la ligne 3 ?";
    const A = "D'après 214 rapports GMAO, 41 % des arrêts de la ligne 3 viennent des roulements du convoyeur, puis des sondes de température (23 %). Je recommande un contrôle vibratoire mensuel.";

    function doc(ctx, type, x, y, rot, s, a) {
      if (a <= 0 || s <= .02) return;
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      const w = 32, h = 40;
      ctx.shadowColor = "rgba(60,64,67,.16)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "#fff";
      if (type === 3) { rr(ctx, -20, -14, 40, 28, 4); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = C.line; ctx.stroke(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, -10); ctx.lineTo(0, 2); ctx.lineTo(16, -10); ctx.stroke(); ctx.restore(); return; }
      if (type === 1) {
        rr(ctx, -19, -15, 38, 30, 4); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = C.line; ctx.stroke();
        ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(-15, 11); ctx.lineTo(-5, -1); ctx.lineTo(3, 7); ctx.lineTo(8, 2); ctx.lineTo(15, 11); ctx.closePath(); ctx.fill();
        ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(8, -7, 3.5, 0, 7); ctx.fill();
        ctx.restore(); return;
      }
      ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2 - 9, -h / 2); ctx.lineTo(w / 2, -h / 2 + 9); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath();
      ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = C.line; ctx.stroke();
      if (type === 0) {
        ctx.fillStyle = C.red; rr(ctx, -w / 2 + 4, 2, 20, 10, 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `700 7px ${FONT}`; ctx.textBaseline = "middle"; ctx.fillText("PDF", -w / 2 + 6.5, 7.5);
        ctx.fillStyle = C.line; rr(ctx, -10, -12, 18, 3, 1.5); ctx.fill(); rr(ctx, -10, -6, 14, 3, 1.5); ctx.fill();
      } else {
        ctx.fillStyle = C.blue; rr(ctx, -10, -12, 12, 3, 1.5); ctx.fill();
        ctx.fillStyle = C.line; for (let l = 0; l < 4; l++) { rr(ctx, -10, -5 + l * 6, l === 3 ? 12 : 20, 3, 1.5); ctx.fill(); }
      }
      ctx.restore();
    }
    function disk(ctx, x, y, rx, ry, dh, top, side) {
      ctx.fillStyle = side;
      ctx.beginPath(); ctx.ellipse(x, y + dh, rx, ry, 0, 0, Math.PI); ctx.lineTo(x - rx, y); ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
      ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Logo Claude : éclat de rayons effilés, couleur terracotta
    const RAYS = [1, .74, .9, .68, .96, .78, .86, .7, 1, .76, .88, .72];
    function claude(ctx, x, y, s, rot, t) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = "#d97757";
      RAYS.forEach((l, i) => {
        const len = s * l * (1 + .05 * Math.sin(t * 2.4 + i * 1.3));
        ctx.save(); ctx.rotate(i * Math.PI * 2 / RAYS.length);
        ctx.beginPath();
        ctx.moveTo(-s * .13, 0);
        ctx.lineTo(-s * .065, -len + s * .07);
        ctx.quadraticCurveTo(0, -len - s * .03, s * .065, -len + s * .07);
        ctx.lineTo(s * .13, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      ctx.beginPath(); ctx.arc(0, 0, s * .16, 0, 7); ctx.fill();
      ctx.restore();
    }

    return {
      key: "rag", title: "assistant.app - Documents → RAG → Réponses", end: 18.5,
      steps: [
        { k: "01 / NON STRUCTURÉ", t: "PDF, photos, mails, rapports" },
        { k: "02 / INDEXATION RAG", t: "Découpage, embeddings, base vectorielle" },
        { k: "03 / LLM MÉTIER", t: "Réponses précises et sourcées" }
      ],
      draw(ctx, t) {
        const { a, b, c, d } = T;
        caption(ctx, "docs/ : 18 fichiers pdf, jpg, docx, eml", 1 - seg(t, a, a + .4), C.green);
        caption(ctx, "index.add(embed(chunks))", seg(t, a + .5, a + 1) * (1 - seg(t, c, c + .4)), C.blue);

        const mv = easeIO(seg(t, c, d));
        const dbx = lerp(300, 112, mv), dby = lerp(205, 216, mv), dbs = lerp(1, .72, mv);
        const appear = easeBack(seg(t, a - .1, a + .7));
        const open = easeIO(seg(t, a + .4, a + 1.1)) * (1 - easeIO(seg(t, b + .7, b + 1.4)));
        const gap = lerp(26, 66, open) * dbs;
        const rx = 82 * dbs, ry = 21 * dbs, dh = 18 * dbs;

        // points d'embedding qui gravitent
        const dotA = seg(t, b - .3, b + .8);
        if (dotA > 0) {
          dots.forEach((p, i) => {
            const ang = p.ang + t * p.sp;
            const x = dbx + Math.cos(ang) * p.rad * dbs, y = dby + gap * .2 + Math.sin(ang) * p.rad * .42 * dbs;
            ctx.save(); ctx.globalAlpha *= dotA * seg(t, b - .3 + i * .03, b + .2 + i * .03) * .85;
            ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(x, y, p.s * dbs, 0, 7); ctx.fill(); ctx.restore();
          });
        }

        // base vectorielle : 3 disques empilés qui s'ouvrent
        if (appear > 0) {
          ctx.save();
          ctx.globalAlpha *= clamp(appear);
          ctx.translate(dbx, dby); ctx.scale(appear, appear); ctx.translate(-dbx, -dby);
          ctx.shadowColor = "rgba(26,115,232,.22)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 6;
          const shades = [["#8ab4f8", "#4285f4"], ["#a8c7fa", "#5e97f6"], ["#c6dafc", "#8ab4f8"]];
          for (let k = 2; k >= 0; k--) {
            const y = dby + (k - 1) * gap - dh / 2;
            disk(ctx, dbx, y, rx, ry, dh, shades[k][0], shades[k][1]);
            if (k === 0) ctx.shadowColor = "transparent";
          }
          ctx.shadowColor = "transparent";
          // reflets
          ctx.fillStyle = "rgba(255,255,255,.35)";
          for (let k = 0; k < 3; k++) { const y = dby + (k - 1) * gap - dh / 2; ctx.beginPath(); ctx.ellipse(dbx - rx * .35, y - ry * .2, rx * .28, ry * .28, 0, 0, 7); ctx.fill(); }
          ctx.restore();
          const la = seg(t, b, b + .5);
          const cnt = Math.round(lerp(0, 12480, easeOut(seg(t, a + .6, b + 1.6))));
          text(ctx, "vector store", dbx, dby + gap + 44 * dbs, { font: `600 ${12 * dbs}px ${MONO}`, color: C.ink, align: "center", a: appear * clamp(la + mv) });
          text(ctx, fr(cnt) + " chunks", dbx, dby + gap + 60 * dbs, { font: `500 ${11 * dbs}px ${MONO}`, color: C.ink3, align: "center", a: appear });
        }

        // documents qui entrent dans la base
        for (const dcm of docs) {
          const p = seg(t, a + .5 + dcm.delay, a + 1.3 + dcm.delay);
          if (p >= 1) continue;
          const pe = easeIO(p);
          const ax = dcm.x + Math.sin(t * .55 + dcm.ph) * 14, ay = dcm.y + Math.cos(t * .5 + dcm.ph2) * 10;
          const tx = dbx + dcm.off * .5, ty = dby + (dcm.gap ? .5 : -.5) * gap;
          const x = lerp(ax, tx, pe), y = lerp(ay, ty, pe) - Math.sin(pe * Math.PI) * 30;
          const s = lerp(1, .2, easeIn(p));
          doc(ctx, dcm.type, x, y, lerp(dcm.rot + Math.sin(t + dcm.ph) * .12, 0, pe), s, 1 - easeIn(seg(p, .7, 1)));
        }

        // LLM + chat
        const la = easeOut(seg(t, c + .4, d + .2));
        if (la > 0) {
          const lx = 242, ly = 216;
          // flux de récupération base → LLM
          ctx.save(); ctx.globalAlpha *= la;
          ctx.strokeStyle = C.line; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(dbx + rx + 4, dby); ctx.lineTo(lx - 30, ly); ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const f = fract(t * .6 + i / 4);
            ctx.fillStyle = GC[i]; ctx.globalAlpha = la * Math.sin(f * Math.PI);
            ctx.beginPath(); ctx.arc(lerp(dbx + rx + 4, lx - 30, f), lerp(dby, ly, f), 3, 0, 7); ctx.fill();
          }
          ctx.restore();
          // halo
          const pulse = .5 + .5 * Math.sin(t * 3);
          ctx.save(); ctx.globalAlpha *= la;
          ctx.fillStyle = `rgba(217,119,87,${.08 + pulse * .06})`; ctx.beginPath(); ctx.arc(lx, ly, 38 + pulse * 4, 0, 7); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(217,119,87,.3)"; ctx.shadowBlur = 18;
          ctx.beginPath(); ctx.arc(lx, ly, 28, 0, 7); ctx.fill();
          ctx.shadowColor = "transparent";
          claude(ctx, lx, ly, 21 * easeBack(seg(t, c + .4, d)), t * .25, t);
          ctx.restore();
          text(ctx, "LLM", lx, ly + 50, { font: `600 11px ${MONO}`, color: C.ink, align: "center", a: la });
          text(ctx, "+ contexte", lx, ly + 64, { font: `500 10px ${MONO}`, color: C.ink3, align: "center", a: la });

          // fenêtre de chat
          const cw = easeOut(seg(t, c + .6, d + .3));
          const x0 = 300 + (1 - cw) * 30, y0 = 26, w = 276, h = 388;
          card(ctx, x0, y0, w, h, cw, null, 14);
          ctx.save(); ctx.globalAlpha *= cw;
          ctx.fillStyle = C.soft; rr(ctx, x0 + .5, y0 + .5, w - 1, 32, 14); ctx.fill();
          ctx.fillRect(x0 + .5, y0 + 18, w - 1, 15);
          ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(x0, y0 + 33.5); ctx.lineTo(x0 + w, y0 + 33.5); ctx.stroke();
          ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0 + 16 + i * 14, y0 + 17, 4.5, 0, 7); ctx.fill(); });
          ctx.restore();
          text(ctx, "Assistant Maintenance", x0 + w / 2 + 18, y0 + 21, { font: `600 11.5px ${FONT}`, color: C.ink2, align: "center", a: cw });
          // flux LLM → chat
          ctx.save(); ctx.globalAlpha *= cw * .9; ctx.strokeStyle = C.blue; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(lx + 30, ly); ctx.lineTo(x0 - 2, ly); ctx.stroke(); ctx.restore();

          // champ de saisie
          ctx.save(); ctx.globalAlpha *= cw;
          ctx.fillStyle = C.soft; rr(ctx, x0 + 12, y0 + h - 48, w - 24, 36, 18); ctx.fill();
          ctx.strokeStyle = C.line; ctx.stroke();
          const sx0 = x0 + w - 31, sy0 = y0 + h - 30;
          ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(sx0, sy0, 12, 0, 7); ctx.fill();
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.beginPath(); ctx.moveTo(sx0, sy0 + 5); ctx.lineTo(sx0, sy0 - 5); ctx.moveTo(sx0 - 4, sy0 - 1); ctx.lineTo(sx0, sy0 - 5); ctx.lineTo(sx0 + 4, sy0 - 1); ctx.stroke();
          ctx.restore();
          text(ctx, "Posez une question métier…", x0 + 28, y0 + h - 26, { font: `400 12px ${FONT}`, color: C.ink3, a: cw });

          // question
          const qa = easeOut(seg(t, d, d + .4));
          if (qa > 0) {
            ctx.save(); ctx.font = `500 12.5px ${FONT}`;
            const lines = wrap(ctx, Q, 180);
            const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 24, bh = lines.length * 17 + 16;
            const bx = x0 + w - 14 - bw, by = y0 + 50 + (1 - qa) * 10;
            ctx.globalAlpha *= qa; ctx.fillStyle = C.blue; rr(ctx, bx, by, bw, bh, 14); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.textBaseline = "top";
            lines.forEach((l, i) => ctx.fillText(l, bx + 12, by + 9 + i * 17));
            ctx.restore();
          }
          // réponse
          const ty = y0 + 50 + 64;
          const typing = seg(t, d + .5, d + 1.1);
          const prog = seg(t, d + 1.1, d + 3.6);
          if (typing > 0 && prog <= 0) {
            ctx.save(); ctx.fillStyle = C.bg || "#f1f3f4"; rr(ctx, x0 + 14, ty, 56, 30, 14); ctx.fillStyle = "#f1f3f4"; ctx.fill();
            for (let i = 0; i < 3; i++) { ctx.fillStyle = C.ink3; ctx.globalAlpha = .4 + .6 * Math.max(0, Math.sin(t * 8 - i)); ctx.beginPath(); ctx.arc(x0 + 30 + i * 12, ty + 15, 3, 0, 7); ctx.fill(); }
            ctx.restore();
          }
          if (prog > 0) {
            const shown = A.slice(0, Math.round(A.length * prog));
            ctx.save(); ctx.font = `400 12.5px ${FONT}`;
            const full = wrap(ctx, A, 214);
            const lines = wrap(ctx, shown, 214);
            const bh = full.length * 17.5 + 18;
            ctx.fillStyle = "#f1f3f4"; rr(ctx, x0 + 14, ty, 238, bh, 14); ctx.fill();
            ctx.fillStyle = C.ink; ctx.textBaseline = "top";
            lines.forEach((l, i) => ctx.fillText(l, x0 + 26, ty + 10 + i * 17.5));
            ctx.restore();
            // sources
            const sa = easeOut(seg(t, d + 3.5, d + 4));
            const sy = ty + bh + 20;
            text(ctx, "SOURCES", x0 + 16, sy, { font: `600 9.5px ${MONO}`, color: C.ink3, a: sa });
            let sx = x0 + 14;
            [["GMAO_2025.pdf", C.red], ["rapport_L3.docx", C.blue]].forEach(([s, col], i) => {
              const wv = pill(ctx, "▤ " + s, sx, sy + 20, col, seg(t, d + 3.6 + i * .15, d + 4 + i * .15), `500 10.5px ${MONO}`);
              sx += wv + 6;
            });
          }
        }
      }
    };
  }

  /* =======================================================
     Moteur
     ======================================================= */
  function createStage(canvas, opts = {}) {
    const ctx = canvas.getContext("2d");
    const scenes = [scene1(), scene2(), scene3()];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let idx = 0, t = 0, playing = !reduced, visible = true, last = 0, scale = 1, dpr = 1;
    if (reduced) t = scenes[0].end - 1.2;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      scale = canvas.width / W;
      render();
    }
    function stepInfo(sc, tt) {
      const bounds = [0, (T.a + T.b) / 2, (T.c + T.d) / 2, sc.end];
      let s = 0;
      for (let i = 0; i < 3; i++) if (tt >= bounds[i]) s = i;
      const p = clamp((tt - bounds[s]) / (bounds[s + 1] - bounds[s]));
      return { step: s, progress: p, bounds };
    }
    function render() {
      const sc = scenes[idx];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const fade = reduced ? 1 : Math.min(1, t / .35, (sc.end - t) / .35);
      ctx.globalAlpha = clamp(fade);
      sc.draw(ctx, t);
      ctx.globalAlpha = 1;
      opts.onFrame && opts.onFrame(idx, sc, stepInfo(sc, t));
    }
    function loop(now) {
      const dt = Math.min(.05, (now - last) / 1000 || 0);
      last = now;
      if (playing && visible) {
        t += dt;
        if (t >= scenes[idx].end) { idx = (idx + 1) % scenes.length; t = 0; opts.onScene && opts.onScene(idx, scenes[idx]); }
      }
      if (visible) render();
      requestAnimationFrame(loop);
    }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .05 }).observe(canvas);
    resize();
    requestAnimationFrame(n => { last = n; loop(n); });

    return {
      scenes,
      get playing() { return playing; },
      play() { playing = true; },
      pause() { playing = false; },
      toggle() { playing = !playing; return playing; },
      goto(i, step) {
        idx = i;
        const sc = scenes[idx];
        if (reduced) { t = sc.end - 1.2; }
        else if (step == null) t = .01;
        else t = [0.01, T.a + .1, T.c + .1][step];
        opts.onScene && opts.onScene(idx, sc);
        render();
      },
      get index() { return idx; }
    };
  }

  window.Stage = { create: createStage };
})();
