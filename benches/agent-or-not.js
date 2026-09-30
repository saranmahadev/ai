// Bench: remove a part of an agent and see what stops working.
export default function mount(root, kit) {
  const { h, frame, choice, toggles, live } = kit;
  const body = frame(root, {
    title: "What makes something an agent?"
  });
  const say = live(body);
  const SCEN = {
    vacuum: { name: "Robot vacuum", sensors: "bump and cliff sensors", decide: "pick a direction to clean next", act: "wheels and brushes", goal: "clean the floor",
      no: { sensors: "It cannot tell where walls are, so it drives into them blindly.", decide: "It has percepts but no rule for what to do with them, so it just sits there.", act: "It knows exactly what to do but cannot move.", goal: "It has nothing to aim for, so any action is as good as any other." } },
    spam: { name: "Spam filter", sensors: "incoming email text", decide: "score each email", act: "move mail to the spam folder", goal: "keep junk out of the inbox",
      no: { sensors: "It never sees any email, so nothing can be judged.", decide: "Email arrives but nothing decides what it is.", act: "It can judge but never files anything, so the inbox stays full.", goal: "Without a goal it cannot tell a good decision from a bad one." } },
    chat: { name: "Chatbot", sensors: "your message", decide: "choose a reply", act: "write the reply on screen", goal: "give a helpful answer",
      no: { sensors: "It never receives your message.", decide: "Your message arrives but no reply is chosen.", act: "It thinks of a reply but cannot show it.", goal: "It would not know which reply is better." } },
    thermo: { name: "Thermostat", sensors: "temperature sensor", decide: "compare with the target", act: "switch the heating", goal: "hold the target temperature",
      no: { sensors: "It cannot read the room, so it heats or cools at random.", decide: "It reads the temperature but never compares it with anything.", act: "It knows it is cold but cannot turn on the heating.", goal: "Without a target there is nothing to compare against." } }
  };
  let cur = "vacuum", parts = { sensors: true, decide: true, act: true, goal: true };
  const pick = choice("System", Object.entries(SCEN).map(([k, v]) => [k, v.name]), cur, (k) => { cur = k; render(); });
  const tg = toggles([["sensors", "Sensors", true], ["decide", "Decision maker", true], ["act", "Actuators", true], ["goal", "Goal", true]], (v) => { parts = v; render(); });
  const cv = kit.canvas(body, { aspect: 0.3, label: "Diagram: environment, sensors, decision maker, actuators and goal" });
  const out = h("p", { class: "bench-verdict" });
  body.append(pick.el, tg.el, cv.box, out);
  cv.onDraw((ctx, w, hh, p) => {
    const boxes = [["Environment", w * 0.09, 1], ["Sensors", w * 0.30, parts.sensors], ["Decides", w * 0.51, parts.decide], ["Actuators", w * 0.72, parts.act], ["Environment", w * 0.91, 1]];
    const bw = w * 0.17, y = hh / 2;
    ctx.font = "800 13px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    boxes.forEach(([t, x, on], i) => {
      ctx.globalAlpha = on ? 1 : 0.28;
      ctx.fillStyle = on ? p.white : p.soft2; ctx.strokeStyle = i === 0 || i === 4 ? p.muted : p.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(x - bw / 2, y - 26, bw, 52, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = p.ink; ctx.fillText(t, x, y);
      if (i < 4) { ctx.strokeStyle = p.muted; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + bw / 2 + 2, y); ctx.lineTo(boxes[i + 1][1] - bw / 2 - 2, y); ctx.stroke(); }
    });
    ctx.globalAlpha = parts.goal ? 1 : 0.28; ctx.fillStyle = p.good; ctx.fillText("Goal: " + SCEN[cur].goal, w * 0.51, y - 44);
    ctx.globalAlpha = 1;
  });
  function render() {
    const s = SCEN[cur], off = Object.keys(parts).filter((k) => !parts[k]);
    const msg = off.length ? `Not an agent any more. ${off.map((k) => s.no[k]).join(" ")}`
      : `Complete: it senses (${s.sensors}), decides (${s.decide}) and acts (${s.act}) to ${s.goal}. That is an agent.`;
    out.textContent = off.map((k) => s.no[k]).join(" "); say(msg); cv.redraw();
  }
  render();
  return () => cv.destroy();
}
