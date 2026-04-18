import {
  kpi,
  revenueChart,
  funnelData,
  managers,
  sources,
  feedEvents,
  aiSummaryText,
  criticalAlerts,
  todayFocus,
} from "../../data/metrics.js";
import { mountKPICards } from "./KPICards.js";
import { mountRevenueChart, mountSourcesChart } from "./Charts.js";
import { formatRub, escapeHtml } from "../../util.js";
import { showToast } from "../../components/toast.js";

const EXTRA_FEED = [
  "Ольга С. запросила повторную консультацию по колье",
  "Резерв снят: Браслет Золото 750 (арт. BRC-4401)",
  "А. Смирнова добавила задачу «Перезвонить Марии С.»",
  "Обновлены фото для RNG-2847 в контент-центре",
  "Новый лид: Сергей М. через Instagram",
  "М. Петрова перевела сделку в «Ждёт решения»",
];

function formatDashboardDate(d) {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function mountDashboard(root) {
  const today = new Date(2026, 3, 17);
  const dateStr = formatDashboardDate(today);

  const wrap = document.createElement("div");
  wrap.className = "dashboard-grid";
  wrap.innerHTML = `
    <div class="dashboard-head">
      <h1>Кабинет собственника</h1>
      <button type="button" class="btn btn--gold" data-ai-summary>AI-сводка за день</button>
    </div>
    <div class="exec-strip">
      <div class="alert-panel">
        <h3 class="alert-panel__title">\u26A0 Критические сигналы</h3>
        <ul class="alert-list">
          ${criticalAlerts.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
      </div>
      <div class="focus-panel">
        <h3 class="focus-panel__title">Фокус дня</h3>
        <ul class="focus-panel__list">
          ${todayFocus.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
        <button type="button" class="btn btn--primary" style="margin-top:12px" data-insight-cta>Сформировать бриф для совещания</button>
      </div>
    </div>
    <div data-ai-banner style="display:none"></div>
    <div class="kpi-row" data-kpi-row></div>
    <div class="charts-row">
      <div class="panel">
        <h2 class="panel__title">Выручка по месяцам</h2>
        <div class="chart-wrap"><canvas data-chart-rev></canvas></div>
      </div>
      <div class="panel">
        <h2 class="panel__title">Воронка продаж</h2>
        <div data-funnel></div>
        <p class="funnel-hint" data-funnel-hint>Нажмите на этап для деталей</p>
      </div>
    </div>
    <div class="bottom-row">
      <div class="panel">
        <h2 class="panel__title">Топ-5 менеджеров</h2>
        <div data-managers></div>
      </div>
      <div class="panel">
        <h2 class="panel__title">Источники лидов</h2>
        <div class="doughnut-wrap"><canvas data-chart-src></canvas></div>
      </div>
    </div>
    <div class="panel">
      <h2 class="panel__title">Лента событий</h2>
      <div class="feed-list" data-feed></div>
    </div>
  `;
  root.appendChild(wrap);

  mountKPICards(wrap.querySelector("[data-kpi-row]"), kpi);

  const revCanvas = wrap.querySelector("[data-chart-rev]");
  mountRevenueChart(revCanvas, revenueChart);

  const srcCanvas = wrap.querySelector("[data-chart-src]");
  mountSourcesChart(srcCanvas, sources, kpi.leads.value);

  const funnelEl = wrap.querySelector("[data-funnel]");
  const funnelHint = wrap.querySelector("[data-funnel-hint]");
  const max = funnelData[0].count;

  function renderFunnel(highlightIdx) {
    funnelEl.innerHTML = funnelData
      .map((row, i) => {
        const pct = Math.round((row.count / max) * 100);
        return `
        <div class="funnel-bar-wrap" data-fi="${i}">
          <div class="funnel-bar-label"><span>${escapeHtml(row.stage)}</span><span>${row.count}</span></div>
          <div class="funnel-bar-track"><div class="funnel-bar-fill" style="width:${pct}%"></div></div>
        </div>`;
      })
      .join("");

    funnelEl.querySelectorAll("[data-fi]").forEach((el) => {
      el.addEventListener("click", () => {
        const i = Number(el.dataset.fi);
        const cur = funnelData[i];
        const next = funnelData[i + 1];
        if (next) {
          const conv = Math.round((next.count / cur.count) * 100);
          funnelHint.textContent = `${cur.stage}: ${cur.count}. Конверсия в «${next.stage}»: ${conv}%.`;
        } else {
          funnelHint.textContent = `${cur.stage}: ${cur.count} сделок на финальном этапе.`;
        }
      });
    });
  }

  renderFunnel();

  const mgrEl = wrap.querySelector("[data-managers]");
  mgrEl.innerHTML = `
    <table class="managers-table">
      <thead><tr><th>#</th><th>Имя</th><th>Сделок</th><th>Выручка</th><th>Конверсия</th></tr></thead>
      <tbody>
        ${managers
          .map(
            (m, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(m.name)}</td>
            <td>${m.deals}</td>
            <td>${escapeHtml(formatRub(m.revenue))}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <span>${m.conversion}%</span>
                <div class="conv-bar"><div class="conv-bar__fill" style="width:${m.conversion}%"></div></div>
              </div>
            </td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;

  const feedEl = wrap.querySelector("[data-feed]");
  let feed = feedEvents.map((e) => ({ ...e }));

  function renderFeed() {
    feedEl.innerHTML = feed
      .slice(0, 10)
      .map(
        (e) => `
      <div class="feed-item">
        <span class="feed-item__dot"></span>
        <span>${escapeHtml(e.text)}</span>
        <span class="feed-item__time">${escapeHtml(e.time)}</span>
      </div>`,
      )
      .join("");
  }

  renderFeed();

  let feedIdx = 0;
  const feedTimer = setInterval(() => {
    const text = EXTRA_FEED[feedIdx % EXTRA_FEED.length];
    feedIdx += 1;
    feed.unshift({ text, time: "только что", type: "info" });
    feed = feed.slice(0, 14);
    renderFeed();
  }, 8000);

  const aiBanner = wrap.querySelector("[data-ai-banner]");
  wrap.querySelector("[data-insight-cta]")?.addEventListener("click", () => {
    showToast("Бриф сформирован и отправлен на почту (демо)", "success");
  });
  wrap.querySelector("[data-ai-summary]").addEventListener("click", () => {
    aiBanner.style.display = "block";
    aiBanner.textContent = "";
    const box = document.createElement("div");
    box.className = "ai-insight";
    const bar = document.createElement("div");
    bar.className = "ai-insight__bar";
    bar.innerHTML = `<strong>AI · операционная сводка</strong><span style="opacity:0.9;font-size:0.82rem;font-weight:500">${escapeHtml(dateStr)}</span>`;
    const body = document.createElement("div");
    body.className = "ai-insight__body";
    const p = document.createElement("p");
    p.style.margin = "0";
    p.style.whiteSpace = "pre-line";
    p.textContent = aiSummaryText;
    body.appendChild(p);
    const cta = document.createElement("div");
    cta.className = "ai-insight__cta";
    cta.innerHTML = `<button type="button" class="btn btn--primary" data-ai-deeper>Углубить анализ</button><button type="button" class="btn" data-ai-share>Отправить руководителю</button>`;
    body.appendChild(cta);
    box.append(bar, body);
    aiBanner.append(box);
    cta.querySelector("[data-ai-deeper]")?.addEventListener("click", () => showToast("Запрошено углубление (демо)", "info"));
    cta.querySelector("[data-ai-share]")?.addEventListener("click", () => showToast("Сводка отправлена (демо)", "success"));
    aiBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  return {
    el: wrap,
    triggerAISummary() {
      wrap.querySelector("[data-ai-summary]").click();
    },
    getAISummaryButton: () => wrap.querySelector("[data-ai-summary]"),
    destroy() {
      clearInterval(feedTimer);
    },
  };
}
