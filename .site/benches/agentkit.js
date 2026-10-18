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

// ---------- Memory and state management ----------

// How many times a user has to restate the same fact across separate sessions: every
// session if nothing persists between them, versus exactly once if it's written to
// long-term memory the first time and read back on every later session.
export function redundantAsks(nSessions, persistent) {
  return persistent ? 1 : nSessions;
}

// Total attempts spent on a recurring task: without an episodic log, every instance
// re-discovers which approach works from scratch (try, fail, try again, succeed); with
// one, only the first instance has to discover it -- every later instance recalls the
// logged outcome and goes straight to the approach that worked.
export function recurringTaskAttempts(nInstances, useEpisodicMemory) {
  if (!useEpisodicMemory) return 2 * nInstances;
  return 2 + (nInstances - 1) * 1;
}

// Raw transcript size growing linearly with turns versus a fixed summarization budget
// that stays capped regardless of how long the conversation runs.
export function rawTranscriptTokens(nTurns, perTurn) {
  return nTurns * perTurn;
}
export function compressionRatio(nTurns, perTurn, cap) {
  return (nTurns * perTurn) / cap;
}

// External calls a multi-step task needs for a piece of shared context: once per step if
// nothing is shared between steps, or exactly once if it's fetched into shared state the
// first time and every later step just reads it back.
export function externalCallsWithoutSharedState(nSteps) {
  return nSteps;
}
export function externalCallsWithSharedState() {
  return 1;
}

// ---------- Multi-agent systems ----------

// Communication edges in a hub-and-spoke supervisor topology (one link per specialist,
// specialists never link to each other) versus a fully connected peer-to-peer mesh among
// the same number of agents.
export function starEdges(n) {
  return n;
}
export function meshEdges(n) {
  return (n * (n - 1)) / 2;
}

// How many pipeline stages run on a flawed result before anything notices, if nothing
// validates between stages -- versus zero, if each stage gates its output the way
// Prompt Chaining's validation gate does, just one level up at agent granularity.
export function wastedStagesWithoutGate(totalStages, failStage) {
  return totalStages - failStage;
}

// Whether two agents are in a circular wait: the specific coordination failure where each
// is blocked on a result only the other can produce, so neither can proceed.
export function circularWait(aWaitsOnB, bWaitsOnA) {
  return aWaitsOnB && bWaitsOnA;
}

// Total work units spent on a set of subtasks if two uncoordinated agents each do all of
// them independently (duplicated) versus a coordinated division where each is done once.
export function duplicatedWorkUnits(nSharedSubtasks, duplicated) {
  return duplicated ? 2 * nSharedSubtasks : nSharedSubtasks;
}

// ---------- Reflection and self-improvement ----------

// Runs a trajectory of steps, each computed from the previous step's value. Without
// self-critique, a step's injected buggy output is used as-is and feeds the next step.
// With self-critique, each step recomputes its own output from its own formula and
// swaps in that recomputed value whenever it disagrees with what was produced.
export function runSelfCritique(steps, selfCritique) {
  let value = steps[0].start;
  const log = [value];
  let correctionsCaught = 0;
  for (let i = 1; i < steps.length; i++) {
    const s = steps[i];
    let produced = s.buggyOutput ? s.buggyOutput(value) : s.compute(value);
    if (selfCritique) {
      const recomputed = s.compute(value);
      if (produced !== recomputed) { produced = recomputed; correctionsCaught++; }
    }
    value = produced;
    log.push(value);
  }
  return { final: value, log, correctionsCaught };
}

// How many checks it takes to find the first step that broke a long trajectory: a linear
// forward scan checks every step up to and including the culprit; a binary search over the
// same monotonic valid/invalid boundary needs only ceil(log2(n)) checks.
export function linearAttributionChecks(culprit) {
  return culprit;
}
export function binaryAttributionChecks(n) {
  return Math.ceil(Math.log2(n));
}

// Attempts at a repeated task: without incorporating feedback into context, the same
// mistake repeats every attempt (always wrong); with it, the first attempt still fails
// (there's no feedback yet), but every attempt after the correction is appended succeeds --
// no weights changed, only what's in the context window.
export function attemptsWithoutFeedback(n) {
  return Array.from({ length: n }, () => false);
}
export function attemptsWithFeedback(n) {
  return Array.from({ length: n }, (_, i) => i >= 1);
}

// Runs a sequence of actions, each either valid immediately or only after some number of
// retries. Without a verifier, every action is used on its first (possibly bad) attempt.
// With one, an action is retried -- up to maxRetries times -- until it passes, consuming
// retries only from the budget actions that actually need them.
export function runVerifierGuided(actions, useVerifier, maxRetries) {
  let retriesUsed = 0;
  const results = actions.map((a) => {
    let attempt = 0;
    let ok = a.validOnAttempt <= attempt;
    if (useVerifier) {
      while (!ok && attempt < maxRetries) {
        attempt++;
        retriesUsed++;
        ok = a.validOnAttempt <= attempt;
      }
    }
    return { ok, attempts: attempt + 1 };
  });
  return { results, allOk: results.every((r) => r.ok), retriesUsed };
}

// ---------- Agent environments and action spaces ----------

// A web agent's planned action targets an element either by stable selector (role/id) or by
// raw list index. A re-render before `reRenderAtAction` shifts every index after it, so
// index-based targeting only keeps hitting the right element up to that point.
export function webActionAccuracy(nActions, reRenderAtAction) {
  let indexCorrect = 0;
  for (let i = 1; i <= nActions; i++) if (i < reRenderAtAction) indexCorrect++;
  return { indexCorrect, selectorCorrect: nActions, nActions };
}

// A fixed pixel click-error offset either lands inside a target's half-width/half-height
// box (a hit) or doesn't -- the same offset can hit a big button and miss a small icon.
export function clickHit(halfW, halfH, dx, dy) { return dx <= halfW && dy <= halfH; }

// Stateful (persistent) execution sends each of n steps' own code once; stateless execution
// resends every prior step's code alongside each new one, so volume grows triangularly.
export function statefulCodeVolume(n, lenPerStep = 1) { return n * lenPerStep; }
export function statelessCodeVolume(n, lenPerStep = 1) { return (n * (n + 1) / 2) * lenPerStep; }

// Three strategies for a set of tasks, each task carrying its GUI action count, its code
// action count, and whether the code path actually succeeds (e.g. skips validation events).
export function actionSpaceStrategyTotals(tasks, strategy) {
  let actions = 0, successes = 0;
  for (const t of tasks) {
    if (strategy === "gui") { actions += t.gui; successes++; }
    else if (strategy === "code") { actions += t.code; if (t.codeSucceeds) successes++; }
    else { // hybrid: use code when it works, fall back to the GUI path when it doesn't
      actions += t.codeSucceeds ? t.code : t.gui;
      successes++;
    }
  }
  return { actions, successes, of: tasks.length };
}

// A random, uninformed first pick among k enumerated (one-action-per-object) choices
// succeeds with probability 1/k -- this is the combinatorial-explosion failure mode as
// k grows, distinct from a too-coarse action that can never succeed at any k.
export function enumeratedActionSuccess(k) { return 1 / k; }

// ---------- Evaluating agents ----------

// Grading an agent run by exact text match vs. by checking the environment's resulting
// state -- many different final messages can all reach the identical correct state.
export function gradingAccuracy(runs, mode) {
  let correct = 0;
  for (const r of runs) {
    if (mode === "text") { if (r.finalText === r.referenceText) correct++; }
    else { if (r.resultState === r.expectedState) correct++; }
  }
  return { correct, of: runs.length };
}

// A binary success rate hides how close a failing run actually got -- two agents with the
// identical success rate can have very different average partial credit on their failures.
export function partialCreditStats(runs) {
  const successes = runs.filter((r) => r.credit >= 1).length;
  const avgCredit = runs.reduce((a, r) => a + r.credit, 0) / runs.length;
  return { successRate: successes / runs.length, avgCredit };
}

// Outcome-only grading checks just the final answer; trajectory-level grading checks every
// step, so it can fail a run whose final answer happens to be right despite an invalid step.
export function trajectoryVerdict(stepsValid, finalCorrect) {
  const validCount = stepsValid.filter(Boolean).length;
  return {
    outcomePass: finalCorrect,
    trajectoryScore: validCount / stepsValid.length,
    trajectoryPass: stepsValid.every(Boolean),
  };
}

// An agent config with a higher success rate isn't automatically the better choice once cost
// is folded in -- cost per SUCCESSFUL run is the joint metric that can flip the comparison.
export function costPerSuccess(successRate, costPerAttempt) { return costPerAttempt / successRate; }
