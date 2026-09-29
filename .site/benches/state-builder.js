// Bench: decide what an agent must remember about the world, and see the cost of remembering more.
export default function mount(root, kit) {
  const { h, frame, toggles, canvas, live } = kit;
  const body = frame(root, {
    title: "What goes into the state?",
    hint: "A delivery robot must handle six situations. Choose which facts it keeps track of."
  });
  const say = live(body);
  // name, how many values it can take
  const VARS = { pos: ["Where I am", 100], dest: ["Where I am going", 100], battery: ["Battery level", 4], obstacle: ["Obstacle ahead?", 2], package: ["Carrying the package?", 2] };
  const CASES = [
    ["A wall is right in front of me", ["obstacle"], "turn away"],
    ["I have arrived", ["pos", "dest"], "stop and hand over"],
    ["Battery is nearly empty and the goal is far", ["battery", "pos", "dest"], "go and charge first"],
    ["I reached the house but have nothing to deliver", ["pos", "dest", "package"], "return to base"],
    ["The package fell off on the way", ["package"], "go back to fetch it"],
    ["The route is blocked and the battery is low", ["obstacle", "battery", "pos", "dest"], "reroute to the charger"]
  ];
  const tg = toggles(Object.entries(VARS).map(([k, [label]]) => [k, label, k === "pos" || k === "dest"]), render);
  const cv = canvas(body, { aspect: 0.16, label: "Bar showing how many distinct states the agent must distinguish" });
  const list = h("ul", { class: "isai-list yes" });
  const count = h("p", { class: "bench-verdict" });
  body.append(tg.el, list, cv.box, count);
  let n = 1;
  cv.onDraw((ctx, w, hh, p) => {
    const frac = Math.log10(n) / Math.log10(160000 * 1.0001);
    ctx.fillStyle = p.soft2; ctx.beginPath(); ctx.roundRect(0, hh / 2 - 9, w, 18, 9); ctx.fill();
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.roundRect(0, hh / 2 - 9, Math.max(18, w * Math.min(1, frac)), 18, 9); ctx.fill();
  });
  function render(v = tg.get()) {
    const have = Object.keys(v).filter((k) => v[k]);
    list.textContent = ""; let ok = 0;
    for (const [name, need, action] of CASES) {
      const missing = need.filter((k) => !have.includes(k)), fine = !missing.length;
      if (fine) ok++;
      list.append(h("li", { style: fine ? "" : "opacity:.7" }, h("b", {}, (fine ? "✓ " : "✗ ") + name), h("small", {}, fine ? ` → ${action}` : ` → cannot tell: it does not track ${missing.map((k) => VARS[k][0].toLowerCase()).join(" or ")}`)));
    }
    n = have.reduce((a, k) => a * VARS[k][1], 1);
    const msg = `The robot handles ${ok} of ${CASES.length} situations. Its state can be in ${n.toLocaleString("en-US")} different configurations. ` +
      (have.length === Object.keys(VARS).length ? "Everything is tracked, and the number of situations to learn about is now large." : ok === CASES.length ? "That is enough for every case." : "Add what is missing, but notice how the count grows.");
    count.textContent = msg; say(msg); cv.redraw();
  }
  render();
  return () => cv.destroy();
}
