// Bench: compare recomputing a whole conversation prefix against reusing its cached KV from an earlier session.
const FLOPS_PER_TOKEN = 2e6;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Not starting from zero on a returning conversation" });
  const say = live(body);
  let prefixTokens = 2000;
  const NEW_TOKENS = 50;

  const cv = canvas(body, { aspect: 0.4, label: "Compute cost, with and without cache reuse" });
  const st = stats([["savings", "compute saved by reusing"]]);
  const sl = slider({ label: "cached prefix length (tokens)", min: 200, max: 8000, step: 200, value: prefixTokens, format: (v) => String(v), onInput: (v) => { prefixTokens = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let noReuse, withReuse;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 3, maxC = noReuse;
    const nH = (noReuse / maxC) * (hh - 30), wH = (withReuse / maxC) * (hh - 30);
    ctx.fillStyle = p.warm; ctx.fillRect(bw * 0.5, hh - 15 - nH, bw * 0.6, nH);
    ctx.fillStyle = p.accent; ctx.fillRect(bw * 1.7, hh - 15 - wH, bw * 0.6, wH);
  });

  function update() {
    noReuse = (prefixTokens + NEW_TOKENS) * FLOPS_PER_TOKEN;
    withReuse = NEW_TOKENS * FLOPS_PER_TOKEN;
    const savings = (1 - withReuse / noReuse) * 100;
    st.set("savings", `${savings.toFixed(1)}%`);
    say(`prefix ${prefixTokens} tokens: reusing the cache saves ${savings.toFixed(1)} percent of the compute`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
