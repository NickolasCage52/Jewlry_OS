export function openModal(innerHtml, { large = false, onClose } = {}) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.innerHTML = `
    <div class="modal ${large ? "modal--lg" : ""}">
      <div class="modal__head">
        <span></span>
        <button type="button" class="modal__close" aria-label="Закрыть">×</button>
      </div>
      <div class="modal__body">${innerHtml}</div>
    </div>
  `;

  const close = () => {
    backdrop.remove();
    onClose?.();
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector(".modal__close").addEventListener("click", close);

  document.body.appendChild(backdrop);
  return { close, backdrop };
}
