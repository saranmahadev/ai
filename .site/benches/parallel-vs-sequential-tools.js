// Bench: compare total latency for independent tool calls run in parallel versus a dependent chain that can only run sequentially.
import { sequentialTotal, parallelTotal } from "./agentkit.js";

const INDEPENDENT = { search_flights: 800, check_weather: 300, get_exchange_rate: 150 };
const DEPENDENT = { search_flights: 800, book_flight: 400, send_confirmation: 200 };

export default function mount(root, kit) {
  const { frame, h, choice, canvas, stats, live } = kit;
  const body = frame(root, { title: "Run them together, or one after another" });
  const say = live(body);
  let mode = "independent";

  const cv = canvas(body, { aspect: 0.45, label: "Total latency by arrangement" });
  const st = stats([["seq", "sequential total"], ["par", "achievable in parallel"]]);
  const ch = choice("Calls", [["independent", "independent (no shared data)"], ["dependent", "dependent chain"]], mode, (v) => { mode = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function calls() { return mode === "independent" ? INDEPENDENT : DEPENDENT; }
  cv.onDraw((ctx, w, hh, p) => {
    const vals = Object.values(calls());
    const seq = sequentialTotal(vals);
    const par = mode === "independent" ? parallelTotal(vals) : seq;
    const maxV = seq;
    const bw = w / 3;
    [["sequential", seq, p.warm], [mode === "independent" ? "parallel" : "sequential only", par, p.accent]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${v}ms`, bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    const vals = Object.values(calls());
    const seq = sequentialTotal(vals);
    const par = mode === "independent" ? parallelTotal(vals) : seq;
    st.set("seq", `${seq}ms`);
    st.set("par", mode === "independent" ? `${par}ms` : "not possible — each step needs the previous one's result");
    say(`${mode === "independent" ? "independent calls" : "dependent chain"}: sequential ${seq} milliseconds${mode === "independent" ? `, parallel ${par} milliseconds` : ", parallel not possible"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
