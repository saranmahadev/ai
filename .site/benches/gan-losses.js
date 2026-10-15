// Bench: discriminator and generator losses as D(real) and D(fake) change.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "The forger and the detective's two losses" });
  const say = live(body);
  let dReal = 0.9, dFake = 0.3;

  const cv = canvas(body, { aspect: 0.45, label: "Discriminator loss and generator loss as bars" });
  const st = stats([["disc", "discriminator loss"], ["gen", "generator loss"]]);
  const s1 = slider({ label: "D(real)", min: 0.01, max: 0.99, step: 0.01, value: dReal, format: (v) => v.toFixed(2), onInput: (v) => { dReal = v; update(); } });
  const s2 = slider({ label: "D(fake)", min: 0.01, max: 0.99, step: 0.01, value: dFake, format: (v) => v.toFixed(2), onInput: (v) => { dFake = v; update(); } });
  body.append(cv.box, st.el, s1.el, s2.el);

  function compute() {
    const discLoss = -(Math.log(dReal) + Math.log(1 - dFake));
    const genLoss = -Math.log(dFake);
    return { discLoss, genLoss };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { discLoss, genLoss } = compute();
    const maxV = Math.max(discLoss, genLoss, 1) * 1.2;
    const bars = [["discriminator", discLoss, p.accent], ["generator", genLoss, p.warm]];
    const bw = w / 4;
    bars.forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 36);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 4);
      ctx.fillText(v.toFixed(3), bw * (i + 1), hh - 24 - bh);
    });
  });

  function update() {
    const { discLoss, genLoss } = compute();
    st.set("disc", discLoss.toFixed(4));
    st.set("gen", genLoss.toFixed(4));
    say(`discriminator loss ${discLoss.toFixed(3)}, generator loss ${genLoss.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
