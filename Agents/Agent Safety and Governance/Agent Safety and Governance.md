An agent that can act on the real world — sending money, deleting files, emailing someone — needs more than good intentions to be safe to run unsupervised. This section is about how much autonomy to actually grant an agent, and what has to contain whatever autonomy it's given.

Topics in this section:

* [[Autonomy Levels and Human Oversight Tiers]]: a graded scale from "approves every action" to "fully unsupervised," and what each level actually requires.
* [[Sandboxing and Isolation]]: running an agent somewhere a mistake can't reach anything that actually matters.
* [[Excessive Agency and Scope Limits]]: giving an agent only the permissions its task genuinely needs, not whatever permissions were convenient to grant.
* [[Guardrails for Agent Actions]]: checks that run around an agent's actions specifically, not just around what a model says.
* [[Prompt Injection in Agent Contexts]]: a malicious instruction reaching an agent through something it reads or acts on, not through its own user.
