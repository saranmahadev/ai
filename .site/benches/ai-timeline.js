// Bench: scrub through the history of AI and see the booms and winters.
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, live } = kit;
  const body = frame(root, {
    title: "Seventy years of AI"
  });
  const say = live(body);
  const EV = [
    [1950, "Turing's imitation game", "Alan Turing publishes “Computing Machinery and Intelligence” in the journal Mind and proposes the imitation game, now called the Turing test."],
    [1956, "The Dartmouth workshop", "A summer workshop at Dartmouth, proposed in 1955 by McCarthy, Minsky, Rochester and Shannon, uses the phrase “artificial intelligence” and is widely seen as the birth of the field."],
    [1958, "The perceptron", "Frank Rosenblatt introduces the perceptron, an early system that learned to classify images from labelled examples."],
    [1966, "ELIZA", "Joseph Weizenbaum's ELIZA imitates a therapist with simple pattern rules, and people still confide in it, an early lesson in how readily we credit machines with understanding."],
    [1973, "The Lighthill report", "A British report is very pessimistic about the field's progress. It helps trigger cuts in AI funding, and the first “AI winter” begins."],
    [1980, "Expert systems go commercial", "Digital Equipment Corporation deploys XCON, a rule-based system that configures computer orders, and companies begin investing heavily in expert systems."],
    [1986, "Backpropagation popularised", "Rumelhart, Hinton and Williams publish a widely read account of training multi-layer neural networks with backpropagation."],
    [1988, "The second winter", "By the late 1980s expert systems prove costly to maintain and narrow, DARPA cuts its AI funding, and many AI companies fail."],
    [1997, "Deep Blue beats Kasparov", "IBM's Deep Blue beats world chess champion Garry Kasparov 3½–2½ in a match, a landmark for search-based AI."],
    [2012, "AlexNet and the deep learning boom", "AlexNet, a deep neural network, wins the ImageNet image recognition challenge with a top-5 error of about 15%, far ahead of the runner-up's 26%."],
    [2016, "AlphaGo beats Lee Sedol", "DeepMind's AlphaGo beats Go champion Lee Sedol four games to one."],
    [2017, "The transformer", "Google researchers publish “Attention Is All You Need”, introducing the transformer architecture behind modern language models."],
    [2022, "ChatGPT", "OpenAI releases ChatGPT on 30 November, and a chatbot built on a large language model reaches a mass audience within weeks."]
  ];
  const WINTERS = [[1974, 1980, "first winter"], [1987, 1993, "second winter"]];
  const Y0 = 1945, Y1 = 2025;
  let year = 1950;
  const s = slider({ label: "year", min: Y0, max: Y1, step: 1, value: year, format: (v) => v, onInput: (v) => { year = v; render(); } });
  const cv = canvas(body, { aspect: 0.28, label: "Timeline of AI events with winter periods shaded" });
  const card = h("div", { class: "bench-reveal stage", style: "padding:12px 16px" });
  const prev = button("← Previous event", () => jump(-1)), next = button("Next event →", () => jump(1));
  body.append(cv.box, s.el, h("div", { class: "bench-row" }, prev, next), card);
  const reached = () => EV.filter((e) => e[0] <= year);
  function jump(d) {
    const idx = EV.findIndex((e) => e[0] > year);
    let target;
    if (d > 0) target = idx < 0 ? EV[EV.length - 1] : EV[idx];
    else { const before = EV.filter((e) => e[0] < year); target = before.length ? before[before.length - 1] : EV[0]; }
    year = target[0]; s.set(year, true); render();
  }
  cv.onDraw((ctx, w, hh, p) => {
    const X = (y) => 16 + ((y - Y0) / (Y1 - Y0)) * (w - 32), mid = hh * 0.55;
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    for (const [a, b, label] of WINTERS) {
      ctx.fillStyle = p.soft2; ctx.beginPath(); ctx.roundRect(X(a), 8, X(b) - X(a), hh - 16, 10); ctx.fill();
      ctx.fillStyle = p.muted; ctx.fillText(label, (X(a) + X(b)) / 2, 22);
    }
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(Y0), mid); ctx.lineTo(X(Y1), mid); ctx.stroke();
    for (let y = 1950; y <= 2020; y += 10) { ctx.fillStyle = p.muted; ctx.fillText(String(y), X(y), hh - 6); }
    for (const e of EV) {
      const on = e[0] <= year, cur = e[0] === year;
      ctx.fillStyle = cur ? p.warm : on ? p.accent : p.soft2; ctx.strokeStyle = p.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X(e[0]), mid, cur ? 8 : 5.5, 0, 7); ctx.fill(); if (!on) ctx.stroke();
    }
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(year), mid - 20); ctx.lineTo(X(year), mid + 20); ctx.stroke();
  });
  function render() {
    const r = reached(), last = r[r.length - 1], winter = WINTERS.find((w) => year >= w[0] && year <= w[1]);
    card.textContent = "";
    if (!last) card.append(h("b", {}, `${year}: before the field has a name.`), h("p", { style: "margin:6px 0 0" }, "Computers exist, but nobody has yet proposed making them intelligent."));
    else {
      card.append(h("b", {}, `${last[0]}: ${last[1]}`), h("p", { style: "margin:6px 0 0" }, last[2]));
    }
    say(card.textContent); cv.redraw();
  }
  render();
  return () => cv.destroy();
}
