// Bench: trace a word through a toy TTS pipeline -- phonemes to duration/pitch/amplitude contours.
const WORDS = {
  hello: [{ ph: "h", duration: 0.05, pitch: 0, amp: 0.3 }, { ph: "eh", duration: 0.12, pitch: 180, amp: 0.8 }, { ph: "l", duration: 0.06, pitch: 170, amp: 0.6 }, { ph: "oh", duration: 0.15, pitch: 160, amp: 0.9 }],
  hi: [{ ph: "h", duration: 0.04, pitch: 0, amp: 0.3 }, { ph: "ai", duration: 0.18, pitch: 200, amp: 0.9 }],
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Phonemes → duration, pitch and amplitude" });
  const say = live(body);
  let word = "hello";

  const cv = canvas(body, { aspect: 0.45, label: "Pitch contour across phonemes" });
  const st = stats([["duration", "total duration"], ["phonemes", "phoneme sequence"]]);
  const ch = choice("Word", Object.keys(WORDS).map((w) => [w, w]), word, (v) => { word = v; update(); });
  body.append(cv.box, st.el, ch.el);

  let phonemes = [];
  cv.onDraw((ctx, w, hh, p) => {
    const maxPitch = 220;
    let x = 10;
    const totalDur = phonemes.reduce((s, ph) => s + ph.duration, 0);
    const scaleX = (w - 20) / totalDur;
    phonemes.forEach((ph) => {
      const bw = ph.duration * scaleX, bh = (ph.pitch / maxPitch) * (hh - 30);
      ctx.fillStyle = p.accent; ctx.globalAlpha = 0.3 + ph.amp * 0.7;
      ctx.fillRect(x, hh - 10 - bh, bw - 2, bh);
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(ph.ph, x + bw / 2, hh - 2);
      x += bw;
    });
  });

  function update() {
    phonemes = WORDS[word];
    const total = phonemes.reduce((s, ph) => s + ph.duration, 0);
    st.set("duration", `${total.toFixed(3)} s`);
    st.set("phonemes", phonemes.map((ph) => ph.ph).join("-"));
    say(`"${word}": ${phonemes.length} phonemes, ${total.toFixed(3)} seconds total`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
