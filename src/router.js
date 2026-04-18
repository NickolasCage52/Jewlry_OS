const ROUTES = {
  sales: { id: "sales", title: "Рабочее место менеджера", crumb: "Рабочее место менеджера" },
  content: { id: "content", title: "Контент-центр", crumb: "Контент-центр" },
  dashboard: { id: "dashboard", title: "Кабинет собственника", crumb: "Кабинет собственника" },
};

let current = "sales";
const listeners = new Set();

export function getRoutes() {
  return ROUTES;
}

export function getRoute() {
  return current;
}

export function getRouteMeta() {
  return ROUTES[current];
}

export function navigate(routeId, { force = false } = {}) {
  if (!ROUTES[routeId]) return;
  if (!force && current === routeId) return;
  current = routeId;
  listeners.forEach((fn) => fn(current));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
