// Shared code for the LLMs benches: data curation, scaling-law arithmetic, alignment training
// (SFT/reward modeling/RLHF/DPO), reasoning search, context-window mechanics, evaluation
// (benchmarks, LLM-as-judge), and practice helpers (fine-tuning, model merging, cost/latency).
// Pure functions, so the notes' worked numbers can be computed by running this same code in Node.

export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function softmax(logits) {
  const m = Math.max(...logits);
  const ex = logits.map((x) => Math.exp(x - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((x) => x / s);
}

// ---------- Scaling laws ----------

// A Chinchilla-style loss surface: an irreducible floor plus two power-law terms that shrink as
// model size (N) and training tokens (D) grow.
export function scalingLoss(N, D, { E = 1.5, A = 400, B = 400, alpha = 0.5, beta = 0.5 } = {}) {
  return E + A / Math.pow(N, alpha) + B / Math.pow(D, beta);
}

// Grid-search the compute-optimal split of a fixed FLOPs budget C (≈ 6·N·D) between model size
// and training tokens, by scanning N on a log grid and deriving D from the compute identity.
export function computeOptimalSplit(C, opts = {}) {
  let best = null;
  for (let logN = 3; logN <= 13; logN += 0.02) {
    const N = Math.pow(10, logN);
    const D = C / (6 * N);
    if (D < 1) continue;
    const L = scalingLoss(N, D, opts);
    if (!best || L < best.L) best = { N, D, L };
  }
  return best;
}

// ---------- Reasoning ----------

// A single noisy guess at a multi-step problem (probability p of being right) vs. a chain of
// independent sub-steps (probability stepP each) that must ALL succeed -- the arithmetic behind
// why breaking a problem into reliable steps can beat one direct guess.
export function directVsChainTrial(rand, { directP, stepP, nSteps }) {
  const direct = rand() < directP;
  let chain = true;
  for (let i = 0; i < nSteps; i++) if (rand() >= stepP) chain = false;
  return { direct, chain };
}

// Tree-of-thought search: at each reasoning step, a true "correct" branch is drawn from a
// probability distribution over candidate continuations; a beam of width k survives that step
// only if the correct branch happens to be among the top-k most-probable candidates.
export function treeSearchSurvives(stepOptionProbs, beamWidth, rand) {
  for (const opts of stepOptionProbs) {
    const r = rand();
    let trueIdx = 0, cum = 0;
    for (let i = 0; i < opts.length; i++) { cum += opts[i]; if (r < cum) { trueIdx = i; break; } }
    if (trueIdx >= beamWidth) return false;
  }
  return true;
}

// Self-refinement: each critique-revise round halves the remaining gap to perfect quality.
export function selfRefineQuality(round) {
  return 1 - Math.pow(0.5, round + 1);
}

// Verifier-scored best-of-N at inference time: sample N candidates, score each noisily but
// correlated with correctness, and keep whichever scored highest -- the test-time-compute analogue
// of best-of-N training-time rejection sampling.
export function verifierBestOfN(N, correctProb, rand) {
  let bestScore = -1, bestCorrect = false;
  for (let i = 0; i < N; i++) {
    const correct = rand() < correctProb;
    const score = (correct ? 0.7 : 0.3) + rand() * 0.3;
    if (score > bestScore) { bestScore = score; bestCorrect = correct; }
  }
  return bestCorrect;
}

// ---------- Evaluating LLMs ----------

export function categoryAverage(scores) {
  const values = Object.values(scores);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// LLM-as-judge position bias: the same response scores higher purely for being shown first.
export function judgeScoreWithPositionBias(quality, position, bias = 0.15) {
  return quality + (position === "first" ? bias : 0);
}

export function capabilityAtAlignment(strength) {
  return 0.85 - 0.15 * strength;
}
export function safetyAtAlignment(strength) {
  return 0.5 + 0.45 * strength;
}

export function weightedLeaderboardScore(model, weights) {
  const num = Object.entries(model).reduce((s, [k, v]) => s + v * weights[k], 0);
  const den = Object.values(weights).reduce((a, b) => a + b, 0);
  return num / den;
}

// ---------- LLM landscape ----------

export function modelCardCompleteness(filledSections, allSections) {
  return filledSections.length / allSections.length;
}

// A responsible-scaling-policy-style tiered threshold: higher measured capability requires a
// higher safety tier's commitments before release.
export function requiredSafetyTier(capabilityScore) {
  if (capabilityScore < 0.3) return 1;
  if (capabilityScore < 0.6) return 2;
  if (capabilityScore < 0.85) return 3;
  return 4;
}

// ---------- Context and memory ----------

export function attentionFlops(n, dModel) {
  return 2 * n * n * dModel;
}

function rotate2D(x, theta) {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [x[0] * c - x[1] * s, x[0] * s + x[1] * c];
}

// The RoPE rotation angle for a given position and frequency -- used to compare how far an
// extrapolated (raw) position's angle strays from the range a model was actually trained on,
// versus an interpolated (rescaled) position that stays within it.
export function ropeAngle(pos, freq) {
  return pos * freq;
}

export function ropeRotate(vec, pos, freq) {
  return rotate2D(vec, ropeAngle(pos, freq));
}

// A toy U-shaped retrieval-accuracy curve: high near the start and end of a long context, lowest
// in the middle -- the "lost in the middle" signature.
export function lostInMiddleAccuracy(fracPos) {
  const dist = Math.abs(fracPos - 0.5) * 2;
  return 0.55 + 0.4 * Math.pow(dist, 1.5);
}

export function fullReplayTokens(turn, tokensPerTurn) {
  return turn * tokensPerTurn;
}

export function summarizedTokens(turn, tokensPerTurn, summaryBudget) {
  return Math.min(turn * tokensPerTurn, summaryBudget + tokensPerTurn);
}

// ---------- Alignment training ----------

// One step of Bradley-Terry maximum-likelihood fitting: given a (winner, loser) comparison and
// current scalar reward estimates, nudge the winner's score up and the loser's down by how
// surprising that outcome was under the current scores.
export function bradleyTerryStep(scores, winner, loser, lr = 0.005) {
  const pWin = 1 / (1 + Math.exp(-(scores[winner] - scores[loser])));
  const grad = 1 - pWin;
  scores[winner] += lr * grad;
  scores[loser] -= lr * grad;
  return scores;
}

// One REINFORCE-style policy-gradient step: shift logits toward candidates whose reward is
// above the current expected reward (the baseline), away from those below it.
export function reinforceStep(logits, rewards, lr = 0.5) {
  const probs = softmax(logits);
  const baseline = probs.reduce((s, p, i) => s + p * rewards[i], 0);
  const grad = probs.map((p, i) => p * (rewards[i] - baseline));
  return logits.map((l, i) => l + lr * grad[i]);
}

// One gradient step of the DPO loss, by numerical differentiation: pulls the policy's log-ratio
// (relative to a fixed reference policy) for the preferred response up, and for the dispreferred
// response down -- with no reward model and no RL loop.
export function dpoStep(policyLogits, refProbs, preferredIdx, dispreferredIdx, { beta = 1, lr = 0.3, eps = 1e-4 } = {}) {
  function loss(logits) {
    const p = softmax(logits);
    const z = beta * (Math.log(p[preferredIdx] / refProbs[preferredIdx]) - Math.log(p[dispreferredIdx] / refProbs[dispreferredIdx]));
    return -Math.log(1 / (1 + Math.exp(-z)));
  }
  const grad = policyLogits.map((_, i) => {
    const lp = [...policyLogits]; lp[i] += eps;
    const lm = [...policyLogits]; lm[i] -= eps;
    return (loss(lp) - loss(lm)) / (2 * eps);
  });
  return policyLogits.map((l, i) => l - lr * grad[i]);
}

// ---------- Pretraining data ----------

export function ngramSet(tokens, n) {
  const s = new Set();
  for (let i = 0; i <= tokens.length - n; i++) s.add(tokens.slice(i, i + n).join(" "));
  return s;
}

// Jaccard similarity between two sets of n-grams -- the basis of near-duplicate detection.
export function jaccardSimilarity(setA, setB) {
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter++;
  return inter / (setA.size + setB.size - inter);
}

// Weighted resampling across data domains: each domain's raw token count is scaled by its
// sampling weight, then a fixed budget is allocated proportionally to the weighted totals.
export function weightedMixture(rawCounts, weights, budget) {
  const weighted = Object.fromEntries(Object.entries(rawCounts).map(([k, v]) => [k, v * (weights[k] ?? 1)]));
  const total = Object.values(weighted).reduce((a, b) => a + b, 0);
  const proportions = Object.fromEntries(Object.entries(weighted).map(([k, v]) => [k, v / total]));
  const sampled = Object.fromEntries(Object.entries(proportions).map(([k, p]) => [k, Math.round(budget * p)]));
  return { proportions, sampled };
}

// Causal language modeling loss via teacher forcing: at every position, score the model's
// probability for the token that actually comes next, and average the negative log of that.
export function clmLoss(steps) {
  let total = 0;
  const perPosition = steps.map(({ logits, trueNext }) => {
    const probs = softmax(logits);
    const loss = -Math.log(probs[trueNext]);
    total += loss;
    return { probTrue: probs[trueNext], loss };
  });
  return { perPosition, meanLoss: total / steps.length };
}

// ---------- LLMs in practice ----------

// Squared-error loss of a 2D weight vector against a task's target -- the shared toy model
// behind both catastrophic forgetting (fine-tuning pulls weights toward a new task's target,
// away from an old one) and model merging (averaging two task-specialized weight vectors).
export function squaredLoss(w, target) {
  return (w[0] - target[0]) ** 2 + (w[1] - target[1]) ** 2;
}

// One gradient step of w toward `target` at the given learning rate.
export function gradientStepToward(w, target, lr) {
  return [w[0] - lr * (w[0] - target[0]), w[1] - lr * (w[1] - target[1])];
}

// Per-request token accounting: a fixed system prompt is repeated on every request, so its
// share of total tokens grows with its own length even though the user/assistant turns don't change.
export function templateOverhead(systemTokens, userTokens, assistantTokens, nRequests) {
  const perRequest = systemTokens + userTokens + assistantTokens;
  const totalSystemTokens = systemTokens * nRequests;
  const totalTokens = perRequest * nRequests;
  return { perRequest, totalSystemTokens, totalTokens, systemFraction: totalSystemTokens / totalTokens };
}

// API cost (token-priced) and latency (prefill scales with input length, decode is sequential
// and scales with output length) for one request.
export function apiCostLatency(inputTokens, outputTokens, { priceIn, priceOut, prefillPerTok, decodePerTok, fixedOverhead }) {
  const cost = (inputTokens * priceIn + outputTokens * priceOut) / 1000;
  const latency = fixedOverhead + inputTokens * prefillPerTok + outputTokens * decodePerTok;
  return { cost, latency };
}

// A safety filter's false-positive rate (safe content wrongly blocked) and catch rate (unsafe
// content correctly blocked) at a given score threshold, from two sets of scored examples.
export function guardrailStats(safeScores, unsafeScores, threshold) {
  const falsePositives = safeScores.filter((s) => s >= threshold).length;
  const trueCatches = unsafeScores.filter((s) => s >= threshold).length;
  return { falsePositiveRate: falsePositives / safeScores.length, catchRate: trueCatches / unsafeScores.length };
}
