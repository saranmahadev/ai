// Bench: planning in a blocks world. Actions have preconditions and effects; a planner searches for the shortest plan.
export default function mount(root, kit) {
  const { h, frame, canvas, stepper, button, stats, live } = kit;
  const body = frame(root, {
    title: "Planning: a sequence of moves to a goal"
  });
  const say = live(body);
  const B = ["A", "B", "C", "D"];
  const START = { A: "table", B: "A", C: "table", D: "C" }; // block -> what it sits on
  const GOAL = { A: "B", B: "C", C: "D", D: "table" };
  let st, moves, plan, planIdx, searched;
  const key = (s) => B.map((b) => s[b]).join(",");
  const clear = (s, b) => !B.some((o) => s[o] === b);
  const legal = (s) => { const out = []; for (const b of B) if (clear(s, b)) { if (s[b] !== "table") out.push([b, "table"]); for (const t of B) if (t !== b && clear(s, t) && s[b] !== t) out.push([b, t]); } return out; };
  const apply = (s, [b, t]) => ({ ...s, [b]: t });
  const isGoal = (s) => B.every((b) => s[b] === GOAL[b]);
  function solve(s) {
    const q = [[s, []]], seen = new Set([key(s)]); let n = 0;
    while (q.length) { const [cur, path] = q.shift(); n++; if (isGoal(cur)) return { path, n }; for (const m of legal(cur)) { const nx = apply(cur, m), k = key(nx); if (!seen.has(k)) { seen.add(k); q.push([nx, [...path, m]]); } } }
    return { path: null, n };
  }
  const cv = canvas(body, { aspect: 0.4, label: "Four blocks stacked on a table" });
  const info = stats([["moves", "moves so far"], ["short", "shortest plan from here"], ["searched", "states the planner examined"]]);
  const out = h("p", { class: "bench-verdict" });
  const list = h("div", { class: "bench-row" });
  const stp = stepper({ onStep: () => { if (plan && planIdx < plan.length) { do1(plan[planIdx++]); return planIdx < plan.length; } return false; }, onReset: reset, interval: 700, stepLabel: "Next planned move" });
  const solveBtn = button("Plan from here", () => { const r = solve(st); plan = r.path; planIdx = 0; searched = r.n; out.textContent = plan ? "Plan: " + plan.map((m) => `${m[0]} → ${m[1]}`).join(", ") : "No plan exists."; refresh(); });
  body.append(cv.box, info.el, out, h("b", {}, "Legal moves"), list, h("div", { class: "bench-row" }, solveBtn), stp.el);

  function do1(m) { st = apply(st, m); moves++; refresh(); }
  function reset() { st = { ...START }; moves = 0; plan = null; planIdx = 0; searched = 0; out.textContent = ""; refresh(); }
  function stacks() { const bottoms = B.filter((b) => st[b] === "table"), res = []; for (const b0 of bottoms) { const stack = [b0]; let cur = b0, nxt; while ((nxt = B.find((o) => st[o] === cur))) { stack.push(nxt); cur = nxt; } res.push(stack); } return res; }
  cv.onDraw((ctx, W, H, p) => {
    const bw = Math.min(70, W / 8), bh = Math.min(44, H / 5.5), base = H - 26;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, base); ctx.lineTo(W - 8, base); ctx.stroke();
    ctx.font = "900 18px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    stacks().forEach((stack, i, all) => stack.forEach((b, j) => {
      const x = W / 2 + (i - (all.length - 1) / 2) * (bw + 26) - bw / 2, y = base - (j + 1) * bh;
      const ok = st[b] === GOAL[b] && (j === 0 ? GOAL[b] === "table" : true);
      ctx.fillStyle = ok && isGoal(st) ? p.good : p.accent; ctx.beginPath(); ctx.roundRect(x, y + 2, bw, bh - 4, 8); ctx.fill();
      ctx.fillStyle = p.white; ctx.fillText(b, x + bw / 2, y + bh / 2);
    }));
  });
  function refresh() {
    list.textContent = "";
    if (isGoal(st)) list.append(h("span", { class: "bench-line" }, "The goal is reached."));
    else for (const m of legal(st)) list.append(button(`Move ${m[0]} ${m[1] === "table" ? "to the table" : "onto " + m[1]}`, () => { plan = null; do1(m); out.textContent = ""; }));
    const r = solve(st);
    info.set("moves", String(moves)); info.set("short", r.path ? String(r.path.length) : "—"); info.set("searched", searched ? String(searched) : "—");
    if (isGoal(st)) out.textContent = `Goal reached in ${moves} move${moves === 1 ? "" : "s"}`;
    say(out.textContent); cv.redraw();
  }
  reset();
  return () => { stp.stop(); cv.destroy(); };
}
