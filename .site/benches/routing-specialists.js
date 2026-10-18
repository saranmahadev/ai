// Bench: compare accuracy when requests are routed to the matching specialist against one generic handler taking everything.
import { routingAccuracy } from "./agentkit.js";

const REQUESTS = ["billing", "billing", "technical"];
const SPECIALIST_ACCURACY = { billing: 0.95, technical: 0.9 };
const GENERIC_ACCURACY = 0.55;

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "The right specialist, or one handler for everything" });
  const say = live(body);
  let mode = "routed";

  const cv = canvas(body, { aspect: 0.4, label: "Overall accuracy across 3 incoming requests" });
  const st = stats([["accuracy", "overall accuracy"]]);
  const ch = choice("Approach", [["routed", "routed to matching specialist"], ["generic", "one generic handler"]], mode, (v) => { mode = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function accuracy() { return mode === "routed" ? routingAccuracy(REQUESTS, SPECIALIST_ACCURACY) : GENERIC_ACCURACY; }

  cv.onDraw((ctx, w, hh, p) => {
    const a = accuracy(), bw = w - 40;
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, bw, 30);
    ctx.fillStyle = p.accent; ctx.fillRect(20, hh / 2 - 15, bw * a, 30);
  });

  function update() {
    st.set("accuracy", `${(accuracy() * 100).toFixed(1)}%`);
    say(`${mode === "routed" ? "routed to the matching specialist" : "forced through one generic handler"}: overall accuracy ${(accuracy() * 100).toFixed(1)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
