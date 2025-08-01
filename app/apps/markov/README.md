# Advanced Markov Chain Monte Carlo Simulator

A comprehensive JavaScript-based MCMC simulator implementing Metropolis-Hastings algorithm, Bayesian inference, and advanced diagnostic tools for analyzing Markov chain convergence and mixing properties.

## Features

### Core Algorithms
- **Metropolis-Hastings Algorithm**: Implementation of the classic MCMC sampling method
- **Bayesian Inference**: Conjugate prior calculations and posterior estimation
- **Multiple Proposal Distributions**: Normal, Uniform, Cauchy, and Adaptive proposals
- **Various Target Distributions**: Mixture of Gaussians, Bimodal, Skewed, and Uniform distributions

### Advanced Diagnostics
- **Autocorrelation Analysis**: Measures chain mixing speed and independence
- **Effective Sample Size**: Calculates the effective number of independent samples
- **Gelman-Rubin Diagnostic**: Convergence assessment using multiple chains
- **Convergence Metrics**: Real-time monitoring of mean and variance convergence

### Interactive Visualizations
- **State Transition Graph**: Dynamic D3.js visualization of Markov chain states
- **Transition Matrix Heatmap**: Probability matrix visualization
- **Chain Trajectory Plot**: Real-time chain evolution with burn-in highlighting
- **Autocorrelation Function**: Lag-based correlation analysis
- **Convergence Plots**: Mean and variance convergence over time
- **Probability Distribution**: Posterior state probability estimation

## Technical Implementation

### Dependencies
- **TensorFlow.js**: For efficient random sampling and numerical computations
- **Math.js**: Advanced mathematical operations and matrix manipulations
- **Plotly.js**: Interactive plotting and visualization
- **React**: Component-based UI framework
- **Tailwind CSS**: Modern styling and responsive design

### Key Components

#### 1. Metropolis-Hastings Algorithm
```javascript
const metropolisHastings = (currentState, proposalDistribution, targetDistribution, acceptanceRate = 0.5) => {
  let proposal = proposalDistribution(currentState);
  const acceptanceRatio = targetDistribution(proposal) / targetDistribution(currentState);
  const acceptanceProbability = Math.min(1, acceptanceRatio);
  
  return Math.random() < acceptanceProbability ? proposal : currentState;
};
```

#### 2. Proposal Distributions
- **Normal**: Gaussian random walk with configurable scale
- **Uniform**: Uniform random walk in specified range
- **Cauchy**: Heavy-tailed proposal for better exploration
- **Adaptive**: Scale adjustment based on acceptance rate

#### 3. Target Distributions
- **Mixture of Gaussians**: Multi-modal target distribution
- **Bimodal**: Two-peaked distribution for testing mixing
- **Skewed**: Asymmetric distribution for robustness testing
- **Uniform**: Simple uniform target for baseline testing

#### 4. Diagnostic Tools
- **Autocorrelation Function**: Measures chain independence
- **Effective Sample Size**: Accounts for autocorrelation in sample efficiency
- **Gelman-Rubin Statistic**: Multi-chain convergence diagnostic
- **Mixing Speed**: Quantifies chain exploration efficiency

## Usage

### Basic Setup
1. Configure the number of states (2-10)
2. Set the number of samples (100-10,000)
3. Adjust burn-in rate (0-50%)
4. Select proposal distribution type
5. Choose target distribution
6. Click "Generate Chain" to start simulation

### Parameter Tuning

#### Burn-in Rate
- **Low (0.1)**: Quick convergence, may include non-stationary samples
- **High (0.3)**: Conservative approach, ensures stationarity
- **Adaptive**: Monitor convergence metrics to determine optimal burn-in

#### Proposal Distribution Selection
- **Normal**: Good for most continuous distributions
- **Uniform**: Robust but may be less efficient
- **Cauchy**: Better for heavy-tailed targets
- **Adaptive**: Automatically adjusts based on acceptance rate

#### Number of Samples
- **Small (1,000)**: Quick exploration, limited precision
- **Large (10,000)**: High precision, longer computation time
- **Monitor ESS**: Ensure effective sample size is sufficient

### Interpreting Results

#### Acceptance Rate
- **Optimal**: 20-50% for most problems
- **Too Low**: Proposal too large, inefficient exploration
- **Too High**: Proposal too small, slow mixing

#### Mixing Speed
- **Lower Values**: Better mixing, more independent samples
- **Higher Values**: Slower mixing, more autocorrelation

#### Gelman-Rubin Statistic
- **< 1.1**: Good convergence
- **1.1-1.2**: Acceptable convergence
- **> 1.2**: Poor convergence, increase samples or adjust parameters

#### Effective Sample Size
- **Compare to Total Samples**: Higher ratio indicates better efficiency
- **Minimum Threshold**: Aim for ESS > 100 for reliable inference

## Advanced Features

### Real-time Visualization
- **Live State Updates**: Watch the chain evolve in real-time
- **Burn-in Highlighting**: Visual distinction between burn-in and post-burn-in samples
- **Interactive Plots**: Zoom, pan, and hover for detailed analysis

### Performance Optimization
- **TensorFlow.js Integration**: GPU-accelerated computations when available
- **Efficient Sampling**: Optimized random number generation
- **Memory Management**: Efficient data structures for large chains

### Extensibility
- **Custom Distributions**: Easy to add new target and proposal distributions
- **Additional Diagnostics**: Framework for implementing new convergence tests
- **Export Capabilities**: Save results for external analysis

## Mathematical Background

### Metropolis-Hastings Algorithm
The algorithm generates samples from a target distribution π(x) using a proposal distribution q(x'|x):

1. Generate proposal x' ~ q(x'|x)
2. Calculate acceptance probability: α = min(1, π(x')q(x|x')/π(x)q(x'|x))
3. Accept x' with probability α, otherwise keep x

### Autocorrelation Function
For lag k, the autocorrelation function is:
ρ(k) = Cov(X_t, X_{t+k}) / Var(X_t)

### Effective Sample Size
ESS = N / (1 + 2∑_{k=1}^∞ ρ(k))

### Gelman-Rubin Diagnostic
R̂ = √((W(n-1)/n + B/n)/W)
where W is within-chain variance and B is between-chain variance.

## Applications

### Bayesian Inference
- Posterior sampling for complex models
- Parameter estimation with uncertainty quantification
- Model comparison and selection

### Statistical Computing
- Integration over high-dimensional spaces
- Optimization in complex landscapes
- Simulation-based inference

### Research and Education
- Algorithm demonstration and teaching
- Method comparison and benchmarking
- Prototyping new MCMC variants

## Future Enhancements

### Planned Features
- **Hamiltonian Monte Carlo**: More efficient sampling for continuous parameters
- **No-U-Turn Sampler (NUTS)**: Automatic tuning of HMC parameters
- **Parallel Tempering**: Better exploration of multi-modal distributions
- **Variational Inference**: Fast approximate posterior estimation

### Performance Improvements
- **Web Workers**: Parallel chain generation
- **WebGL Acceleration**: GPU-accelerated computations
- **Streaming Visualization**: Real-time plot updates for large datasets

## Contributing

This simulator is designed to be educational and extensible. Contributions are welcome for:
- New proposal or target distributions
- Additional diagnostic tools
- Performance optimizations
- Documentation improvements
- Bug fixes and feature requests

## License

This project is open source and available under the MIT License. 