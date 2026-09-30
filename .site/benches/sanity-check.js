// Bench: judge numeric claims as plausible or off, with an estimate for each.
export default function mount(root, kit) {
  const { h, frame, button, live } = kit;
  const body = frame(root, { title: "Plausible or off?" });
  const say = live(body);
  const Q = [
    ["A model with 10 million parameters stored as 4-byte numbers needs about 40 MB.", true, "10⁷ × 4 = 4 × 10⁷ bytes = 40 MB."],
    ["A classifier is 130% accurate.", false, "Accuracy is a share of correct answers, so it cannot exceed 100%."],
    ["0.9 × 0.9 × 0.9 is about 0.73.", true, "0.9³ = 0.729."],
    ["The average of 20, 30 and 40 is 90.", false, "90 is the sum. The average is 90 ÷ 3 = 30."],
    ["A model reports a probability of −0.2 for an event.", false, "Probabilities lie between 0 and 1."],
    ["A 224 × 224 colour image at 3 bytes per pixel takes about 150 KB.", true, "224 × 224 × 3 = 150,528 bytes."],
    ["A learning rate of 10⁻³ is ten times larger than 10⁻⁴.", true, "The exponents differ by one, a factor of 10."],
    ["The square root of 50 is about 25.", false, "25 is half of 50. √50 ≈ 7.07, since 7² = 49."]
  ];
  let i = 0, score = 0, answered = false;
  const claim = h("p", { class: "stage", style: "font:800 1.25rem/1.4 Nunito,system-ui,sans-serif;min-height:5rem" });
  const verdict = h("p", { class: "bench-verdict", "aria-live": "polite" });
  const count = h("p", { class: "bench-line" });
  const ok = button("Plausible", () => judge(true)), off = button("Off", () => judge(false)), next = button("Next claim", () => { i = (i + 1) % Q.length; if (i === 0) score = 0; show(); });
  function show() { answered = false; claim.textContent = Q[i][0]; verdict.textContent = ""; count.textContent = `Claim ${i + 1} of ${Q.length}   ·   score ${score}`; }
  function judge(v) {
    if (answered) return; answered = true;
    const right = v === Q[i][1]; if (right) score++;
    verdict.textContent = `${right ? "Correct." : "Not quite."} ${Q[i][2]}`; say(verdict.textContent);
    count.textContent = `Claim ${i + 1} of ${Q.length}   ·   score ${score}`;
  }
  body.append(claim, verdict, count, h("div", { class: "bench-row" }, ok, off, next));
  show();
  return () => {};
}
