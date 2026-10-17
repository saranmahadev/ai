// Bench: complete a prompt by copying whatever token followed the same token earlier in it.
import { inductionComplete } from "./gakit.js";

const PROMPTS = [
  { tokens: ["dog", "bark", "cat", "meow", "bird", "chirp", "dog"], label: "dog · bark · cat · meow · bird · chirp · dog → ?" },
  { tokens: ["red", "stop", "green", "go", "red"], label: "red · stop · green · go · red → ?" },
  { tokens: ["fox"], label: "fox → ? (never seen before)" },
];

export default function mount(root, kit) {
  const { frame, choice, stats, live } = kit;
  const body = frame(root, { title: "Completing by copying, not by knowing" });
  const say = live(body);
  let idx = 0;

  const st = stats([["prompt", "prompt"], ["completion", "completion"]]);
  const ch = choice("Prompt", PROMPTS.map((p, i) => [String(i), p.label]), "0", (v) => { idx = +v; update(); });
  body.append(st.el, ch.el);

  function update() {
    const { tokens, label } = PROMPTS[idx];
    const completion = inductionComplete(tokens);
    st.set("prompt", label);
    st.set("completion", completion === null ? "no earlier match — no completion" : completion);
    say(`prompt ${label}: ${completion === null ? "no earlier occurrence found" : `completes with ${completion}`}`);
  }
  update();
  return () => {};
}
