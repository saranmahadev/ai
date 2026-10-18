// Bench: compare a linear forward scan against a binary search for the step that actually broke a 16-step trajectory.
import { linearAttributionChecks, binaryAttributionChecks } from "./agentkit.js";

const N = 16, CULPRIT = 11;

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Finding the one step that broke it" });
  const say = live(body);
  let method = "linear";

  const grid = h("div", { class: "isai-list", style: "display:grid;grid-template-columns:repeat(8,1fr);gap:4px" });
  const st = stats([["checks", "checks needed to find step " + CULPRIT]]);
  const ch = choice("Method", [["linear", "linear forward scan"], ["binary", "binary search"]], method, (v) => { method = v; update(); });
  body.append(grid, st.el, ch.el);

  function checkedSteps() {
    if (method === "linear") return Array.from({ length: CULPRIT }, (_, i) => i + 1);
    // Mirror the exact binary-search probe sequence used by binaryAttributionChecks' derivation.
    const probes = [];
    let lo = 1, hi = N;
    const valid = (i) => { probes.push(i); return i < CULPRIT; };
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (valid(mid)) lo = mid + 1; else hi = mid;
    }
    return probes;
  }
  function update() {
    const probed = checkedSteps();
    grid.textContent = "";
    for (let i = 1; i <= N; i++) {
      const cell = h("div", { style: "padding:6px 0;text-align:center;border-radius:6px;font:700 11px Nunito, system-ui, sans-serif" });
      cell.textContent = String(i);
      const wasProbed = probed.includes(i);
      const isCulprit = i === CULPRIT;
      cell.style.background = isCulprit ? "var(--accent)" : wasProbed ? "var(--soft2)" : "var(--soft)";
      cell.style.color = isCulprit ? "var(--white)" : "var(--ink)";
      grid.append(cell);
    }
    const checks = method === "linear" ? linearAttributionChecks(CULPRIT) : binaryAttributionChecks(N);
    st.set("checks", String(checks));
    say(`${method === "linear" ? "linear scan" : "binary search"}: ${checks} checks to find step ${CULPRIT} of ${N}`);
  }
  update();
  return () => {};
}
