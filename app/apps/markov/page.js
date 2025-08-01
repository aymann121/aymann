"use client"

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as math from 'mathjs';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-48">Loading plot...</div>
});

export default function Markov() {
  const [chainData, setChainData] = useState([]);
  const [transitionMatrix, setTransitionMatrix] = useState([]);
  const [burnInRate, setBurnInRate] = useState(0.1);
  const [numSamples, setNumSamples] = useState(1000);
  const [numStates, setNumStates] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  const [mixingSpeed, setMixingSpeed] = useState(0);
  const [currentState, setCurrentState] = useState(0);
  const [acceptanceRate, setAcceptanceRate] = useState(0);
  const [proposalType, setProposalType] = useState('normal');
  const [targetType, setTargetType] = useState('mixture');
  const [effectiveSampleSize, setEffectiveSampleSize] = useState(0);
  const [gelmanRubin, setGelmanRubin] = useState(0);
  const [convergenceHistory, setConvergenceHistory] = useState([]);
  const [editingCell, setEditingCell] = useState(null); // {row, col} for which cell is being edited
  const [showProposalEditor, setShowProposalEditor] = useState(false);
  const [initialDistribution, setInitialDistribution] = useState([]);
  const [proposalScale, setProposalScale] = useState(1.5);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); // 'main', 'matrix-power', 'info'
  const [matrixPowerSteps, setMatrixPowerSteps] = useState(5);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize transition matrix
  useEffect(() => {
    if (numStates >= 2) {
      initializeTransitionMatrix();
      initializeInitialDistribution();
    }
  }, [numStates]);

  // Ensure initial distribution is set if it's empty
  useEffect(() => {
    if (initialDistribution.length === 0 && numStates >= 2) {
      initializeInitialDistribution();
    }
  }, [initialDistribution.length, numStates]);

  // Update transition probability (without immediate normalization)
  const updateTransitionProbability = (fromState, toState, probability) => {
    const newMatrix = [...transitionMatrix];
    newMatrix[fromState][toState] = Math.max(0, probability);
    setTransitionMatrix(newMatrix);
  };

  // Handle cell click to start editing
  const handleCellClick = (row, col) => {
    setEditingCell({ row, col });
  };

  // Handle cell edit completion
  const handleCellEdit = (value) => {
    if (editingCell) {
      const probability = parseFloat(value) || 0;
      updateTransitionProbability(editingCell.row, editingCell.col, probability);
      setEditingCell(null);
    }
  };

  // Handle cell edit cancellation
  const handleCellEditCancel = () => {
    setEditingCell(null);
  };

  // Calculate matrix power (transition matrix raised to the nth power)
  const calculateMatrixPower = (matrix, power) => {
    if (!matrix || matrix.length === 0) {
      return [];
    }
    
    if (power === 0) {
      // Return identity matrix
      return Array(matrix.length).fill().map((_, i) => 
        Array(matrix.length).fill().map((_, j) => i === j ? 1 : 0)
      );
    }
    
    if (power === 1) {
      return matrix;
    }
    
    // Use mathjs for matrix multiplication
    try {
      let result = matrix;
      for (let i = 1; i < power; i++) {
        result = math.multiply(result, matrix);
      }
      return result;
    } catch (error) {
      console.error('Matrix multiplication error:', error);
      return matrix;
    }
  };

  // Multiply matrix with vector (matrix-vector multiplication)
  const multiplyMatrixWithVector = (matrix, vector) => {
    if (!matrix || !vector || matrix.length === 0 || vector.length === 0) {
      return vector || [];
    }
    
    try {
      return math.multiply(matrix, vector);
    } catch (error) {
      console.error('Matrix-vector multiplication error:', error);
      return vector;
    }
  };

  // Update initial distribution probability
  const updateInitialProbability = (state, probability) => {
    const newInitial = [...initialDistribution];
    newInitial[state] = Math.max(0, probability);
    setInitialDistribution(newInitial);
  };

  // Initialize initial distribution
  const initializeInitialDistribution = () => {
    const distribution = Array(numStates).fill(1 / numStates);
    setInitialDistribution(distribution);
  };

  // Normalize transition matrix before running
  const normalizeTransitionMatrix = () => {
    const normalizedMatrix = transitionMatrix.map(row => {
      const sum = row.reduce((a, b) => a + b, 0);
      if (sum > 0) {
        return row.map(p => p / sum);
      }
      return row.map(() => 1 / numStates); // Default to uniform if row sums to 0
    });
    return normalizedMatrix;
  };

  // Normalize initial distribution
  const normalizeInitialDistribution = () => {
    const sum = initialDistribution.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      return initialDistribution.map(p => p / sum);
    }
    return Array(numStates).fill(1 / numStates); // Default to uniform
  };

  const initializeTransitionMatrix = () => {
    if (numStates < 2) return;
    
    const matrix = [];
    for (let i = 0; i < numStates; i++) {
      const row = [];
      for (let j = 0; j < numStates; j++) {
        // Create a random transition probability
        row.push(Math.random());
      }
      // Normalize the row to sum to 1
      const sum = row.reduce((a, b) => a + b, 0);
      for (let j = 0; j < numStates; j++) {
        row[j] = row[j] / sum;
      }
      matrix.push(row);
    }
    setTransitionMatrix(matrix);
  };

  // Different target distributions
  const getTargetDistribution = (type) => {
    switch (type) {
      case 'mixture':
        return (state) => {
          return Math.exp(-0.5 * Math.pow(state - 2, 2)) + 
                 0.5 * Math.exp(-0.5 * Math.pow(state - 8, 2));
        };
      case 'bimodal':
        return (state) => {
          return Math.exp(-0.3 * Math.pow(state - 3, 2)) + 
                 Math.exp(-0.3 * Math.pow(state - 7, 2));
        };
      case 'skewed':
        return (state) => {
          return Math.exp(-0.2 * Math.pow(state - 1, 2)) * (1 + 0.5 * state);
        };
      case 'uniform':
        return (state) => {
          return state >= 0 && state <= 10 ? 1 : 0;
        };
      default:
        return (state) => Math.exp(-0.5 * Math.pow(state - 5, 2));
    }
  };

  // Different proposal distributions
  const getProposalDistribution = (type) => {
    switch (type) {
      case 'normal':
        return (currentState) => {
          // Use Box-Muller transform for normal distribution
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          return currentState + z0 * proposalScale;
        };
      case 'uniform':
        return (currentState) => {
          return currentState + (Math.random() - 0.5) * proposalScale * 2;
        };
      case 'cauchy':
        return (currentState) => {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          return currentState + z0 * proposalScale * 0.33;
        };
      case 'adaptive':
        return (currentState, acceptanceRate) => {
          const scale = acceptanceRate > 0.44 ? 1.1 : 0.9;
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          return currentState + z0 * proposalScale * scale;
        };
      default:
        return (currentState) => currentState + (Math.random() - 0.5) * proposalScale * 1.33;
    }
  };

  // Metropolis-Hastings Algorithm with enhanced features
  const metropolisHastings = (currentState, proposalDistribution, targetDistribution, acceptanceRate = 0.5) => {
    let proposal;
    if (proposalType === 'adaptive') {
      proposal = proposalDistribution(currentState, acceptanceRate);
    } else {
      proposal = proposalDistribution(currentState);
    }
    
    const acceptanceRatio = targetDistribution(proposal) / targetDistribution(currentState);
    const acceptanceProbability = Math.min(1, acceptanceRatio);
    
    if (Math.random() < acceptanceProbability) {
      return proposal;
    }
    return currentState;
  };

  // Enhanced Bayesian inference with conjugate priors
  const bayesianInference = (data, prior, likelihood) => {
    try {
      const posterior = math.multiply(prior, likelihood(data));
      const normalization = math.sum(posterior);
      return math.divide(posterior, normalization);
    } catch (error) {
      console.error('Bayesian inference error:', error);
      return prior;
    }
  };

  // Calculate effective sample size
  const calculateEffectiveSampleSize = (chain) => {
    const states = chain.map(c => c.state);
    const mean = states.reduce((a, b) => a + b, 0) / states.length;
    const variance = states.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / states.length;
    
    // Simple autocorrelation calculation
    let autocorr = 0;
    for (let lag = 1; lag < Math.min(50, states.length / 2); lag++) {
      let sum = 0;
      for (let i = lag; i < states.length; i++) {
        sum += (states[i] - mean) * (states[i - lag] - mean);
      }
      autocorr += sum / (states.length - lag);
    }
    
    const autocorrFactor = Math.abs(autocorr / variance);
    return chain.length / (1 + 2 * autocorrFactor);
  };

  // Gelman-Rubin diagnostic (requires multiple chains)
  const calculateGelmanRubin = (chains) => {
    if (chains.length < 2) return 1;
    
    const means = chains.map(chain => 
      chain.reduce((sum, d) => sum + d.state, 0) / chain.length
    );
    const overallMean = means.reduce((sum, m) => sum + m, 0) / means.length;
    
    const betweenChainVar = chains.length * 
      means.reduce((sum, m) => sum + Math.pow(m - overallMean, 2), 0) / (chains.length - 1);
    
    const withinChainVars = chains.map(chain => {
      const mean = chain.reduce((sum, d) => sum + d.state, 0) / chain.length;
      return chain.reduce((sum, d) => sum + Math.pow(d.state - mean, 2), 0) / (chain.length - 1);
    });
    
    const withinChainVar = withinChainVars.reduce((sum, v) => sum + v, 0) / withinChainVars.length;
    
    return Math.sqrt((withinChainVar * (chains[0].length - 1) + betweenChainVar) / (withinChainVar * chains[0].length));
  };

  // Generate Markov Chain with enhanced features
  const generateChain = async () => {
    if (!mounted) {
      alert('Component is still loading. Please wait a moment and try again.');
      return;
    }

    setIsRunning(true);
    
    // Normalize transition matrix and initial distribution before running
    const normalizedMatrix = normalizeTransitionMatrix();
    const normalizedInitial = normalizeInitialDistribution();
    
    const chain = [];
    const burnInSamples = Math.floor(numSamples * burnInRate);
    let accepted = 0;
    
    // Start from a random state based on initial distribution
    let current = 0;
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < numStates; i++) {
      cumulative += normalizedInitial[i];
      if (rand <= cumulative) {
        current = i;
        break;
      }
    }

    const targetDistribution = getTargetDistribution(targetType);
    const proposalDistribution = getProposalDistribution(proposalType);

    const convergenceHistory = [];
    const targetProbs = calculateTargetProbabilities();
    
    for (let i = 0; i < numSamples; i++) {
      const currentAcceptanceRate = accepted / Math.max(1, i);
      const newState = metropolisHastings(current, proposalDistribution, targetDistribution, currentAcceptanceRate);
      
      if (newState !== current) {
        accepted++;
      }
      
      current = newState;
      chain.push({
        step: i,
        state: current,
        isBurnIn: i < burnInSamples
      });

      // Calculate convergence metrics every 50 steps
      if (i % 50 === 0 && i > burnInSamples) {
        const empiricalProbs = calculateEmpiricalProbabilities(chain);
        const klDivergence = calculateKLDivergence(targetProbs, empiricalProbs);
        const totalVariation = calculateTotalVariation(targetProbs, empiricalProbs);
        
        convergenceHistory.push({
          step: i,
          klDivergence: klDivergence,
          totalVariation: totalVariation
        });
      }

      // Update current state for visualization
      if (i % 10 === 0) {
        setCurrentState(current);
        setAcceptanceRate(currentAcceptanceRate);
      }

      // Add small delay for visualization
      if (i % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    setChainData(chain);
    setAcceptanceRate(accepted / numSamples);
    setConvergenceHistory(convergenceHistory);
    
    // Calculate advanced metrics
    const postBurnInChain = chain.slice(burnInSamples);
    const mixingSpeed = calculateMixingSpeed(postBurnInChain);
    setMixingSpeed(mixingSpeed);
    
    const ess = calculateEffectiveSampleSize(postBurnInChain);
    setEffectiveSampleSize(ess);
    
    // Generate multiple chains for Gelman-Rubin diagnostic
    const chains = await generateMultipleChains(3, targetDistribution, proposalDistribution);
    const gr = calculateGelmanRubin(chains);
    setGelmanRubin(gr);
    
    setIsRunning(false);
  };

  // Generate multiple chains for diagnostics
  const generateMultipleChains = async (numChains, targetDistribution, proposalDistribution) => {
    const chains = [];
    const chainLength = Math.floor(numSamples / 2);
    
    for (let c = 0; c < numChains; c++) {
      const chain = [];
      let current = Math.random() * 10;
      
      for (let i = 0; i < chainLength; i++) {
        const newState = metropolisHastings(current, proposalDistribution, targetDistribution);
        current = newState;
        chain.push({ step: i, state: current });
      }
      
      chains.push(chain);
    }
    
    return chains;
  };

  // Calculate mixing speed using autocorrelation
  const calculateMixingSpeed = (chain) => {
    const states = chain.map(c => c.state);
    const mean = states.reduce((a, b) => a + b, 0) / states.length;
    const variance = states.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / states.length;
    
    let autocorr = 0;
    for (let lag = 1; lag < Math.min(50, states.length / 2); lag++) {
      let sum = 0;
      for (let i = lag; i < states.length; i++) {
        sum += (states[i] - mean) * (states[i - lag] - mean);
      }
      autocorr += sum / (states.length - lag);
    }
    
    return Math.abs(autocorr / variance);
  };

  // Calculate target distribution probabilities for discrete states
  const calculateTargetProbabilities = () => {
    const targetDistribution = getTargetDistribution(targetType);
    const probabilities = [];
    
    for (let i = 0; i < numStates; i++) {
      const stateValue = i * (10 / (numStates - 1)); // Map discrete states to [0, 10] range
      probabilities.push(targetDistribution(stateValue));
    }
    
    // Normalize to sum to 1
    const sum = probabilities.reduce((a, b) => a + b, 0);
    return probabilities.map(p => p / sum);
  };

  // Calculate empirical distribution from chain data
  const calculateEmpiricalProbabilities = (data = null) => {
    const chainToUse = data || chainData;
    if (chainToUse.length === 0) return Array(numStates).fill(0);
    
    const postBurnInData = chainToUse.filter(d => !d.isBurnIn);
    const probabilities = [];
    
    for (let i = 0; i < numStates; i++) {
      const stateValue = i * (10 / (numStates - 1));
      const count = postBurnInData.filter(d => 
        Math.abs(d.state - stateValue) < (5 / (numStates - 1))
      ).length;
      probabilities.push(count / postBurnInData.length);
    }
    
    return probabilities;
  };

  // Calculate KL divergence between two probability distributions
  const calculateKLDivergence = (p, q) => {
    let divergence = 0;
    for (let i = 0; i < p.length; i++) {
      if (p[i] > 0 && q[i] > 0) {
        divergence += p[i] * Math.log(p[i] / q[i]);
      }
    }
    return divergence;
  };

  // Calculate total variation distance between two probability distributions
  const calculateTotalVariation = (p, q) => {
    let distance = 0;
    for (let i = 0; i < p.length; i++) {
      distance += Math.abs(p[i] - q[i]);
    }
    return distance / 2;
  };

  // D3.js State Graph Visualization
  const renderStateGraph = () => {
    if (!canvasRef.current || !mounted) return;
    
    // Ensure transition matrix is properly initialized
    if (!transitionMatrix || transitionMatrix.length !== numStates) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw state nodes
    const nodeRadius = 20;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    for (let i = 0; i < numStates; i++) {
      const angle = (2 * Math.PI * i) / numStates;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = i === currentState ? '#ff6b6b' : '#4ecdc4';
      ctx.fill();
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw state number
      ctx.fillStyle = '#2c3e50';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), x, y + 4);

      // Draw transition arrows
      for (let j = 0; j < numStates; j++) {
        if (i !== j && transitionMatrix[i] && transitionMatrix[i][j] && transitionMatrix[i][j] > 0.1) {
          const targetAngle = (2 * Math.PI * j) / numStates;
          const targetX = centerX + radius * Math.cos(targetAngle);
          const targetY = centerY + radius * Math.sin(targetAngle);
          
          // Calculate arrow position
          const dx = targetX - x;
          const dy = targetY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const arrowX = x + (dx / distance) * (nodeRadius + 8);
          const arrowY = y + (dy / distance) * (nodeRadius + 8);
          
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(targetX - (dx / distance) * (nodeRadius + 8), 
                    targetY - (dy / distance) * (nodeRadius + 8));
          ctx.strokeStyle = `rgba(52, 73, 94, ${transitionMatrix[i][j]})`;
          ctx.lineWidth = transitionMatrix[i][j] * 2;
          ctx.stroke();
        }
      }
    }
  };

  // Update state graph animation
  useEffect(() => {
    if (isRunning && mounted) {
      renderStateGraph();
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(renderStateGraph, 100);
      });
    } else if (mounted) {
      renderStateGraph();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentState, transitionMatrix, isRunning, numStates, mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Markov Chain Monte Carlo Simulator
          </h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Markov Chain Monte Carlo Simulator
        </h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-4 border border-gray-400">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
            {/* Number of States */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Number of States</label>
              <input
                min="2"
                max="10"
                type="number"
                value={numStates}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  setNumStates(isNaN(value) || value < 2 ? 2 : value);
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Number of Samples */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Number of Samples</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={numSamples}
                onChange={e => setNumSamples(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Burn-in Rate */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Burn-in Rate</label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={burnInRate}
                onChange={e => setBurnInRate(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-600">{burnInRate}</span>
            </div>
            {/* Proposal Distribution */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Proposal Distribution</label>
              <select
                value={proposalType}
                onChange={e => setProposalType(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="uniform">Uniform</option>
                <option value="cauchy">Cauchy</option>
                <option value="adaptive">Adaptive</option>
              </select>
            </div>
            {/* Target Distribution */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Distribution</label>
              <select
                value={targetType}
                onChange={e => setTargetType(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mixture">Mixture of Gaussians</option>
                <option value="bimodal">Bimodal</option>
                <option value="skewed">Skewed</option>
                <option value="uniform">Uniform</option>
              </select>
            </div>
            {/* Button Grid */}
            <div className="md:col-span-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={initializeTransitionMatrix}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-md text-xs whitespace-nowrap"
                >
                  Randomize Matrix
                </button>
                <button
                  onClick={generateChain}
                  disabled={isRunning || !mounted}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-1 px-2 rounded-md text-xs whitespace-nowrap"
                >
                  {!mounted ? 'Loading...' : isRunning ? 'Running...' : 'Generate Chain'}
                </button>

              </div>
            </div>
          </div>
        </div>



        {/* Compact Proposal Customization Dropdown */}
        {showProposalEditor && (
          <div className="absolute z-50 bg-white border border-gray-300 rounded shadow-lg p-2 mt-2 max-w-xs">
            {proposalType === 'normal' && (
              <div>
                <label className="block text-xs mb-1">Std Dev</label>
                <input type="number" min="0.1" max="10" step="0.1" value={proposalScale} onChange={e => setProposalScale(parseFloat(e.target.value))} className="w-16 px-1 py-0.5 border border-gray-200 rounded text-xs" />
              </div>
            )}
            {proposalType === 'uniform' && (
              <div>
                <label className="block text-xs mb-1">Range</label>
                <input type="number" min="0.1" max="10" step="0.1" value={proposalScale} onChange={e => setProposalScale(parseFloat(e.target.value))} className="w-16 px-1 py-0.5 border border-gray-200 rounded text-xs" />
              </div>
            )}
            {/* Add more proposal customization as needed */}
          </div>
        )}



        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-1">Current State</h3>
            <p className="text-xl font-bold text-blue-600">{currentState.toFixed(2)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-1">Acceptance Rate</h3>
            <p className="text-xl font-bold text-green-600">
              {(acceptanceRate * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-1">Mixing Speed</h3>
            <p className="text-xl font-bold text-purple-600">
              {mixingSpeed.toFixed(4)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-1">Effective Sample Size</h3>
            <p className="text-xl font-bold text-orange-600">
              {effectiveSampleSize.toFixed(0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-1">Gelman-Rubin</h3>
            <p className="text-xl font-bold text-red-600">
              {gelmanRubin.toFixed(3)}
            </p>
          </div>
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* State Graph */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-2">State Transition Graph</h3>
            <canvas
              ref={canvasRef}
              width={250}
              height={250}
              className="border border-gray-300 rounded-md mx-auto"
            />
          </div>

          {/* Transition Matrix Heatmap */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-2">Transition Matrix (Click cells to edit)</h3>
            <div className="grid gap-1 max-w-xs mx-auto" style={{
              gridTemplateColumns: `repeat(${numStates}, 1fr)`
            }}>
              {transitionMatrix && transitionMatrix.length === numStates && 
                transitionMatrix.map((row, i) =>
                  row && row.map((prob, j) => {
                    const isEditing = editingCell && editingCell.row === i && editingCell.col === j;
                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`aspect-square flex items-center justify-center text-xs font-medium cursor-pointer border-2 transition-all ${
                          isEditing 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: isEditing 
                            ? 'rgba(59, 130, 246, 0.1)' 
                            : `rgba(59, 130, 246, ${prob || 0})`,
                          color: isEditing 
                            ? 'black' 
                            : (prob || 0) > 0.5 ? 'white' : 'black'
                        }}
                        onClick={() => handleCellClick(i, j)}
                      >
                        {isEditing ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              defaultValue={prob.toFixed(2)}
                              className="w-8 h-6 text-center text-xs border border-gray-300 rounded bg-white"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(e.target.value);
                                } else if (e.key === 'Escape') {
                                  handleCellEditCancel();
                                }
                              }}
                              onBlur={(e) => handleCellEdit(e.target.value)}
                              autoFocus
                            />
                            <div className="text-xs text-gray-500 mt-1">Enter/Esc</div>
                          </div>
                        ) : (
                          <span>{(prob || 0).toFixed(2)}</span>
                        )}
                      </div>
                    );
                  })
                )
              }
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Click any cell to edit. Press Enter to save, Escape to cancel.
            </div>
          </div>

          {/* Initial Distribution */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-3 border border-gray-400">
            <h3 className="text-sm font-semibold mb-2">Initial Distribution</h3>
            <div className="space-y-1">
              {Array.from({ length: numStates }, (_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">State {i}:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(initialDistribution[i] || 0).toFixed(2)}
                    onChange={e => {
                      const newInitial = [...initialDistribution];
                      newInitial[i] = Math.max(0, parseFloat(e.target.value) || 0);
                      setInitialDistribution(newInitial);
                    }}
                    className="w-16 px-2 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                  />
                </div>
              ))}
              <div className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-200 text-center">
                Sum: {(initialDistribution.reduce((a, b) => a + b, 0) || 0).toFixed(3)}
              </div>
              <button
                onClick={initializeInitialDistribution}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-2 rounded-md text-xs mt-2"
              >
                Reset to Uniform
              </button>
            </div>
          </div>
        </div>



        {/* Enhanced Probability Distribution and Convergence Plot Side by Side */}
        {chainData.length > 0 && activeTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* State Probability Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-3 overflow-hidden border border-gray-400">
              <h3 className="text-sm font-semibold mb-2">State Probability Distribution</h3>
              <div className="w-full h-64">
                <Plot
                  data={[
                    {
                      x: Array.from({ length: numStates }, (_, i) => i),
                      y: calculateTargetProbabilities(),
                      type: 'bar',
                      name: 'Target Distribution',
                      marker: { color: '#3b82f6', opacity: 0.7 }
                    },
                    {
                      x: Array.from({ length: numStates }, (_, i) => i),
                      y: calculateEmpiricalProbabilities(),
                      type: 'bar',
                      name: 'Empirical Distribution',
                      marker: { color: '#ef4444', opacity: 0.7 }
                    }
                  ]}
                  layout={{
                    title: 'Target vs Empirical State Probabilities',
                    xaxis: { title: 'State' },
                    yaxis: { title: 'Probability' },
                    height: 240,
                    barmode: 'group',
                    showlegend: true,
                    margin: { l: 50, r: 20, t: 40, b: 50 },
                    autosize: true,
                    legend: {
                      x: 0.7,
                      y: 0.95
                    }
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            {/* Convergence Plot */}
            {convergenceHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-3 overflow-hidden border border-gray-400">
                <h3 className="text-sm font-semibold mb-2">Convergence Analysis</h3>
                <div className="w-full h-64">
                  <Plot
                    data={[
                      {
                        x: convergenceHistory.map(d => d.step),
                        y: convergenceHistory.map(d => d.klDivergence),
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'KL Divergence',
                        line: { color: '#3b82f6' },
                        marker: { size: 4 }
                      },
                      {
                        x: convergenceHistory.map(d => d.step),
                        y: convergenceHistory.map(d => d.totalVariation),
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Total Variation Distance',
                        line: { color: '#ef4444' },
                        marker: { size: 4 }
                      }
                    ]}
                    layout={{
                      title: 'Convergence Metrics: Empirical vs Target Distribution',
                      xaxis: { title: 'Chain Step' },
                      yaxis: { title: 'Distance Metric' },
                      height: 240,
                      showlegend: true,
                      margin: { l: 50, r: 20, t: 40, b: 50 },
                      autosize: true,
                      legend: {
                        x: 0.7,
                        y: 0.95
                      }
                    }}
                    config={{ responsive: true, displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                          </div>
          )}

          {/* Info Tab Content */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4 border border-gray-400">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Markov Chain Monte Carlo (MCMC) Simulator</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">🎯 What is MCMC?</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Markov Chain Monte Carlo is a computational technique for sampling from complex probability distributions. 
                      It's widely used in Bayesian statistics, machine learning, and scientific computing.
                    </p>
                    
                    <h4 className="font-semibold text-green-600 mb-2">🔄 How It Works</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                      <li>• <strong>Proposal Step:</strong> Suggest a new state based on current state</li>
                      <li>• <strong>Acceptance Step:</strong> Accept or reject based on target distribution</li>
                      <li>• <strong>Iteration:</strong> Repeat to build a chain of samples</li>
                      <li>• <strong>Convergence:</strong> Chain eventually samples from target distribution</li>
                    </ul>
                    
                    <h4 className="font-semibold text-purple-600 mb-2">📊 Key Metrics</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>Acceptance Rate:</strong> Percentage of proposed moves accepted</li>
                      <li>• <strong>Mixing Speed:</strong> How quickly the chain explores the space</li>
                      <li>• <strong>Effective Sample Size:</strong> Independent samples equivalent</li>
                      <li>• <strong>Gelman-Rubin:</strong> Convergence diagnostic (≈1.0 = converged)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">🎛️ Controls Explained</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                      <li>• <strong>Number of States:</strong> Discrete states in the Markov chain</li>
                      <li>• <strong>Number of Samples:</strong> Total iterations to run</li>
                      <li>• <strong>Burn-in Rate:</strong> Initial samples to discard (warm-up period)</li>
                      <li>• <strong>Proposal Distribution:</strong> How to suggest new states</li>
                      <li>• <strong>Target Distribution:</strong> The distribution we want to sample from</li>
                      <li>• <strong>Proposal Scale:</strong> Step size for proposal moves</li>
                    </ul>
                    
                    <h4 className="font-semibold text-red-600 mb-2">📈 Visualizations</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                      <li>• <strong>State Graph:</strong> Visual representation of transitions</li>
                      <li>• <strong>Transition Matrix:</strong> Probability of moving between states</li>
                      <li>• <strong>Probability Distribution:</strong> Target vs empirical distributions</li>
                      <li>• <strong>Convergence Plot:</strong> How well the chain converges</li>
                    </ul>
                    
                    <h4 className="font-semibold text-indigo-600 mb-2">💡 Tips</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Aim for 20-50% acceptance rate for optimal mixing</li>
                      <li>• Use burn-in to discard initial non-stationary samples</li>
                      <li>• Monitor convergence metrics to ensure reliable results</li>
                      <li>• Experiment with different proposal distributions</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔬 Matrix Power Analysis</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    The Matrix Power Analysis tab shows how the transition matrix evolves over multiple steps:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>P^n:</strong> Shows transition probabilities after n steps</li>
                    <li>• <strong>Initial Distribution:</strong> Starting probability distribution across states</li>
                    <li>• <strong>Result Distribution:</strong> Final distribution after n transitions (P^n × Initial)</li>
                    <li>• <strong>Convergence:</strong> As n increases, the result approaches the stationary distribution</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> This simulator demonstrates the Metropolis-Hastings algorithm, 
                    one of the most fundamental MCMC methods. The convergence plot shows KL divergence and 
                    total variation distance between the empirical and target distributions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Tab System */}
        <div className="mt-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'main'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Main Simulation
            </button>
            <button
              onClick={() => setActiveTab('matrix-power')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'matrix-power'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Matrix Power Analysis
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              How It Works
            </button>
          </div>

          {/* Matrix Power Tab Content */}
          {activeTab === 'matrix-power' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4 border border-gray-400">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Matrix Power Controls and Heatmap */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Transition Matrix Power (P^n)</h3>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600">Steps (n):</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={matrixPowerSteps}
                        onChange={e => setMatrixPowerSteps(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-1 max-w-xs mx-auto mb-4" style={{
                    gridTemplateColumns: `repeat(${numStates}, 1fr)`
                  }}>
                    {(() => {
                      const poweredMatrix = calculateMatrixPower(transitionMatrix, matrixPowerSteps);
                      if (!poweredMatrix || poweredMatrix.length === 0) {
                        return <div className="col-span-full text-center text-gray-500">No matrix data available</div>;
                      }
                      return poweredMatrix.map((row, i) =>
                        row && row.map((prob, j) => (
                          <div
                            key={`power-${i}-${j}`}
                            className="aspect-square flex items-center justify-center text-xs font-medium border border-gray-200"
                            style={{
                              backgroundColor: `rgba(147, 51, 234, ${Math.min(1, prob || 0)})`,
                              color: (prob || 0) > 0.5 ? 'white' : 'black'
                            }}
                          >
                            {(prob || 0).toFixed(3)}
                          </div>
                        ))
                      )
                    })()}
                  </div>
                  
                  <div className="text-sm text-gray-600 text-center">
                    Shows transition probabilities after {matrixPowerSteps} steps
                  </div>
                </div>

                {/* Initial Distribution and Result */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution Evolution</h3>
                  
                  <div className="space-y-4">
                    {/* Initial Distribution */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Initial Distribution</h4>
                      <div className="grid gap-1 max-w-xs" style={{
                        gridTemplateColumns: `repeat(${numStates}, 1fr)`
                      }}>
                        {initialDistribution && initialDistribution.length > 0 ? 
                          initialDistribution.map((prob, i) => (
                            <div
                              key={`initial-${i}`}
                              className="aspect-square flex items-center justify-center text-xs font-medium border border-gray-200 bg-blue-100"
                            >
                              {(prob || 0).toFixed(3)}
                            </div>
                          )) : 
                          <div className="col-span-full text-center text-gray-500">No initial distribution data</div>
                        }
                      </div>
                    </div>

                    {/* Multiply Button */}
                    <button
                      onClick={() => {
                        const poweredMatrix = calculateMatrixPower(transitionMatrix, matrixPowerSteps);
                        const result = multiplyMatrixWithVector(poweredMatrix, initialDistribution);
                        // You can add state to display this result if needed
                        console.log('Result after multiplication:', result);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                    >
                      {`Calculate P^${matrixPowerSteps} × Initial Distribution`}
                    </button>

                    {/* Result Display */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Result Distribution</h4>
                      <div className="grid gap-1 max-w-xs" style={{
                        gridTemplateColumns: `repeat(${numStates}, 1fr)`
                      }}>
                        {(() => {
                          const poweredMatrix = calculateMatrixPower(transitionMatrix, matrixPowerSteps);
                          const result = multiplyMatrixWithVector(poweredMatrix, initialDistribution);
                          if (!result || result.length === 0) {
                            return <div className="col-span-full text-center text-gray-500">No result data available</div>;
                          }
                          return result.map((prob, i) => (
                            <div
                              key={`result-${i}`}
                              className="aspect-square flex items-center justify-center text-xs font-medium border border-gray-200"
                              style={{
                                backgroundColor: `rgba(34, 197, 94, ${Math.min(1, prob || 0)})`,
                                color: (prob || 0) > 0.5 ? 'white' : 'black'
                              }}
                            >
                              {(prob || 0).toFixed(3)}
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Tab Content */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4 border border-gray-400">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Markov Chain Monte Carlo (MCMC) Simulator</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">🎯 What is MCMC?</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Markov Chain Monte Carlo is a computational technique for sampling from complex probability distributions. 
                      It's widely used in Bayesian statistics, machine learning, and scientific computing.
                    </p>
                    
                    <h4 className="font-semibold text-green-600 mb-2">🔄 How It Works</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                      <li>• <strong>Proposal Step:</strong> Suggest a new state based on current state</li>
                      <li>• <strong>Acceptance Step:</strong> Accept or reject based on target distribution</li>
                      <li>• <strong>Iteration:</strong> Repeat to build a chain of samples</li>
                      <li>• <strong>Convergence:</strong> Chain eventually samples from target distribution</li>
                    </ul>
                    
                    <h4 className="font-semibold text-purple-600 mb-2">📊 Key Metrics</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>Acceptance Rate:</strong> Percentage of proposed moves accepted</li>
                      <li>• <strong>Mixing Speed:</strong> How quickly the chain explores the space</li>
                      <li>• <strong>Effective Sample Size:</strong> Independent samples equivalent</li>
                      <li>• <strong>Gelman-Rubin:</strong> Convergence diagnostic (≈1.0 = converged)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">🎛️ Controls Explained</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                      <li>• <strong>Number of States:</strong> Discrete states in the Markov chain</li>
                      <li>• <strong>Number of Samples:</strong> Total iterations to run</li>
                      <li>• <strong>Burn-in Rate:</strong> Initial samples to discard (warm-up period)</li>
                      <li>• <strong>Proposal Distribution:</strong> How to suggest new states</li>
                      <li>• <strong>Target Distribution:</strong> The distribution we want to sample from</li>
                      <li>• <strong>Proposal Scale:</strong> Step size for proposal moves</li>
                    </ul>
                    
                    <h4 className="font-semibold text-red-600 mb-2">📈 Visualizations</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                      <li>• <strong>State Graph:</strong> Visual representation of transitions</li>
                      <li>• <strong>Transition Matrix:</strong> Probability of moving between states</li>
                      <li>• <strong>Probability Distribution:</strong> Target vs empirical distributions</li>
                      <li>• <strong>Convergence Plot:</strong> How well the chain converges</li>
                    </ul>
                    
                    <h4 className="font-semibold text-indigo-600 mb-2">💡 Tips</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Aim for 20-50% acceptance rate for optimal mixing</li>
                      <li>• Use burn-in to discard initial non-stationary samples</li>
                      <li>• Monitor convergence metrics to ensure reliable results</li>
                      <li>• Experiment with different proposal distributions</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔬 Matrix Power Analysis</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    The Matrix Power Analysis tab shows how the transition matrix evolves over multiple steps:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>P^n:</strong> Shows transition probabilities after n steps</li>
                    <li>• <strong>Initial Distribution:</strong> Starting probability distribution across states</li>
                    <li>• <strong>Result Distribution:</strong> Final distribution after n transitions (P^n × Initial)</li>
                    <li>• <strong>Convergence:</strong> As n increases, the result approaches the stationary distribution</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> This simulator demonstrates the Metropolis-Hastings algorithm, 
                    one of the most fundamental MCMC methods. The convergence plot shows KL divergence and 
                    total variation distance between the empirical and target distributions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
