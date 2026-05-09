// ====== Data ======
const SEGMENTS = [
  { id: 'mass', name: 'Mass Market', color: '#6c5ce7', clients: 1800000, arpu: 180, churn: 0.18 },
  { id: 'middle', name: 'Middle', color: '#00cec9', clients: 800000, arpu: 520, churn: 0.12 },
  { id: 'premium', name: 'Premium', color: '#fdcb6e', clients: 300000, arpu: 1400, churn: 0.08 },
  { id: 'private', name: 'Private Banking', color: '#e17055', clients: 50000, arpu: 4500, churn: 0.04 },
];

const ALERTS = [
  { id: 1, sev: 'h', title: 'Рост оттока в Premium', impact: 2847000, cause: 'Время одобрения ипотеки выросло на 40%', rec: 'Запустить удержание Premium', time: '2ч назад' },
  { id: 2, sev: 'm', title: 'CSAT контакт-центра снизился', impact: 680000, cause: 'Среднее время ожидания 8.2 мин (норма 4)', rec: 'Оптимизировать IVR', time: '5ч назад' },
  { id: 3, sev: 'l', title: 'Аномалия в мобильном приложении', impact: 210000, cause: 'Ошибка авторизации после обновления', rec: 'Откатить релиз', time: '1д назад' },
];

const VOC = {
  churn: {
    q: 'почему люди уходят после оформления кредитной карты',
    reasons: [
      { cause: 'Неочевидные условия обслуживания (2990₽/год)', weight: 34, sent: 'negative', quote: 'Никто не сказал, что обслуживание 2990 в год' },
      { cause: 'Долгий выпуск (7-14 дней вместо 3)', weight: 28, sent: 'negative', quote: 'Обещали за 3 дня — пришла через полторы недели' },
      { cause: 'Лимит ниже одобренного', weight: 18, sent: 'negative', quote: 'В заявке 500к — пришла на 200к' },
      { cause: 'Сложности с активацией в приложении', weight: 12, sent: 'negative', quote: 'Третий раз ввожу код — ошибка' },
      { cause: 'Лучшие условия у конкурента', weight: 8, sent: 'neutral', quote: 'В Тинькофф сделал за 10 минут онлайн' },
    ],
  },
  mortgage: {
    q: 'что говорят про ипотеку',
    reasons: [
      { cause: 'Срок рассмотрения > 2 недель', weight: 45, sent: 'negative', quote: 'Третья неделя — квартира уйдёт' },
      { cause: 'Лишние документы', weight: 25, sent: 'negative', quote: '12 справок принесли — просят ещё 3' },
      { cause: 'Сумма ниже ожидаемой', weight: 18, sent: 'negative', quote: 'Одобрили на 40% меньше — весь смысл пропал' },
    ],
  },
};

const channels = [
  { name: 'Мобильное приложение', sat: 4.2, clients: 1200000 },
  { name: 'Интернет-банк', sat: 3.8, clients: 900000 },
  { name: 'Контакт-центр', sat: 3.1, clients: 600000 },
  { name: 'Отделения', sat: 3.5, clients: 400000 },
  { name: 'Онлайн-чат', sat: 4.0, clients: 350000 },
];

function totalClients() { return SEGMENTS.reduce((s, x) => s + x.clients, 0); }
function totalRevenue() { return SEGMENTS.reduce((s, x) => s + x.clients * x.arpu, 0); }
function lostRevenue() { return SEGMENTS.reduce((s, x) => s + x.clients * x.churn * x.arpu, 0); }
function churnRate() { return SEGMENTS.reduce((s, x) => s + x.clients * x.churn, 0) / totalClients(); }
function fmt(n) { return n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : '$' + Math.round(n/1e3) + 'K'; }
function fnum(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function pct(n) { return (n * 100).toFixed(1) + '%'; }

// ====== Router ======
const app = document.getElementById('app');

function show(view) {
  document.querySelectorAll('.topbar__btn').forEach(b => b.classList.toggle('active', b.dataset.tab === view));
  const fns = { dashboard, profit, sim, voice, roi };
  if (fns[view]) fns[view]();
}

// ====== Dashboard ======
function dashboard() {
  const lr = lostRevenue();
  const cr = churnRate();
  app.innerHTML = `
    <div class="view">
      <h2>CX Command Center</h2>
      <p>Диспетчерская клиентского опыта в реальном времени</p>
      <div class="cards">
        <div class="card">
          <div class="card__l">Клиентов на платформе</div>
          <div class="card__v">${(totalClients()/1e6).toFixed(1)}M</div>
          <div class="card__t card__t--up">+2.3% к периоду</div>
        </div>
        <div class="card">
          <div class="card__l">NPS</div>
          <div class="card__v">${(68 + Math.random()*6).toFixed(1)}</div>
          <div class="card__t card__t--up">+3.2 п. за период</div>
        </div>
        <div class="card">
          <div class="card__l">Текущий отток (год)</div>
          <div class="card__v card__v--dng">${pct(cr)}</div>
          <div class="card__t card__t--dn">+0.4 п. к прошлому</div>
        </div>
        <div class="card card--hl">
          <div class="card__l">Потеряно (год)</div>
          <div class="card__v card__v--prf">${fmt(lr)}</div>
          <div class="card__t">+$280K относительно прогноза</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="block">
          <div class="block__h">Динамика оттока <span>Churn Prediction</span></div>
          <div id="churnBars"></div>
          <div style="font-size:12px;color:#a1a1aa;margin-top:8px">🔮 ML-прогноз на 7 дней: <strong style="color:#e4e4e7">${(cr * 100 - 0.6).toFixed(1)}%</strong></div>
        </div>
        <div class="block">
          <div class="block__h">NPS по месяцам <span>Тренд</span></div>
          <div id="npsBars"></div>
          <div style="font-size:12px;color:#a1a1aa;margin-top:8px">📈 Рост: <strong style="color:#e4e4e7">+11 п. за год</strong></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="block">
          <div class="block__h">Активные алерты <span>3 шт.</span></div>
          <div id="alertList">
            ${ALERTS.map(a => {
              const dotClass = {h:'alert-dot--h', m:'alert-dot--m', l:'alert-dot--l'}[a.sev];
              return `<div class="alert-item">
                <div class="alert-h"><span class="alert-dot ${dotClass}"></span><span class="alert-t">${a.title}</span><span class="alert-i">${fmt(a.impact)}</span></div>
                <div class="alert-d">${a.cause}</div>
                <div class="alert-a"><span>▶ ${a.rec}</span></div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="block">
          <div class="block__h">Удовлетворённость по каналам</div>
          <div id="channelBars">
            ${channels.map(c => `
              <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px">
                  <span>${c.name}</span><span style="font-weight:700;font-family:monospace">${c.sat.toFixed(1)}</span>
                </div>
                <div class="bar"><div class="bar__fill" style="width:${c.sat/5*100}%;background:${['#6c5ce7','#00cec9','#fdcb6e','#e17055','#55efc4'][channels.indexOf(c)]}"></div></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Render simple bar charts
  renderChurnBars(cr);
  renderNpsBars();
}

function renderChurnBars(curr) {
  const el = document.getElementById('churnBars');
  if (!el) return;
  const data = Array.from({length: 14}, (_, i) => curr * 100 + (Math.random() - 0.45) * 1.5);
  const max = Math.max(...data);
  el.innerHTML = data.map((v, i) => {
    const h = v / max * 80;
    const pred = i >= 7;
    return `<div style="display:flex;align-items:end;gap:2px;height:90px;margin-bottom:2px">
      ${data.slice(0,i+1).map((x, j) => {
        const ph = x / max * 80;
        return `<div style="width:${100/14-2}%;height:${ph}px;background:${j>=7?'#00cec9':'#e17055'};border-radius:2px 2px 0 0;opacity:${j===i?1:0.5}"></div>`;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#a1a1aa">
      <span>${i===0?'Текущий':''}</span>
      <span>${i===13?'Прогноз (ML)':''}</span>
    </div>`;
  }).join('');
}

function renderNpsBars() {
  const el = document.getElementById('npsBars');
  if (!el) return;
  const data = [42,44,43,45,46,44,47,49,48,50,51,53];
  const max = 60; const min = 35;
  el.innerHTML = '<div style="display:flex;align-items:end;gap:4px;height:90px">' +
    data.map((v, i) => {
      const h = (v - min) / (max - min) * 80;
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center">
        <div style="width:100%;height:${h}px;background:#6c5ce7;border-radius:2px 2px 0 0;opacity:${0.4 + (v/60)}"></div>
        <span style="font-size:9px;color:#a1a1aa;margin-top:2px">${('0'+(i+1)).slice(-2)}</span>
      </div>`;
    }).join('') + '</div>';
}

// ====== Profit Cockpit ======
function profit() {
  const lr = lostRevenue();
  const tc = totalClients();
  const potential = lr * 0.23;
  const implCost = tc * 0.55;
  const roi = potential / implCost;

  app.innerHTML = `
    <div class="view">
      <h2>Profit Cockpit</h2>
      <p>Клиентский опыт в деньгах. Каждый пункт — в P&amp;L.</p>
      <div class="cards">
        <div class="card card--hl">
          <div class="card__l">Годовая выручка под риском</div>
          <div class="card__v card__v--prf">${fmt(totalRevenue())}</div>
          <div class="card__t">от клиентов, которые могут уйти</div>
        </div>
        <div class="card">
          <div class="card__l">Потеряно (отток)</div>
          <div class="card__v card__v--dng">${fmt(lr)}</div>
          <div class="card__t">${fnum(Math.round(tc * churnRate()))} клиентов</div>
        </div>
        <div class="card">
          <div class="card__l">Потенциал удержания</div>
          <div class="card__v card__v--prf">${fmt(potential)}</div>
          <div class="card__t">23% recovery rate</div>
        </div>
        <div class="card">
          <div class="card__l">ROI платформы</div>
          <div class="card__v card__v--prf">${roi.toFixed(1)}x</div>
          <div class="card__t">на вложенный рубль</div>
        </div>
      </div>

      <div class="block">
        <div class="block__h">Profit Waterfall — Потери по сегментам <span>Causal Model</span></div>
        ${SEGMENTS.map(s => {
          const loss = s.clients * s.churn * s.arpu;
          const maxLoss = Math.max(...SEGMENTS.map(x => x.clients * x.churn * x.arpu));
          const pct = loss / maxLoss * 100;
          return `<div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px">
              <span>${s.name}</span><span style="font-weight:700;font-family:monospace">${fmt(loss)}/год</span>
            </div>
            <div class="bar"><div class="bar__fill" style="width:${pct}%;background:${s.color}"></div></div>
          </div>`;
        }).join('')}
        <div style="font-size:12px;color:#a1a1aa;margin-top:8px">⚡ Causal evidence: изменение времени ответа = <strong style="color:#e4e4e7">$${Math.round(lr * 0.17 / 1000) * 1000}K влияния</strong></div>
      </div>

      <div style="margin-top:16px">
        ${SEGMENTS.map(s => {
          const loss = s.clients * s.churn * s.arpu;
          return `<div style="display:grid;grid-template-columns:repeat(5,1fr);padding:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;margin-bottom:8px;border-left:3px solid ${s.color};gap:8px">
            <div><div style="font-size:11px;color:#a1a1aa">Сегмент</div><div style="font-weight:700">${s.name}</div></div>
            <div><div style="font-size:11px;color:#a1a1aa">Клиентов</div><div style="font-family:monospace;font-weight:600">${(s.clients/1000).toFixed(0)}K</div></div>
            <div><div style="font-size:11px;color:#a1a1aa">ARPU</div><div style="font-family:monospace;font-weight:600">${s.arpu}$</div></div>
            <div><div style="font-size:11px;color:#a1a1aa">Отток</div><div style="font-family:monospace;font-weight:600;color:#e17055">${pct(s.churn)}</div></div>
            <div><div style="font-size:11px;color:#a1a1aa">Потеря/год</div><div style="font-family:monospace;font-weight:600">${fmt(loss)}</div></div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

// ====== Simulation ======
function sim() {
  const BASE = { wait: 8.0, chat: 120, mortgage: 14, fcr: 68, steps: 12 };
  let curr = { ...BASE };

  app.innerHTML = `
    <div class="view">
      <h2>Simulation Sandbox</h2>
      <p>Меняй параметры — смотри эффект на выручку</p>
      <div class="sim-l">
        <div class="block">
          <div class="block__h">Параметры</div>
          <div class="sim-ctrl">
            <label>Контакт-центр (ожидание, мин): <span class="val" id="sv1">${BASE.wait.toFixed(1)}</span></label>
            <input type="range" id="s1" min="1" max="20" step="0.5" value="${BASE.wait}" />
          </div>
          <div class="sim-ctrl">
            <label>Чат (первый ответ, сек): <span class="val" id="sv2">${BASE.chat}</span></label>
            <input type="range" id="s2" min="10" max="180" step="5" value="${BASE.chat}" />
          </div>
          <div class="sim-ctrl">
            <label>Ипотека (одобрение, дней): <span class="val" id="sv3">${BASE.mortgage}</span></label>
            <input type="range" id="s3" min="3" max="30" step="1" value="${BASE.mortgage}" />
          </div>
          <div class="sim-ctrl">
            <label>FCR (% с первого раза): <span class="val" id="sv4">${BASE.fcr}</span></label>
            <input type="range" id="s4" min="40" max="95" step="1" value="${BASE.fcr}" />
          </div>
          <div class="sim-ctrl">
            <label>Шагов в онбординге: <span class="val" id="sv5">${BASE.steps}</span></label>
            <input type="range" id="s5" min="3" max="20" step="1" value="${BASE.steps}" />
          </div>
          <button id="simReset" style="width:100%;padding:10px;border-radius:8px;border:none;background:#6c5ce7;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;margin-top:8px">Сбросить</button>
        </div>
        <div>
          <div class="sim-b">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
              <span>Текущие</span><span style="font-size:10px;color:#a1a1aa;background:rgba(255,255,255,0.04);padding:2px 8px;border-radius:100px">Baseline</span>
            </div>
            <div class="sim-row"><span class="l">Отток</span><span class="v" id="sb1">8.3%</span></div>
            <div class="sim-row"><span class="l">Удержание</span><span class="v" id="sb2">91.7%</span></div>
            <div class="sim-row"><span class="l">Потеря (год)</span><span class="v" id="sb3">$18.4M</span></div>
          </div>
          <div class="sim-b sim-b--pr">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
              <span>Прогноз</span><span style="font-size:10px;background:rgba(85,239,196,0.08);color:#55efc4;padding:2px 8px;border-radius:100px">Projected</span>
            </div>
            <div class="sim-impact" id="simImpact">📉 Отток снизится на 1.2%</div>
            <div class="sim-row"><span class="l">Новый отток</span><span class="v" id="sp1">7.1%</span></div>
            <div class="sim-row"><span class="l">Сохранено (год)</span><span class="v v--p" id="sp2">$2,840,000</span></div>
            <div class="sim-row"><span class="l">ROI изменения</span><span class="v v--p" id="sp3">6.8x</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const sliders = ['s1','s2','s3','s4','s5'].map(id => document.getElementById(id));
  const vals = ['sv1','sv2','sv3','sv4','sv5'].map(id => document.getElementById(id));
  const keys = ['wait','chat','mortgage','fcr','steps'];

  function update() {
    keys.forEach((k, i) => { curr[k] = parseFloat(sliders[i].value); vals[i].textContent = sliders[i].value; });
    calc();
  }

  function calc() {
    const dWait = (BASE.wait - curr.wait) / 10;
    const dChat = (BASE.chat - curr.chat) / 300;
    const dMort = (BASE.mortgage - curr.mortgage) / 30;
    const dFcr = (curr.fcr - BASE.fcr) / 200;
    const dSteps = (BASE.steps - curr.steps) / 40;
    const delta = dWait + dChat + dMort + dFcr + dSteps;

    const baseChurn = 8.3;
    const newChurn = Math.max(2, baseChurn - delta * baseChurn);
    const saved = 3000000 * 400 * (baseChurn - newChurn) / 100;
    const roi = saved / 1650000;

    document.getElementById('sb1').textContent = baseChurn.toFixed(1) + '%';
    document.getElementById('sb2').textContent = (100 - baseChurn).toFixed(1) + '%';
    document.getElementById('sb3').textContent = '$' + (3000000 * 400 * baseChurn / 100 / 1e6).toFixed(1) + 'M';
    document.getElementById('simImpact').textContent = `📉 Отток ${newChurn < baseChurn ? 'снизится' : 'вырастет'} на ${Math.abs(baseChurn - newChurn).toFixed(1)}%`;
    document.getElementById('sp1').textContent = newChurn.toFixed(1) + '%';
    document.getElementById('sp2').textContent = '$' + Math.round(saved).toLocaleString();
    document.getElementById('sp3').textContent = roi.toFixed(1) + 'x';
  }

  sliders.forEach((s, i) => { s.addEventListener('input', update); });
  document.getElementById('simReset').addEventListener('click', () => {
    keys.forEach((k, i) => { sliders[i].value = BASE[k]; vals[i].textContent = BASE[k]; curr[k] = BASE[k]; });
    calc();
  });
  calc();
}

// ====== Voice AI ======
function voice() {
  app.innerHTML = `
    <div class="view">
      <h2>Voice-of-Customer AI</h2>
      <p>Спроси на естественном языке — получи ответ с цитатами</p>
      <div class="vsrch">
        <input id="vSearch" placeholder="Например: «почему люди уходят после оформления кредитной карты»" />
        <button id="vBtn">Спросить</button>
      </div>
      <div>
        <span style="font-size:12px;color:#a1a1aa">Быстрые вопросы:</span>
        <span class="vchip" data-q="churn">Отток по кредиткам</span>
        <span class="vchip" data-q="mortgage">Ипотека</span>
      </div>
      <div id="vResults"></div>
    </div>
  `;

  document.getElementById('vBtn').addEventListener('click', doVocSearch);
  document.getElementById('vSearch').addEventListener('keydown', e => { if (e.key === 'Enter') doVocSearch(); });
  document.querySelectorAll('.vchip').forEach(c => c.addEventListener('click', () => {
    document.getElementById('vSearch').value = c.textContent;
    doVocSearch();
  }));

  function doVocSearch() {
    const q = document.getElementById('vSearch').value.toLowerCase();
    const el = document.getElementById('vResults');
    let data;
    if (q.includes('кредит') || q.includes('карт') || q.includes('уход')) data = VOC.churn;
    else if (q.includes('ипотек') || q.includes('жиль') || q.includes('квартир')) data = VOC.mortgage;
    else {
      el.innerHTML = '<div style="padding:16px;color:#a1a1aa;text-align:center">🤔 Не нашёл. Попробуйте: «почему люди уходят после оформления кредитной карты»</div>';
      return;
    }
    el.innerHTML = `
      <div class="block" style="margin-top:16px">
        <div class="block__h">Результаты анализа <span>LLM-powered</span></div>
        ${data.reasons.map(r => `
          <div class="vreason">
            <h4>${r.cause} <span>${r.weight}%</span></h4>
            <div class="sent">${r.sent === 'negative' ? '🔴' : '🟡'} ${r.sent === 'negative' ? 'Негативная' : 'Нейтральная'}</div>
            <div class="q">«${r.quote}»</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// ====== ROI ======
function roi() {
  app.innerHTML = `
    <div class="view">
      <h2>ROI Калькулятор</h2>
      <p>Сколько ваш банк теряет — и сколько можно вернуть</p>
      <div class="roi-c">
        <div>
          <div class="roi-f">
            <label>Клиентов: <span id="rCv">3 000 000</span></label>
            <input type="range" id="rC" min="100000" max="20000000" step="100000" value="3000000" />
            <div class="rv"><span>100K</span><span>20M</span></div>
          </div>
          <div class="roi-f">
            <label>ARPU: <span id="rAv">$400</span></label>
            <input type="range" id="rA" min="50" max="2000" step="10" value="400" />
            <div class="rv"><span>$50</span><span>$2 000</span></div>
          </div>
          <div class="roi-f">
            <label>Отток: <span id="rChv">15.0%</span></label>
            <input type="range" id="rCh" min="5" max="40" step="0.5" value="15" />
            <div class="rv"><span>5%</span><span>40%</span></div>
          </div>
          <div class="roi-f">
            <label>Стоимость внедрения/клиент: <span id="rCov">$0.55</span></label>
            <input type="range" id="rCo" min="0.20" max="2.00" step="0.05" value="0.55" />
            <div class="rv"><span>$0.20</span><span>$2.00</span></div>
          </div>
        </div>
        <div>
          <div class="roi-res">
            <div class="l">Годовая потеря от оттока</div>
            <div class="v" id="rLoss">$180 000 000</div>
          </div>
          <div class="roi-res roi-res--hl">
            <div class="l">Потенциальное удержание</div>
            <div class="v v--p" id="rSave">$41 400 000</div>
          </div>
          <div class="roi-res">
            <div class="l">Стоимость внедрения/год</div>
            <div class="v" id="rCost">$1 650 000</div>
          </div>
          <div class="roi-res">
            <div class="l">Чистый ROI</div>
            <div class="v v--p" id="rROI">24.1x</div>
          </div>
        </div>
      </div>
    </div>
  `;

  function rCalc() {
    const clients = parseInt(document.getElementById('rC').value);
    const arpu = parseInt(document.getElementById('rA').value);
    const churn = parseFloat(document.getElementById('rCh').value) / 100;
    const cost = parseFloat(document.getElementById('rCo').value);

    const loss = clients * arpu * churn;
    const save = loss * 0.23;
    const impl = clients * cost;
    const roi = impl > 0 ? save / impl : 0;

    document.getElementById('rCv').textContent = fnum(clients);
    document.getElementById('rAv').textContent = '$' + fnum(arpu);
    document.getElementById('rChv').textContent = (churn * 100).toFixed(1) + '%';
    document.getElementById('rCov').textContent = '$' + cost.toFixed(2);
    document.getElementById('rLoss').textContent = '$' + fnum(Math.round(loss));
    document.getElementById('rSave').textContent = '$' + fnum(Math.round(save));
    document.getElementById('rCost').textContent = '$' + fnum(Math.round(impl));
    document.getElementById('rROI').textContent = roi.toFixed(1) + 'x';
  }

  ['rC','rA','rCh','rCo'].forEach(id => document.getElementById(id).addEventListener('input', rCalc));
  rCalc();
}

// ====== Init ======
document.querySelectorAll('.topbar__btn').forEach(b => {
  b.addEventListener('click', () => show(b.dataset.tab));
});

show('dashboard');
console.log('🧿 CX Profit Platform — app loaded');
