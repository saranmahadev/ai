// Bench: compare a team of identical generalist agents against one with a specialist per required skill.
import { routingAccuracy } from "./agentkit.js";

const SKILLS = ["coding", "writing", "research"];
const SPECIALIST_ACCURACY = { coding: 0.95, writing: 0.95, research: 0.95 };
const GENERALIST_ACCURACY = 0.6;

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Three generalists, or one specialist per skill" });
  const say = live(body);
  let team = "specialized";

  const list = h("ul", { class: "isai-list" });
  const st = stats([["accuracy", "overall team accuracy"]]);
  const ch = choice("Team", [["generalist", "3 identical generalists"], ["specialized", "1 specialist per skill"]], team, (v) => { team = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const acc = team === "specialized" ? routingAccuracy(SKILLS, SPECIALIST_ACCURACY) : GENERALIST_ACCURACY;
    st.set("accuracy", `${(acc * 100).toFixed(1)}%`);
    list.textContent = "";
    SKILLS.forEach((s) => {
      const who = team === "specialized" ? `the ${s} specialist (${(SPECIALIST_ACCURACY[s] * 100).toFixed(0)}%)` : `any generalist (${(GENERALIST_ACCURACY * 100).toFixed(0)}%)`;
      list.append(h("li", {}, `${s}: handled by ${who}`));
    });
    say(`${team === "specialized" ? "specialized team" : "generalist team"}: ${(acc * 100).toFixed(1)} percent overall accuracy`);
  }
  update();
  return () => {};
}
