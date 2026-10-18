// Bench: compare tokenizer fertility (tokens per word) between the vocabulary's own language and an underrepresented one.
import { bpeTrain, bpeApply } from "./tfkit.js";

const CORPUS = { the: 50, quick: 10, brown: 8, fox: 12, jumps: 6, over: 15, lazy: 7, dog: 9, running: 5, playing: 4 };
const { merges } = bpeTrain(CORPUS, 30);
const SAMPLES = {
  "well-represented (English)": "the quick brown fox",
  "underrepresented script": "zxqvkplmwjhf qzxvbnmklpo wertyuiopas",
};

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "The same vocabulary, two very different fertilities" });
  const say = live(body);
  let key = Object.keys(SAMPLES)[0];

  const out = h("p", { class: "isai-readout" });
  const st = stats([["tokens", "tokens produced"], ["fertility", "tokens per word"]]);
  const ch = choice("Text", Object.keys(SAMPLES).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(out, st.el, ch.el);

  function update() {
    const words = SAMPLES[key].split(" ");
    const tokens = words.flatMap((w) => bpeApply(w, merges));
    out.textContent = tokens.join(" · ");
    st.set("tokens", String(tokens.length));
    st.set("fertility", (tokens.length / words.length).toFixed(2));
    say(`"${key}": ${words.length} words became ${tokens.length} tokens, a fertility of ${(tokens.length / words.length).toFixed(2)}`);
  }
  update();
  return () => {};
}
