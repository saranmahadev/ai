// Bench: compare one structured tool call per item against one code call that loops over all of them.
import { structuredCalls, codeInterfaceCalls } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One call per item, or one loop" });
  const say = live(body);
  let n = 10;

  const cv = canvas(body, { aspect: 0.45, label: "Total tool calls by interface" });
  const st = stats([["structured", "structured tool calls"], ["code", "code-as-tool calls"]]);
  const sl = slider({ label: "Items to process", min: 1, max: 200, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const s = structuredCalls(n), c = codeInterfaceCalls();
    const maxV = Math.max(s, c);
    const bw = w / 3;
    [["structured (one per item)", s, p.warm], ["code (one loop)", c, p.accent]].forEach(([label, v, color], i) => {
      const bh = Math.max(2, (v / maxV) * (hh - 40));
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(v), bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    st.set("structured", String(structuredCalls(n)));
    st.set("code", String(codeInterfaceCalls()));
    say(`${n} items: structured calls ${structuredCalls(n)}, code-as-tool calls ${codeInterfaceCalls()}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
