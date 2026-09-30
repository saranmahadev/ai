// Bench: a grid-world agent stepped through perceive, decide, act.
export default function mount(root, kit) {
  const { h, frame, canvas, stepper, slider, toggles, button, rng, stats, live } = kit;
  const body = frame(root, {
    title: "The perceive – decide – act loop"
  });
  const say = live(body);
  const ROWS = 7, COLS = 10;
  const WALL = new Set([1, 2, 3, 4, 5].map((r) => r + ",5")); // a wall across the middle with gaps at the top and bottom rows ("row,col")
  const wallAt = (r, c) => r < 0 || c < 0 || r >= ROWS || c >= COLS || WALL.has(r + "," + c);
  const START = [3, 2], GOAL = [3, 8];
  let noise = 0, memory = true, seed = 1, R, pos, phase, percept, choice, visits, loops, bumps, done;

  const noiseS = slider({ label: "sensor noise (chance a sensed cell is misread)", min: 0, max: 60, step: 5, value: 0, format: (v) => v + "%", onInput: (v) => { noise = v / 100; reset(); } });
  const mem = toggles([["mem", "Remember where it has been", true]], (v) => { memory = v.mem; reset(); });
  const cv = canvas(body, { aspect: 0.7, label: "Grid world: the agent looks for the goal around a wall" });
  const st = stats([["phase", "next phase"], ["loops", "loops completed"], ["bumps", "bumps into walls"], ["state", "status"]]);
  const log = h("p", { class: "bench-verdict" });
  const s = stepper({ onStep: step, onReset: () => reset(), interval: 700 });
  const again = button("New run with different noise", () => { seed++; reset(); });
  body.append(cv.box, st.el, log, s.el, h("div", { class: "bench-controls" }, noiseS.el, mem.el), h("div", { class: "bench-row" }, again));

  const DIRS = [["up", -1, 0], ["down", 1, 0], ["left", 0, -1], ["right", 0, 1]];
  function reset() {
    R = rng(seed * 101 + Math.round(noise * 100));
    pos = START.slice(); phase = "perceive"; percept = null; choice = null; visits = { [pos.join(",")]: 1 }; loops = 0; bumps = 0; done = false;
    log.textContent = "Ready"; refresh();
  }
  function step() {
    if (done) return false;
    if (phase === "perceive") {
      percept = DIRS.map(([n, dr, dc]) => { const r = pos[0] + dr, c = pos[1] + dc, real = wallAt(r, c); return { n, r, c, real, seen: R.chance(noise) ? !real : real }; });
      const wrong = percept.filter((p) => p.seen !== p.real).length;
      log.textContent = `Perceive: 4 neighbours sensed${wrong ? `, ${wrong} misread` : ""}`; phase = "decide";
    } else if (phase === "decide") {
      const free = percept.filter((p) => !p.seen);
      const score = (p) => Math.abs(p.r - GOAL[0]) + Math.abs(p.c - GOAL[1]) + (memory ? 3 * (visits[p.r + "," + p.c] || 0) : 0) + R() * 0.01;
      choice = free.length ? free.reduce((a, b) => (score(b) < score(a) ? b : a)) : null;
      log.textContent = choice ? `Decide: move ${choice.n}` : "Decide: wait"; phase = "act";
    } else {
      if (choice) {
        if (wallAt(choice.r, choice.c)) { bumps++; log.textContent = `Act: bumped a wall going ${choice.n}`; }
        else { pos = [choice.r, choice.c]; visits[pos.join(",")] = (visits[pos.join(",")] || 0) + 1; log.textContent = `Act: moved ${choice.n}`; }
      } else log.textContent = "Act: waited";
      loops++; phase = "perceive"; percept = null;
      if (pos[0] === GOAL[0] && pos[1] === GOAL[1]) { done = true; log.textContent += ` · goal reached in ${loops} loops`; }
      else if (loops >= 60) { done = true; log.textContent += " · gave up after 60 loops"; }
    }
    say(log.textContent); refresh(); return !done;
  }
  cv.onDraw((ctx, W, H, p) => {
    const cell = Math.min(W / COLS, H / ROWS), ox = (W - cell * COLS) / 2, oy = (H - cell * ROWS) / 2;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = wallAt(r, c) ? p.muted : (visits[r + "," + c] ? p.soft : p.white);
      ctx.beginPath(); ctx.roundRect(ox + c * cell + 2, oy + r * cell + 2, cell - 4, cell - 4, 8); ctx.fill();
    }
    if (percept) for (const q of percept) {
      if (q.r < 0 || q.c < 0 || q.r >= ROWS || q.c >= COLS) continue;
      ctx.strokeStyle = q.seen !== q.real ? p.warm : p.accent; ctx.lineWidth = 3; ctx.setLineDash(q.seen ? [4, 4] : []);
      ctx.beginPath(); ctx.roundRect(ox + q.c * cell + 3, oy + q.r * cell + 3, cell - 6, cell - 6, 8); ctx.stroke(); ctx.setLineDash([]);
    }
    if (choice && phase === "act") { ctx.strokeStyle = p.good; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(ox + choice.c * cell + 4, oy + choice.r * cell + 4, cell - 8, cell - 8, 8); ctx.stroke(); }
    ctx.fillStyle = p.good; ctx.beginPath(); ctx.arc(ox + GOAL[1] * cell + cell / 2, oy + GOAL[0] * cell + cell / 2, cell * 0.28, 0, 7); ctx.fill();
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(ox + pos[1] * cell + cell / 2, oy + pos[0] * cell + cell / 2, cell * 0.3, 0, 7); ctx.fill();
    ctx.fillStyle = p.white; ctx.beginPath(); ctx.arc(ox + pos[1] * cell + cell / 2 - 4, oy + pos[0] * cell + cell / 2 - 4, cell * 0.07, 0, 7); ctx.arc(ox + pos[1] * cell + cell / 2 + 4, oy + pos[0] * cell + cell / 2 - 4, cell * 0.07, 0, 7); ctx.fill();
  });
  function refresh() {
    st.set("phase", done ? "—" : phase); st.set("loops", String(loops)); st.set("bumps", String(bumps));
    st.set("state", done ? (pos[0] === GOAL[0] && pos[1] === GOAL[1] ? "goal reached" : "gave up") : "running");
    cv.redraw();
  }
  reset();
  return () => { s.stop(); cv.destroy(); };
}
