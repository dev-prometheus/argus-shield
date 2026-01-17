/**
 * Argus Shield - Report Form
 * Handles suspicious address reporting
 */

// ============================================
// CONFIGURATION
// ============================================

// API endpoint - UPDATE THIS when backend is ready
const REPORT_API = 'https://api.argusshield.io/v1/report';
const DEMO_MODE = true; // Set to false when API is ready

// ============================================
// DOM ELEMENTS
// ============================================

const modal = document.getElementById('reportModal');
const form = document.getElementById('reportForm');
const successView = document.getElementById('reportSuccess');

const openBtn = document.getElementById('openReportModal');
const closeBtn = document.getElementById('closeReportModal');
const cancelBtn = document.getElementById('cancelReport');
const closeSuccessBtn = document.getElementById('closeSuccessModal');

const addressInput = document.getElementById('reportAddress');
const descriptionInput = document.getElementById('reportDescription');
const emailInput = document.getElementById('reportEmail');

// ============================================
// EVENT LISTENERS
// ============================================

openBtn?.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);
cancelBtn?.addEventListener('click', closeModal);
closeSuccessBtn?.addEventListener('click', closeModal);

// Close on backdrop click
modal?.addEventListener('click', (e) => {
  if (e.target === modal || e.target.classList.contains('modal__backdrop')) {
    closeModal();
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) {
    closeModal();
  }
});

// Form submission
form?.addEventListener('submit', handleSubmit);

// Address validation on blur
addressInput?.addEventListener('blur', validateAddress);

// ============================================
// MODAL CONTROLS
// ============================================

function openModal() {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Reset to form view
  form.style.display = 'block';
  successView.style.display = 'none';
  
  // Focus input
  setTimeout(() => addressInput?.focus(), 100);
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset form after animation
  setTimeout(() => {
    form?.reset();
    form.style.display = 'block';
    successView.style.display = 'none';
  }, 300);
}

// ============================================
// FORM HANDLING
// ============================================

async function handleSubmit(e) {
  e.preventDefault();
  
  const address = addressInput.value.trim();
  const description = descriptionInput.value.trim();
  const email = emailInput.value.trim();
  
  // Validate address
  if (!isValidAddress(address)) {
    showInputError(addressInput, 'Not a valid Ethereum address');
    return;
  }
  
  // Validate email if provided
  if (email && !isValidEmail(email)) {
    showInputError(emailInput, 'Not a valid email');
    return;
  }
  
  // Disable form
  setFormLoading(true);
  
  try {
    if (DEMO_MODE) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      // Real API call
      await submitReport({ address, description, email });
    }
    
    // Show success
    form.style.display = 'none';
    successView.style.display = 'block';
    
    console.log('📢 Report submitted:', { address, description, email: email || 'anonymous' });
    
  } catch (error) {
    console.error('Report submission error:', error);
    showToast('Something went wrong. Try again.', 'error');
  } finally {
    setFormLoading(false);
  }
}

async function submitReport(data) {
  const response = await fetch(REPORT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: data.address,
      description: data.description || null,
      reporter_email: data.email || null,
      source: 'website',
      timestamp: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return response.json();
}

// ============================================
// VALIDATION
// ============================================

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateAddress() {
  const address = addressInput.value.trim();
  
  if (address && !isValidAddress(address)) {
    showInputError(addressInput, 'Not a valid address format');
    return false;
  }
  
  clearInputError(addressInput);
  return true;
}

function showInputError(input, message) {
  clearInputError(input);
  
  input.style.borderColor = 'var(--danger)';
  
  const hint = input.parentElement.querySelector('.form-hint');
  if (hint) {
    hint.textContent = message;
    hint.style.color = 'var(--danger)';
  }
}

function clearInputError(input) {
  input.style.borderColor = '';
  
  const hint = input.parentElement.querySelector('.form-hint');
  if (hint) {
    hint.textContent = 'Enter a valid Ethereum address (0x...)';
    hint.style.color = '';
  }
}

// ============================================
// UTILITIES
// ============================================

function setFormLoading(loading) {
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 24 24" width="18" height="18">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="20"/>
      </svg>
      Submitting...
    `;
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
      </svg>
      Submit Report
    `;
  }
}

// Toast notification (shared with scanner)
function showToast(message, type = 'info') {
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
  
  // Add toast styles if not present
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--bg-elevated);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        font-size: 14px;
        color: var(--text-primary);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s;
      }
      .toast.show {
        transform: translateY(0);
        opacity: 1;
      }
      .toast--success { border-color: rgba(34, 197, 94, 0.3); }
      .toast--success svg { color: var(--green-core); }
      .toast--error { border-color: rgba(244, 63, 94, 0.3); }
      .toast--error svg { color: var(--danger); }
      .toast svg { width: 20px; height: 20px; }
      .spinner { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// INITIALIZATION
// ============================================

console.log('📢 Argus Report Form initialized');