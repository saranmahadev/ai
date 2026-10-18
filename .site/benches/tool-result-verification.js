// Bench: compare "the call didn't raise an exception" against "the result actually has what's needed."
import { verifiedOkCount } from "./agentkit.js";

const REQUIRED = ["temperature", "conditions", "location"];
const RESULTS = [
  "temperature,conditions,location",
  "temperature,conditions,location",
  "conditions,location",
  "",
  "temperature,conditions,location",
];

export default function mount(root, kit) {
  const { frame, h, stats, live } = kit;
  const body = frame(root, { title: "No exception isn't the same as a usable result" });
  const say = live(body);

  const list = h("ol", { class: "isai-list" });
  const st = stats([["noexc", "calls with no exception"], ["ok", "calls that pass verification"]]);
  body.append(list, st.el);

  RESULTS.forEach((r, i) => {
    const has = (f) => r.includes(f);
    const missing = REQUIRED.filter((f) => !has(f));
    list.append(h("li", {}, `call ${i + 1}: no exception — ${missing.length ? `✗ missing ${missing.join(", ")}` : "✓ has every required field"}`));
  });

  st.set("noexc", `${RESULTS.length} of ${RESULTS.length}`);
  const ok = verifiedOkCount(RESULTS, REQUIRED);
  st.set("ok", `${ok} of ${RESULTS.length}`);
  say(`all ${RESULTS.length} calls completed without raising an exception, but only ${ok} pass verification`);
  return () => {};
}
