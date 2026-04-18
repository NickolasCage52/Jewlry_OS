function ensureHost() {
  let host = document.querySelector("[data-toast-host]");
  if (!host) {
    host = document.createElement("div");
    host.className = "toast-host";
    host.setAttribute("data-toast-host", "");
    document.body.appendChild(host);
  }
  return host;
}

export function showToast(message, type = "info") {
  const host = ensureHost();
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.setAttribute("role", "status");
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("toast--in"));
  const remove = () => {
    el.classList.remove("toast--in");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  };
  setTimeout(remove, 3200);
}
