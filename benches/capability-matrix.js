// Bench: what each kind of AI system can and cannot do. A rough guide, not a benchmark.
export default function mount(root, kit) {
  const { h, frame, choice, canvas, live } = kit;
  const body = frame(root, {
    title: "What can each system do?"
  });
  const say = live(body);
  const TASKS = ["Play chess", "Label a photo", "Filter spam", "Write an essay", "Vacuum a room", "Steer a car"];
  // 2 = its job, 1 = partly / with help, 0 = cannot
  const SYS = [
    ["Chess engine", [2, 0, 0, 0, 0, 0], "Superhuman at one game, and helpless at everything else. Put it in a photo app and it has nothing to say."],
    ["Photo classifier", [0, 2, 0, 0, 0, 0], "It maps pixels to labels. It has no notion of chess, email or roads."],
    ["Spam filter", [0, 0, 2, 0, 0, 0], "It scores email text and does nothing else."],
    ["Language-model chatbot", [1, 1, 1, 2, 0, 0], "The most flexible of the group. It can attempt many text tasks, but a specialist engine still plays chess better, and it cannot vacuum or steer."],
    ["Robot vacuum", [0, 0, 0, 0, 2, 0], "One body, one job."],
    ["Self-driving software", [0, 1, 0, 0, 0, 2], "Its vision parts recognise road objects, but that is not the same as labelling any photo you give it."]
  ];
  let cur = 3;
  const pick = choice("System", SYS.map((s, i) => [i, s[0]]), cur, (i) => { cur = i; render(); });
  const cv = canvas(body, { aspect: 0.5, label: "Grid of systems against tasks, showing which each can do" });
  const out = kit.stats([["can", "tasks it can touch"]]);
  body.append(pick.el, cv.box, out.el);
  cv.onDraw((ctx, w, hh, p) => {
    const left = Math.min(150, w * 0.26), top = 34, cw = (w - left - 8) / TASKS.length, rh = (hh - top - 6) / SYS.length;
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    TASKS.forEach((t, j) => { ctx.fillStyle = p.muted; const words = t.split(" "); words.forEach((wd, k) => ctx.fillText(wd, left + j * cw + cw / 2, 10 + k * 12)); });
    SYS.forEach((s, i) => {
      ctx.textAlign = "right"; ctx.fillStyle = i === cur ? p.accent : p.ink; ctx.fillText(s[0], left - 8, top + i * rh + rh / 2);
      s[1].forEach((v, j) => {
        const x = left + j * cw + 3, y = top + i * rh + 3;
        ctx.globalAlpha = i === cur ? 1 : 0.55;
        ctx.fillStyle = v === 2 ? p.accent : v === 1 ? p.warm : p.soft2;
        ctx.beginPath(); ctx.roundRect(x, y, cw - 6, rh - 6, 8); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = v === 0 ? p.muted : p.white; ctx.textAlign = "center";
        ctx.fillText(v === 2 ? "yes" : v === 1 ? "partly" : "no", x + (cw - 6) / 2, y + (rh - 6) / 2);
      });
    });
  });
  function render() {
    const s = SYS[cur], can = s[1].filter((v) => v > 0).length;
    const msg = `${s[0]}: can do ${can} of ${TASKS.length} tasks. ${s[2]}`;
    out.set("can", `${can} of ${TASKS.length}`); say(msg); cv.redraw();
  }
  render();
  return () => cv.destroy();
}
