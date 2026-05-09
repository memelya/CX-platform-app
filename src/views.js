// ====== View Templates for CX Profit Platform ======
// Each view returns HTML that gets rendered into #app

import { computeMetrics, getChurnTrend, getNpsTrend, getChannelSatisfaction, ALERTS, VOC_RESULTS } from './data.js';

export function dashboardView() {
  const m = computeMetrics();
  const churn = getChurnTrend();
  const npsData = getNpsTrend();

  return `
    <div class="view dashboard-view">
      <div class="dashboard__header">
        <div>
          <h1 class="view__title">CX Command Center</h1>
          <p class="view__subtitle">Диспетчерская клиентского опыта в реальном времени</p>
        </div>
        <div class="dashboard__last-update">🟢 Обновлено сейчас</div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi__grid">
        <div class="kpi__card">
          <div class="kpi__label">Клиентов на платформе</div>
          <div class="kpi__value">${(m.totalClients / 1e6).toFixed(1)}M</div>
          <div class="kpi__trend kpi__trend--up">+2.3% к периоду</div>
        </div>
        <div class="kpi__card">
          <div class="kpi__label">NPS (Net Promoter Score)</div>
          <div class="kpi__value">${m.nps}</div>
          <div class="kpi__trend kpi__trend--up">+3.2 п. за период</div>
        </div>
        <div class="kpi__card">
          <div class="kpi__label">Текущий отток (период)</div>
          <div class="kpi__value kpi__value--danger">${(m.periodChurnRate * 100).toFixed(1)}%</div>
          <div class="kpi__trend kpi__trend--down">+0.4 п. к прошлому периоду</div>
        </div>
        <div class="kpi__card kpi__card--highlight">
          <div class="kpi__label">Потеряно (доход)</div>
          <div class="kpi__value">$${(m.periodLostRevenue / 1e6).toFixed(1)}M</div>
          <div class="kpi__trend kpi__trend--up">+$280K относительно прогноза</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts__grid">
        <div class="chart__card">
          <div class="chart__header">
            <h3>Динамика оттока</h3>
            <span class="chart__badge">Churn Prediction</span>
          </div>
          <div class="chart__body">
            <canvas id="churnChart"></canvas>
          </div>
          <div class="chart__footer">
            <span>🔮 ML-прогноз на 7 дней: <strong>${(parseFloat(churn.predicted[churn.predicted.length - 1]).toFixed(1))}%</strong></span>
          </div>
        </div>
        <div class="chart__card">
          <div class="chart__header">
            <h3>NPS по месяцам</h3>
            <span class="chart__badge">Тренд</span>
          </div>
          <div class="chart__body">
            <canvas id="npsChart"></canvas>
          </div>
          <div class="chart__footer">
            <span>📈 Рост за год: <strong>${npsData.values[npsData.values.length - 1] - npsData.values[0]} п.</strong></span>
          </div>
        </div>
      </div>

      <!-- Alerts & Segments -->
      <div class="dashboard__bottom">
        <div class="chart__card alerts__card">
          <div class="chart__header">
            <h3>Активные алерты</h3>
            <span class="chart__badge chart__badge--alert">${ALERTS.length} шт.</span>
          </div>
          <div class="alerts__list">
            ${ALERTS.map(a => `
              <div class="alert__item alert__item--${a.severity}">
                <div class="alert__item-header">
                  <span class="alert__severity"></span>
                  <span class="alert__title">${a.title}</span>
                  <span class="alert__impact">$${(a.impact / 1e6).toFixed(1)}M</span>
                </div>
                <p class="alert__detail">${a.rootCause}</p>
                <div class="alert__actions">
                  <span class="alert__action">▶ Запустить сценарий</span>
                  <span class="alert__action alert__action--secondary">Симулировать</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="chart__card">
          <div class="chart__header">
            <h3>Удовлетворённость по каналам</h3>
          </div>
          <div class="chart__body">
            <canvas id="channelChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function profitView() {
  const m = computeMetrics();

  return `
    <div class="view profit-view">
      <div class="view__header">
        <h1 class="view__title">Profit Cockpit</h1>
        <p class="view__subtitle">Клиентский опыт в деньгах. Каждый пункт — в P&amp;L.</p>
      </div>

      <!-- Summary -->
      <div class="kpi__grid">
        <div class="kpi__card kpi__card--highlight">
          <div class="kpi__label">Годовая выручка под риском</div>
          <div class="kpi__value">${(m.annualRevenue / 1e6).toFixed(0)}M</div>
          <div class="kpi__trend">от клиентов, которые могут уйти</div>
        </div>
        <div class="kpi__card">
          <div class="kpi__label">Потеряно за период (отток)</div>
          <div class="kpi__value kpi__value--danger">$${(m.periodLostRevenue / 1e6).toFixed(1)}M</div>
          <div class="kpi__trend">${m.periodLostClients.toLocaleString()} клиентов</div>
        </div>
        <div class="kpi__card">
          <div class="kpi__label">Потенциал удержания</div>
          <div class="kpi__value" style="background:linear-gradient(135deg,#6c5ce7,#00cec9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">$${(m.periodLostRevenue * 0.23 / 1e6).toFixed(1)}M</div>
          <div class="kpi__trend">23% recovery rate (ML-модель)</div>
        </div>
        <div class="kpi__card">
          <div class="kpi__label">ROI платформы (прогноз)</div>
          <div class="kpi__value" style="background:linear-gradient(135deg,#00cec9,#55efc4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${(m.periodLostRevenue * 0.23 / (m.totalClients * 0.55 / 12 * 3)).toFixed(1)}x</div>
          <div class="kpi__trend">на вложенный рубль</div>
        </div>
      </div>

      <!-- Revenue Waterfall placeholder -->
      <div class="chart__card">
        <div class="chart__header">
          <h3>Profit Waterfall — Потери по сегментам</h3>
          <span class="chart__badge">Causal Model</span>
        </div>
        <div class="chart__body">
          <canvas id="waterfallChart"></canvas>
        </div>
        <div class="chart__footer">
          <span>⚡ Causal evidence: изменение времени ответа = <strong>$\$${Math.round(m.periodLostRevenue * 0.17 / 1000) * 1000}K влияния</strong></span>
        </div>
      </div>

      <!-- Segment breakdown -->
      <div class="segment__grid">
        ${m.segments.map(seg => `
          <div class="segment__card" style="border-left: 3px solid ${seg.color}">
            <div class="segment__name">${seg.name}</div>
            <div class="segment__stats">
              <div>
                <span class="segment__stat-label">Клиентов</span>
                <span class="segment__stat-value">${(seg.clients / 1000).toFixed(0)}K</span>
              </div>
              <div>
                <span class="segment__stat-label">ARPU</span>
                <span class="segment__stat-value">${seg.arpu}$</span>
              </div>
              <div>
                <span class="segment__stat-label">Отток</span>
                <span class="segment__stat-value segment__stat-value--danger">${(seg.churn * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span class="segment__stat-label">Годовая потеря</span>
                <span class="segment__stat-value">$${Math.round(seg.clients * seg.churn * seg.arpu / 1e6)}M</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function simulationView() {
  return `
    <div class="view simulation-view">
      <div class="view__header">
        <h1 class="view__title">Simulation Sandbox</h1>
        <p class="view__subtitle">Flight simulator для клиентского опыта. Меняй параметры — смотри эффект на выручку.</p>
      </div>

      <div class="simulation__layout">
        <div class="simulation__controls">
          <div class="simulation__control-group">
            <h3>Время ответа</h3>
            <div class="sim__control">
              <label>Контакт-центр (среднее ожидание, мин)</label>
              <input type="range" class="sim-slider" id="simWait" min="1" max="20" step="0.5" value="8" />
              <div class="sim__value"><span id="simWaitVal">8.0</span> мин</div>
            </div>
            <div class="sim__control">
              <label>Чат (первый ответ, сек)</label>
              <input type="range" class="sim-slider" id="simChat" min="10" max="180" step="5" value="120" />
              <div class="sim__value"><span id="simChatVal">120</span> сек</div>
            </div>
            <div class="sim__control">
              <label>Ипотека (одобрение, дней)</label>
              <input type="range" class="sim-slider" id="simMortgage" min="3" max="30" step="1" value="14" />
              <div class="sim__value"><span id="simMortgageVal">14</span> дней</div>
            </div>
          </div>
          <div class="simulation__control-group">
            <h3>Качество сервиса</h3>
            <div class="sim__control">
              <label>% решённых с первого обращения (FCR)</label>
              <input type="range" class="sim-slider" id="simFcr" min="40" max="95" step="1" value="68" />
              <div class="sim__value"><span id="simFcrVal">68</span>%</div>
            </div>
            <div class="sim__control">
              <label>Количество шагов в онбординге</label>
              <input type="range" class="sim-slider" id="simSteps" min="3" max="20" step="1" value="12" />
              <div class="sim__value"><span id="simStepsVal">12</span> шагов</div>
            </div>
          </div>

          <button class="btn btn--primary btn--full" id="simReset">Сбросить к текущим</button>
        </div>

        <div class="simulation__results">
          <div class="sim__result-baseline">
            <div class="sim__result-header">
              <span>Текущие показатели</span>
              <span class="sim__result-badge">Baseline</span>
            </div>
            <div class="sim__result-grid">
              <div class="sim__result-item">
                <span class="sim__result-label">Отток (период)</span>
                <span class="sim__result-value" id="simBaseChurn">8.3%</span>
              </div>
              <div class="sim__result-item">
                <span class="sim__result-label">Удержание</span>
                <span class="sim__result-value" id="simBaseRetention">91.7%</span>
              </div>
              <div class="sim__result-item">
                <span class="sim__result-label">Потеря (год)</span>
                <span class="sim__result-value" id="simBaseLoss">$18.4M</span>
              </div>
            </div>
          </div>

          <div class="sim__result-projected sim__result-projected--active">
            <div class="sim__result-header">
              <span>Прогноз при изменениях</span>
              <span class="sim__result-badge sim__result-badge--green">Projected</span>
            </div>
            <div class="sim__impact-summary">
              <span id="simImpactText">📈 Отток снизится на 1.2%</span>
            </div>
            <div class="sim__result-grid">
              <div class="sim__result-item">
                <span class="sim__result-label">Новый отток</span>
                <span class="sim__result-value" id="simProjChurn">7.1%</span>
              </div>
              <div class="sim__result-item">
                <span class="sim__result-label">Сохранённый доход (год)</span>
                <span class="sim__result-value sim__result-value--profit" id="simSavedRevenue">$2,840,000</span>
              </div>
              <div class="sim__result-item">
                <span class="sim__result-label">ROI изменения</span>
                <span class="sim__result-value sim__result-value--profit" id="simROI">6.8x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function voiceView() {
  return `
    <div class="view voice-view">
      <div class="view__header">
        <h1 class="view__title">Voice-of-Customer AI</h1>
        <p class="view__subtitle">Спроси на естественном языке — получи ответ с цитатами и цифрами.</p>
      </div>

      <div class="voice__search">
        <div class="voice__search-input-wrapper">
          <span class="voice__search-icon">🔍</span>
          <input type="text" class="voice__search-input" id="voiceSearch" placeholder="Например: «почему люди уходят после оформления кредитной карты»" />
          <button class="voice__search-btn" id="voiceSearchBtn">Спросить</button>
        </div>
        <div class="voice__suggestions">
          <span class="voice__suggestion-label">Быстрые вопросы:</span>
          <button class="voice__chip" data-query="почему люди уходят после оформления кредитной карты">Отток по кредиткам</button>
          <button class="voice__chip" data-query="что говорят про ипотеку">Ипотека</button>
        </div>
      </div>

      <div class="voice__results" id="voiceResults" style="display:none">
        <!-- filled by JS -->
      </div>
    </div>
  `;
}

export function roiView() {
  return `
    <div class="view roi-view">
      <div class="view__header">
        <h1 class="view__title">ROI Калькулятор</h1>
        <p class="view__subtitle">Сколько ваш банк теряет на клиентском опыте — и сколько можно вернуть.</p>
      </div>

      <div class="roi__calculator" id="roiCalc">
        <div class="roi__inputs">
          <div class="roi__field">
            <label>Количество розничных клиентов</label>
            <input type="range" id="roiClients" min="100000" max="20000000" step="100000" value="3000000" />
            <div class="roi__range-values">
              <span>100K</span>
              <span id="roiClientsVal">3 000 000</span>
              <span>20M</span>
            </div>
          </div>
          <div class="roi__field">
            <label>Средний годовой доход с клиента (ARPU), $</label>
            <input type="range" id="roiArpu" min="50" max="2000" step="10" value="400" />
            <div class="roi__range-values">
              <span>$50</span>
              <span id="roiArpuVal">$400</span>
              <span>$2 000</span>
            </div>
          </div>
          <div class="roi__field">
            <label>Текущий годовой отток клиентов, %</label>
            <input type="range" id="roiChurn" min="5" max="40" step="0.5" value="15" />
            <div class="roi__range-values">
              <span>5%</span>
              <span id="roiChurnVal">15.0%</span>
              <span>40%</span>
            </div>
          </div>
          <div class="roi__field">
            <label>Средняя стоимость внедрения на клиента, $</label>
            <input type="range" id="roiCost" min="0.20" max="2.00" step="0.05" value="0.55" />
            <div class="roi__range-values">
              <span>$0.20</span>
              <span id="roiCostVal">$0.55</span>
              <span>$2.00</span>
            </div>
          </div>
        </div>
        <div class="roi__results">
          <div class="roi__result-item">
            <span class="roi__result-label">Годовая потеря от оттока</span>
            <span class="roi__result-value" id="roiLoss">$180 000 000</span>
          </div>
          <div class="roi__result-item roi__result-item--highlight">
            <span class="roi__result-label">Потенциальное удержание (23% recovery)</span>
            <span class="roi__result-value" id="roiSaved">$41 400 000</span>
          </div>
          <div class="roi__result-item">
            <span class="roi__result-label">Стоимость внедрения/год</span>
            <span class="roi__result-value" id="roiCostResult">$1 650 000</span>
          </div>
          <div class="roi__result-item">
            <span class="roi__result-label">Чистый ROI</span>
            <span class="roi__result-value roi__result-value--profit" id="roiROI">24.1x</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
