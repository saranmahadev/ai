## 1. Linear Algebra

### 1.1 [[Math Fundamentals|Fundamentals]]

* Scalars
* Vectors
* Vector notation
* Vector dimensions
* Row vectors vs column vectors
* Vector addition/subtraction
* Scalar multiplication
* Linear combinations
* Span
* Linear independence

### 1.2 Vector Operations

* Dot product
* Inner product
* Vector magnitude
* Norms

  * L1 norm
  * L2 norm
  * L∞ norm
* Distance
* Cosine similarity
* Orthogonality
* Projections

### 1.3 Matrices

* Matrix representation
* Matrix dimensions
* Matrix addition/subtraction
* Scalar multiplication
* Matrix multiplication
* Transpose
* Symmetric matrices
* Identity matrix
* Diagonal matrices
* Triangular matrices
* Sparse matrices

### 1.4 Matrix Properties

* Determinant
* Inverse
* Rank
* Trace
* Linear systems
* Singular matrices
* Positive definite / semi-definite matrices

### 1.5 Vector Spaces

* Vector spaces
* Basis
* Dimension
* Column space
* Row space
* Null space
* Change of basis

### 1.6 Eigenvalues & Eigenvectors

* Eigenvalues
* Eigenvectors
* Characteristic equation
* Eigen-decomposition
* Diagonalization
* Intuition behind eigenvectors

### 1.7 Matrix Decompositions

Important for ML:

* LU decomposition
* QR decomposition
* **Singular Value Decomposition (SVD)**
* Eigendecomposition

### 1.8 Dimensionality Reduction

* Principal Component Analysis (PCA)
* Covariance matrix
* Geometric interpretation of PCA

### 1.9 Tensors

Particularly important for Deep Learning:

* Scalars → 0D tensor
* Vectors → 1D tensor
* Matrices → 2D tensor
* Higher-dimensional tensors
* Tensor shapes
* Tensor operations
* Broadcasting

---

# 2. Calculus

## 2.1 Functions

* Variables
* Constants
* Functions
* Domain
* Range
* Function composition
* Linear functions
* Polynomial functions
* Exponential functions
* Logarithmic functions
* Sigmoid
* ReLU
* Softmax

These become particularly important when studying neural networks.

---

## 2.2 Limits

* Concept of a limit
* Continuity
* Basic limit rules

You don't need an extremely rigorous mathematical treatment.

---

## 2.3 Derivatives

* Derivative intuition
* Derivative as rate of change
* Derivative rules
* Power rule
* Product rule
* Quotient rule
* Chain rule
* Derivatives of:

  * Exponential functions
  * Logarithms
  * Sigmoid
  * ReLU

---

## 2.4 Partial Derivatives

For functions with multiple variables:

$$
f(x,y,z)
$$

Learn:

* Partial derivative
* First-order partial derivatives
* Higher-order partial derivatives

---

## 2.5 Gradients

* Gradient
* Gradient vector
* Directional derivatives
* Gradient interpretation
* Gradient fields

This is **extremely important for ML**.

---

## 2.6 Jacobian

* Jacobian matrix
* Vector-valued functions
* Jacobian intuition

Very useful once you enter neural networks and transformations.

---

## 2.7 Hessian

* Second derivatives
* Hessian matrix
* Curvature
* Local minima/maxima
* Saddle points

You don't need to obsess over advanced Hessian mathematics initially, but understand what it represents.

---

## 2.8 Optimization

* Objective functions
* Minima/maxima
* Local vs global minima
* Convex vs non-convex functions
* Gradient descent
* Learning rate
* Stochastic gradient descent
* Mini-batch gradient descent

Later:

* Momentum
* Adam
* RMSProp
* Newton's method

---

# 3. Probability

## 3.1 Probability Fundamentals

* Experiments
* Outcomes
* Sample spaces
* Events
* Probability axioms
* Joint probability
* Marginal probability

---

## 3.2 Conditional Probability

* Conditional probability
* Independence
* Chain rule of probability
* Law of total probability

genui{"learning_viz":{"type_id":"CONDITIONAL_PROBABILITY_DEFINITION"}}

---

## 3.3 Bayes' Theorem

* Bayes' theorem
* Prior
* Likelihood
* Evidence
* Posterior
* Bayesian inference

genui{"learning_viz":{"type_id":"BAYES_THEOREM"}}

This becomes important for understanding probabilistic ML.

---

## 3.4 Random Variables

* Discrete random variables
* Continuous random variables
* Probability mass function
* Probability density function
* Cumulative distribution function

---

## 3.5 Probability Distributions

### Discrete

* Bernoulli
* Binomial
* Categorical
* Multinomial
* Poisson

### Continuous

* Uniform
* Normal/Gaussian
* Exponential
* Beta

You don't need to memorize dozens of distributions. Understand **what they represent and when they're useful**.

---

## 3.6 Expectation & Moments

* Expected value
* Variance
* Standard deviation
* Covariance
* Higher moments
* Conditional expectation

genui{"learning_viz":{"type_id":"VARIANCE"}}

---

## 3.7 Multivariate Probability

* Joint distributions
* Marginal distributions
* Conditional distributions
* Covariance matrices
* Multivariate Gaussian

---

# 4. Statistics

## 4.1 Descriptive Statistics

* Mean
* Median
* Mode
* Range
* Variance
* Standard deviation
* Percentiles
* Quartiles
* Interquartile range

---

## 4.2 Data Distributions

Understand:

* Normal distribution
* Skewness
* Kurtosis
* Outliers
* Distribution shape
* Z-scores

---

## 4.3 Sampling

* Population
* Sample
* Sampling methods
* Sampling distributions
* Central Limit Theorem
* Standard error

The **Central Limit Theorem** is particularly useful conceptually.

---

## 4.4 Estimation

* Point estimation
* Maximum likelihood estimation (MLE)
* Maximum a posteriori estimation (MAP)
* Bias
* Variance
* Bias-variance tradeoff

**MLE/MAP** are especially useful when moving into probabilistic ML.

---

## 4.5 Confidence Intervals

* Confidence intervals
* Interpretation
* Standard errors
* Confidence levels

---

## 4.6 Hypothesis Testing

* Null hypothesis
* Alternative hypothesis
* Test statistic
* p-value
* Significance level
* Type I error
* Type II error
* Statistical power

---

## 4.7 Correlation & Covariance

* Covariance
* Pearson correlation
* Spearman correlation
* Correlation vs causation

genui{"learning_viz":{"type_id":"CORRELATION"}}

---

# 5. Information Theory

This is the major topic missing from my earlier list.

You should learn:

### 5.1 Entropy

How much uncertainty exists in a probability distribution.

### 5.2 Cross-Entropy

Extremely important for classification and modern neural networks.

### 5.3 KL Divergence

Measures how one probability distribution differs from another.

### 5.4 Mutual Information

Measures how much information one variable contains about another.

### 5.5 Information Gain

Important in decision trees.

---

# 6. Optimization Theory

Although optimization overlaps with calculus, I would treat it as its own ML foundation.

Learn:

* Objective functions
* Loss functions
* Cost functions
* Constraints
* Unconstrained optimization
* Constrained optimization
* Gradient descent
* Stochastic gradient descent
* Mini-batch optimization
* Learning rate
* Convexity
* Local vs global minima
* Saddle points
* Regularization

Later:

* Momentum
* Adam
* RMSProp
* L-BFGS
* Learning-rate schedules

---

# 7. Numerical Foundations

You don't need to become a numerical-analysis expert, but understand:

* Floating-point numbers
* Numerical precision
* Overflow / underflow
* Numerical stability
* Vectorization
* Computational complexity
* Approximation
* Random initialization

These become surprisingly important in Deep Learning.

---

# 8. ML-Specific Mathematical Concepts

Once you've covered the above, there are a few concepts that bridge mathematics into actual ML.

### Learn:

* Feature vectors
* Parameter vs hyperparameter
* Model function
* Loss function
* Objective function
* Training
* Inference
* Optimization
* Generalization
* Overfitting
* Underfitting
* Bias-variance tradeoff
* Regularization
* L1 regularization
* L2 regularization
* Train/validation/test split

---
