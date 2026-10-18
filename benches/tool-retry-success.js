// Bench: step through retries of a transient vs. a permanent tool error and watch cumulative success probability.
import { successWithinNTries } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, choice, stepper, stats, live } = kit;
  const body = frame(root, { title: "Retrying a flaky call, or a broken one" });
  const say = live(body);
  let kind = "transient", tries = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Cumulative success probability by try" });
  const st = stats([["prob", "success probability so far"]]);
  const ch = choice("Error type", [["transient", "transient (70% success per try)"], ["permanent", "permanent (malformed request)"]], kind, (v) => { kind = v; reset(); });
  body.append(cv.box, st.el, ch.el);

  function p() { return kind === "transient" ? 0.7 : 0; }
  cv.onDraw((ctx, w, hh, pal) => {
    const bw = w / 5;
    for (let n = 1; n <= 4; n++) {
      const v = successWithinNTries(p(), n);
      const bh = v * (hh - 30);
      ctx.fillStyle = n === tries ? pal.accent : pal.soft;
      ctx.fillRect(bw * n, hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = pal.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`try ${n}`, bw * n + bw * 0.3, hh - 2);
    }
  });

  function update() {
    const v = tries === 0 ? 0 : successWithinNTries(p(), tries);
    st.set("prob", `${(v * 100).toFixed(2)}%`);
    say(`after ${tries} tries: ${(v * 100).toFixed(2)} percent cumulative success probability`);
    cv.redraw();
  }
  const sp = stepper({
    stepLabel: "Retry",
    onStep: () => { if (tries >= 4) return false; tries++; update(); return tries < 4; },
    onReset: () => reset(),
  });
  function reset() { tries = 0; update(); }
  body.append(sp.el);
  update();
  return () => cv.destroy();
}
