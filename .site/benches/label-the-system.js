// Bench: capstone. Label the parts of four familiar AI systems.
export default function mount(root, kit) {
  const { frame, sorter, choice, h } = kit;
  const body = frame(root, {
    title: "Anatomy of an AI system"
  });
  const bins = [["goal", "Goal"], ["data", "Data it learns from or uses"], ["model", "Model or rule"], ["perceive", "Perceive"], ["decide", "Decide"], ["act", "Act"], ["judge", "How we judge it"]].map(([id, label]) => ({ id, label }));
  const SYS = {
    thermostat: ["Thermostat", [
      ["goal", "Keep the room at 20 °C"], ["data", "The temperature readings and the target setting"], ["model", "The rule: heat whenever the reading is below the target"],
      ["perceive", "Reads the temperature sensor"], ["decide", "Chooses to switch the heating on right now"], ["act", "Switches the heating on or off"], ["judge", "How far the room strays from 20 °C"]]],
    spam: ["Spam filter", [
      ["goal", "Keep junk out of the inbox without hiding real mail"], ["data", "Thousands of emails labelled spam or not spam"], ["model", "Word weights learned from those labelled emails"],
      ["perceive", "Reads the text of an arriving email"], ["decide", "Scores this email as probably spam"], ["act", "Moves the email to the spam folder"], ["judge", "Spam caught, and real mail wrongly hidden"]]],
    car: ["Self-driving car", [
      ["goal", "Reach the destination safely and legally"], ["data", "Recorded driving with labelled road objects, plus simulated miles"], ["model", "Neural networks that recognise objects and predict movement"],
      ["perceive", "Cameras and radar detect a cyclist ahead"], ["decide", "Judges the cyclist may cross and chooses to slow down"], ["act", "Applies the brakes"], ["judge", "Safety incidents per million kilometres, and ride comfort"]]],
    chat: ["Chatbot", [
      ["goal", "Give a helpful, honest answer to the request"], ["data", "Huge amounts of text, then examples of good answers"], ["model", "A large language model with billions of learned parameters"],
      ["perceive", "Reads the user's message and the conversation so far"], ["decide", "Chooses the next words to produce"], ["act", "Shows the reply on screen"], ["judge", "People's ratings and tests on benchmark questions"]]]
  };
  let cur = "spam";
  const pick = choice("System", Object.entries(SYS).map(([k, v]) => [k, v[0]]), cur, (k) => { cur = k; render(); });
  const holder = h("div", {});
  body.append(pick.el, holder);
  function render() {
    holder.textContent = "";
    const items = SYS[cur][1].map(([bin, label], i) => ({ id: "s" + i, label, bin, why: `this is the ${bins.find((b) => b.id === bin).label.toLowerCase()}.` }));
    holder.append(sorter({ items: kit.rng(7).shuffle(items), bins, answers: Object.fromEntries(items.map((i) => [i.id, i.bin])) }).el);
  }
  render();
}
