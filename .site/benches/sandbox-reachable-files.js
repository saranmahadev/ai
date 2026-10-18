// Bench: toggle sandboxing and watch how many host files a running piece of code can reach.
import { sandboxReachableFiles } from "./agentkit.js";

const FILES = [
  { path: "/scratch/notes.txt", scratch: true },
  { path: "/scratch/draft.md", scratch: true },
  { path: "/home/user/.ssh/id_rsa", scratch: false },
  { path: "/etc/shadow", scratch: false },
  { path: "/var/secrets/api_key", scratch: false },
  { path: "/home/otheruser/private.doc", scratch: false },
  { path: "/root/.aws/credentials", scratch: false },
];

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "What a sandbox keeps out of reach" });
  const say = live(body);
  let sandboxed = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["reachable", "files this code can reach"]]);
  const tg = toggles([["sandbox", "run inside a sandbox restricted to /scratch/", sandboxed]], (v) => { sandboxed = v.sandbox; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const paths = FILES.map((f) => f.path);
    const n = sandboxReachableFiles(paths, sandboxed, "/scratch/");
    list.textContent = "";
    FILES.forEach((f) => {
      const reachable = !sandboxed || f.scratch;
      list.append(h("li", {}, `${reachable ? "✓ reachable" : "✗ blocked"} — ${f.path}`));
    });
    st.set("reachable", `${n} of ${FILES.length}`);
    say(`${sandboxed ? "sandboxed" : "unsandboxed"}: ${n} of ${FILES.length} files reachable`);
  }
  update();
  return () => {};
}
