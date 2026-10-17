// Bench: compare the energy and carbon cost of one inference request against full model training.
import { computeCost } from "./gakit.js";

const PARAMS = 7e9;
const GPU_FLOPS_PER_SEC = 300e12, GPU_POWER_KW = 0.4, CARBON_INTENSITY = 0.4;

export default function mount(root, kit) {
  const { frame, slider, stats, live } = kit;
  const body = frame(root, { title: "One request vs. the whole training run" });
  const say = live(body);
  let tokens = 1000;

  const st = stats([["inferWh", "this request's energy"], ["trainKwh", "full training's energy"], ["ratio", "training ÷ this request"]]);
  const sl = slider({ label: "tokens generated", min: 100, max: 5000, step: 100, value: tokens, format: (v) => String(v), onInput: (v) => { tokens = v; update(); } });
  body.append(st.el, sl.el);

  function update() {
    const inferFlops = tokens * 2 * PARAMS;
    const trainFlops = 1e12 * 6 * PARAMS;
    const infer = computeCost(inferFlops, { gpuFlopsPerSec: GPU_FLOPS_PER_SEC, gpuPowerKw: GPU_POWER_KW, carbonIntensity: CARBON_INTENSITY });
    const train = computeCost(trainFlops, { gpuFlopsPerSec: GPU_FLOPS_PER_SEC, gpuPowerKw: GPU_POWER_KW, carbonIntensity: CARBON_INTENSITY });
    st.set("inferWh", `${(infer.energyKWh * 1000).toFixed(4)} Wh`);
    st.set("trainKwh", `${train.energyKWh.toFixed(1)} kWh`);
    st.set("ratio", (train.energyKWh / infer.energyKWh).toExponential(2));
    say(`${tokens} tokens: ${(infer.energyKWh * 1000).toFixed(4)} watt-hours, versus ${train.energyKWh.toFixed(1)} kilowatt-hours for the full training run`);
  }
  update();
  return () => {};
}
