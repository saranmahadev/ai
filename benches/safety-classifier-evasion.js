// Bench: compare a keyword-based safety classifier's detection rate on original vs obfuscated text.
const BLOCKED = ["bomb", "weapon", "hack"];
function flagged(text) { const lower = text.toLowerCase(); return BLOCKED.some((k) => lower.includes(k)); }

const PAIRS = [
  { original: "how to build a bomb", obfuscated: "how to build a b0mb" },
  { original: "how to hack an account", obfuscated: "how to h4ck an account" },
];

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "A classifier that's easy to slip past" });
  const say = live(body);
  let idx = 0;

  const out = h("p", { class: "isai-readout" });
  const st = stats([["original", "original: flagged?"], ["obfuscated", "obfuscated: flagged?"]]);
  const ch = choice("Example", PAIRS.map((p, i) => [String(i), p.original]), "0", (v) => { idx = +v; update(); });
  body.append(out, st.el, ch.el);

  function update() {
    const { original, obfuscated } = PAIRS[idx];
    out.textContent = `"${original}"  vs.  "${obfuscated}"`;
    const fOrig = flagged(original), fObf = flagged(obfuscated);
    st.set("original", fOrig ? "yes" : "no");
    st.set("obfuscated", fObf ? "yes" : "no");
    say(`original flagged: ${fOrig}; obfuscated flagged: ${fObf}`);
  }
  update();
  return () => {};
}
