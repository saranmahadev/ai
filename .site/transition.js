// The warp: a full-screen tunnel of clay streaks and rings that swallows the page, swaps the route at its peak, then opens on the new one.
// play({ color, dir, swap }): dir 1 = fly into a topic (streaks rush outward), dir -1 = return to the road (streaks rush inward, iris closes then opens).
const canvas = document.createElement("canvas");
canvas.id = "warp";
canvas.setAttribute("aria-hidden", "true");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const PALETTE = ["#ffffff", "#ffd9e6", "#d9ccff", "#c9f2e6", "#ffe9b8", "#cfe6ff"];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let busy = false;

function fit() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export const warp = {
  get busy() { return busy; },

  async play({ color = "#b39cf5", dir = 1, swap }) {
    if (busy) return;
    if (reduce) { swap && (await swap()); return; }
    busy = true;
    fit();
    canvas.classList.add("on");

    const W = innerWidth, H = innerHeight, cx = W / 2, cy = H / 2, diag = Math.hypot(W, H) / 2 + 40;
    const TOTAL = dir > 0 ? 2100 : 1900;
    const SWAP_AT = dir > 0 ? 1150 : 900;
    const streaks = Array.from({ length: 170 }, (_, i) => ({
      a: Math.random() * Math.PI * 2, r0: Math.random(), w: 3 + Math.random() * 7, len: 0.5 + Math.random(),
      c: i % 3 === 0 ? color : PALETTE[i % PALETTE.length], off: Math.random() * 0.3
    }));
    const rings = [];
    let nextRing = 0, swapped = false;
    const start = performance.now();

    await new Promise((done) => {
      const tick = async (now) => {
        const t = now - start, u = t / TOTAL;
        ctx.clearRect(0, 0, W, H);

        // 1. the dark tunnel fades in, then out after the swap
        const dark = dir > 0
          ? clamp(t / 350, 0, 1) * (1 - clamp((t - SWAP_AT - 250) / 500, 0, 1))
          : clamp(t / 300, 0, 1) * (1 - clamp((t - SWAP_AT - 100) / 600, 0, 1));
        ctx.fillStyle = `rgba(38, 30, 84, ${0.82 * dark})`;
        ctx.fillRect(0, 0, W, H);

        // 2. streaks: clay dashes rushing along rays (outward into a topic, inward when returning)
        const speed = ease(clamp(t / SWAP_AT, 0, 1));
        ctx.lineCap = "round";
        for (const s of streaks) {
          let p = (s.r0 + (t / 1000) * (0.4 + speed * 2.4) * (dir > 0 ? 1 : -1) + s.off) % 1;
          if (p < 0) p += 1;
          const r = Math.pow(p, 2.2) * diag;
          const len = (6 + speed * 120 * s.len) * (0.3 + p);
          const r2 = dir > 0 ? Math.max(0, r - len) : r + len;
          ctx.globalAlpha = clamp(dark * (0.25 + p) , 0, 1);
          ctx.strokeStyle = s.c;
          ctx.lineWidth = s.w * (0.4 + p);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(s.a) * r, cy + Math.sin(s.a) * r);
          ctx.lineTo(cx + Math.cos(s.a) * r2, cy + Math.sin(s.a) * r2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // 3. rings expanding like the walls of a tunnel
        if (t > nextRing && t < SWAP_AT + 300) { rings.push({ born: t, c: rings.length % 2 ? color : "#ffffff" }); nextRing = t + 140; }
        for (const g of rings) {
          const age = (t - g.born) / 1100;
          if (age > 1) continue;
          const rr = (dir > 0 ? Math.pow(age, 1.8) : Math.pow(1 - age, 1.8)) * diag * 1.05;
          ctx.globalAlpha = (1 - age) * 0.9 * clamp(dark * 2, 0, 1);
          ctx.strokeStyle = g.c;
          ctx.lineWidth = 6 + age * 26;
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, rr), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // 4. the portal core: swells to swallow the screen, then irises open on the new page
        let core;
        if (dir > 0) core = t < SWAP_AT - 250 ? Math.pow(clamp((t - 300) / (SWAP_AT - 550), 0, 1), 3) * 0.16 : 0.16 + ease(clamp((t - (SWAP_AT - 250)) / 300, 0, 1)) * 1.1;
        else core = t < SWAP_AT ? ease(clamp((t - 60) / (SWAP_AT - 80), 0, 1)) * 1.1 : 0;
        let coreAlpha = 1;
        if (dir > 0 && t > SWAP_AT) coreAlpha = 1 - ease(clamp((t - SWAP_AT) / 750, 0, 1));
        if (dir < 0 && t >= SWAP_AT) {
          // iris opens: a full-screen fill with a growing hole showing the new page
          const hole = ease(clamp((t - SWAP_AT - 40) / 800, 0, 1)) * diag * 1.05;
          if (hole < diag) {
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(cx, cy, Math.max(1, hole), 0, Math.PI * 2, true); ctx.fill("evenodd");
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 10; ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, hole), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
          }
        } else if (core > 0.001 && coreAlpha > 0.001) {
          const R = core * diag;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
          g.addColorStop(0, "#ffffff");
          g.addColorStop(0.55, color);
          g.addColorStop(1, color);
          ctx.globalAlpha = coreAlpha;
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }

        if (!swapped && t >= SWAP_AT) { swapped = true; try { swap && (await swap()); } catch (e) { console.warn(e); } }
        if (t < TOTAL) requestAnimationFrame(tick); else done();
      };
      requestAnimationFrame(tick);
    });

    canvas.classList.remove("on");
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    busy = false;
  }
};
