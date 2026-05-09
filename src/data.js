// ====== Mock Data for CX Profit Platform ======

export const PERIODS = {
  '7d': { label: '7 days', days: 7, multiplier: 1 },
  '30d': { label: '30 days', days: 30, multiplier: 3 },
  'quarter': { label: 'Quarter', days: 90, multiplier: 8 },
  'year': { label: 'Year', days: 365, multiplier: 30 },
};

// ====== Generate time series ======
export function generateTrend(days, base, volatility = 0.05, direction = 0) {
  const data = [];
  let val = base;
  for (let i = 0; i < days; i++) {
    val += (Math.random() - 0.45) * volatility * base + direction * base / days;
    val = Math.max(val, base * 0.7);
    data.push(Math.round(val * 100) / 100);
  }
  return data;
}

// ====== Segments ======
export const SEGMENTS = [
  { id: 'mass', name: 'Mass Market', color: '#6c5ce7', clients: 1800000, arpu: 180, churn: 0.18 },
  { id: 'middle', name: 'Middle', color: '#00cec9', clients: 800000, arpu: 520, churn: 0.12 },
  { id: 'premium', name: 'Premium', color: '#fdcb6e', clients: 300000, arpu: 1400, churn: 0.08 },
  { id: 'private', name: 'Private Banking', color: '#e17055', clients: 50000, arpu: 4500, churn: 0.04 },
];

// ====== Channels ======
export const CHANNELS = [
  { id: 'mobile', name: 'Мобильное приложение', clients: 1200000, satisfaction: 4.2 },
  { id: 'web', name: 'Интернет-банк', clients: 900000, satisfaction: 3.8 },
  { id: 'call', name: 'Контакт-центр', clients: 600000, satisfaction: 3.1 },
  { id: 'branch', name: 'Отделения', clients: 400000, satisfaction: 3.5 },
  { id: 'chat', name: 'Онлайн-чат', clients: 350000, satisfaction: 4.0 },
];

// ====== Compute metrics ======
export function computeMetrics(period = '30d') {
  const mult = PERIODS[period]?.multiplier || 3;

  const totalClients = SEGMENTS.reduce((s, seg) => s + seg.clients, 0);
  const annualRevenue = SEGMENTS.reduce((s, seg) => s + seg.clients * seg.arpu, 0);
  const periodRevenue = annualRevenue / 12 * mult;
  const periodChurnRate = SEGMENTS.reduce((s, seg) => s + seg.clients * seg.churn, 0) / totalClients * mult / 12;
  const periodLostClients = Math.round(totalClients * periodChurnRate);
  const periodLostRevenue = Math.round(SEGMENTS.reduce((s, seg) => s + seg.clients * seg.churn * seg.arpu, 0) / 12 * mult);

  return {
    totalClients,
    annualRevenue,
    periodRevenue,
    periodChurnRate,
    periodLostClients,
    periodLostRevenue,
    nps: Math.round((68 + Math.random() * 6) * 10) / 10,
    csat: Math.round((3.7 + Math.random() * 0.4) * 10) / 10,
    ces: Math.round((4.1 + Math.random() * 0.3) * 10) / 10,
    segments: SEGMENTS,
    channels: CHANNELS,
  };
}

// ====== Alerts ======
export const ALERTS = [
  {
    id: 1,
    severity: 'high',
    title: 'Рост оттока в Premium',
    segment: 'Premium',
    clients: 342,
    impact: 2847000,
    rootCause: 'Время одобрения ипотеки выросло на 40%',
    recommendation: 'Запустить сценарий приоритетной поддержки',
    time: '2 часа назад',
  },
  {
    id: 2,
    severity: 'medium',
    title: 'CSAT контакт-центра снизился',
    segment: 'Middle',
    clients: 1250,
    impact: 680000,
    rootCause: 'Среднее время ожидания 8.2 мин (норма 4 мин)',
    recommendation: 'Оптимизировать IVR-маршрутизацию',
    time: '5 часов назад',
  },
  {
    id: 3,
    severity: 'low',
    title: 'Аномалия в мобильном приложении',
    segment: 'Mass Market',
    clients: 890,
    impact: 210000,
    rootCause: 'Ошибка авторизации после обновления',
    recommendation: 'Откатить последний релиз',
    time: '1 день назад',
  },
];

// ====== Voice of Customer mock results ======
export const VOC_RESULTS = {
  'почему люди уходят после оформления кредитной карты': {
    reasons: [
      { cause: 'Неочевидные условия по годовому обслуживанию', weight: 34, sentiment: 'negative', quote: 'Никто не сказал, что обслуживание 2990 в год, если тратишь меньше 300к' },
      { cause: 'Долгий выпуск карты (7-14 дней вместо обещанных 3)', weight: 28, sentiment: 'negative', quote: 'Обещали за 3 дня, пришла через полторы недели. Уже не нужно было.' },
      { cause: 'Лимит ниже одобренного при оформлении', weight: 18, sentiment: 'negative', quote: 'В заявке был лимит 500к, пришла на 200к. Странно.' },
      { cause: 'Сложности с активацией в приложении', weight: 12, sentiment: 'negative', quote: 'Третий раз ввожу код, пишет ошибка. Удалил приложение.' },
      { cause: 'Лучшие условия у конкурента (Tinkoff/Альфа)', weight: 8, sentiment: 'neutral', quote: 'В Тинькофф ту же карту сделал за 10 минут онлайн.' },
    ],
  },
  'что говорят про ипотеку': {
    reasons: [
      { cause: 'Срок рассмотрения заявки > 2 недель', weight: 45, sentiment: 'negative', quote: 'Третья неделя пошла, а ответа нет. Страшно, что одобрят, а квартира уйдёт.' },
      { cause: 'Требуют лишние документы', weight: 25, sentiment: 'negative', quote: 'Принесли 12 справок, просят ещё 3. Чувствую себя отчётностью.' },
      { cause: 'Одобренная сумма ниже ожидаемой', weight: 18, sentiment: 'negative', quote: 'Одобрили на 40% меньше, чем рассчитывал. Весь смысл пропал.' },
    ],
  },
};

// ====== Alert data for dashboard ======
export const CHURN_TREND_DAYS = 30;
export function getChurnTrend() {
  return {
    labels: Array.from({ length: CHURN_TREND_DAYS }, (_, i) => `День ${i + 1}`),
    actual: generateTrend(CHURN_TREND_DAYS, 8.2, 0.08, 0.8),
    predicted: generateTrend(CHURN_TREND_DAYS, 7.5, 0.05, 0.5),
  };
}

export function getNpsTrend() {
  return {
    labels: Array.from({ length: 12 }, (_, i) => `${i + 1}.${2025}`),
    values: [42, 44, 43, 45, 46, 44, 47, 49, 48, 50, 51, 53],
  };
}

export function getChannelSatisfaction() {
  return CHANNELS.map(c => ({ label: c.name, value: c.satisfaction, clients: c.clients }));
}
