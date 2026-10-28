Before a transformer sees a single vector, raw text has to become a sequence of discrete symbols it can look up in a fixed vocabulary. This section covers how that vocabulary is built and the trade-offs baked into the choice.

Topics in this section:

* [[Byte Pair Encoding]]: building a vocabulary by repeatedly merging the most frequent adjacent pair of symbols.
* [[WordPiece and SentencePiece]]: the variations other major tokenizers use instead of raw BPE.
* [[Vocabulary Size and Out-of-Vocabulary Trade-offs]]: what a bigger or smaller vocabulary actually costs.
* [[Tokenizing Beyond Text]]: treating image patches and other non-text data as tokens too.
