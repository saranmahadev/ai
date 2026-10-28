Computers do not do real-number maths exactly. They store numbers with a fixed number of digits, so results are rounded, very big or very small values fall off the ends, and nearly-equal quantities can cancel into garbage. Everything earlier in this subject assumed perfect arithmetic; this section shows where that breaks and the standard fixes that every machine-learning library uses.

Topics in this section:

* [[Floating Point]]: how computers store real numbers, and the rounding that follows.
* [[Overflow and Underflow]]: numbers too large or too small to store.
* [[Numerical Stability]]: rewriting formulas so rounding does not ruin them.
* [[Conditioning]]: problems that amplify tiny errors, whatever you do.
* [[Random Numbers and Seeds]]: pseudo-randomness and reproducible experiments.
