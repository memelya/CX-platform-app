// ====== Chart.js Rendering ======
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

Chart.defaults.color = '#a1a1aa';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";

// Dark theme for charts
const colors = {
  grid: 'rgba(255,255,255,0.04)',
  tooltip: 'rgba(15,15,25,0.95)',
  accent: '#6c5ce7',
  accent2: '#00cec9',
  danger: '#e17055',
  warning: '#fdcb6e',
  success: '#55efc4',
  text: '#a1a1aa',
};

let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

export function renderChurnChart(canvasId, data) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels.slice(-14),
      datasets: [
        {
          label: 'Фактический отток',
          data: data.actual.slice(-14),
          borderColor: '#e17055',
          backgroundColor: 'rgba(225,112,85,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: '#e17055',
        },
        {
          label: 'ML-прогноз',
          data: data.predicted.slice(-14),
          borderColor: '#00cec9',
          borderDash: [6, 3],
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, padding: 16, usePointStyle: true },
        },
        tooltip: {
          backgroundColor: colors.tooltip,
          titleFont: { size: 12 },
          bodyFont: { size: 13 },
          cornerRadius: 8,
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { maxTicksLimit: 8, font: { size: 11 } },
        },
        y: {
          grid: { color: colors.grid },
          ticks: {
            font: { size: 11 },
            callback: v => v + '%',
          },
        },
      },
    },
  });
}

export function renderNpsChart(canvasId, data) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(108,92,231,0.25)');
  gradient.addColorStop(1, 'rgba(108,92,231,0)');

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'NPS',
        data: data.values,
        borderColor: colors.accent,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: colors.accent,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltip,
          cornerRadius: 8,
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        y: {
          grid: { color: colors.grid },
          min: 35,
          max: 60,
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
}

export function renderChannelChart(canvasId, data) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const colorsList = ['#6c5ce7', '#00cec9', '#fdcb6e', '#e17055', '#55efc4'];

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Удовлетворённость (1-5)',
        data: data.map(d => d.value),
        backgroundColor: data.map((_, i) => colorsList[i % colorsList.length] + '99'),
        borderColor: data.map((_, i) => colorsList[i % colorsList.length]),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 32,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltip,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            afterLabel: ctx => `Клиентов: ${(data[ctx.dataIndex].clients / 1000).toFixed(0)}K`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          min: 0,
          max: 5,
          ticks: { font: { size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' } },
        },
      },
    },
  });
}

export function renderWaterfallChart(canvasId, segments) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = segments.map(s => s.name);
  const losses = segments.map(s => Math.round(s.clients * s.churn * s.arpu / 1e6 * 10) / 10);
  const colorsArr = segments.map(s => s.color);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Потеря ($M/год)',
        data: losses,
        backgroundColor: colorsArr.map(c => c + '99'),
        borderColor: colorsArr,
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 48,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltip,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: ctx => `$${ctx.raw}M/год`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' } },
        },
        y: {
          grid: { color: colors.grid },
          ticks: { font: { size: 11 }, callback: v => '$' + v + 'M' },
        },
      },
    },
  });
}

export function destroyAllCharts() {
  Object.keys(chartInstances).forEach(id => destroyChart(id));
}
