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

// ---------- Planning and task decomposition ----------

// Counts how many times a task in `order` appears before one of its own prerequisites has
// completed -- a flat, non-dependency-aware ordering can violate dependencies that an order
// respecting them (a topological order, the output of decomposing a goal) never does.
export function countDependencyViolations(order, deps) {
  let violations = 0;
  const done = new Set();
  for (const task of order) {
    for (const dep of deps[task]) if (!done.has(dep)) violations++;
    done.add(task);
  }
  return violations;
}

// Total LLM calls for a fixed plan executed step by step (one planning call, then one call
// per step) versus interleaving a fresh think-then-act call at every step instead.
export function planExecuteCalls(nSteps) { return 1 + nSteps; }
export function interleavedCalls(nSteps) { return 2 * nSteps; }

// How many of a plan's steps complete when a failure partway through is ignored (every later
// step depending on the failed one also fails) versus when the agent notices and replans the
// remaining steps around it.
export function planFailureOutcome(totalSteps, failStep, replans) {
  return replans ? totalSteps : failStep;
}

// Total wall-clock time spent replanning every time the environment changes (every
// `volatility` steps) versus a reactive policy that never plans and just reacts each step.
export function planningTotalTime(horizon, volatility, tPlan, tExec) {
  const replans = Math.ceil(horizon / volatility);
  return replans * tPlan + horizon * tExec;
}
export function reactiveTotalTime(horizon, tReactive) {
  return horizon * tReactive;
}

// ---------- Tool use and function calling ----------

// Worst-case tool-selection accuracy with no signal beyond the candidate set itself: if the
// genuinely correct tool survived a top-K pre-filter, a uniform guess among the K shown
// succeeds 1/K of the time; if it didn't survive filtering, it can never be picked at all.
export function recallAtK(ranked, k, totalRelevant) {
  return ranked.slice(0, k).filter((r) => r.relevant).length / totalRelevant;
}
export function worstCaseToolAccuracy(ranked, k) {
  return recallAtK(ranked, k, 1) * (1 / k);
}

// Total latency for a set of tool calls run one after another versus run at once -- only
// possible when none of them depends on another's result.
export function sequentialTotal(latencies) { return latencies.reduce((a, b) => a + b, 0); }
export function parallelTotal(latencies) { return Math.max(...latencies); }

// Probability a transient failure eventually succeeds within n tries, given a per-call
// success probability -- and the same formula correctly gives 0 for a permanent error whose
// success probability is 0, no matter how many times it's retried.
export function successWithinNTries(perCallSuccess, n) {
  return 1 - Math.pow(1 - perCallSuccess, n);
}

// How many of a set of tool-call results, none of which raised an exception, actually pass a
// verification check against the fields the caller actually needs.
export function verifiedOkCount(results, requiredFields) {
  return results.filter((r) => passesGate(r, requiredFields)).length;
}

// Whether a value matches a tool's strict schema (here, ISO-8601 dates) -- a free-text field
// accepts anything, including formats the tool can't actually parse.
export function parsesAsIso(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// Total tool calls needed to apply an operation to n items one at a time versus expressing
// the whole loop as one piece of code the agent emits in a single call.
export function structuredCalls(nItems) { return nItems; }
export function codeInterfaceCalls() { return 1; }
