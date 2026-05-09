import './style.css';
import { dashboardView, profitView, simulationView, voiceView, roiView } from './views.js';
import { renderChurnChart, renderNpsChart, renderChannelChart, renderWaterfallChart, destroyAllCharts } from './charts.js';
import { getChurnTrend, getNpsTrend, getChannelSatisfaction, computeMetrics, ALERTS, VOC_RESULTS } from './data.js';

// ====== Router ======
let currentView = null;

const views = {
  dashboard: { render: dashboardView, after: renderDashboardCharts },
  profit: { render: profitView, after: renderProfitCharts },
  simulation: { render: simulationView, after: initSimulation },
  voice: { render: voiceView, after: initVoiceSearch },
  roi: { render: roiView, after: initRoiCalc },
};

function navigate(viewName) {
  if (currentView === viewName) return;
  currentView = viewName;

  const app = document.getElementById('app');
  const view = views[viewName];
  if (!view) return;

  // Update nav
  document.querySelectorAll('.nav__link').forEach(link => {
    link.classList.toggle('nav__link--active', link.dataset.view === viewName);
  });

  // Render
  app.innerHTML = view.render();
  if (view.after) setTimeout(() => view.after(), 50);
}

// ====== Nav setup ======
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => navigate(link.dataset.view));
});

// ====== Dashboard charts ======
function renderDashboardCharts() {
  const churn = getChurnTrend();
  const nps = getNpsTrend();
  const channels = getChannelSatisfaction();

  renderChurnChart('churnChart', churn);
  renderNpsChart('npsChart', nps);
  renderChannelChart('channelChart', channels);
}

// ====== Profit charts ======
function renderProfitCharts() {
  const m = computeMetrics();
  renderWaterfallChart('waterfallChart', m.segments);
}

// ====== Simulation ======
function initSimulation() {
  const sliders = document.querySelectorAll('.sim-slider');
  const valueEls = {};

  // Map id -> value element id
  const idMap = {
    simWait: 'simWaitVal',
    simChat: 'simChatVal',
    simMortgage: 'simMortgageVal',
    simFcr: 'simFcrVal',
    simSteps: 'simStepsVal',
  };

  // Baseline values
  const baseline = {
    wait: 8.0,
    chat: 120,
    mortgage: 14,
    fcr: 68,
    steps: 12,
  };

  // Current values
  let current = { ...baseline };

  function updateValue(id, val) {
    const elId = idMap[id];
    if (elId) {
      const el = document.getElementById(elId);
      if (el) {
        if (id === 'simChat') el.textContent = val;
        else if (id === 'simSteps') el.textContent = val;
        else el.textContent = parseFloat(val).toFixed(1);
      }
    }
  }

  function updateProjection() {
    // Simple model: each parameter delta affects churn
    const waitDelta = (baseline.wait - current.wait) / 10;
    const chatDelta = (baseline.chat - current.chat) / 300;
    const mortgageDelta = (baseline.mortgage - current.mortgage) / 30;
    const fcrDelta = (current.fcr - baseline.fcr) / 200;
    const stepsDelta = (baseline.steps - current.steps) / 40;

    const totalDelta = waitDelta + chatDelta + mortgageDelta + fcrDelta + stepsDelta;

    const baseChurn = 8.3;
    const newChurn = Math.max(2, baseChurn - totalDelta * baseChurn);
    const churnChange = baseChurn - newChurn;

    // Revenue model: for 3M clients with avg $400 ARPU
    const totalRevenue = 3000000 * 400;
    const baseLost = totalRevenue * baseChurn / 100;
    const newLost = totalRevenue * newChurn / 100;
    const saved = baseLost - newLost;

    // ROI: avg implementation cost $0.55/client = $1.65M
    const implCost = 1650000;
    const roiVal = implCost > 0 ? saved / implCost : 0;

    document.getElementById('simBaseChurn').textContent = baseChurn.toFixed(1) + '%';
    document.getElementById('simBaseRetention').textContent = (100 - baseChurn).toFixed(1) + '%';
    document.getElementById('simBaseLoss').textContent = '$' + (baseLost / 1e6).toFixed(1) + 'M';

    const impactArrow = churnChange > 0 ? '📉' : '📈';
    document.getElementById('simImpactText').textContent =
      `${impactArrow} Отток ${churnChange > 0 ? 'снизится' : 'вырастет'} на ${Math.abs(churnChange).toFixed(1)}%`;

    document.getElementById('simProjChurn').textContent = newChurn.toFixed(1) + '%';
    document.getElementById('simSavedRevenue').textContent = '$' + (saved).toLocaleString();
    document.getElementById('simROI').textContent = roiVal.toFixed(1) + 'x';
  }

  sliders.forEach(slider => {
    const handler = () => {
      const val = parseFloat(slider.value);
      current[slider.id.replace('sim', '').toLowerCase()] = val;
      updateValue(slider.id, val);
      updateProjection();
    };
    slider.addEventListener('input', handler);
    // init
    const initVal = parseFloat(slider.value);
    current[slider.id.replace('sim', '').toLowerCase()] = initVal;
    updateValue(slider.id, initVal);
  });

  // Reset button
  const resetBtn = document.getElementById('simReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.keys(baseline).forEach(key => {
        const sliderId = 'sim' + key.charAt(0).toUpperCase() + key.slice(1);
        const slider = document.getElementById(sliderId);
        if (slider) {
          slider.value = baseline[key];
          current[key] = baseline[key];
          updateValue(sliderId, baseline[key]);
        }
      });
      updateProjection();
    });
  }

  updateProjection();
}

// ====== Voice Search ======
function initVoiceSearch() {
  const searchInput = document.getElementById('voiceSearch');
  const searchBtn = document.getElementById('voiceSearchBtn');
  const resultsEl = document.getElementById('voiceResults');

  function normalizeQuery(q) {
    return q.toLowerCase().trim().replace(/[?•—,.]/g, '').replace(/\s+/g, ' ');
  }

  function findBestMatch(query) {
    const normalized = normalizeQuery(query);
    const keys = Object.keys(VOC_RESULTS);
    let bestKey = null;
    let bestScore = 0;

    for (const key of keys) {
      const normalizedKey = normalizeQuery(key);
      let score = 0;
      const queryWords = normalized.split(' ');
      const keyWords = normalizedKey.split(' ');

      for (const qw of queryWords) {
        if (qw.length < 3) continue;
        for (const kw of keyWords) {
          if (kw.includes(qw) || qw.includes(kw)) score += 1;
        }
      }
      // Bonus for exact-ish match
      if (normalizedKey.includes(normalized) || normalized.includes(normalizedKey)) score += 3;

      if (score > bestScore) {
        bestScore = score;
        bestKey = key;
      }
    }

    // threshold
    if (bestScore < 1) return null;
    return bestKey;
  }

  function renderResults(key) {
    const data = VOC_RESULTS[key];
    if (!data) {
      resultsEl.innerHTML = `<div style="padding:24px;color:var(--text-muted);text-align:center;">
        🤔 Не нашёл точного совпадения. Попробуй: «почему люди уходят после оформления кредитной карты»</div>`;
      return;
    }

    resultsEl.innerHTML = `
      <div class="chart__card">
        <div class="chart__header">
          <h3>Результаты анализа</h3>
          <span class="chart__badge">LLM-powered</span>
        </div>
        <div class="chart__body" style="height:auto;padding:0">
          <div class="voc__reasons">
            ${data.reasons.map(r => `
              <div class="voc__reason">
                <div class="voc__reason-header">
                  <span class="voc__reason-title">${r.cause}</span>
                  <span class="voc__reason-weight">${r.weight}%</span>
                </div>
                <div class="voc__reason-sentiment">
                  Тональность: ${r.sentiment === 'negative' ? '🔴 Негативная' : r.sentiment === 'neutral' ? '🟡 Нейтральная' : '🟢 Позитивная'}
                </div>
                <div class="voc__reason-quote">«${r.quote}»</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function doSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsEl.style.display = 'block';
    const match = findBestMatch(query);

    if (!match) {
      resultsEl.innerHTML = `<div style="padding:24px;color:var(--text-muted);text-align:center;">
        🤔 Не нашёл точного совпадения. Попробуй: «почему люди уходят после оформления кредитной карты»</div>`;
      return;
    }
    renderResults(match);
  }

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

  // Chips
  document.querySelectorAll('.voice__chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      searchInput.value = query;
      doSearch();
    });
  });
}

// ====== ROI Calculator ======
function initRoiCalc() {
  const ids = ['roiClients', 'roiArpu', 'roiChurn', 'roiCost'];
  const inputs = {};
  ids.forEach(id => { inputs[id] = document.getElementById(id); });

  function formatPlain(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function calc() {
    const clients = parseInt(inputs.roiClients.value);
    const arpu = parseInt(inputs.roiArpu.value);
    const churn = parseFloat(inputs.roiChurn.value) / 100;
    const costPerClient = parseFloat(inputs.roiCost.value);

    const revenueAtRisk = clients * arpu * churn;
    const recoveryRate = 0.23;
    const potentialRecovery = revenueAtRisk * recoveryRate;
    const implCost = clients * costPerClient;
    const netROI = implCost > 0 ? potentialRecovery / implCost : 0;

    const valIds = { roiClients: 'roiClientsVal', roiArpu: 'roiArpuVal', roiChurn: 'roiChurnVal', roiCost: 'roiCostVal' };
    Object.keys(valIds).forEach(key => {
      const el = document.getElementById(valIds[key]);
      if (!el) return;
      if (key === 'roiClients') el.textContent = formatPlain(parseInt(inputs[key].value));
      else if (key === 'roiArpu') el.textContent = '$' + formatPlain(parseInt(inputs[key].value));
      else if (key === 'roiChurn') el.textContent = parseFloat(inputs[key].value).toFixed(1) + '%';
      else el.textContent = '$' + parseFloat(inputs[key].value).toFixed(2);
    });

    document.getElementById('roiLoss').textContent = '$' + formatPlain(Math.round(revenueAtRisk));
    document.getElementById('roiSaved').textContent = '$' + formatPlain(Math.round(potentialRecovery));
    document.getElementById('roiCostResult').textContent = '$' + formatPlain(Math.round(implCost));
    document.getElementById('roiROI').textContent = netROI.toFixed(1) + 'x';
  }

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calc);
  });
  calc();
}

// ====== Alert Panel ======
const alertBtn = document.getElementById('alertBtn');
const alertPanel = document.getElementById('alertPanel');
const alertOverlay = document.getElementById('alertOverlay');
const alertClose = document.getElementById('alertClose');

function openAlerts() {
  alertPanel.classList.add('alert-panel--open');
  alertOverlay.classList.add('alert-overlay--open');
  const list = document.getElementById('alertList');
  list.innerHTML = ALERTS.map(a => `
    <div class="alert__item alert__item--${a.severity}">
      <div class="alert__item-header">
        <span class="alert__severity"></span>
        <span class="alert__title">${a.title}</span>
        <span class="alert__impact">$${(a.impact / 1e6).toFixed(1)}M</span>
      </div>
      <p class="alert__detail">${a.rootCause}</p>
      <div class="alert__actions">
        <span class="alert__action">▶ ${a.recommendation}</span>
      </div>
    </div>
  `).join('');
}

if (alertBtn) alertBtn.addEventListener('click', openAlerts);
if (alertClose) alertClose.addEventListener('click', () => {
  alertPanel.classList.remove('alert-panel--open');
  alertOverlay.classList.remove('alert-overlay--open');
});
if (alertOverlay) alertOverlay.addEventListener('click', () => {
  alertPanel.classList.remove('alert-panel--open');
  alertOverlay.classList.remove('alert-overlay--open');
});

// ====== Start ======
navigate('dashboard');
