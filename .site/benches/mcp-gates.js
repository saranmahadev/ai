// Bench: a hand-wired McCulloch-Pitts neuron computing AND, OR or NOT, with absolute inhibition.
const GATES = {
  AND: { exc: 2, inh: 0, threshold: 2 },
  OR: { exc: 2, inh: 0, threshold: 1 },
  NOT: { exc: 0, inh: 1, threshold: 0 }
};

function mcp(excitatory, inhibitory, threshold) {
  if (inhibitory.some((v) => v === 1)) return 0;
  const sum = excitatory.reduce((a, b) => a + b, 0);
  return sum >= threshold ? 1 : 0;
}

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Wiring logic out of threshold units" });
  const say = live(body);
  let gate = "AND";

  const cv = canvas(body, { aspect: 0.5, label: "The gate's truth table, with excitatory sum and inhibitory veto" });
  const st = stats([["threshold", "threshold"], ["wiring", "wiring"]]);
  const ch = choice("Gate", [["AND", "AND"], ["OR", "OR"], ["NOT", "NOT"]], gate, (v) => { gate = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function rows() {
    const g = GATES[gate];
    if (gate === "NOT") return [0, 1].map((a) => ({ inputs: [a], out: mcp([], [a], g.threshold) }));
    const pairs = [[0, 0], [0, 1], [1, 0], [1, 1]];
    return pairs.map(([a, b]) => ({ inputs: [a, b], out: mcp([a, b], [], g.threshold) }));
  }

  cv.onDraw((ctx, w, hh, p) => {
    const rs = rows();
    const rowH = hh / (rs.length + 1);
    ctx.font = "700 13px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    rs.forEach((r, i) => {
      const y = (i + 0.7) * rowH;
      ctx.fillStyle = p.ink;
      ctx.fillText(r.inputs.join(", "), w * 0.3, y);
      ctx.fillStyle = r.out ? p.good : p.warm;
      ctx.fillText(String(r.out), w * 0.7, y);
    });
  });

  function update() {
    const g = GATES[gate];
    st.set("threshold", String(g.threshold));
    st.set("wiring", `${g.exc} excitatory, ${g.inh} inhibitory`);
    say(`${gate} gate: threshold ${g.threshold}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
