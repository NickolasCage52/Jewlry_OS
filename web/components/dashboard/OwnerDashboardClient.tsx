"use client";

import { useMemo, useState } from "react";
import {
  aiSummaryText,
  criticalAlerts,
  feedEvents,
  formatDashboardDate,
  funnelData,
  kpi,
  managers,
  revenueChart,
  sources,
  todayFocus,
} from "@/lib/mock/dashboard";
import { formatRub } from "@/lib/format/money";

function formatKpiValue(key: string, v: number) {
  if (key === "revenue" || key === "avgCheck")
    return formatRub(Math.round(v));
  if (key === "conversion") return `${Math.round(v)}%`;
  return String(Math.round(v));
}

export function OwnerDashboardClient() {
  const [funnelHint, setFunnelHint] = useState(
    "Нажмите на этап для деталей",
  );
  const [aiOpen, setAiOpen] = useState(false);

  const dateStr = useMemo(
    () => formatDashboardDate(new Date(2026, 3, 17)),
    [],
  );

  const kpiItems = useMemo(
    () => [
      { key: "revenue", label: "Выручка", data: kpi.revenue },
      { key: "leads", label: "Новых лидов", data: kpi.leads },
      { key: "conversion", label: "Конверсия", data: kpi.conversion },
      { key: "avgCheck", label: "Средний чек", data: kpi.avgCheck },
    ],
    [],
  );

  const maxFunnel = funnelData[0]?.count ?? 1;
  const maxRev = Math.max(...revenueChart.current, 1);
  const chartMaxPx = 220;

  return (
    <div className="dashboard-grid">
      <div className="dashboard-head">
        <h1>Кабинет собственника</h1>
        <button
          type="button"
          className="btn btn--gold"
          onClick={() => setAiOpen(true)}
        >
          AI-сводка за день
        </button>
      </div>

      <div className="exec-strip">
        <div className="alert-panel">
          <h3 className="alert-panel__title">
            <span aria-hidden>{"\u26A0 "}</span>
            Критические сигналы
          </h3>
          <ul className="alert-list">
            {criticalAlerts.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="focus-panel">
          <h3 className="focus-panel__title">Фокус дня</h3>
          <ul className="focus-panel__list">
            {todayFocus.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn--primary"
            style={{ marginTop: 12 }}
          >
            Сформировать бриф для совещания
          </button>
        </div>
      </div>

      {aiOpen ? (
        <div className="ai-insight module-view">
          <div className="ai-insight__bar">
            <strong>AI · операционная сводка</strong>
            <span style={{ opacity: 0.9, fontSize: "0.82rem", fontWeight: 500 }}>
              {dateStr}
            </span>
          </div>
          <div className="ai-insight__body">
            <p style={{ margin: 0, whiteSpace: "pre-line" }}>{aiSummaryText}</p>
            <div className="ai-insight__cta">
              <button type="button" className="btn btn--primary">
                Углубить анализ
              </button>
              <button type="button" className="btn">
                Отправить руководителю
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="kpi-row">
        {kpiItems.map((it) => (
          <div key={it.key} className="kpi-card">
            <div className="kpi-card__label">{it.label}</div>
            <div className="kpi-card__value">
              {formatKpiValue(it.key, it.data.value)}
            </div>
            <div
              className={`kpi-card__trend ${it.data.trend === "up" ? "kpi-card__trend--up" : "kpi-card__trend--down"}`}
            >
              {it.data.trend === "up" ? "↑" : "↓"}{" "}
              {it.data.change > 0 ? "+" : ""}
              {it.data.change}% vs пр. мес.
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="panel">
          <h2 className="panel__title">Выручка по месяцам</h2>
          <div className="chart-wrap">
            <div className="flex h-full items-end justify-between gap-2 px-1">
              {revenueChart.labels.map((label, i) => {
                const val = revenueChart.current[i] ?? 0;
                const barH = Math.max(8, Math.round((val / maxRev) * chartMaxPx));
                return (
                  <div
                    key={label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full max-w-[40px] rounded-t"
                      style={{
                        height: barH,
                        background: `linear-gradient(180deg, var(--gold2), var(--gold))`,
                      }}
                      title={formatRub(val)}
                    />
                    <span className="text-center text-[0.68rem] text-[var(--muted)]">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="panel">
          <h2 className="panel__title">Воронка продаж</h2>
          <div>
            {funnelData.map((row, i) => {
              const pct = Math.round((row.count / maxFunnel) * 100);
              return (
                <div
                  key={row.stage}
                  className="funnel-bar-wrap cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const next = funnelData[i + 1];
                    if (next) {
                      const conv = Math.round((next.count / row.count) * 100);
                      setFunnelHint(
                        `${row.stage}: ${row.count}. Конверсия в «${next.stage}»: ${conv}%.`,
                      );
                    } else {
                      setFunnelHint(
                        `${row.stage}: ${row.count} сделок на финальном этапе.`,
                      );
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      (e.target as HTMLElement).click();
                    }
                  }}
                >
                  <div className="funnel-bar-label">
                    <span>{row.stage}</span>
                    <span>{row.count}</span>
                  </div>
                  <div className="funnel-bar-track">
                    <div
                      className="funnel-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="funnel-hint">{funnelHint}</p>
        </div>
      </div>

      <div className="bottom-row">
        <div className="panel">
          <h2 className="panel__title">Топ-5 менеджеров</h2>
          <table className="managers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Имя</th>
                <th>Сделок</th>
                <th>Выручка</th>
                <th>Конверсия</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m, i) => (
                <tr key={m.name}>
                  <td>{i + 1}</td>
                  <td>{m.name}</td>
                  <td>{m.deals}</td>
                  <td>{formatRub(m.revenue)}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>{m.conversion}%</span>
                      <div className="conv-bar">
                        <div
                          className="conv-bar__fill"
                          style={{ width: `${m.conversion}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2 className="panel__title">Источники лидов</h2>
          <div className="flex flex-col gap-3 py-2">
            {sources.map((s) => (
              <div key={s.label}>
                <div className="funnel-bar-label">
                  <span>{s.label}</span>
                  <span>{s.value}%</span>
                </div>
                <div className="funnel-bar-track">
                  <div
                    className="funnel-bar-fill"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel__title">Лента событий</h2>
        <div className="feed-list">
          {feedEvents.map((e, idx) => (
            <div key={`${e.time}-${idx}`} className="feed-item">
              <span className="feed-item__dot" />
              <span>{e.text}</span>
              <span className="feed-item__time">{e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
