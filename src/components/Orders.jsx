import { useMemo, useState } from "react";
import { groupItemsByOrder } from "../lib/hooks.js";
import {
  formatDate,
  money,
  num,
  productImage,
  productName,
  productNameZh,
  thumbUrl,
} from "../lib/values.js";
import { PixelHouse, PixelStar } from "./PixelSprites.jsx";

// Facts worth showing per order, in the order they read best. Any field the
// Base does not actually have is skipped rather than rendered blank.
const ORDER_FACTS = [
  ["Store", "门店"],
  ["Payment", "支付方式"],
  ["Pieces", "商品件数"],
  ["Goods total", "商品总额"],
  ["Packaging", "包装费"],
  ["Delivery", "配送费"],
  ["Cashback", "回馈金(优惠)"],
];

function Orders({ orders, orderProducts, products }) {
  const byOrder = useMemo(() => groupItemsByOrder(orderProducts), [orderProducts]);

  // Order lines only carry 产品名称, so match them back to the catalog to get
  // the English name and the product photo.
  const productByName = useMemo(() => {
    const map = new Map();
    for (const record of products) {
      const zh = record.fields["产品名称"];
      if (zh && !map.has(zh)) map.set(zh, record);
    }
    return map;
  }, [products]);

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

  const [selectedId, setSelectedId] = useState(null);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;

  return (
    <section>
      <div className="tool-bar">
        <h2 className="tool-title">
          <PixelHouse className="sprite sprite-sm" /> Orders
        </h2>
        <span className="count-inline">
          {orders.length} orders · {orderProducts.length} line items
        </span>
      </div>

      <div className="split">
        <div className="split-list" role="listbox" aria-label="Orders">
          {rows.map((row) => {
            const on = selected && row.id === selected.id;
            const paid = money(row.fields["实付金额"]);
            return (
              <button
                type="button"
                key={row.id}
                role="option"
                aria-selected={on}
                className={on ? "order-item order-item-on" : "order-item"}
                onClick={() => setSelectedId(row.id)}
              >
                <span className="order-item-no">{row.key}</span>
                <span className="order-item-sub">
                  {formatDate(row.fields["下单时间"]) ?? "no date"} · {row.items.length} items
                  {row.planned && " · planned"}
                </span>
                <span className="order-item-amt">{paid ?? "—"}</span>
              </button>
            );
          })}
        </div>

        <div className="split-detail">
          {selected && <OrderDetail row={selected} productByName={productByName} />}
        </div>
      </div>
    </section>
  );
}

function OrderDetail({ row, productByName }) {
  const f = row.fields;
  const paid = money(f["实付金额"]);
  const itemsTotal = row.items.reduce((sum, item) => sum + (num(item.fields["小计"]) ?? 0), 0);

  return (
    <article className="detail">
      <header className="detail-head">
        <div>
          <h3 className="detail-no">{row.key}</h3>
          <p className="detail-sub">
            {formatDate(f["下单时间"]) ?? "no date"}
            {row.planned && " · planned"}
          </p>
        </div>
        <div className="detail-amt">
          <span className="summary-label">Paid</span>
          <span className="summary-value">{paid ?? "not paid"}</span>
        </div>
      </header>

      <dl className="facts">
        {ORDER_FACTS.map(([label, key]) => {
          const raw = f[key];
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
        {f["备注"] && (
          <div className="fact fact-wide">
            <dt>备注</dt>
            <dd>{f["备注"]}</dd>
          </div>
        )}
      </dl>

      <h4 className="detail-lines-title">
        <PixelStar className="sprite sprite-sm" /> Products in this order
      </h4>

      {row.items.length === 0 ? (
        <p className="empty">No line items linked to this order.</p>
      ) : (
        <ul className="lines lines-rich">
          {row.items.map((item) => {
            const line = item.fields;
            const zh = line["产品名称"] ?? "";
            const product = productByName.get(zh);
            const image = product ? thumbUrl(productImage(product.fields), 120) : null;
            const en = product ? productName(product.fields) : null;
            const qty = num(line["数量"]);
            const unit = money(line["单价"]);
            const subtotal = money(line["小计"]);

            return (
              <li className="line line-rich" key={item.id}>
                <span className="line-thumb">
                  {image ? (
                    <img src={image} alt="" loading="lazy" />
                  ) : (
                    <span className="thumb-ph">{(en || zh || "?").slice(0, 1)}</span>
                  )}
                </span>

                <span className="line-text">
                  <span className="line-en">{en ?? zh ?? "(unnamed)"}</span>
                  {en && zh && zh !== en && <span className="line-zh">{zh}</span>}
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
    </article>
  );
}

export default Orders;
