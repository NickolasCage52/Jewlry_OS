"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ClientRecord } from "@/lib/types/crm";
import { MOCK_CLIENTS } from "@/lib/mock/clients";
import { formatRub } from "@/lib/format/money";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getOpsStore } from "@/lib/ops/store";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { getAvatarColor, initials } from "@/lib/ui/person";
import { DEAL_STATUSES, dealStatusBadgeClass } from "@/lib/crm/deal-status";
import { stockBadgeClass } from "@/lib/crm/stock-badge";

function listIndicators(c: ClientRecord) {
  const inds: { key: string; className: string; label: string }[] = [];
  if (c.notes?.toLowerCase().includes("vip")) {
    inds.push({
      key: "vip",
      className: "sales-ind sales-ind--hot",
      label: "VIP",
    });
  }
  if (c.deal.stock === "Под заказ") {
    inds.push({
      key: "order",
      className: "sales-ind sales-ind--hot",
      label: "Под заказ",
    });
  }
  return inds;
}

export function SalesWorkspace({
  initialClientId,
}: {
  initialClientId?: number | null;
}) {
  const [clients] = useState(() => [...MOCK_CLIENTS]);
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    if (initialClientId != null && clients.some((c) => c.id === initialClientId)) {
      return initialClientId;
    }
    return clients[0]?.id ?? null;
  });
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    let list = clients;
    if (statusFilter) {
      list = list.filter((c) => c.status === statusFilter);
    }
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [clients, filter, statusFilter]);

  const selected = clients.find((c) => c.id === selectedId) ?? null;
  const s = getOpsStore();

  return (
    <div className="sales-layout module-view">
      <aside className="sales-list-panel">
        <div className="sales-list-toolbar">
          <input
            type="search"
            className="w-full border border-[var(--border)] bg-[var(--white)] px-3 py-2.5 text-sm"
            style={{ borderRadius: "var(--radius-sm)" }}
            placeholder="Поиск по имени…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Поиск клиента"
          />
          <select
            className="sales-status-filter"
            aria-label="Фильтр по статусу"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все статусы</option>
            {DEAL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <Link
            href="/app/faq"
            className="btn btn--gold"
            style={{ width: "100%", textAlign: "center" }}
          >
            База знаний · ЧаВо
          </Link>
        </div>
        <div className="sales-list">
          {filtered.length === 0 ? (
            <div className="empty-illustration" data-empty-list>
              <svg
                className="empty-illustration__art"
                viewBox="0 0 120 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect
                  x="10"
                  y="20"
                  width="100"
                  height="60"
                  rx="8"
                  fill="var(--border)"
                />
                <circle cx="45" cy="48" r="14" fill="var(--muted2)" />
                <rect x="68" y="38" width="36" height="8" rx="2" fill="var(--muted)" />
                <rect x="68" y="52" width="28" height="8" rx="2" fill="var(--muted2)" />
              </svg>
              <p>
                <strong>Клиенты не найдены</strong>
              </p>
              <p>Измените запрос, фильтр или сбросьте поиск</p>
            </div>
          ) : (
            filtered.map((c) => {
              const sel = c.id === selectedId ? "is-selected" : "";
              const bg = getAvatarColor(c.name);
              const ini = initials(c.name);
              const sub = c.lastAction
                ? `${c.lastAction} · ${c.lastContact}`
                : c.lastContact;
              const ind = listIndicators(c);
              return (
                <div
                  key={c.id}
                  className={`sales-list__item ${sel}`.trim()}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(c.id);
                    }
                  }}
                >
                  <div
                    className="sales-list__avatar"
                    style={{ background: bg }}
                  >
                    {ini}
                  </div>
                  <div className="sales-list__meta">
                    <div className="sales-list__name">{c.name}</div>
                    <div className="sales-list__sub">{sub}</div>
                    {ind.length > 0 ? (
                      <div className="sales-list__indicators">
                        {ind.map((x) => (
                          <span key={x.key} className={x.className}>
                            {x.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <span className={dealStatusBadgeClass(c.status)}>
                      {c.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
      <section className="sales-detail">
        {!selected ? (
          <div className="sales-detail__empty">
            <svg
              className="sales-detail__empty-art"
              viewBox="0 0 120 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect
                x="10"
                y="20"
                width="100"
                height="60"
                rx="8"
                fill="var(--border)"
              />
              <path
                d="M40 45 L55 60 L80 35"
                stroke="var(--muted)"
                strokeWidth="4"
                fill="none"
              />
            </svg>
            <p>
              <strong>Выберите клиента</strong>
            </p>
            <p>Список слева · детали появятся здесь</p>
          </div>
        ) : (
          <ClientPreviewCard client={selected} store={s} />
        )}
      </section>
    </div>
  );
}

function ClientPreviewCard({
  client,
  store,
}: {
  client: ClientRecord;
  store: ReturnType<typeof getOpsStore>;
}) {
  const bg = getAvatarColor(client.name);
  const ini = initials(client.name);
  const p = CATALOG_BY_SKU[client.deal.sku];
  const eff =
    p &&
    computeEffectivePrice(store.prices[client.deal.sku], p, store.promotions);

  return (
    <div className="client-card">
      <div className="client-card__header">
        <div className="client-card__hero">
          <div
            className="client-card__avatar-lg"
            style={{ background: bg }}
          >
            {ini}
          </div>
          <div className="client-card__contacts">
            <h2>{client.name}</h2>
            <p>{client.phone}</p>
            <p>{client.email}</p>
          </div>
        </div>
        <div className="client-card__actions">
          <Link
            href={`/app/sales/${client.id}`}
            className="btn btn--primary"
          >
            Полная карточка
          </Link>
          <button type="button" className="btn">
            Позвонить
          </button>
          <button type="button" className="btn">
            Написать
          </button>
          <div className="client-card__status-wrap">
            <span className={dealStatusBadgeClass(client.status)}>
              {client.status}
            </span>
          </div>
        </div>
      </div>
      {client.nextAction ? (
        <div
          className="client-card__next-strip"
          style={{ margin: "0 24px 16px" }}
        >
          <div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--muted)",
                marginBottom: 4,
              }}
            >
              Следующий шаг
            </div>
            <strong>{client.nextAction.type}</strong>
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              {" "}
              · {client.nextAction.date}
            </span>
          </div>
        </div>
      ) : null}
      <div className="deal-product deal-product--clickable">
        <div
          className="deal-product__img"
          style={{ background: client.deal.color }}
        >
          {"\u2726"}
        </div>
        <div className="deal-product__info">
          <h3>{client.deal.product}</h3>
          <div className="deal-product__sku">
            Арт. {client.deal.sku}
            {eff && (
              <>
                {" "}
                · эфф. {formatRub(eff.effective)}
              </>
            )}
          </div>
          <div className="deal-product__price">
            {formatRub(client.deal.price)}
          </div>
          <span className={stockBadgeClass(client.deal.stock)}>
            {client.deal.stock}
          </span>
        </div>
      </div>
    </div>
  );
}
