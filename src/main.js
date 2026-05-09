import './style.css';

// ====== NAV TOGGLE ======
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close nav on link click
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav')) navLinks.classList.remove('active');
  });
}

// ====== SCROLL SMOOTHING (for anchor links) ======
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ====== ROI CALCULATOR ======
const roiClients = document.getElementById('roiClients');
const roiArpu = document.getElementById('roiArpu');
const roiChurn = document.getElementById('roiChurn');

const roiClientsVal = document.getElementById('roiClientsVal');
const roiArpuVal = document.getElementById('roiArpuVal');
const roiChurnVal = document.getElementById('roiChurnVal');

const roiLoss = document.getElementById('roiLoss');
const roiSaved = document.getElementById('roiSaved');
const roiROI = document.getElementById('roiROI');

function formatNumber(n) {
  if (n >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + Math.round(n);
}

function formatPlain(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatDollars(n) {
  return '$' + formatPlain(Math.round(n));
}

function calcROI() {
  const clients = parseInt(roiClients.value);
  const arpu = parseInt(roiArpu.value);
  const churn = parseFloat(roiChurn.value) / 100;

  // Annual revenue at risk
  const revenueAtRisk = clients * arpu * churn;

  // CX Profit typically recovers 18-30% of churning clients
  const recoveryRate = 0.23; // 23% avg from case studies
  const potentialRecovery = revenueAtRisk * recoveryRate;

  // Implementation cost estimation (rough: $0.30-1.00 per client per year for large banks)
  const implCost = clients * 0.55;
  const roiMultiplier = implCost > 0 ? (potentialRecovery / implCost) : 0;

  roiClientsVal.textContent = formatPlain(clients);
  roiArpuVal.textContent = '$' + formatPlain(arpu);
  roiChurnVal.textContent = (churn * 100).toFixed(1) + '%';

  roiLoss.textContent = formatDollars(revenueAtRisk);
  roiSaved.textContent = formatDollars(potentialRecovery);
  roiROI.textContent = roiMultiplier.toFixed(1) + 'x';
}

[roiClients, roiArpu, roiChurn].forEach(el => {
  if (el) el.addEventListener('input', calcROI);
});

// Initial calculation
calcROI();

// ====== CONTACT FORM (demo handling) ======
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const origText = btn.textContent;
    btn.textContent = '✓ Отправлено! Мы свяжемся в ближайшее время';
    btn.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

// ====== SCROLL-BASED NAV STYLING ======
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 100) {
    nav.style.background = 'rgba(10,10,15,0.95)';
  } else {
    nav.style.background = 'rgba(10,10,15,0.85)';
  }
  lastScroll = scrollY;
}, { passive: true });

console.log('🧿 CX Profit Platform — loaded');
