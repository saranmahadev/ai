// Bench: quantize an image patch to a discrete code and place it in a shared text+image vocabulary.
import { nearestCode } from "./gakit.js";

const IMAGE_CODEBOOK = [[1, 0], [0, 1], [0.5, 0.5], [-1, 0]];
const TEXT_VOCAB = ["a", "photo", "of", "<img>"];
const PATCHES = { "near code 0": [0.9, 0.1], "near code 2": [0.45, 0.52], "near code 3": [-0.8, 0.1] };

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "One vocabulary, text and image tokens together" });
  const say = live(body);
  let patchKey = Object.keys(PATCHES)[0];

  const out = h("p", { class: "isai-readout" });
  const st = stats([["code", "quantized to"], ["unified", "unified sequence"]]);
  const ch = choice("Image patch", Object.keys(PATCHES).map((k) => [k, k]), patchKey, (v) => { patchKey = v; update(); });
  body.append(out, st.el, ch.el);

  function tokenName(id) { return id < TEXT_VOCAB.length ? TEXT_VOCAB[id] : `code${id - TEXT_VOCAB.length}`; }

  function update() {
    const code = nearestCode(PATCHES[patchKey], IMAGE_CODEBOOK);
    const seq = [0, 1, 2, 3, TEXT_VOCAB.length + code];
    out.textContent = seq.map(tokenName).join(" ");
    st.set("code", `code${code}`);
    st.set("unified", `vocab size ${TEXT_VOCAB.length + IMAGE_CODEBOOK.length}`);
    say(`patch quantized to code${code}; full sequence: ${seq.map(tokenName).join(", ")}`);
  }
  update();
  return () => {};
}
