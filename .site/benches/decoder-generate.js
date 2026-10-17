// Bench: step through autoregressive generation, showing exactly which positions are visible at each step.
const N = 5;

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Generating one token, with only what came before" });
  const say = live(body);
  let step;

  function reset() { step = 0; }
  reset();

  const cv = canvas(body, { aspect: 0.4, label: "Generated and visible positions at the current step" });
  const st = stats([["step", "generating position"], ["visible", "visible context size"]]);
  const sp = stepper({
    stepLabel: "Generate next token",
    onStep: () => { step++; draw(); return step < N; },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / N;
    for (let i = 0; i < N; i++) {
      const generating = i === step;
      const visible = i < step;
      ctx.fillStyle = generating ? p.warm : visible ? p.good : p.soft;
      ctx.fillRect(bw * i + 2, hh / 2 - 20, bw - 4, 40);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`pos ${i}`, bw * i + bw / 2, hh / 2 + 6);
    }
  });

  function draw() {
    st.set("step", step < N ? `position ${step}` : "done");
    st.set("visible", String(step));
    say(step < N ? `generating position ${step}, ${step} positions visible` : "generation complete");
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
