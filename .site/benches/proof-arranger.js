// Bench: put the steps of a short proof in order.
export default function mount(root, kit) {
  const { h, frame, choice, button, rng, live } = kit;
  const body = frame(root, { title: "Put the proof in order" });
  const say = live(body);
  const P = {
    even: { name: "Even + even is even", steps: ["An even number has the form 2m for some whole number m.", "Take two even numbers, 2m and 2n.", "Their sum is 2m + 2n.", "That equals 2(m + n).", "Since m + n is a whole number, the sum is 2 times a whole number, so it is even."] },
    ind: { name: "1 + 2 + … + n = n(n + 1)/2", steps: ["Base case: for n = 1 the sum is 1, and 1·2/2 = 1.", "Assume the formula holds for some n.", "Then the sum up to n + 1 is n(n + 1)/2 + (n + 1).", "That simplifies to (n + 1)(n + 2)/2, which is the formula with n + 1.", "So it holds for n = 1, and whenever it holds for n it holds for n + 1: it holds for all n."] }
  };
  let key = "even", next = 0, order = [];
  const pool = h("div", { class: "stage", style: "display:grid;gap:.5rem" }), done = h("ol", { class: "stage", style: "margin:0;padding-left:1.4rem" }), msg = h("p", { class: "bench-verdict", "aria-live": "polite" });
  const ch = choice("Proof", Object.entries(P).map(([k, v]) => [k, v.name]), key, (k) => { key = k; reset(); });
  function reset() { next = 0; order = rng(Date.now() % 997 + 1).shuffle(P[key].steps.map((_, i) => i)); msg.textContent = "Click the step that comes first."; draw(); }
  function pick(i) {
    if (i === next) { next++; msg.textContent = next === P[key].steps.length ? "Complete: each step follows from the ones before it." : "Right. Which step comes next?"; }
    else msg.textContent = i < next ? "That step is already placed." : "Not yet: that step needs something that has not been established.";
    say(msg.textContent); draw();
  }
  function draw() {
    pool.textContent = ""; done.textContent = "";
    P[key].steps.forEach((s, i) => { if (i < next) done.append(h("li", {}, s)); });
    for (const i of order) if (i >= next) pool.append(h("button", { type: "button", class: "bench-btn", style: "text-align:left;height:auto;padding:.6rem .8rem", onClick: () => pick(i) }, P[key].steps[i]));
  }
  body.append(done, pool, msg, ch.el, h("div", { class: "bench-row" }, button("Shuffle again", reset)));
  reset();
  return () => {};
}
