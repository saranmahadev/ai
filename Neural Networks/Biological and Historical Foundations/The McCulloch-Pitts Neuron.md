Fifteen years before [[The Perceptron|the perceptron]] learned anything, Warren McCulloch and Walter Pitts proposed the first mathematical neuron, in 1943. It had no learning rule at all — its weights were fixed by hand — but it proved something important: networks of simple threshold units, wired together correctly, can compute *any* logical function.

**You need:** [[Hebbian Learning]] and [[The Perceptron]].

## The question it answers

"Before anyone knew how to train a neuron, could you even build useful logic out of one?" Yes — hand-set a few units correctly, with no training involved at all, and you can compute AND, OR, NOT, and (by combining them) anything logic can express.

## Intuition: excitatory votes, with an absolute veto

A McCulloch-Pitts (MCP) neuron takes only binary (0 or 1) inputs, through connections marked either **excitatory** or **inhibitory**. If *any* inhibitory input is active, the neuron is vetoed outright and outputs 0, no matter what else is happening — an absolute, all-or-nothing block. Otherwise, it fires if enough excitatory inputs are active to cross a threshold. No weights are learned; a person chooses the threshold and the wiring by hand to compute whatever logical function they want.

## Definitions

```text
if any inhibitory input = 1:  output = 0                     (absolute veto)
else:  output = 1 if (sum of excitatory inputs) ≥ threshold, else 0
```

Unlike the perceptron, there is no update rule here at all — a MCP network's behaviour is entirely fixed once wired, the same way a hand-built logic circuit is.

## A worked example

Three hand-wired MCP neurons, computing three different logical functions:

```text
AND (2 excitatory inputs, threshold 2):
  (0,0)→0   (0,1)→0   (1,0)→0   (1,1)→1

OR (2 excitatory inputs, threshold 1):
  (0,0)→0   (0,1)→1   (1,0)→1   (1,1)→1

NOT (1 inhibitory input, no excitatory inputs, threshold 0):
  0→1   1→0
```

AND needs *both* excitatory inputs active to reach its threshold of 2; OR only needs one to clear its threshold of 1; NOT has no excitatory inputs at all, so it fires by default (0 clears a threshold of 0) unless its single inhibitory input vetoes it. Since AND, OR and NOT together can build any logical function, a network of enough correctly-wired MCP neurons can compute anything expressible in logic — with no learning involved anywhere.

## Bench

```bench
id: mcp-gates
title: Wiring logic out of threshold units
fallback: Pick AND, OR or NOT and watch an MCP neuron's excitatory sum, inhibitory veto, and output for all four input combinations.
```

**Try this**

1. Step through AND's four input combinations and confirm only `(1,1)` fires.
2. Switch to OR and confirm three of the four combinations fire.
3. Switch to NOT and see the inhibitory veto in action.

**What you should notice:** nothing here is learned — every gate's correct behaviour comes entirely from a person choosing the right threshold and excitatory/inhibitory wiring ahead of time.

## Where it appears in AI

* **The MCP neuron is the direct ancestor of every artificial neuron on both this planet and Deep Learning** — the perceptron, fifteen years later, kept the threshold-unit shape and added the missing piece: a way to *learn* the weights from data instead of hand-setting them.
* **Its proof that threshold-unit networks are logically universal** was an early, influential argument that brain-like computation might, in principle, be able to compute anything a digital computer could.
* **It had no answer to the XOR problem any more than a single perceptron did** (see [[From Linear Models to Neural Networks]] on the Deep Learning planet) — a *single* threshold unit still can't separate XOR, hand-wired or learned; MCP's universality claim is about *networks* of units, not any one unit alone.

## Common pitfalls

* **Confusing the MCP neuron with the perceptron.** The perceptron (1958) added a learning rule; the MCP neuron (1943) has none — its weights and wiring are entirely hand-designed.
* **Thinking "logically universal" means "practically useful" for learning from data.** MCP networks show what's computable with the right wiring, not how to find that wiring automatically from examples.
* **Treating the excitatory/inhibitory distinction as the same thing as a perceptron's signed weights.** Inhibition in the original MCP model is an absolute veto, not merely a negative number that subtracts from a sum.

## Quick check

<details><summary>1. What is the key difference between the McCulloch-Pitts neuron and the perceptron?</summary>
The MCP neuron has no learning rule at all — its wiring and threshold are set by hand; the perceptron learns its weights from labelled mistakes.
</details>

<details><summary>2. In the worked example, why does the AND gate need a threshold of 2 rather than 1?</summary>
It must require both excitatory inputs to be active before firing; a threshold of 1 would make it behave like OR instead.
</details>

<details><summary>3. What did McCulloch and Pitts's work prove about networks of threshold units?</summary>
That they are logically universal — correctly wired networks of such units can compute any logical function, even though no learning is involved.
</details>

## Key terms

* **McCulloch-Pitts (MCP) neuron:** the first mathematical neuron model (1943), with binary inputs, hand-set excitatory/inhibitory weights, and no learning rule.
* **Excitatory / inhibitory connection:** a connection that votes toward firing, or that can veto firing outright.
* **Absolute inhibition:** an inhibitory input that, if active, forces the output to 0 regardless of any excitatory input.

## Related

[[Hebbian Learning]] · [[The Perceptron]] · [[From Linear Models to Neural Networks]] · [[Why This Planet Looks Different from Deep Learning]]
