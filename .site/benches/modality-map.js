// Bench: pick an architectural idea and a modality, see how the raw data is reshaped before the idea applies.
const IDEAS = {
  convolution: {
    vision: "Slides a small 2D filter over the image's pixel grid.",
    audio: "Slides a small 2D filter over a spectrogram's time-frequency grid (or a 1D filter over the raw waveform).",
    language: "Rarely used directly on raw text; occasionally applied over short windows of token embeddings."
  },
  attention: {
    vision: "Relates patches of an image to each other (as in vision transformers).",
    audio: "Relates frames of an audio sequence to each other.",
    language: "Relates tokens (words or subwords) of a sentence to each other."
  }
};

export default function mount(root, kit) {
  const { frame, canvas, choice, live } = kit;
  const body = frame(root, { title: "The same idea, a different modality each time" });
  const say = live(body);
  let idea = "attention", modality = "vision";

  const cv = canvas(body, { aspect: 0.4, label: "How the chosen idea is adapted to the chosen modality" });
  const chIdea = choice("Idea", [["convolution", "Convolution"], ["attention", "Attention"]], idea, (v) => { idea = v; update(); });
  const chMod = choice("Modality", [["vision", "Vision"], ["audio", "Audio"], ["language", "Language"]], modality, (v) => { modality = v; update(); });
  const note = kit.h("p", { class: "bench-verdict" });
  body.append(cv.box, chIdea.el, chMod.el, note);

  cv.onDraw((ctx, w, hh, p) => {
    ctx.textAlign = "center";
    ctx.fillStyle = p.accent; ctx.font = "800 20px Nunito, system-ui, sans-serif";
    ctx.fillText(idea[0].toUpperCase() + idea.slice(1), w / 2, hh * 0.35);
    ctx.fillStyle = p.muted; ctx.font = "700 14px Nunito, system-ui, sans-serif";
    ctx.fillText("applied to", w / 2, hh * 0.35 + 24);
    ctx.fillStyle = p.good; ctx.font = "800 20px Nunito, system-ui, sans-serif";
    ctx.fillText(modality[0].toUpperCase() + modality.slice(1), w / 2, hh * 0.35 + 54);
  });

  function update() {
    const text = IDEAS[idea][modality];
    note.textContent = text;
    say(text);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
