import { faqItems, faqCategories } from "../data/faq.js";
import { openSlideOver } from "./ui/SlideOver.js";
import { escapeHtml } from "../util.js";
import { showToast } from "./toast.js";

export function openFAQPanel({ onInsert } = {}) {
  let cat = "all";
  let q = "";
  let openId = null;

  const so = openSlideOver({
    title: "База знаний · FAQ",
    bodyHtml: "",
    wide: true,
  });
  const { bodyEl } = so;

  function filtered() {
    return faqItems.filter((item) => {
      if (cat !== "all" && item.cat !== cat) return false;
      if (!q.trim()) return true;
      const blob = (item.q + " " + item.a).toLowerCase();
      return blob.includes(q.toLowerCase());
    });
  }

  function render() {
    const items = filtered();
    const cats = faqCategories
      .map(
        (c) =>
          `<button type="button" class="faq-cat ${c.id === cat ? "is-active" : ""}" data-cat="${c.id}">${escapeHtml(c.label)}</button>`,
      )
      .join("");

    const list = items.length
      ? items
          .map((item) => {
            const exp = item.id === openId;
            return `
            <div class="faq-item ${exp ? "is-open" : ""}" data-faq-id="${item.id}">
              <button type="button" class="faq-q" data-toggle="${item.id}">
                <span>${escapeHtml(item.q)}</span>
                <span class="faq-chevron">${exp ? "\u2212" : "+"}</span>
              </button>
              <div class="faq-a" ${exp ? "" : 'hidden'}>
                <p>${escapeHtml(item.a)}</p>
                <div class="faq-a__actions">
                  <button type="button" class="btn btn--primary btn--sm" data-insert="${item.id}">Вставить в ответ клиенту</button>
                  <button type="button" class="btn btn--sm" data-copy="${item.id}">Скопировать</button>
                </div>
              </div>
            </div>`;
          })
          .join("")
      : `<div class="empty-illustration" style="padding:32px 16px">
          <p><strong>Ничего не найдено</strong></p>
          <p>Сбросьте фильтр или измените запрос</p>
        </div>`;

    bodyEl.innerHTML = `
      <div class="faq-panel">
        <p class="faq-lead">Единые формулировки вместо «каждый менеджер отвечает по-своему».</p>
        <div class="faq-search-wrap">
          <input type="search" class="faq-search" placeholder="Быстрый поиск по вопросам и ответам…" data-faq-search value="${escapeHtml(q)}" />
        </div>
        <div class="faq-cats" data-faq-cats>${cats}</div>
        <div class="faq-list" data-faq-list>${list}</div>
      </div>`;

    bodyEl.querySelector("[data-faq-search]").addEventListener("input", (e) => {
      q = e.target.value;
      openId = null;
      render();
    });

    bodyEl.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        cat = btn.dataset.cat;
        openId = null;
        render();
      });
    });

    bodyEl.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggle;
        openId = openId === id ? null : id;
        render();
      });
    });

    bodyEl.querySelectorAll("[data-insert]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = faqItems.find((x) => x.id === btn.dataset.insert);
        if (!item) return;
        const text = `${item.q}\n\n${item.a}`;
        onInsert?.(text);
        showToast("Ответ добавлен в поле сообщения", "success");
      });
    });

    bodyEl.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const item = faqItems.find((x) => x.id === btn.dataset.copy);
        if (!item) return;
        const text = `${item.q}\n\n${item.a}`;
        try {
          await navigator.clipboard.writeText(text);
          showToast("Скопировано в буфер", "success");
        } catch {
          showToast("Скопируйте вручную (Ctrl+C)", "info");
        }
      });
    });
  }

  render();
}
