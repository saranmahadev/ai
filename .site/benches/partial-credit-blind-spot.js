// Bench: two agents share the identical success rate but very different average partial credit.
import { partialCreditStats } from "./agentkit.js";

const AGENT_A = [{ credit: 1 }, { credit: 1 }, { credit: 0.1 }, { credit: 0.1 }, { credit: 0.1 }];
const AGENT_B = [{ credit: 1 }, { credit: 1 }, { credit: 0.9 }, { credit: 0.9 }, { credit: 0.9 }];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Same success rate, very different near-misses" });
  const say = live(body);
  let agent = "A";

  const cv = canvas(body, { aspect: 0.45, label: "Credit earned on each of 5 runs" });
  const st = stats([["rate", "success rate"], ["avg", "average credit"]]);
  const ch = choice("Agent", [["A", "Agent A"], ["B", "Agent B"]], agent, (v) => { agent = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const runs = agent === "A" ? AGENT_A : AGENT_B;
    const bw = w / runs.length;
    runs.forEach((r, i) => {
      const bh = r.credit * (hh - 24);
      ctx.fillStyle = r.credit >= 1 ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.2), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`run ${i + 1}`, bw * (i + 0.2) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const r = partialCreditStats(agent === "A" ? AGENT_A : AGENT_B);
    st.set("rate", `${(r.successRate * 100).toFixed(0)}%`);
    st.set("avg", `${(r.avgCredit * 100).toFixed(0)}%`);
    say(`agent ${agent}: success rate ${(r.successRate * 100).toFixed(0)} percent, average credit ${(r.avgCredit * 100).toFixed(0)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
