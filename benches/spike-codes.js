// Bench: the same LIF spike train read two ways — firing rate over a window, and first-spike latency.
import { lifStep } from "./nnkit.js";

const WINDOW = 16;
const LEAK = 0.1, THRESHOLD = 1;

function simulate(input) {
  let v = 0;
  const spikeTimes = [];
  for (let t = 1; t <= WINDOW; t++) {
    const r = lifStep(v, input, { leak: LEAK, threshold: THRESHOLD });
    v = r.v;
    if (r.spiked) spikeTimes.push(t);
  }
  return spikeTimes;
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Reading the same spikes two ways" });
  const say = live(body);
  let input = 0.3;

  const cv = canvas(body, { aspect: 0.4, label: "Spike train over the counting window, first spike marked" });
  const st = stats([["rate", "firing rate"], ["latency", "first-spike latency"], ["count", "spike count"]]);
  const sl = slider({ label: "input current", min: 0, max: 0.9, step: 0.05, value: input, format: (v) => v.toFixed(2), onInput: (v) => { input = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let spikes = [];
  cv.onDraw((ctx, w, hh, p) => {
    const x = (t) => 20 + ((t - 1) / (WINDOW - 1)) * (w - 40);
    ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(20, hh / 2); ctx.lineTo(w - 20, hh / 2); ctx.stroke();
    spikes.forEach((t, i) => {
      ctx.strokeStyle = i === 0 ? p.good : p.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x(t), hh / 2 - 24); ctx.lineTo(x(t), hh / 2 + 24); ctx.stroke();
    });
    ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`${WINDOW}-step counting window`, w / 2, hh - 8);
  });

  function update() {
    spikes = simulate(input);
    const rate = spikes.length / WINDOW;
    st.set("rate", rate.toFixed(3));
    st.set("latency", spikes.length ? String(spikes[0]) : "no spike");
    st.set("count", String(spikes.length));
    say(`input ${input.toFixed(2)}: rate ${rate.toFixed(2)}, first-spike latency ${spikes.length ? spikes[0] : "none"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
