// Bench: each entry of a matrix product is a row of A dotted with a column of B.
export default function mount(root, kit) {
  const { h, frame, choice, stepper, live } = kit;
  const body = frame(root, { title: "Rows meet columns" });
  const say = live(body);
  const SETS = {
    a: ["2×2 example", [[1, 2], [3, 4]], [[0, 1], [1, 0]]],
    b: ["Swap the order", [[0, 1], [1, 0]], [[1, 2], [3, 4]]],
    c: ["2×3 times 3×2", [[1, 2, 3], [4, 5, 6]], [[7, 8], [9, 10], [11, 12]]],
    d: ["3×2 times 2×3", [[7, 8], [9, 10], [11, 12]], [[1, 2, 3], [4, 5, 6]]],
    e: ["With the identity", [[2, 5], [-1, 3]], [[1, 0], [0, 1]]]
  };
  let key = "a", A, B, step = 0;
  const stage = h("div", { class: "stage", style: "display:flex;gap:1.2rem;flex-wrap:wrap;align-items:center;justify-content:center;font:800 1.05rem ui-monospace,monospace" });
  const note = h("p", { class: "bench-verdict", "aria-live": "polite" });
  const ch = choice("Pair", Object.entries(SETS).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; reset(); });
  const stp = stepper({ interval: 800, stepLabel: "Next entry", onStep: () => { const total = A.length * B[0].length; if (step >= total) return false; step++; render(); if (step >= total) return false; }, onReset: () => reset() });
  const table = (M, hi = {}) => h("table", { style: "border-collapse:collapse" }, M.map((row, i) => h("tr", {}, row.map((v, j) => h("td", { style: `padding:.35rem .7rem;text-align:center;border-radius:6px;${hi[i + "," + j] ? "background:var(--soft);color:var(--accent)" : ""}` }, v === null ? "·" : String(v))))));
  function reset() { [, A, B] = SETS[key]; step = 0; render(); }
  function render() {
    const m = A.length, p = B[0].length, n = B.length, cur = step - 1, ci = Math.floor(cur / p), cj = cur % p, R = A.map(() => new Array(p).fill(null));
    for (let k = 0; k < step; k++) { const i = Math.floor(k / p), j = k % p; R[i][j] = A[i].reduce((s, v, t) => s + v * B[t][j], 0); }
    const hiA = {}, hiB = {}, hiR = {};
    if (cur >= 0) { for (let t = 0; t < n; t++) { hiA[ci + "," + t] = true; hiB[t + "," + cj] = true; } hiR[ci + "," + cj] = true; }
    stage.textContent = ""; stage.append(table(A, hiA), h("span", {}, "×"), table(B, hiB), h("span", {}, "="), table(R, hiR));
    note.textContent = cur < 0 ? `A is ${m}×${n}, B is ${n}×${p}, so the product is ${m}×${p}. Press "Next entry".` : `Entry (${ci + 1}, ${cj + 1}) = ${A[ci].map((v, t) => `${v}·${B[t][cj]}`).join(" + ")} = ${R[ci][cj]}`;
    if (step) say(note.textContent);
  }
  body.append(stage, note, ch.el, stp.el);
  reset();
  return () => stp.stop();
}
