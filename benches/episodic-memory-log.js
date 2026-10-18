// Bench: compare total attempts spent on a recurring task with and without an episodic memory log.
import { recurringTaskAttempts } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Rediscovering what works, or recalling it" });
  const say = live(body);
  let instances = 5, useLog = false;

  const cv = canvas(body, { aspect: 0.4, label: "Attempts spent on each instance of the recurring task" });
  const st = stats([["total", "total attempts across all instances"]]);
  const sN = slider({ label: "Instances of the task", min: 2, max: 8, step: 1, value: instances, onInput: (v) => { instances = v; update(); } });
  const ch = choice("Memory", [["off", "no episodic log"], ["on", "logs each outcome"]], useLog ? "on" : "off", (v) => { useLog = v === "on"; update(); });
  body.append(cv.box, st.el, sN.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / instances;
    for (let i = 1; i <= instances; i++) {
      const attempts = useLog && i > 1 ? 1 : 2;
      const bh = (attempts / 2) * (hh - 34);
      ctx.fillStyle = attempts === 1 ? p.good : p.warm;
      ctx.fillRect(bw * (i - 1) + bw * 0.15, hh - 18 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`#${i}`, bw * (i - 1) + bw * 0.5, hh - 4);
      ctx.fillText(`${attempts}`, bw * (i - 1) + bw * 0.5, hh - 20 - bh);
    }
  });

  function update() {
    const total = recurringTaskAttempts(instances, useLog);
    st.set("total", String(total));
    say(`${useLog ? "with an episodic log" : "without an episodic log"}: ${total} total attempts across ${instances} instances of the task`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
