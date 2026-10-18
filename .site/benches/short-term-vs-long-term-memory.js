// Bench: compare how many times a fact must be restated across sessions with and without persistent memory.
import { redundantAsks } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Restating a fact, or remembering it" });
  const say = live(body);
  let sessions = 4, persistent = false;

  const cv = canvas(body, { aspect: 0.4, label: "Does the agent ask again, session by session?" });
  const st = stats([["asks", "times the fact is restated"]]);
  const sSess = slider({ label: "Sessions", min: 2, max: 8, step: 1, value: sessions, onInput: (v) => { sessions = v; update(); } });
  const ch = choice("Memory", [["off", "short-term only (nothing persists)"], ["on", "long-term (persists across sessions)"]], persistent ? "on" : "off", (v) => { persistent = v === "on"; update(); });
  body.append(cv.box, st.el, sSess.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / sessions;
    for (let s = 1; s <= sessions; s++) {
      const asked = persistent ? s === 1 : true;
      const bh = asked ? hh - 34 : (hh - 34) * 0.25;
      ctx.fillStyle = asked ? p.warm : p.good;
      ctx.fillRect(bw * (s - 1) + bw * 0.15, hh - 18 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`session ${s}`, bw * (s - 1) + bw * 0.5, hh - 4);
      ctx.fillText(asked ? "asks again" : "remembered", bw * (s - 1) + bw * 0.5, hh - 20 - bh);
    }
  });

  function update() {
    const asks = redundantAsks(sessions, persistent);
    st.set("asks", String(asks));
    say(`${persistent ? "long-term memory" : "short-term only"}: the fact is restated ${asks} time${asks === 1 ? "" : "s"} across ${sessions} sessions`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
