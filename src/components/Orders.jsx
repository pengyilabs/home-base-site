import { useMemo, useState } from "react";
import { groupItemsByOrder } from "../lib/hooks.js";
import { formatDate, money, num } from "../lib/values.js";

// Facts worth showing per order, in the order they read best. Any field the
// Base does not actually have is skipped rather than rendered blank.
const ORDER_FACTS = [
  ["门店", "门店"],
  ["Payment", "支付方式"],
  ["Goods total", "商品总额"],
  ["Packaging", "包装费"],
  ["Delivery", "配送费"],
  ["Cashback", "回馈金(优惠)"],
];

function Orders({ orders, orderProducts }) {
  const byOrder = useMemo(() => groupItemsByOrder(orderProducts), [orderProducts]);
  const [open, setOpen] = useState(() => new Set());

  const rows = useMemo(
    () =>
      orders
        .map((record) => {
          const f = record.fields;
          const key = String(f["订单号"] ?? record.id);
          const date = num(f["下单时间"]);
          return {
            id: record.id,
            fields: f,
            key,
            date,
            planned: key.startsWith("PLAN-"),
            items: byOrder.get(f["订单号"]) ?? [],
          };
        })
        .sort((a, b) => {
          if (a.planned !== b.planned) return a.planned ? -1 : 1;
          return (b.date ?? 0) - (a.date ?? 0);
        }),
    [orders, byOrder]
  );

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section>
      <p className="count">
        {orders.length} orders · {orderProducts.length} line items
      </p>

      <div className="orders">
        {rows.map((row) => {
          const expanded = open.has(row.id);
          const paid = money(row.fields["实付金额"]);
          const date = formatDate(row.fields["下单时间"]);
          const pieces = num(row.fields["商品件数"]);
          const itemsTotal = row.items.reduce((sum, item) => sum + (num(item.fields["小计"]) ?? 0), 0);

          return (
            <article className={expanded ? "order order-open" : "order"} key={row.id}>
              <button type="button" className="order-head" onClick={() => toggle(row.id)}>
                <span className="order-id">
                  <span className="order-no">{row.key}</span>
                  <span className="order-sub">
                    {date ?? "no date"}
                    {pieces !== null && ` · ${pieces} items`}
                    {row.planned && " · planned"}
                  </span>
                </span>
                <span className="order-total">
                  {paid ?? <span className="muted">not paid</span>}
                  <span className="chev">{expanded ? "▲" : "▼"}</span>
                </span>
              </button>

              {expanded && (
                <div className="order-body">
                  <dl className="facts">
                    {ORDER_FACTS.map(([label, key]) => {
                      const raw = row.fields[key];
                      if (raw === null || raw === undefined || raw === "") return null;
                      const shown = key === "支付方式" || key === "门店" ? raw : money(raw) ?? raw;
                      return (
                        <div className="fact" key={key}>
                          <dt>{label}</dt>
                          <dd>{shown}</dd>
                        </div>
                      );
                    })}
                    <div className="fact">
                      <dt>Items total</dt>
                      <dd>{money(itemsTotal)}</dd>
                    </div>
                    {row.fields["备注"] && (
                      <div className="fact fact-wide">
                        <dt>备注</dt>
                        <dd>{row.fields["备注"]}</dd>
                      </div>
                    )}
                  </dl>

                  {row.items.length === 0 ? (
                    <p className="empty">No line items linked to this order.</p>
                  ) : (
                    <ul className="lines">
                      {row.items.map((item) => {
                        const line = item.fields;
                        const qty = num(line["数量"]);
                        const unit = money(line["单价"]);
                        const subtotal = money(line["小计"]);
                        return (
                          <li className="line" key={item.id}>
                            <span className="line-name">
                              {line["产品名称"] ?? "(unnamed)"}
                              {line["规格"] && <span className="line-spec">{line["规格"]}</span>}
                            </span>
                            <span className="line-calc">
                              {qty !== null && <span className="line-qty">{qty}×</span>}
                              {unit && <span className="line-unit">{unit}</span>}
                              <span className="line-sum">{subtotal}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Orders;