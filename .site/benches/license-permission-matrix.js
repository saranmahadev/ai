// Bench: compare what's actually permitted under different real-world license styles.
const LICENSES = {
  "permissive (Apache/MIT-style)": { commercialUse: true, modify: true, redistribute: true, noUsageCap: true },
  "open-with-restrictions (community license style)": { commercialUse: true, modify: true, redistribute: true, noUsageCap: false },
  "fully closed (API terms only)": { commercialUse: true, modify: false, redistribute: false, noUsageCap: true },
};
const ROWS = [
  ["commercialUse", "use commercially"],
  ["modify", "modify the model/weights"],
  ["redistribute", "redistribute the model"],
  ["noUsageCap", "no usage-based restriction (e.g. user cap)"],
];

export default function mount(root, kit) {
  const { frame, h, choice, live } = kit;
  const body = frame(root, { title: "What a license actually permits" });
  const say = live(body);
  let license = Object.keys(LICENSES)[0];

  const list = h("ul", { class: "isai-list" });
  const ch = choice("License", Object.keys(LICENSES).map((k) => [k, k]), license, (v) => { license = v; update(); });
  body.append(list, ch.el);

  function update() {
    const terms = LICENSES[license];
    list.textContent = "";
    ROWS.forEach(([key, label]) => list.append(h("li", {}, `${terms[key] ? "✓" : "✗"} ${label}`)));
    const allowedCount = ROWS.filter(([key]) => terms[key]).length;
    say(`"${license}": permits ${allowedCount} of ${ROWS.length} listed freedoms`);
  }
  update();
  return () => {};
}
