// Bench: cost and time of the 8 training episodes a grid-world agent needs (verified on the ML planet), run in the real world vs. in simulation.
export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Training in the world, or training in a copy of it" });
  const say = live(body);
  const EPISODES = 8, REAL_COST = 40, REAL_MIN = 5, SIM_SEC = 0.01;
  let episode = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Cumulative real-world cost by episode" });
  const st = stats([["cost", "real-world cost so far"], ["simtime", "simulated time so far"]]);
  body.append(cv.box, st.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (EPISODES + 1);
    for (let i = 1; i <= EPISODES; i++) {
      const bh = (i * REAL_COST / (EPISODES * REAL_COST)) * (hh - 30);
      ctx.fillStyle = i <= episode ? p.warm : p.soft;
      ctx.fillRect(bw * i, hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`ep ${i}`, bw * i + bw * 0.3, hh - 2);
    }
  });

  function update() {
    st.set("cost", `$${episode * REAL_COST} (real) / $0 (sim)`);
    st.set("simtime", `${episode * REAL_MIN} min (real) / ${(episode * SIM_SEC).toFixed(2)} s (sim)`);
    say(`after ${episode} episodes: real world $${episode * REAL_COST} and ${episode * REAL_MIN} minutes, simulation effectively free and ${(episode * SIM_SEC).toFixed(2)} seconds`);
    cv.redraw();
  }
  const sp = stepper({
    stepLabel: "Run one more training episode",
    onStep: () => { if (episode >= EPISODES) return false; episode++; update(); return episode < EPISODES; },
    onReset: () => { episode = 0; update(); },
  });
  body.append(sp.el);
  update();
  return () => cv.destroy();
}
