import { getCssVar } from "../../util.js";

export function mountRevenueChart(canvas, { labels, current, previous }) {
  const gold = getCssVar("--gold");
  const gray = getCssVar("--chart-gray");
  const border = getCssVar("--border");

  return new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Текущий год",
          data: current,
          borderColor: gold,
          backgroundColor: "rgba(184, 146, 42, 0.09)",
          tension: 0.38,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: gold,
          fill: true,
        },
        {
          label: "Прошлый год",
          data: previous,
          borderColor: gray,
          borderDash: [6, 4],
          backgroundColor: "transparent",
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 16, color: getCssVar("--ink3") },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const i = ctx.dataIndex;
              const cur = current[i];
              const prev = previous[i];
              const diff = prev ? Math.round(((cur - prev) / prev) * 100) : 0;
              const sign = diff >= 0 ? "+" : "";
              return `${ctx.dataset.label}: ${new Intl.NumberFormat("ru-RU").format(ctx.parsed.y)} \u20BD (${sign}${diff}% vs прошлый год)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: border },
          ticks: { color: getCssVar("--muted") },
        },
        y: {
          grid: { color: border },
          ticks: {
            color: getCssVar("--muted"),
            callback(v) {
              return (v / 1_000_000).toFixed(1) + "M";
            },
          },
        },
      },
    },
  });
}

export function mountSourcesChart(canvas, sources, totalLeads) {
  const colors = [
    getCssVar("--gold"),
    getCssVar("--gold2"),
    getCssVar("--gold-border"),
    getCssVar("--ink3"),
    getCssVar("--muted"),
  ];

  return new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: sources.map((s) => s.label),
      datasets: [
        {
          data: sources.map((s) => s.value),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: getCssVar("--white"),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 12, color: getCssVar("--ink3") },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              return `${ctx.label}: ${ctx.parsed}%`;
            },
          },
        },
      },
    },
    plugins: [
      {
        id: "centerText",
        afterDatasetsDraw(chart) {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          const cx = (chartArea.left + chartArea.right) / 2;
          const cy = (chartArea.top + chartArea.bottom) / 2;
          const body = getCssVar("--font-body");
          ctx.save();
          ctx.font = `600 14px ${body}`;
          ctx.fillStyle = getCssVar("--muted");
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${totalLeads} лидов`, cx, cy - 6);
          ctx.restore();
        },
      },
    ],
  });
}
