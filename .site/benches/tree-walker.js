// Bench: search a balanced binary tree, one comparison per level.
import { dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, stepper, canvas, stats, live } = kit;
  const body = frame(root, { title: "Walk down a search tree" });
  const say = live(body);
  let depth = 3, target = 11, path = [], step = 0;
  const N = () => 2 ** (depth + 1) - 1;
  const sd = slider({ label: "tree depth", min: 1, max: 5, step: 1, value: depth, onInput: (v) => { depth = v; target = Math.min(target, N()); st2.input.max = N(); reset(); } });
  const st2 = slider({ label: "value to find", min: 1, max: N(), step: 1, value: target, onInput: (v) => { target = v; reset(); } });
  const cv = canvas(body, { aspect: 0.6, label: "A binary search tree with the search path highlighted" });
  const st = stats([["n", "items in the tree"], ["s", "comparisons so far"], ["m", "at most (depth + 1)"], ["msg", "at this node"]]);
  const stp = stepper({ interval: 700, stepLabel: "Compare", onStep: () => { if (step >= path.length) return false; step++; update(); if (step >= path.length) return false; }, onReset: reset });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sd.el, st2.el), stp.el);
  const nodePos = (v, w, hh) => { let lo = 1, hi = N(), d = 0; while (true) { const mid = Math.floor((lo + hi) / 2); if (mid === v) return { x: 14 + ((v - 0.5) / N()) * (w - 28), y: 20 + d * ((hh - 40) / depth) }; if (v < mid) hi = mid - 1; else lo = mid + 1; d++; } };
  const route = (t) => { let lo = 1, hi = N(), out = []; while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); out.push(mid); if (mid === t) break; if (t < mid) hi = mid - 1; else lo = mid + 1; } return out; };
  function reset() { path = route(target); step = 0; update(); }
  cv.onDraw((ctx, w, hh, p) => {
    const seen = new Set(path.slice(0, step));
    const kids = (lo, hi, parent) => { if (lo > hi) return; const mid = Math.floor((lo + hi) / 2), a = nodePos(mid, w, hh); if (parent) { ctx.strokeStyle = seen.has(mid) ? p.warm : p.soft2; ctx.lineWidth = seen.has(mid) ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(parent.x, parent.y); ctx.lineTo(a.x, a.y); ctx.stroke(); } kids(lo, mid - 1, a); kids(mid + 1, hi, a); };
    kids(1, N(), null);
    const r = Math.max(5, Math.min(13, (w - 28) / N() / 1.6));
    for (let v = 1; v <= N(); v++) { const a = nodePos(v, w, hh); dot(ctx, a.x, a.y, r, v === target ? p.good : seen.has(v) ? p.warm : p.accent); if (r > 8) { ctx.fillStyle = p.white; ctx.font = `800 ${Math.round(r * 0.9)}px Nunito, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.fillText(String(v), a.x, a.y + r * 0.32); } }
  });
  function update() { const cur = path[step - 1]; st.set("n", String(N())); st.set("s", String(step)); st.set("m", String(depth + 1)); st.set("msg", step === 0 ? "start at the root" : cur === target ? `${cur}: found it` : `${cur}: ${target < cur ? `${target} is smaller, go left` : `${target} is larger, go right`}`); say(step ? `Compared with ${cur}` : "Reset"); cv.redraw(); }
  reset();
  return () => { stp.stop(); cv.destroy(); };
}
