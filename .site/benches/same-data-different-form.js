// Bench: whatever the kind of data, the model receives numbers.
export default function mount(root, kit) {
  const { h, frame, choice, slider, button, canvas, live } = kit;
  const body = frame(root, {
    title: "Everything becomes numbers",
    hint: "Pick a kind of data. The left side is what people see; the right side is what a model receives."
  });
  const say = live(body);
  let kind = "text";
  const pick = choice("Kind of data", [["text", "Text"], ["image", "Image"], ["sound", "Sound"], ["table", "Table row"], ["series", "Time series"]], kind, (k) => { kind = k; render(); });
  const human = h("div", { class: "bench-canvas", style: "padding:12px;min-height:120px" });
  const nums = h("pre", { class: "bench-line", style: "margin:0;padding:12px;border-radius:20px;background:var(--pre);color:#efe9ff;white-space:pre-wrap;overflow-wrap:anywhere;min-height:120px" });
  const say2 = h("p", { class: "bench-verdict" });
  body.append(pick.el, h("div", { class: "bench-two" }, human, nums), say2);

  // image state: 6x6 pixels, brightness 0..9
  const N = 6;
  const px = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => ([[1, 1], [1, 4], [4, 1], [4, 2], [4, 3], [4, 4]].some(([a, b]) => a === r && b === c) ? 9 : 0)));
  let text = "hello", pitch = 4, ctxA = null, osc = null;
  const SERIES = [12, 11, 11, 10, 10, 12, 15, 18, 21, 24, 26, 27, 28, 28, 27, 25, 22, 19, 17, 15, 14, 13, 12, 12];

  function render() {
    if (human.__wave) { human.__wave.destroy(); human.__wave = null; }
    human.textContent = "";
    if (kind === "text") {
      const inp = h("input", { type: "text", value: text, maxlength: 12, "aria-label": "Type some text", style: "font:800 16px var(--font);padding:8px 12px;border-radius:12px;border:2px solid var(--accent);background:var(--white);color:var(--ink);width:100%" });
      inp.addEventListener("input", () => { text = inp.value; numsFor(); });
      human.append(h("p", { style: "margin:0 0 8px" }, "Type anything:"), inp);
      numsFor();
      say2.textContent = "Each character is stored as a number (its Unicode code point). Real language models go further and split text into tokens, but those are numbers too.";
    } else if (kind === "image") {
      const grid = h("div", { style: `display:grid;grid-template-columns:repeat(${N},1fr);gap:3px;max-width:220px` });
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const b = h("button", { type: "button", "aria-label": `Pixel row ${r + 1} column ${c + 1}, brightness ${px[r][c]}. Press to brighten.`, style: `aspect-ratio:1;border:0;border-radius:5px;cursor:pointer;background:hsl(260 60% ${10 + px[r][c] * 9}%)` });
        b.addEventListener("click", () => { px[r][c] = (px[r][c] + 3) % 12 > 9 ? 0 : (px[r][c] + 3) % 12; render(); });
        grid.append(b);
      }
      human.append(h("p", { style: "margin:0 0 8px" }, "Click a pixel to change its brightness:"), grid);
      nums.textContent = px.map((row) => row.join(" ")).join("\n");
      say2.textContent = "An image is a grid of brightness values (colour photos have three grids, red, green and blue). A model receives the grid of numbers, not the picture.";
    } else if (kind === "sound") {
      const s = slider({ label: "pitch", min: 1, max: 8, step: 1, value: pitch, format: (v) => v + " (higher = faster wave)", onInput: (v) => { pitch = v; drawWave(); } });
      const wave = canvas(human, { aspect: 0.3, label: "A sound wave", maxH: 120 });
      wave.onDraw((ctx, w, hh, p) => { ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = (i / 200) * w, y = hh / 2 - Math.sin((i / 200) * pitch * Math.PI * 2) * (hh / 2 - 8); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
      human.append(s.el, button("Play the tone", () => {
        try { ctxA = ctxA || new (window.AudioContext || window.webkitAudioContext)(); if (osc) osc.stop(); osc = ctxA.createOscillator(); const g = ctxA.createGain(); g.gain.value = 0.08; osc.frequency.value = 220 * pitch / 2; osc.connect(g); g.connect(ctxA.destination); osc.start(); osc.stop(ctxA.currentTime + 0.6); } catch (e) { /* audio unavailable */ }
      }));
      human.__wave = wave; drawWave();
      say2.textContent = "Sound is measured thousands of times a second, and each measurement is a number. A model receives the list of measurements.";
    } else if (kind === "table") {
      human.append(h("table", { class: "bench-table" }, h("tbody", {}, ...[["Age", "34"], ["City", "Pune"], ["Plan", "Premium"], ["Signed up", "2023"]].map(([a, b]) => h("tr", {}, h("th", {}, a), h("td", {}, b))))));
      nums.textContent = "age       → 34\ncity      → 2   (one code per city)\nplan      → 1   (0 = basic, 1 = premium)\nsigned up → 2023";
      say2.textContent = "Even a tidy table needs conversion: categories such as city or plan must be turned into numbers, and how you do that is a design choice.";
    } else {
      const wave = canvas(human, { aspect: 0.35, label: "Temperature over a day", maxH: 140 });
      wave.onDraw((ctx, w, hh, p) => { const m = kit.plot(w, hh, [0, 23], [8, 30], { l: 30, r: 8, t: 8, b: 22 }); m.axes(ctx, p, { xlabel: "hour" }); ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath(); SERIES.forEach((v, i) => (i ? ctx.lineTo(m.X(i), m.Y(v)) : ctx.moveTo(m.X(i), m.Y(v)))); ctx.stroke(); });
      human.__wave = wave;
      nums.textContent = SERIES.join(", ");
      say2.textContent = "A day of temperature readings is already a list of 24 numbers. A model looks at the whole list at once, or at a sliding window of it.";
    }
    say(say2.textContent);
    function numsFor() { nums.textContent = [...text].map((c) => `${c}  →  ${c.codePointAt(0)}`).join("\n") || "(nothing typed)"; }
    function drawWave() { if (human.__wave) human.__wave.redraw(); nums.textContent = Array.from({ length: 16 }, (_, i) => (Math.sin((i / 16) * pitch * Math.PI * 2)).toFixed(2)).join(", ") + ", …"; }
  }
  render();
  return () => { if (osc) try { osc.stop(); } catch (e) {} if (ctxA) ctxA.close(); if (human.__wave) human.__wave.destroy(); };
}
