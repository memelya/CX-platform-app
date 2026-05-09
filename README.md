# ◆ CX Profit Platform

**Аналитическая платформа клиентского опыта для крупного банка.**

Не очередной дашборд NPS. Единственная CX-платформа, которая переводит клиентский опыт в деньги — и показывает, что делать, чтобы заработать больше.

## Философия

> Большинство CX-решений (Qualtrics, Medallia, NICE) измеряют «погоду» — NPS, CSAT, CES.
> CEO видит цифры, но не знает: это хорошо? Плохо? Сколько мы теряем? Что делать?
>
> **CX Profit Platform** решает это:
> - Каждый пункт CX-метрики → конкретная сумма в P&L
> - Не alert «NPS упал», а «587 Premium-клиентов на грани ухода = $2.7M потери. Запустить удержание?»
> - Simulation Sandbox: «Что если сократить время ответа на 30 сек?» → ответ в деньгах

## Структура проекта

```
cx-platform/
├── index.html              # Главный лендинг
├── vite.config.js          # Vite конфиг
├── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js             # JavaScript (ROI калькулятор, навигация)
│   └── style.css           # Стили (dark theme, адаптив)
└── docs/
    ├── user-stories.md     # User Stories для разработки
    └── architecture.md     # Техническая архитектура
```

## Быстрый старт

```bash
npm install
npm run dev
```

Открой `http://localhost:5173` в браузере.

## Сборка для production

```bash
npm run build
npm run preview   # локальный просмотр собранного
```

Результат — в папке `dist/`.

## Разделы лендинга

1. **Hero** — «Клиентский опыт — это деньги»
2. **Проблема** — почему текущие CX-решения не работают
3. **Платформа** — 4 модуля: Command Center, Profit Cockpit, Simulation Sandbox, Voice AI
4. **Как работает** — 4 шага от данных до денег
5. **ROI Калькулятор** — интерактивный: введи параметры → получи потенциальный эффект
6. **Кому нужно** — CEO, Head of Retail, CTO, Head of CX
7. **Кейсы** — реальные (анонимизированные) результаты
8. **Сравнение** — MetaGPT vs Qualtrics vs Medallia
9. **Контакты** — запрос Profit Simulation

## Технологии

- Vite 6 + Vanilla JS
- CSS Custom Properties (dark theme)
- Fully responsive
- No framework lock-in

## Related docs

- [User Stories](docs/user-stories.md) — Product Backlog
- [Architecture](docs/architecture.md) — System Design

---

**🧿 Фидель:** *«Платформа должна продавать спасённые и заработанные деньги, а не NPS и CSAT.»*
