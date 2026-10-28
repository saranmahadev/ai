Making a transformer bigger raises three separate questions: whether every parameter has to run on every input, how big "bigger" actually is in concrete numbers, and how a single block's computation gets spread across hardware that no longer fits it on one device. This section answers each in turn.

Topics in this section:

* [[Mixture-of-Experts Transformer Blocks]]: routing each token to a handful of specialist feed-forward sublayers instead of running all of them.
* [[Counting a Transformer's Parameters and FLOPs]]: working out exactly how big and how expensive one block is.
* [[Splitting a Transformer Across Devices]]: dividing a single block's own weight matrices and sequence dimension across hardware.
