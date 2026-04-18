import { mountSidebar } from "./components/Sidebar.js";
import { mountTopBar } from "./components/TopBar.js";
import { mountSales } from "./modules/sales/Sales.js";
import { mountContentCenter } from "./modules/content/ContentCenter.js";
import { mountDashboard } from "./modules/dashboard/Dashboard.js";
import { navigate, subscribe, getRoute } from "./router.js";
import { escapeHtml } from "./util.js";

const app = document.getElementById("app");

app.innerHTML = `
  <div data-sidebar></div>
  <div class="main-wrap">
    <div data-topbar></div>
    <main class="main-content" data-outlet></main>
  </div>
`;

mountSidebar(app.querySelector("[data-sidebar]"));
mountTopBar(app.querySelector("[data-topbar]"));

const outlet = app.querySelector("[data-outlet]");
const salesRoot = document.createElement("div");
const contentRoot = document.createElement("div");
const dashRoot = document.createElement("div");
outlet.append(salesRoot, contentRoot, dashRoot);

const salesApi = mountSales(salesRoot);
const contentApi = mountContentCenter(contentRoot);
const dashApi = mountDashboard(dashRoot);

function syncView() {
  const r = getRoute();
  const panels = [
    [salesRoot, "sales"],
    [contentRoot, "content"],
    [dashRoot, "dashboard"],
  ];
  panels.forEach(([el, id]) => {
    const show = r === id;
    el.hidden = !show;
    if (show) {
      el.classList.remove("module-view");
      void el.offsetWidth;
      el.classList.add("module-view");
    }
  });
}

subscribe(syncView);
syncView();

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mountDemoPanel(apis) {
  let holeEl = null;
  let labelEl = null;
  let resizeHandler = null;

  function clearSpot() {
    holeEl?.remove();
    labelEl?.remove();
    holeEl = null;
    labelEl = null;
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
  }

  function positionSpotlight(target, title, body) {
    if (!target) return;
    const r = target.getBoundingClientRect();
    const pad = 10;
    const hole = holeEl || document.createElement("div");
    hole.className = "demo-spotlight-hole";
    hole.style.left = `${r.left - pad}px`;
    hole.style.top = `${r.top - pad}px`;
    hole.style.width = `${r.width + pad * 2}px`;
    hole.style.height = `${r.height + pad * 2}px`;
    if (!holeEl) {
      holeEl = hole;
      document.body.appendChild(hole);
    }

    const cap = labelEl || document.createElement("div");
    cap.className = "demo-spotlight-label";
    cap.innerHTML = `<div class="demo-spotlight-label__title">${escapeHtml(title)}</div><div class="demo-spotlight-label__body">${escapeHtml(body)}</div>`;
    const below = r.bottom + pad + 14;
    const top = below + 160 > window.innerHeight ? Math.max(16, r.top - 120) : below;
    cap.style.left = `${Math.max(14, Math.min(r.left, window.innerWidth - 380))}px`;
    cap.style.top = `${top}px`;
    if (!labelEl) {
      labelEl = cap;
      document.body.appendChild(cap);
    }
    requestAnimationFrame(() => cap.classList.add("is-visible"));

    resizeHandler = () => positionSpotlight(target, title, body);
    window.addEventListener("resize", resizeHandler);
  }

  function spotlight(target, step) {
    clearSpot();
    if (!target || !step) return;
    requestAnimationFrame(() => positionSpotlight(target, step.title, step.detail));
  }

  const { salesApi: s, contentApi: c, dashApi: d } = apis;

  const DEMO_STEPS = [
    {
      id: "find-client",
      title: "Находим клиента",
      detail:
        "Боль: контекст размазан по чатам и таблицам.\nДействие: один поиск по имени.\nРезультат: карточка с историей и статусом за секунды.",
      run: async () => {
        navigate("sales", { force: true });
        await wait(220);
        s.setSearch("");
        s.setSearch("Мария");
        s.focusSearch();
        return s.getSearchEl();
      },
    },
    {
      id: "sku-stock",
      title: "Видим товар и наличие",
      detail:
        "Боль: «уточню на складе» и пауза в разговоре.\nДействие: сделка и остаток в одной карточке.\nРезультат: менеджер говорит уверенно, без «перезвоню».",
      run: async () => {
        navigate("sales", { force: true });
        await wait(200);
        s.selectClient(1);
        s.openDealTab();
        await wait(380);
        return s.getDetailEl().querySelector("[data-deal-stock]");
      },
    },
    {
      id: "find-photo",
      title: "Находим фото и материалы",
      detail:
        "Боль: 15 минут в папках и пересылках «а это точно тот ракурс?».\nДействие: контент-центр с привязкой к SKU.\nРезультат: нужный файл за секунды.",
      run: async () => {
        navigate("content", { force: true });
        await wait(220);
        c.setSearch("сапфир");
        c.focusSearch();
        await wait(280);
        return c.el.querySelector(".search-banner") || c.getSearchInput();
      },
    },
    {
      id: "faq-ai",
      title: "FAQ и единый стиль ответов",
      detail:
        "Боль: каждый менеджер формулирует по-своему.\nДействие: база знаний + вставка в ответ.\nРезультат: спокойный, проверенный тон бренда.",
      run: async () => {
        navigate("sales", { force: true });
        await wait(200);
        s.selectClient(1);
        s.openFAQ();
        await wait(450);
        return document.querySelector(".slide-over") || s.el.querySelector("[data-faq-open]");
      },
    },
    {
      id: "owner-dash",
      title: "Дашборд собственника",
      detail:
        "Боль: картина бизнеса в пяти вкладках Excel.\nДействие: выручка, воронка, команда в одном окне.\nРезультат: ощущение контроля без микроменеджмента.",
      run: async () => {
        navigate("dashboard", { force: true });
        await wait(260);
        return d.el.querySelector(".kpi-row");
      },
    },
    {
      id: "ai-summary",
      title: "AI-сводка для руководителя",
      detail:
        "Боль: ручная сводка из семи отчётов по понедельникам.\nДействие: один клик — инсайты и риски.\nРезультат: фокус на решениях, а не на сборе цифр.",
      run: async () => {
        navigate("dashboard", { force: true });
        await wait(260);
        d.triggerAISummary();
        await wait(320);
        return d.el.querySelector(".ai-insight") || d.el.querySelector("[data-ai-summary]");
      },
    },
  ];

  let stepIndex = 0;
  let autoplayOn = false;
  let autoplayTimer = null;

  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "demo-fab";
  fab.textContent = "Demo";
  document.body.appendChild(fab);

  const drawer = document.createElement("div");
  drawer.className = "demo-drawer";
  drawer.innerHTML = `
    <div class="demo-drawer__header">
      <h3 style="margin:0">Demo Pro</h3>
    </div>
    <p class="demo-drawer__hint">Сценарий «боль \u2192 действие \u2192 результат». Подсветка показывает, где система экономит время и снимает хаос.</p>
    <div class="demo-controls">
      <button type="button" class="btn" data-demo-prev>\u2190 Назад</button>
      <button type="button" class="btn btn--primary" data-demo-next>Далее \u2192</button>
    </div>
    <div class="demo-controls">
      <button type="button" class="btn" data-demo-restart>Сначала</button>
      <button type="button" class="btn btn--gold" data-demo-full>\u25B6 Авто-показ</button>
    </div>
    <label class="demo-autoplay"><input type="checkbox" data-demo-autoplay /> Автопереход шагов (4 c)</label>
    <div class="demo-drawer__divider"></div>
    <div data-demo-steps></div>
  `;
  document.body.appendChild(drawer);

  const stepsHost = drawer.querySelector("[data-demo-steps]");

  function renderStepList() {
    stepsHost.innerHTML = DEMO_STEPS.map(
      (st, i) => `
      <button type="button" class="demo-step ${i === stepIndex ? "is-current" : ""}" data-go-step="${i}">
        <div class="demo-step__n">Шаг ${i + 1} / ${DEMO_STEPS.length}</div>
        <div class="demo-step__t">${escapeHtml(st.title)}</div>
        <div class="demo-step__d">${escapeHtml(st.detail.split("\n")[0])}</div>
      </button>`,
    ).join("");
    stepsHost.querySelectorAll("[data-go-step]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        stepIndex = Number(btn.dataset.goStep);
        await runStepAt(stepIndex);
      });
    });
  }

  async function runStepAt(i) {
    const step = DEMO_STEPS[i];
    if (!step) return;
    stepIndex = i;
    renderStepList();
    const target = await step.run();
    spotlight(target, step);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    autoplayOn = false;
    const cb = drawer.querySelector("[data-demo-autoplay]");
    if (cb) cb.checked = false;
  }

  fab.addEventListener("click", () => drawer.classList.toggle("is-open"));

  drawer.querySelector("[data-demo-next]").addEventListener("click", async () => {
    stopAutoplay();
    stepIndex = (stepIndex + 1) % DEMO_STEPS.length;
    await runStepAt(stepIndex);
  });
  drawer.querySelector("[data-demo-prev]").addEventListener("click", async () => {
    stopAutoplay();
    stepIndex = (stepIndex - 1 + DEMO_STEPS.length) % DEMO_STEPS.length;
    await runStepAt(stepIndex);
  });
  drawer.querySelector("[data-demo-restart]").addEventListener("click", async () => {
    stopAutoplay();
    stepIndex = 0;
    await runStepAt(0);
  });

  drawer.querySelector("[data-demo-full]").addEventListener("click", async () => {
    drawer.classList.remove("is-open");
    stopAutoplay();
    for (let i = 0; i < DEMO_STEPS.length; i += 1) {
      stepIndex = i;
      renderStepList();
      const target = await DEMO_STEPS[i].run();
      spotlight(target, DEMO_STEPS[i]);
      await wait(4000);
    }
    clearSpot();
  });

  drawer.querySelector("[data-demo-autoplay]").addEventListener("change", (e) => {
    if (!e.target.checked) {
      stopAutoplay();
      return;
    }
    autoplayOn = true;
    autoplayTimer = setInterval(async () => {
      if (!autoplayOn) return;
      stepIndex = (stepIndex + 1) % DEMO_STEPS.length;
      await runStepAt(stepIndex);
    }, 4000);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      drawer.classList.remove("is-open");
      clearSpot();
      stopAutoplay();
    }
  });

  renderStepList();
}

mountDemoPanel({ salesApi, contentApi, dashApi });
