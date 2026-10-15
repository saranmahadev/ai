// Bench: soften a teacher's softmax with temperature and compare a student's distillation loss.
import { softmax } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Softening a teacher's output with temperature" });
  const say = live(body);
  let teacherZ = [3.0, 1.0, 0.5], studentZ = [2.0, 1.2, 0.8], T = 4;

  const cv = canvas(body, { aspect: 0.5, label: "Teacher's (left bars) and student's (right bars) softened distributions" });
  const st = stats([["teacher", "teacher distribution"], ["student", "student distribution"], ["loss", "distillation loss"]]);
  const tSliders = teacherZ.map((v, i) => slider({ label: `teacher logit ${i + 1}`, min: -2, max: 4, step: 0.1, value: v, format: (val) => val.toFixed(1), onInput: (val) => { teacherZ[i] = val; update(); } }));
  const sSliders = studentZ.map((v, i) => slider({ label: `student logit ${i + 1}`, min: -2, max: 4, step: 0.1, value: v, format: (val) => val.toFixed(1), onInput: (val) => { studentZ[i] = val; update(); } }));
  const sT = slider({ label: "temperature T", min: 1, max: 8, step: 0.5, value: T, format: (v) => v.toFixed(1), onInput: (v) => { T = v; update(); } });
  body.append(cv.box, st.el, ...tSliders.map((s) => s.el), ...sSliders.map((s) => s.el), sT.el);

  function compute() {
    const pt = softmax(teacherZ.map((z) => z / T));
    const ps = softmax(studentZ.map((z) => z / T));
    const loss = -pt.reduce((s, p, i) => s + p * Math.log(Math.max(1e-9, ps[i])), 0);
    return { pt, ps, loss };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { pt, ps } = compute();
    const n = pt.length, gw = w / n;
    for (let i = 0; i < n; i++) {
      const bw = gw * 0.3;
      const bht = pt[i] * (hh - 30), bhs = ps[i] * (hh - 30);
      ctx.fillStyle = p.accent; ctx.fillRect(i * gw + gw * 0.15, hh - 20 - bht, bw, bht);
      ctx.fillStyle = p.warm; ctx.fillRect(i * gw + gw * 0.15 + bw + 6, hh - 20 - bhs, bw, bhs);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`class ${i + 1}`, i * gw + gw / 2, hh - 4);
    }
  });

  function update() {
    const { pt, ps, loss } = compute();
    st.set("teacher", pt.map((v) => v.toFixed(3)).join(", "));
    st.set("student", ps.map((v) => v.toFixed(3)).join(", "));
    st.set("loss", loss.toFixed(4));
    say(`distillation loss ${loss.toFixed(3)} at temperature ${T}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
