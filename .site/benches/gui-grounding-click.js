// Bench: the same pixel click-error offset lands inside a big target but misses a small one.
import { clickHit } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "The same pixel error, two target sizes" });
  const say = live(body);
  let dx = 12, dy = 9;
  const button = { name: "Submit button", halfW: 60, halfH: 20 };
  const icon = { name: "Close icon", halfW: 8, halfH: 8 };

  const cv = canvas(body, { aspect: 0.55, label: "Predicted click vs. each target's box" });
  const st = stats([["button", "button: predicted click"], ["icon", "icon: predicted click"]]);
  const sx = slider({ label: "Click error, x (px)", min: 0, max: 30, step: 1, value: dx, onInput: (v) => { dx = v; update(); } });
  const sy = slider({ label: "Click error, y (px)", min: 0, max: 30, step: 1, value: dy, onInput: (v) => { dy = v; update(); } });
  body.append(cv.box, st.el, sx.el, sy.el);

  function draw(ctx, cx, cy, half, hit, p, label) {
    ctx.strokeStyle = hit ? p.accent : p.warm;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - half.w, cy - half.h, half.w * 2, half.h * 2);
    ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(label, cx, cy - half.h - 8);
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = p.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2);
    ctx.fillStyle = hit ? p.accent : p.warm; ctx.fill();
  }
  cv.onDraw((ctx, w, hh, p) => {
    draw(ctx, w * 0.3, hh * 0.5, { w: button.halfW, h: button.halfH }, clickHit(button.halfW, button.halfH, dx, dy), p, button.name);
    draw(ctx, w * 0.75, hh * 0.5, { w: icon.halfW, h: icon.halfH }, clickHit(icon.halfW, icon.halfH, dx, dy), p, icon.name);
  });

  function update() {
    const hitButton = clickHit(button.halfW, button.halfH, dx, dy);
    const hitIcon = clickHit(icon.halfW, icon.halfH, dx, dy);
    const dist = Math.sqrt(dx * dx + dy * dy).toFixed(1);
    st.set("button", hitButton ? "hit" : "miss");
    st.set("icon", hitIcon ? "hit" : "miss");
    say(`click error distance ${dist} pixels: button ${hitButton ? "hit" : "miss"}, icon ${hitIcon ? "hit" : "miss"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
