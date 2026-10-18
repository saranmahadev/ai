// Shared code for the Agents benches: pure functions so the notes' worked numbers can be
// computed in Node. Weighted scoring is reused directly from llmkit.js where the mechanism
// is identical -- see each bench's imports.

// ---------- Foundations of agentic systems ----------

// A single, unlooped step only follows one link in a chain of facts -- it can't reach
// anything that depends on a fact it hasn't looked up yet.
export function singleCallLookup(graph, start) {
  const node = graph[start];
  return node.manager ?? node.department ?? null;
}

// Repeatedly follows links until a terminal fact (here, a department) is reached, or a step
// budget runs out -- the same lookup mechanism, applied more than once.
export function loopedLookup(graph, start, maxSteps) {
  let current = start, steps = 0;
  while (steps < maxSteps) {
    steps++;
    const node = graph[current];
    if (node.department) return { result: node.department, steps };
    current = node.manager;
  }
  return { result: null, steps };
}

// Whether a failure injected at a given step is ever detected: open-loop never checks an
// action's actual result, so an injected failure is always silent; closed-loop checks after
// every step, so it's always caught as soon as it happens.
export function loopDetectsFailure(nSteps, failStep, closedLoop) {
  for (let s = 0; s < nSteps; s++) {
    if (s === failStep && closedLoop) return true;
  }
  return false;
}

// ---------- Workflow patterns before autonomy ----------

// A validation gate between chained steps: an intermediate result only proceeds to the next
// step if it actually has every field the next step depends on.
export function passesGate(result, requiredFields) {
  return requiredFields.every((f) => result.includes(f));
}

// Weighted-average accuracy when each request is routed to the specialist accuracy matching
// its true category, versus one flat accuracy if every request goes through a single generic
// handler instead.
export function routingAccuracy(requests, specialistAccuracy) {
  return requests.reduce((s, r) => s + specialistAccuracy[r], 0) / requests.length;
}

function choose(n, k) {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}

// Exact probability that a strict majority of n independent samples, each correct with
// probability p, are correct -- the mechanism behind self-consistency/majority-vote sampling.
export function majorityVoteAccuracy(n, p) {
  let total = 0;
  for (let k = Math.floor(n / 2) + 1; k <= n; k++) total += choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  return total;
}
