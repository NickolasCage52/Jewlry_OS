function easeOutCubicBezier(t) {
  const c = 0.36;
  return 1 - Math.pow(1 - t, 3) * (1 - c) - Math.pow(1 - t, 2) * c;
}

function formatKpiValue(key, v) {
  if (key === "revenue") return new Intl.NumberFormat("ru-RU").format(Math.round(v)) + " \u20BD";
  if (key === "avgCheck") return new Intl.NumberFormat("ru-RU").format(Math.round(v)) + " \u20BD";
  if (key === "conversion") return Math.round(v) + "%";
  return String(Math.round(v));
}

export function mountKPICards(container, kpi) {
  const items = [
    { key: "revenue", label: "Выручка", data: kpi.revenue },
    { key: "leads", label: "Новых лидов", data: kpi.leads },
    { key: "conversion", label: "Конверсия", data: kpi.conversion },
    { key: "avgCheck", label: "Средний чек", data: kpi.avgCheck },
  ];

  container.innerHTML = items
    .map(
      (it) => `
    <div class="kpi-card" data-kpi="${it.key}">
      <div class="kpi-card__label">${it.label}</div>
      <div class="kpi-card__value" data-val>0</div>
      <div class="kpi-card__trend ${it.data.trend === "up" ? "kpi-card__trend--up" : "kpi-card__trend--down"}" data-trend>
        ${it.data.trend === "up" ? "\u2191" : "\u2193"} ${it.data.change > 0 ? "+" : ""}${it.data.change}% vs пр. мес.
      </div>
    </div>`,
    )
    .join("");

  const duration = 1200;
  const t0 = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - t0) / duration);
    const e = easeOutCubicBezier(t);
    items.forEach((it) => {
      const el = container.querySelector(`[data-kpi="${it.key}"] [data-val]`);
      const v = it.data.value * e;
      el.textContent = formatKpiValue(it.key, v);
    });
    if (t < 1) requestAnimationFrame(tick);
    else {
      items.forEach((it) => {
        const el = container.querySelector(`[data-kpi="${it.key}"] [data-val]`);
        el.textContent = formatKpiValue(it.key, it.data.value);
      });
    }
  }

  requestAnimationFrame(tick);
}
