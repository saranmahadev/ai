// Navigation model: one levelled path, Home → Galaxy → Planet → Topic.
// navFor() describes the bar for the current route: a Back button that names where it leads, a clickable
// breadcrumb trail, and the few actions that make sense on that screen. main.js renders it and handles Esc.

export function navFor({ key, query, content, has3d }) {
  if (!key) return null; // home has no bar
  const galaxyHref = has3d ? "#/galaxy" : "#/list";
  const home = { label: "Home", href: "#/" };
  const galaxy = { label: "Galaxy", href: galaxyHref };
  const planet = content.planets.find((p) => p.id === key);
  const topic = content.topics[key];

  if (key === "galaxy" && has3d) {
    return { back: { label: "Home", href: "#/" }, crumbs: [{ label: "Galaxy" }],
      actions: [{ label: "☀ The big picture", href: "#/ai" }, { label: "List view", href: "#/list" }] };
  }
  if (key === "galaxy" || key === "list") {
    return { back: { label: "Home", href: "#/" }, crumbs: [{ label: "Planets" }],
      actions: has3d ? [{ label: "3D galaxy", href: "#/galaxy" }] : [] };
  }
  if (planet) {
    const threeD = has3d && !planet.planned && query !== "text";
    return {
      back: { label: "Galaxy", href: galaxyHref, board: threeD },
      crumbs: [home, galaxy, { label: planet.title }],
      actions: threeD ? [{ label: "List view", href: `#/${planet.id}?text` }]
        : has3d && !planet.planned ? [{ label: "🚀 Walk the road", href: `#/${planet.id}` }] : [],
      progress: threeD
    };
  }
  if (topic) {
    const p = topic.planet && content.planets.find((x) => x.id === topic.planet);
    if (!p) return { back: { ...galaxy }, crumbs: [home, galaxy, { label: topic.title }], actions: [] };
    const d = p.districts.find((x) => x.id === topic.district);
    const toRoad = { href: `#/${p.id}`, warp: has3d ? -1 : 0 };
    return {
      back: { label: p.title, ...toRoad, title: has3d ? `Back to the road on ${p.title}` : `Back to ${p.title}` },
      crumbs: [home, galaxy, { label: p.title, ...toRoad }, ...(d && d.title !== p.title ? [{ label: d.title }] : []), { label: topic.title }],
      actions: []
    };
  }
  return { back: { ...galaxy }, crumbs: [home, { label: "Not found" }], actions: [] };
}
