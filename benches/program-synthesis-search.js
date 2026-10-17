// Bench: search every grammar-valid toy program for ones that evaluate to a target value.
import { synthesizePrograms, evalRPN } from "./gakit.js";

const DIGITS = ["1", "2", "3"], OPS = ["+", "-", "*"];

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Searching for a program that computes a target" });
  const say = live(body);
  let target = 7;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["found", "matching programs"], ["total", "candidates searched"]]);
  const sl = slider({ label: "target value", min: 1, max: 15, step: 1, value: target, format: (v) => String(v), onInput: (v) => { target = v; update(); } });
  body.append(list, st.el, sl.el);

  function update() {
    const matches = synthesizePrograms(DIGITS, OPS, target);
    const total = DIGITS.length ** 2 * OPS.length ** 2 * DIGITS.length;
    list.textContent = "";
    matches.slice(0, 5).forEach((m) => list.append(h("li", {}, `${m.join(" ")}  =  ${evalRPN(m)}`)));
    st.set("found", String(matches.length));
    st.set("total", String(total));
    say(`${matches.length} of ${total} candidate programs evaluate to ${target}`);
  }
  update();
  return () => {};
}
