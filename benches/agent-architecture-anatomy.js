// Bench: step through the named components of an agent architecture on one toy request.
const COMPONENTS = [
  { name: "perceive", detail: "reads the current request and any new observations: \"book a table for 4 at 7pm\"" },
  { name: "memory", detail: "checks stored state: a saved preference, \"prefers Italian food,\" is retrieved" },
  { name: "planner", detail: "decomposes the goal: search restaurants → check availability → confirm booking" },
  { name: "tool executor", detail: "calls the booking tool with the restaurant, time and party size" },
  { name: "controller", detail: "checks the tool's result against the goal; loops back to the planner if it didn't work, otherwise stops" },
];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "The same five components, every time" });
  const say = live(body);
  let step = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["component", "current component"]]);
  body.append(list, st.el);

  function render() {
    list.textContent = "";
    for (let i = 0; i <= step; i++) list.append(h("li", {}, `${COMPONENTS[i].name}: ${COMPONENTS[i].detail}`));
    st.set("component", `${step + 1} / ${COMPONENTS.length} — ${COMPONENTS[step].name}`);
    say(`${COMPONENTS[step].name}: ${COMPONENTS[step].detail}`);
  }
  const sp = stepper({
    stepLabel: "architecture component",
    onStep: () => {
      if (step >= COMPONENTS.length - 1) return false;
      step++;
      render();
      return step < COMPONENTS.length - 1;
    },
    onReset: () => { step = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
