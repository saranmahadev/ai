A single forward pass has a fixed context window, but real use involves far more text than fits in one, conversations that span many turns, and sessions that return days later expecting to be remembered. This district covers handling all of that on top of a mechanism that, underneath, only ever sees one bounded window at a time.

Topics on this stretch of the road:

* [[Long-Context Transformers]]: what actually breaks as context length grows, and the main approaches to extending it.
* [[Context Window Extension Techniques]]: stretching a model trained on shorter sequences to handle longer ones.
* [[Context Rot and Lost-in-the-Middle Effects]]: why a model can use information at the start and end of a long context better than information buried in the middle.
* [[Multi-Turn Conversation State and Memory]]: keeping a conversation coherent across many turns without replaying everything every time.
* [[KV-Cache Reuse Across Sessions]]: avoiding redundant computation when a conversation returns to context it has already processed.
