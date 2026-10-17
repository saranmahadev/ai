// Bench: trace a word through the full pipeline — tokenize, embed, position, one transformer block, project back to predictions.
import { bpeTrain, bpeApply, embeddingLookup, vecAdd, layerNorm, selfAttention, feedForward, relu, softmax, dot } from "./tfkit.js";
import { rng } from "./kit.js";

const CORPUS = { low: 5, lower: 2, newest: 6, widest: 3 };
const VOCAB = ["low", "est</w>", "er</w>", "new", "wid"];
const D_MODEL = 4, D_FF = 8;
const WORDS = ["lowest", "slowest", "newer"];

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "One phrase, the whole pipeline" });
  const say = live(body);
  let word = WORDS[0];

  const { merges } = bpeTrain(CORPUS, 8);
  const stagesList = h("ol", { class: "isai-list" });
  const st = stats([["tokens", "tokens"], ["top", "top prediction"]]);
  const ch = choice("Word", WORDS.map((w) => [w, w]), word, (v) => { word = v; update(); });
  body.append(stagesList, st.el, ch.el);

  function update() {
    const rand = rng(99);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));

    const pieces = bpeApply(word, merges);
    const tokenIds = pieces.map((p) => VOCAB.indexOf(p));
    const unknown = tokenIds.some((id) => id < 0);

    const E = randMat(VOCAB.length, D_MODEL, 0.4);
    const scale = Math.sqrt(D_MODEL);

    stagesList.textContent = "";
    stagesList.append(h("li", {}, `tokens: ${pieces.join(" · ")}`));

    if (unknown) {
      stagesList.append(h("li", {}, "one or more pieces aren't in this tiny demo vocabulary — pick another word"));
      st.set("tokens", pieces.join(" · "));
      st.set("top", "—");
      say(`tokens ${pieces.join(", ")}; piece outside the demo vocabulary`);
      return;
    }

    const embeds = tokenIds.map((id) => embeddingLookup(E, id, scale));
    const P = randMat(pieces.length, D_MODEL, 0.2);
    const withPos = embeds.map((e, i) => vecAdd(e, P[i]));

    const Wq = randMat(D_MODEL, D_MODEL, 0.5), Wk = randMat(D_MODEL, D_MODEL, 0.5), Wv = randMat(D_MODEL, D_MODEL, 0.5);
    const normed1 = withPos.map((x) => layerNorm(x));
    const { out: attnOut } = selfAttention(normed1, { Wq, Wk, Wv });
    const X1 = withPos.map((x, i) => vecAdd(x, attnOut[i]));

    const W1 = randMat(D_FF, D_MODEL, 0.4), b1 = Array.from({ length: D_FF }, () => (rand() * 2 - 1) * 0.1);
    const W2 = randMat(D_MODEL, D_FF, 0.4), b2 = Array.from({ length: D_MODEL }, () => (rand() * 2 - 1) * 0.1);
    const normed2 = X1.map((x) => layerNorm(x));
    const ffnOut = normed2.map((x) => feedForward(x, { W1, b1, W2, b2, activation: relu }));
    const X2 = X1.map((x, i) => vecAdd(x, ffnOut[i]));

    const finalHidden = X2[X2.length - 1];
    const logits = E.map((row) => dot(row, finalHidden));
    const probs = softmax(logits);
    const topIdx = probs.indexOf(Math.max(...probs));

    stagesList.append(h("li", {}, `embedded + scaled (√${D_MODEL}) + positioned`));
    stagesList.append(h("li", {}, "through one transformer block (attention + residual + norm, feed-forward + residual + norm)"));
    stagesList.append(h("li", {}, `projected via the tied embedding table → top prediction: ${VOCAB[topIdx]} (p=${probs[topIdx].toFixed(3)})`));

    st.set("tokens", pieces.join(" · "));
    st.set("top", `${VOCAB[topIdx]} (p=${probs[topIdx].toFixed(3)})`);
    say(`tokens ${pieces.join(", ")}; top prediction ${VOCAB[topIdx]} with probability ${probs[topIdx].toFixed(3)}`);
  }
  update();
  return () => {};
}
