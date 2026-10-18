// Shared code for the RAG benches: pure functions so the notes' worked numbers can be
// computed in Node. Vector/similarity math (cosineSim) and weighted scoring
// (weightedLeaderboardScore) are reused directly from gakit.js and llmkit.js where the
// mechanism is identical -- see each bench's imports.
import { cosineSim } from "./gakit.js";

// ---------- Why retrieval and grounding ----------

// A model's confidence in its own (unretrieved) answer, as a function of how far an event
// falls past its training cutoff: high and flat before the cutoff, decaying afterward but
// never quite reaching zero (a model still produces *some* answer).
export function confidenceVsCutoff(eventDate, cutoffDate) {
  const daysPast = (eventDate - cutoffDate) / (1000 * 60 * 60 * 24);
  if (daysPast <= 0) return 0.95;
  return Math.max(0.05, 0.95 * Math.exp(-daysPast / 30));
}

// ---------- Document processing and chunking ----------

// Word count, for measuring how much of a raw page is boilerplate versus real content.
export function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// Splits text into fixed-size windows with no regard for word or sentence boundaries.
export function fixedChunks(text, size) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

// Splits text into windows that slide forward by (size - overlap) each step, so consecutive
// chunks share `overlap` characters.
export function chunkWithOverlap(text, size, overlap) {
  const chunks = [];
  let i = 0;
  while (i < text.length) { chunks.push(text.slice(i, i + size)); i += size - overlap; }
  return chunks;
}

// Recursive chunking: splits on sentence boundaries first, packing whole sentences into a
// chunk until the next sentence would push it past maxSize, never cutting mid-sentence.
export function recursiveChunks(text, maxSize) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > maxSize && cur) { chunks.push(cur.trim()); cur = ""; }
    cur += s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

// True if `chunk` ends mid-word and the next chunk continues that same word.
export function splitsMidWord(chunk, nextChunk) {
  return /\w$/.test(chunk) && !!nextChunk && /^\w/.test(nextChunk);
}

// Semantic chunking: a chunk boundary falls wherever consecutive sentence embeddings' cosine
// similarity drops below `threshold` -- a topic shift, rather than a fixed character count.
export function semanticBoundaries(sentenceSims, threshold) {
  return sentenceSims.map((s, i) => (s < threshold ? i : null)).filter((x) => x !== null);
}

// Keeps only the most recent chunk(s) at or after a cutoff date, out of several near-duplicate
// chunks that differ only in when they were last updated.
export function freshnessFilter(chunks, cutoffDate, keep = 1) {
  return chunks
    .filter((c) => c.date >= cutoffDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, keep);
}

// ---------- Embeddings for retrieval ----------

// Late-interaction (ColBERT-style) scoring: for each query token vector, take its single best
// match among all of a document's token vectors, then sum those best-matches. A strong match
// survives however many unrelated document tokens surround it.
export function maxSimScore(queryTokenVecs, docTokenVecs) {
  return queryTokenVecs.reduce((sum, qv) => sum + Math.max(...docTokenVecs.map((dv) => cosineSim(qv, dv))), 0);
}

function meanPool(vecs) {
  return vecs[0].map((_, i) => vecs.reduce((s, v) => s + v[i], 0) / vecs.length);
}

// Single-vector scoring: mean-pool every token vector into one vector per side, then compare
// those two pooled vectors -- a strong match gets diluted by however many other tokens it's
// averaged together with.
export function singleVectorScore(queryTokenVecs, docTokenVecs) {
  return cosineSim(meanPool(queryTokenVecs), meanPool(docTokenVecs));
}

// Quantizes a vector to signed 8-bit integers (scaled by its own max absolute value), then
// immediately converts back to floats at that same scale -- simulating the precision lost by
// storing int8 instead of float32, without actually changing the vector's byte layout here.
export function quantizeAndDequantize(vec) {
  const maxAbs = Math.max(...vec.map(Math.abs));
  const scale = maxAbs / 127;
  return vec.map((x) => Math.round(x / scale) * scale);
}

// ---------- Vector search and indexing ----------

function euclid(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

// Greedy graph search (the core idea behind HNSW): starting at `startNode`, repeatedly move
// to the unexamined neighbor closest to the query, stopping once no neighbor is closer than
// the current node. Counts each neighbor actually looked at as one comparison, so the total
// can be compared directly against a brute-force scan of every node.
export function greedyGraphSearch(nodes, edges, query, startNode) {
  let current = startNode, comparisons = 0;
  const examined = new Set([startNode]);
  const path = [startNode];
  while (true) {
    const neighbors = edges[current].filter((n) => !examined.has(n));
    comparisons += neighbors.length;
    neighbors.forEach((n) => examined.add(n));
    if (!neighbors.length) break;
    const best = neighbors.reduce((a, b) => (euclid(query, nodes[a]) < euclid(query, nodes[b]) ? a : b));
    if (euclid(query, nodes[best]) >= euclid(query, nodes[current])) break;
    current = best;
    path.push(best);
  }
  return { found: current, comparisons, path };
}

// IVF-style clustering: assigns each vector to its nearest centroid, by Euclidean distance.
export function nearestCentroid(vec, centroids) {
  return Object.entries(centroids).map(([name, c]) => [name, euclid(vec, c)]).sort((a, b) => a[1] - b[1])[0][0];
}

// Expected number of ANN-ranked top-k results that also survive a metadata filter applied
// afterward, when the filter matches a `matchRate` fraction of the collection at random with
// respect to similarity rank.
export function postFilterSurvivorCount(topK, matchRate) {
  return Math.round(topK * matchRate);
}

// ---------- Retrieval strategies ----------

export function tokenize(s) {
  return s.toLowerCase().split(/\s+/);
}

function docFreq(term, tokenizedDocs) {
  return Object.values(tokenizedDocs).filter((d) => d.includes(term)).length;
}
function termFreq(term, doc) {
  return doc.filter((t) => t === term).length;
}

// Classic TF-IDF: term frequency times inverse document frequency. Its idf term can land
// exactly on zero once a term appears in around half the collection, giving it no weight at
// all even though it still distinguishes documents that contain it from ones that don't.
export function tfidfScore(query, doc, tokenizedDocs) {
  const N = Object.keys(tokenizedDocs).length;
  return tokenize(query).reduce((s, term) => {
    const idf = Math.log(N / (1 + docFreq(term, tokenizedDocs)));
    return s + termFreq(term, doc) * idf;
  }, 0);
}

// BM25: a smoothed, length-normalized relative of TF-IDF whose idf term never degenerates to
// exactly zero, and whose term-frequency contribution saturates (diminishing returns) rather
// than growing without bound.
export function bm25Score(query, doc, tokenizedDocs, { k1 = 1.5, b = 0.75 } = {}) {
  const N = Object.keys(tokenizedDocs).length;
  const avgLen = Object.values(tokenizedDocs).reduce((s, d) => s + d.length, 0) / N;
  return tokenize(query).reduce((s, term) => {
    const df = docFreq(term, tokenizedDocs);
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    const f = termFreq(term, doc);
    return s + (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * doc.length) / avgLen));
  }, 0);
}

// Reciprocal rank fusion: combines several independent rankings of the same candidates by
// summing 1/(k + rank) for each candidate's position in each ranking, so a candidate ranked
// highly by even one method can out-rank one that every method ranks only moderately.
export function reciprocalRankFusion(rankings, k = 60) {
  const scores = {};
  rankings.forEach((ranking) => ranking.forEach((doc, i) => { scores[doc] = (scores[doc] || 0) + 1 / (k + i + 1); }));
  return Object.entries(scores).sort((a, b) => b[1] - a[1]);
}

// Adds each query term's known synonyms to the query, for sparse retrieval methods that can
// only match exact vocabulary.
export function expandQuery(query, synonyms) {
  const terms = tokenize(query);
  const expanded = new Set(terms);
  terms.forEach((t) => (synonyms[t] || []).forEach((syn) => expanded.add(syn)));
  return [...expanded];
}

// ---------- Advanced RAG patterns ----------

// A lightweight relevance classifier for corrective RAG: looks only at the best of several
// retrieved passages' relevance scores and buckets the whole retrieval as correct (safe to
// generate from), ambiguous (worth a refined re-query) or incorrect (fall back entirely).
export function classifyRetrieval(scores, { correctAt = 0.7, ambiguousAt = 0.3 } = {}) {
  const best = Math.max(...scores);
  if (best >= correctAt) return "correct";
  if (best >= ambiguousAt) return "ambiguous";
  return "incorrect";
}

// Follows a fixed number of labeled edges out of a graph, starting from `start`, returning
// the path actually walked -- the mechanism behind graph-based RAG's multi-hop traversal.
export function traverseGraph(edges, start, hops) {
  let current = start;
  const path = [start];
  for (let h = 0; h < hops; h++) {
    const edge = edges.find(([from]) => from === current);
    if (!edge) break;
    current = edge[2];
    path.push(edge[1], current);
  }
  return path;
}

// ---------- Generation with retrieved context ----------

// Finds the passage (by name) whose embedding is most similar to a claim's embedding, and how
// similar it is -- the basis of citing a generated claim back to the passage that supports it.
export function bestSupport(claimVec, passages) {
  return Object.entries(passages).map(([name, v]) => [name, cosineSim(claimVec, v)]).sort((a, b) => b[1] - a[1])[0];
}

// The fraction of an answer's claims that have some passage supporting them above a similarity
// threshold -- a claim with no sufficiently similar passage is treated as unsupported (possibly
// hallucinated, i.e. not actually grounded in what was retrieved).
export function faithfulnessScore(claims, passages, threshold) {
  const supported = claims.filter((c) => bestSupport(c.vec, passages)[1] >= threshold);
  return supported.length / claims.length;
}

// How many retrieved chunks of `tokensPerChunk` fit in a fixed context budget once conversation
// history has already claimed some of it.
export function chunksThatFit(budget, conversationTokens, tokensPerChunk) {
  return Math.max(0, Math.floor((budget - conversationTokens) / tokensPerChunk));
}

// ---------- Evaluating RAG systems ----------

// `ranked` is a list of {relevant, gain} objects in retrieved order.
export function precisionAtK(ranked, k) {
  return ranked.slice(0, k).filter((r) => r.relevant).length / k;
}
export function recallAtK(ranked, k, totalRelevant) {
  return ranked.slice(0, k).filter((r) => r.relevant).length / totalRelevant;
}

// Mean reciprocal rank: 1 / (position of the first relevant result), 0 if none are relevant.
export function mrr(ranked) {
  const idx = ranked.findIndex((r) => r.relevant);
  return idx === -1 ? 0 : 1 / (idx + 1);
}

function dcgAtK(ranked, k) {
  return ranked.slice(0, k).reduce((s, r, i) => s + r.gain / Math.log2(i + 2), 0);
}

// Normalized discounted cumulative gain: rewards graded relevance (not just relevant/not),
// discounted by how far down the ranking each result sits, normalized against the best
// possible ordering of the same results.
export function ndcgAtK(ranked, k) {
  const dcg = dcgAtK(ranked, k);
  const ideal = [...ranked].sort((a, b) => b.gain - a.gain);
  const idealDcg = dcgAtK(ideal, k);
  return idealDcg === 0 ? 0 : dcg / idealDcg;
}

// Two-proportion z-score for an A/B test, pooling both variants' rates under the null
// hypothesis that they're equal -- |z| above about 1.96 is the usual 95%-confidence cutoff.
export function twoProportionZ(p1, n1, p2, n2) {
  const pPooled = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));
  return (p1 - p2) / se;
}

// ---------- RAG in practice ----------

// Total time a batch of queries costs with and without a cache that serves repeated queries
// at ~zero cost, at a given hit rate.
export function cacheSavings(hitRate, costPerQuery, totalQueries) {
  const withoutCache = totalQueries * costPerQuery;
  const withCache = totalQueries * (1 - hitRate) * costPerQuery;
  return { withoutCache, withCache, savings: withoutCache - withCache };
}

// Keeps only chunks whose permission tags overlap the user's roles -- the access-control
// analogue of freshnessFilter, applied before (not after) a chunk ever reaches generation.
export function permissionFiltered(chunks, userRoles, k) {
  return chunks.filter((c) => c.permissions.some((p) => userRoles.includes(p))).slice(0, k);
}
