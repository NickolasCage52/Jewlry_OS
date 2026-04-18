export function openSlideOver({ title, bodyHtml = "", wide = false, onClose } = {}) {
  const backdrop = document.createElement("div");
  backdrop.className = "slide-over-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.innerHTML = `
    <div class="slide-over ${wide ? "slide-over--wide" : ""}">
      <div class="slide-over__head">
        <h2 class="slide-over__title"></h2>
        <button type="button" class="slide-over__close" aria-label="Закрыть">\u00D7</button>
      </div>
      <div class="slide-over__body"></div>
    </div>
  `;

  const panel = backdrop.querySelector(".slide-over");
  const titleEl = backdrop.querySelector(".slide-over__title");
  titleEl.textContent = title || "";
  const bodyEl = backdrop.querySelector(".slide-over__body");
  bodyEl.innerHTML = bodyHtml;

  const close = () => {
    backdrop.classList.remove("slide-over-backdrop--open");
    panel.classList.remove("slide-over--open");
    const done = () => {
      backdrop.remove();
      onClose?.();
    };
    backdrop.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 320);
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector(".slide-over__close").addEventListener("click", close);

  const onKey = (e) => {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", onKey);
    }
  };
  document.addEventListener("keydown", onKey);

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => {
    backdrop.classList.add("slide-over-backdrop--open");
    panel.classList.add("slide-over--open");
  });

  return { close, backdrop, bodyEl };
}
