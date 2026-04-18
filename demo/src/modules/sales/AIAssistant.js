import { escapeHtml } from "../../util.js";
import { showToast } from "../../components/toast.js";

const R = "\u20BD";

const CHIPS = [
  { id: "job", label: "Чем занимается клиент?" },
  { id: "viewed", label: "Какие товары смотрел?" },
  { id: "similar", label: "Предложить похожее" },
  { id: "followup", label: "Написать follow-up" },
  { id: "care", label: "Уход за изделием" },
  { id: "certificate", label: "Сертификат на камень" },
  { id: "delivery", label: "Доставка и сроки" },
];

function buildResponses(client, variant = 0) {
  const first = client.name.split(/\s+/)[0] || "Клиент";
  const v = (a, b) => (variant % 2 === 0 ? a : b);
  return {
    job: v(
      `${client.name} — постоянный клиент, 3 покупки за год. Средний чек 45 000 ${R}. Предпочитает золото 585 с натуральными камнями. День рождения — 15 марта. Последний контакт 12 дней назад, не закрыли сделку по кольцу с сапфиром. Рекомендую возобновить диалог.`,
      `${client.name}: профиль «практичный люкс», откликается на факты (вес, проба, сроки). Короткие сообщения + визуалы из контент-центра работают лучше длинных описаний.`,
    ),
    viewed: `По карточке: в фокусе «${client.deal.product}» (${client.deal.sku}). В зоне интереса также ${client.products.map((p) => `«${p.name}»`).join(", ")}.`,
    similar: v(
      `На основе истории покупок ${first} предлагаю:
• Кольцо «Аквамарин Люкс» — схожий стиль, есть в наличии, 52 000 ${R}
• Серьги «Сапфир Классик» — дополнение к прошлой покупке, 38 000 ${R}
• Кулон «Морская звезда» — новинка, подходит под её стиль, 29 000 ${R}`,
      `Альтернативный подбор для ${first}:
• Кольцо «Ночной сапфир» — глубже цвет, 54 500 ${R}
• Серьги «Мини-сапфир» — лёгкий ежедневный формат, 31 000 ${R}
• Тонкая цепь 45 см — апсейл к кольцу, 12 000 ${R}`,
    ),
    followup: `Готовый текст для WhatsApp:

«${first}, добрый день! Хотела уточнить — вы ещё рассматриваете кольцо с сапфиром? У нас осталось всего 2 экземпляра в вашем размере. Также поступила новинка, которая, думаю, вам понравится — могу показать фото?»`,
    care: `Коротко для клиента: хранить отдельно от других украшений, избегать домашней химии и спорта с кольцами. Чистка — тёплая вода + мягкая щётка; раз в год профилактика в сервисе бренда.`,
    certificate: v(
      `По запросу отправляем PDF сертификата геммолога (если в карточке товара отмечено). В письме указываем номер партии и ссылку на оригинал в контент-центре — так менеджеры не дублируют разные версии.`,
      `Если клиент просит «официально»: сертификат лаборатории + паспорт изделия. В демо-процессе файлы уже привязаны к SKU — менеджеру не нужно искать в папках.`,
    ),
    delivery: `Доставка по РФ курьером со страховкой. Сроки 1–3 дня в зависимости от города. Трекинг дублируем в карточке сделки; упаковка — фирменная коробка + сертификат при наличии.`,
    default: `Учитывая этап «${client.status}» и товар «${client.deal.product}», рекомендую зафиксировать следующий контакт и отправить визуалы из контент-центра по артикулу ${client.deal.sku}.`,
  };
}

function typewriterHtml(text) {
  const words = text.split(/(\s+)/);
  return words
    .map((w, i) => {
      if (!w.trim()) return escapeHtml(w);
      return `<span class="typewriter" style="animation-delay:${i * 0.035}s">${escapeHtml(w)}</span>`;
    })
    .join("");
}

export function mountAIAssistant(container, client, opts = {}) {
  const insertDraft = typeof opts.insertDraft === "function" ? opts.insertDraft : null;
  let variantRound = 0;

  container.innerHTML = `
    <div class="ai-chat">
      <div class="ai-chat__chips">
        ${CHIPS.map((c) => `<button type="button" class="ai-chip" data-chip="${c.id}">${escapeHtml(c.label)}</button>`).join("")}
      </div>
      <div class="ai-chat__messages" data-messages></div>
      <div class="ai-chat__input-row">
        <input type="text" placeholder="Спросите про клиента или сделку…" data-ai-input />
        <button type="button" class="btn btn--primary" data-ai-send>Отправить</button>
      </div>
    </div>
  `;

  const messagesEl = container.querySelector("[data-messages]");
  const input = container.querySelector("[data-ai-input]");
  let busy = false;

  function appendUser(text) {
    const el = document.createElement("div");
    el.className = "ai-msg ai-msg--user";
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    el.dataset.typing = "1";
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    messagesEl.querySelector("[data-typing]")?.remove();
  }

  function appendBot(html, plain, meta = {}) {
    const wrap = document.createElement("div");
    wrap.className = "ai-msg ai-msg--bot";
    wrap.innerHTML = html;
    const actions = document.createElement("div");
    actions.className = "ai-msg__actions";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "btn ai-msg__copy";
    copyBtn.textContent = "Скопировать";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(plain);
        showToast("Скопировано", "success");
      } catch {
        showToast("Скопируйте вручную (Ctrl+C)", "info");
      }
    });

    const insBtn = document.createElement("button");
    insBtn.type = "button";
    insBtn.className = "btn ai-msg__copy";
    insBtn.textContent = "Вставить в сообщение";
    insBtn.addEventListener("click", () => {
      if (insertDraft) {
        insertDraft(plain);
      } else {
        input.value = (input.value ? `${input.value}\n\n` : "") + plain;
        input.focus();
        showToast("Текст вставлен в поле ввода", "success");
      }
    });

    const regBtn = document.createElement("button");
    regBtn.type = "button";
    regBtn.className = "btn ai-msg__copy";
    regBtn.textContent = "Другой вариант";
    regBtn.addEventListener("click", () => {
      if (!meta.chipId || busy) return;
      variantRound += 1;
      answerWithChip(meta.chipId, true);
    });

    actions.append(copyBtn, insBtn);
    if (meta.chipId) actions.append(regBtn);
    wrap.appendChild(actions);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function answerWithChip(chipId, isRegenerate = false) {
    if (busy) return;
    busy = true;
    const map = buildResponses(client, isRegenerate ? variantRound : 0);
    const text = map[chipId] || map.default;
    if (!isRegenerate) {
      appendUser(CHIPS.find((c) => c.id === chipId)?.label || "Вопрос");
    }
    showTyping();
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    removeTyping();
    appendBot(typewriterHtml(text), text, { chipId });
    busy = false;
  }

  async function answerFree(q) {
    if (busy || !q.trim()) return;
    busy = true;
    appendUser(q.trim());
    showTyping();
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    removeTyping();
    const map = buildResponses(client, 0);
    const text = map.default;
    appendBot(typewriterHtml(text), text, {});
    busy = false;
  }

  container.querySelectorAll("[data-chip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      variantRound = 0;
      answerWithChip(btn.dataset.chip);
    });
  });

  container.querySelector("[data-ai-send]").addEventListener("click", () => {
    answerFree(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      answerFree(input.value);
      input.value = "";
    }
  });
}
