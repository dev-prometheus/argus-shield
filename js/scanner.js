/**
 * Argus Shield - Contract Scanner
 * Analyzes Ethereum smart contracts for risk indicators
 */

// ============================================
// CONFIGURATION
// ============================================

// API endpoint - UPDATE THIS when backend is ready
const API_BASE = 'https://api.argusshield.io'; // Placeholder
const DEMO_MODE = true; // Set to false when API is ready

// Etherscan base URL for links
const ETHERSCAN_BASE = 'https://etherscan.io';

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  form: document.getElementById('scannerForm'),
  input: document.getElementById('contractAddress'),
  submitBtn: document.getElementById('scanButton'),
  resultsSection: document.getElementById('resultsSection'),
  infoSection: document.getElementById('infoSection'),
  
  // Score
  scoreCircle: document.getElementById('scoreCircle'),
  scoreProgress: document.getElementById('scoreProgress'),
  scoreNumber: document.getElementById('scoreNumber'),
  scoreLabel: document.getElementById('scoreLabel'),
  scoreAddress: document.getElementById('scoreAddress'),
  scoreCard: document.getElementById('scoreCard'),
  
  // Details
  contractName: document.getElementById('contractName'),
  contractType: document.getElementById('contractType'),
  compilerVersion: document.getElementById('compilerVersion'),
  verifiedStatus: document.getElementById('verifiedStatus'),
  isProxy: document.getElementById('isProxy'),
  license: document.getElementById('license'),
  createdDate: document.getElementById('createdDate'),
  contractAge: document.getElementById('contractAge'),
  deployerAddress: document.getElementById('deployerAddress'),
  txCount: document.getElementById('txCount'),
  balance: document.getElementById('balance'),
  lastActivity: document.getElementById('lastActivity'),
  
  // Warnings
  warningsCard: document.getElementById('warningsCard'),
  warningsList: document.getElementById('warningsList'),
  
  // Actions
  etherscanLink: document.getElementById('etherscanLink'),
  copyReport: document.getElementById('copyReport'),
  scanAnother: document.getElementById('scanAnother'),
};

// ============================================
// EVENT LISTENERS
// ============================================

elements.form.addEventListener('submit', handleSubmit);
elements.copyReport?.addEventListener('click', copyReport);
elements.scanAnother?.addEventListener('click', resetScanner);

// Example buttons
document.querySelectorAll('.scanner-example__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    elements.input.value = btn.dataset.address;
    elements.form.dispatchEvent(new Event('submit'));
  });
});

// ============================================
// MAIN HANDLER
// ============================================

async function handleSubmit(e) {
  e.preventDefault();
  
  const address = elements.input.value.trim();
  
  if (!isValidAddress(address)) {
    showToast('Enter a valid Ethereum address', 'error');
    return;
  }
  
  setLoading(true);
  
  try {
    let data;
    
    if (DEMO_MODE) {
      // Demo mode - generate mock data
      data = await getMockData(address);
    } else {
      // Real API call
      data = await analyzeContract(address);
    }
    
    displayResults(address, data);
    
  } catch (error) {
    console.error('Scanner error:', error);
    showToast('Something went wrong. Try again.', 'error');
  } finally {
    setLoading(false);
  }
}

// ============================================
// API CALL (When backend is ready)
// ============================================

async function analyzeContract(address) {
  const response = await fetch(`${API_BASE}/v1/contract/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: address,
      network: 'ethereum'
    })
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return response.json();
}

// ============================================
// MOCK DATA (For demo/testing)
// ============================================

async function getMockData(address) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Known safe contracts for demo
  const knownContracts = {
    '0xdac17f958d2ee523a2206206994597c13d831ec7': {
      name: 'TetherToken',
      type: 'ERC-20',
      verified: true,
      proxy: false,
      compiler: 'v0.4.18',
      license: 'MIT',
      created: '2017-11-28',
      deployer: '0x36928500bc1dcd7af6a2b4008875cc336b927d57',
      txCount: '185,432,156',
      balance: '0 ETH',
      riskScore: 8,
    },
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      name: 'FiatTokenV2_1',
      type: 'ERC-20 (Proxy)',
      verified: true,
      proxy: true,
      compiler: 'v0.6.12',
      license: 'MIT',
      created: '2018-08-03',
      deployer: '0x95ba4cf87d6723ad9c0db21737d862be80e93911',
      txCount: '142,891,432',
      balance: '0 ETH',
      riskScore: 5,
    }
  };
  
  const lowerAddress = address.toLowerCase();
  
  if (knownContracts[lowerAddress]) {
    const data = knownContracts[lowerAddress];
    return {
      ...data,
      address: address,
      warnings: [],
      ageCategory: 'old',
    };
  }
  
  // Generate random data for unknown addresses
  const isVerified = Math.random() > 0.4;
  const ageInDays = Math.floor(Math.random() * 1000);
  const isNew = ageInDays < 30;
  
  let riskScore = 20; // Base score
  
  const warnings = [];
  
  if (!isVerified) {
    riskScore += 35;
    warnings.push('No verified source code on Etherscan');
  }
  
  if (isNew) {
    riskScore += 25;
    warnings.push(`Only ${ageInDays} days old`);
  }
  
  if (ageInDays < 7) {
    riskScore += 20;
    warnings.push('Less than a week old. Be extra careful.');
  }
  
  // Random additional warnings
  if (Math.random() > 0.7) {
    warnings.push('Deployer has created a lot of contracts recently');
  }
  
  riskScore = Math.min(riskScore, 100);
  
  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - ageInDays);
  
  return {
    address: address,
    name: isVerified ? 'UnknownContract' : 'Unknown',
    type: 'Contract',
    verified: isVerified,
    proxy: Math.random() > 0.8,
    compiler: isVerified ? 'v0.8.19' : 'Unknown',
    license: isVerified ? 'None' : 'Unknown',
    created: createdDate.toISOString().split('T')[0],
    deployer: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    txCount: Math.floor(Math.random() * 10000).toLocaleString(),
    balance: (Math.random() * 10).toFixed(4) + ' ETH',
    riskScore: riskScore,
    warnings: warnings,
    ageCategory: isNew ? 'new' : (ageInDays < 180 ? 'medium' : 'old'),
  };
}

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResults(address, data) {
  // Show results, hide info
  elements.resultsSection.style.display = 'block';
  elements.infoSection.style.display = 'none';
  
  // Update score
  updateScore(data.riskScore);
  elements.scoreAddress.textContent = address;
  
  // Update details
  elements.contractName.textContent = data.name || 'Unknown';
  elements.contractType.textContent = data.type || 'Contract';
  elements.compilerVersion.textContent = data.compiler || 'Unknown';
  
  // Verification badge
  elements.verifiedStatus.textContent = data.verified ? 'Verified ✓' : 'Not Verified';
  elements.verifiedStatus.className = 'result-value result-badge ' + 
    (data.verified ? 'result-badge--verified' : 'result-badge--unverified');
  
  elements.isProxy.textContent = data.proxy ? 'Yes (Upgradeable)' : 'No';
  elements.license.textContent = data.license || 'Unknown';
  
  // Timeline
  elements.createdDate.textContent = formatDate(data.created);
  
  const ageText = getAgeText(data.created);
  elements.contractAge.textContent = ageText;
  elements.contractAge.className = 'result-value result-badge ' + getAgeBadgeClass(data.ageCategory);
  
  elements.deployerAddress.textContent = formatAddress(data.deployer);
  elements.deployerAddress.title = data.deployer;
  
  // Activity
  elements.txCount.textContent = data.txCount || '0';
  elements.balance.textContent = data.balance || '0 ETH';
  elements.lastActivity.textContent = 'Recently'; // Would come from API
  
  // Warnings
  if (data.warnings && data.warnings.length > 0) {
    elements.warningsCard.style.display = 'block';
    elements.warningsList.innerHTML = data.warnings.map(w => `<li>${w}</li>`).join('');
  } else {
    elements.warningsCard.style.display = 'none';
  }
  
  // Update Etherscan link
  elements.etherscanLink.href = `${ETHERSCAN_BASE}/address/${address}`;
  
  // Scroll to results
  elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateScore(score) {
  // Animate score number
  let current = 0;
  const duration = 1000;
  const start = performance.now();
  
  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    
    current = Math.round(score * progress);
    elements.scoreNumber.textContent = current;
    
    // Update circle progress (283 is circumference)
    const offset = 283 - (283 * (current / 100));
    elements.scoreProgress.style.strokeDashoffset = offset;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
  
  // Update color based on score
  const color = getScoreColor(score);
  elements.scoreProgress.style.stroke = color;
  elements.scoreCircle.style.color = color;
  
  // Update label
  const label = getScoreLabel(score);
  elements.scoreLabel.textContent = label;
  elements.scoreLabel.className = 'score-label score-label--' + getScoreCategory(score);
}

function getScoreColor(score) {
  if (score <= 20) return '#22c55e'; // Green
  if (score <= 50) return '#eab308'; // Yellow
  if (score <= 80) return '#f97316'; // Orange
  return '#f43f5e'; // Red
}

function getScoreLabel(score) {
  if (score <= 20) return 'Low Risk';
  if (score <= 50) return 'Medium Risk';
  if (score <= 80) return 'High Risk';
  return 'Critical Risk';
}

function getScoreCategory(score) {
  if (score <= 20) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 80) return 'high';
  return 'critical';
}

function getAgeBadgeClass(category) {
  if (category === 'old') return 'result-badge--old';
  if (category === 'new') return 'result-badge--new';
  return 'result-badge--medium';
}

// ============================================
// UTILITIES
// ============================================

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function formatAddress(address) {
  if (!address || address.length < 10) return address || 'Unknown';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

function getAgeText(dateStr) {
  if (!dateStr) return 'Unknown';
  try {
    const created = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  } catch {
    return 'Unknown';
  }
}

function setLoading(loading) {
  elements.submitBtn.disabled = loading;
  elements.submitBtn.classList.toggle('loading', loading);
}

function resetScanner() {
  elements.input.value = '';
  elements.resultsSection.style.display = 'none';
  elements.infoSection.style.display = 'block';
  elements.input.focus();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// COPY REPORT
// ============================================

function copyReport() {
  const address = elements.scoreAddress.textContent;
  const score = elements.scoreNumber.textContent;
  const scoreLabel = elements.scoreLabel.textContent;
  const name = elements.contractName.textContent;
  const verified = elements.verifiedStatus.textContent;
  const age = elements.contractAge.textContent;
  const created = elements.createdDate.textContent;
  
  const report = `
ARGUS SHIELD - Contract Report
==============================

Address: ${address}
Risk: ${score}/100 (${scoreLabel})

Details
-------
Name: ${name}
Verified: ${verified}
Created: ${created}
Age: ${age}

Etherscan: ${ETHERSCAN_BASE}/address/${address}

Scanned with Argus Shield
argusshield.io
`.trim();
  
  navigator.clipboard.writeText(report).then(() => {
    showToast('Copied!', 'success');
  }).catch(() => {
    showToast('Could not copy', 'error');
  });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
      }
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// INITIALIZATION
// ============================================

console.log('🔍 Argus Contract Scanner initialized');
console.log('📡 Demo mode:', DEMO_MODE ? 'ON' : 'OFF');