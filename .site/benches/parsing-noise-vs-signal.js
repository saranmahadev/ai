// Bench: toggle boilerplate stripping and watch how much of a raw page was never real content.
import { wordCount } from "./ragkit.js";

const RAW_PAGE = "Page 7 of 42\nACME CORP CONFIDENTIAL\nShipping Policy\nOrders ship within two business days of payment confirmation.\nFooter: acme.com | page 7";

function stripBoilerplate(s) {
  return s.split("\n").filter((line) => !/^Page \d+ of \d+$/.test(line) && !/^ACME CORP CONFIDENTIAL$/.test(line) && !/^Footer:/.test(line)).join("\n");
}

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Half of this page was never content" });
  const say = live(body);
  let stripped = false;

  const pre = h("pre", { class: "isai-pre" });
  const st = stats([["words", "words kept"], ["noise", "noise removed"]]);
  const tg = toggles([["strip", "strip page headers/footers", stripped]], (v) => { stripped = v.strip; update(); });
  body.append(pre, st.el, tg.el);

  function update() {
    const text = stripped ? stripBoilerplate(RAW_PAGE) : RAW_PAGE;
    pre.textContent = text;
    const raw = wordCount(RAW_PAGE), kept = wordCount(text);
    st.set("words", String(kept));
    st.set("noise", `${(((raw - kept) / raw) * 100).toFixed(0)}%`);
    say(`${kept} of ${raw} words kept; ${(((raw - kept) / raw) * 100).toFixed(0)} percent was boilerplate`);
  }
  update();
  return () => {};
}
