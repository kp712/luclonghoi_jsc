/* season.js: one clock for the whole app and the 12-month plan that starts from this month and from what is in the field now.
   - Clock: the real date, or the date being played in the year simulation (never saved, never used for writes).
   - Plan window: 12 months from this month. Months still taken by the crop in the field now come first ("R0", "S0", "U0":
     the first letter is the crop kind, so every colour and icon keeps working). After it, the chosen rotation follows.
     A rotation season that should have started while the field was still busy is sown late when there is room for a rice crop
     (3 months: rice takes 90–100 days, published duration in resources.json), otherwise the field waits for the next season.
   Read by dash.js (dashboard) and app.js (create-plan step 4). Plain functions, no DOM. */
const Season = (() => {
  const DAY = 864e5, WEEK = 7 * DAY;
  /* ---------------- clock ---------------- */
  let sim = null; const fns = [];
  const real = () => new Date();
  const now = () => (sim != null ? new Date(sim) : new Date());
  const simOn = () => sim != null;
  function set(d) { sim = d == null ? null : +d; fns.forEach((fn) => { try { fn(now()) } catch (e) { console.error(e) } }) }
  const on = (fn) => fns.push(fn);

  /* ---------------- dates ---------------- */
  const absOf = (d) => d.getFullYear() * 12 + d.getMonth();
  const yOf = (idx) => Math.floor(idx / 12), mOf = (idx) => ((idx % 12) + 12) % 12;
  const mStart = (idx) => new Date(yOf(idx), mOf(idx), 1);
  const mEnd = (idx) => new Date(yOf(idx), mOf(idx) + 1, 0);
  const days = (a, b) => Math.round((b - a) / DAY);

  /* ---------------- what is in the field now ----------------
     nw = { k: "R" | "S" | "U" | "-", weeks: weeks left until harvest when it was entered, at: time entered, choice: "keep" | "early" } */
  const RICE_DAYS = 95, RICE_MAX = 100;   /* middle and top of the published 90–100 days (resources.json rice.duration_days) */
  const RIPE_WEEKS = 4;          /* team rule: rice or an upland crop can only be cut early in its last 4 weeks */
  const LATE_MONTHS = 3;         /* a late rice season needs 3 free months (90–100 days) */
  const valid = (nw) => !!(nw && nw.k && ["R", "S", "U", "-"].includes(nw.k) && nw.at > 0);
  const growing = (nw) => valid(nw) && nw.k !== "-";
  /* can the farmer harvest early? shrimp: any time (smaller shrimp); rice / upland: only near ripeness */
  const earlyOk = (nw) => growing(nw) && nw.weeks >= 2 && (nw.k === "S" || nw.weeks <= RIPE_WEEKS);
  const earlyWeeks = (nw) => (nw.k === "S" ? 1 : Math.max(1, nw.weeks - 2));
  /* harvest date of the crop in the field now (keep, or early when allowed) */
  function harvestOf(nw, choice) {
    if (!growing(nw)) return null;
    const ch = choice || nw.choice, wk = ch === "early" && earlyOk(nw) ? earlyWeeks(nw) : nw.weeks;
    return new Date(nw.at + wk * WEEK);
  }
  /* end = the last month the field is busy with today's crop (absolute month index); free = nothing in the field */
  function endOf(nw, choice) {
    if (!valid(nw)) return null;
    if (nw.k === "-") return { idx: absOf(new Date(nw.at)) - 1, free: true, date: null };
    const d = harvestOf(nw, choice); return { idx: absOf(d), free: false, date: d };
  }

  /* ---------------- the 12-month window ---------------- */
  const baseAt = (card, idx) => card.months[mOf(idx)];
  const runStart = (card, idx) => { const c = baseAt(card, idx); let s = idx; for (let k = 0; k < 11 && baseAt(card, s - 1) === c; k++) s--; return s };
  const runEnd = (card, idx) => { const c = baseAt(card, idx); let e = idx; for (let k = 0; k < 11 && baseAt(card, e + 1) === c; k++) e++; return e };
  function cell(card, nw, end, idx) {
    if (end && !end.free && idx <= end.idx) return { code: nw.k + "0", src: "now" };
    const b = baseAt(card, idx);
    if (b === "-" || !end) return { code: b, src: "rot" };
    if (runStart(card, idx) > end.idx) return { code: b, src: "rot" };
    /* this season should have begun while the field was still busy (or was missed) */
    const free = runEnd(card, idx) - end.idx;
    if (b[0] === "R" && free >= LATE_MONTHS) return { code: b, src: "rot", late: true };
    return { code: "-", src: "wait", miss: b };
  }
  const NOWNAME = { R: { vi: "lúa đang trồng", en: "current rice crop" }, S: { vi: "tôm đang nuôi", en: "current shrimp" }, U: { vi: "cây màu đang trồng", en: "current upland crop" } };
  const NOWRES = { R: ["rice"], S: ["shrimp"], U: [] };
  /* a card-shaped object: months[] is indexed by calendar month (0 = January) like every rotation card, so the old code keeps
     working; pv[] / nx[] give the real previous / next month in time (the window does not wrap), cells[] is the window in order */
  function windowOf(card, nw, from, choice) {
    const a0 = absOf(from || real()), end = endOf(nw, choice);
    const at = (i) => ({ ...cell(card, nw, end, a0 + i), i, idx: a0 + i, y: yOf(a0 + i), m: mOf(a0 + i) });
    const cells = [...Array(12)].map((_, i) => at(i)), before = at(-1), after = at(12);
    const months = Array(12), pv = Array(12), nx = Array(12);
    cells.forEach((c, i) => { months[c.m] = c.code; pv[c.m] = (i ? cells[i - 1] : before).code; nx[c.m] = (i < 11 ? cells[i + 1] : after).code });
    const plan = { ...(card.plan || {}) };
    if (growing(nw)) plan[nw.k + "0"] = { name: NOWNAME[nw.k], res: NOWRES[nw.k] };
    const w = { ...card, months, pv, nx, plan, cells, before: before.code, after: after.code, a0, m0: mOf(a0), y0: yOf(a0), end, now: valid(nw) ? nw : null };
    w.runs = runsOf(card, w);
    return w;
  }
  /* crop seasons in the window with dates: sow (or stock) and harvest. Days are estimates from the month calendar
     (sow on the 1st of the first month, harvest at the end of the last), except the crop in the field now, whose harvest
     the farmer gave us. */
  function runsOf(card, w) {
    const out = [];
    w.cells.forEach((c, i) => {
      if (c.code === "-") return;
      const prev = i ? w.cells[i - 1].code : w.before;
      if (i && prev === c.code) { out[out.length - 1].to = i; return }
      out.push({ code: c.code, k: c.code[0], from: i, to: i, late: !!c.late, cur: c.src === "now", ongoing: !i && prev === c.code });
    });
    out.forEach((r) => {
      const fi = w.a0 + r.from, ti = w.a0 + r.to, last = r.to === 11 && w.after === r.code;
      if (r.cur) {
        r.har = w.end.date;
        r.sow = r.k === "R" ? new Date(+r.har - RICE_DAYS * DAY) : new Date(w.now.at);
        r.sowEst = true;
      } else {
        r.har = mEnd(last ? runEnd(card, ti) : ti);
        r.sow = mStart(r.ongoing ? runStart(card, fi) : fi);
        /* a rice season in the calendar spans whole months; the crop itself takes at most 100 days, so the first weeks are land preparation */
        if (r.k === "R" && days(r.sow, r.har) > RICE_MAX) { r.sow = new Date(+r.har - RICE_MAX * DAY); r.sow.setHours(0, 0, 0, 0) }
      }
      r.len = Math.max(1, days(r.sow, r.har));
    });
    return out;
  }
  /* where the field is on a date: the crop season it is in (with day counts) or the next one */
  function at(w, d) {
    const t = +d, r = w.runs.find((x) => t >= +x.sow && t <= +x.har + DAY - 1);
    if (r) return { run: r, day: Math.max(0, days(r.sow, d)), left: Math.max(0, days(d, r.har)), frac: Math.min(1, Math.max(0, (t - r.sow) / (r.har - r.sow || 1))) };
    const next = w.runs.find((x) => +x.sow > t);
    return { run: null, next, wait: next ? Math.max(0, days(d, next.sow)) : null };
  }
  /* rice steps from the published guide (resources.json rice.steps): days after sowing, and days before harvest */
  const RICE_MARKS = [{ k: "top1", d: 8 }, { k: "top2", d: 20 }, { k: "top3", d: 40 }, { k: "drain", back: 11 }];
  function marks(run) {
    if (run.k !== "R") return [];
    return RICE_MARKS.map((x) => ({ k: x.k, date: x.back ? new Date(+run.har - x.back * DAY) : new Date(+run.sow + x.d * DAY) })).filter((x) => +x.date > +run.sow && +x.date < +run.har);
  }
  /* range of the simulation: today to the end of 1, 2 or 3 plan years (12 months each, from this month) */
  function span(years) {
    const y = Math.max(1, Math.min(3, years || 1)), a = real(); a.setHours(12, 0, 0, 0);
    const b = mEnd(absOf(real()) + 12 * y - 1); b.setHours(12, 0, 0, 0);
    return { from: a, to: b, years: y, weeks: Math.max(1, Math.floor((b - a) / WEEK)) };
  }
  /* which plan year (0, 1, 2) a date falls in, counted from this month */
  const yearOf = (d) => Math.max(0, Math.floor((absOf(d || now()) - absOf(real())) / 12));
  /* weeks left now for a crop entered earlier */
  const weeksLeft = (nw, d) => (growing(nw) ? Math.max(0, Math.round((+harvestOf(nw, "keep") - +(d || real())) / WEEK)) : null);

  return { real, now, set, on, simOn, absOf, mStart, mEnd, days, DAY, WEEK, valid, growing, earlyOk, earlyWeeks, harvestOf, endOf, windowOf, at, marks, span, yearOf, weeksLeft, RIPE_WEEKS, RICE_DAYS, LATE_MONTHS };
})();
