import { useMemo, useState } from "react";
import ProductCollector from "./ProductCollector.jsx";
import { useLocalState } from "../lib/hooks.js";
import { money, num, productImage, productName, productNameZh, thumbUrl } from "../lib/values.js";
import { PixelStar, PixelWheat } from "./PixelSprites.jsx";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function toSlot(record) {
  const f = record.fields;
  return {
    key: uid(),
    productId: record.id,
    name: productName(f),
    zh: productNameZh(f),
    image: thumbUrl(productImage(f), 160),
    qty: 1,
    price: num(f["单价"]),
    unit: f["单位"] ?? "",
    done: false,
  };
}

function Plan({ products }) {
  const [plan, setPlan] = useLocalState("home-base.plan", () => ({
    name: `PLAN-${new Date().toISOString().slice(0, 10)}`,
    items: [],
  }));

  const setItems = (updater) =>
    setPlan((prev) => ({ ...prev, items: typeof updater === "function" ? updater(prev.items) : updater }));

  const add = (record) =>
    setItems((prev) => {
      const found = prev.find((row) => row.productId === record.id);
      if (found) return prev.map((row) => (row.productId === record.id ? { ...row, qty: row.qty + 1 } : row));
      return [...prev, toSlot(record)];
    });

  const patch = (key, changes) =>
    setItems((prev) => prev.map((row) => (row.key === key ? { ...row, ...changes } : row)));

  const remove = (key) => setItems((prev) => prev.filter((row) => row.key !== key));

  const totals = useMemo(() => {
    let all = 0;
    let remaining = 0;
    let count = 0;
    for (const item of plan.items) {
      const line = (item.qty || 0) * (item.price ?? 0);
      all += line;
      count += item.qty || 0;
      if (!item.done) remaining += line;
    }
    return { all, remaining, count };
  }, [plan.items]);

  return (
    <section>
      <div className="tool-bar">
        <h2 className="tool-title">
          <PixelStar className="sprite sprite-sm" /> Plan an order
        </h2>
        {plan.items.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPlan({ name: plan.name, items: [] })}
          >
            Clear
          </button>
        )}
      </div>

      <p className="notice">
        Name it, collect the products, tick them off as you shop. A local scratchpad — nothing is
        written to your Feishu Base.
      </p>

      <div className="builder">
        <label className="field">
          <span>Plan name</span>
          <input
            className="input input-name"
            value={plan.name}
            onChange={(event) => setPlan((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <ProductCollector
          products={products}
          items={plan.items}
          onAdd={add}
          onPatch={patch}
          onRemove={remove}
          showDone
          showPrice
        />

        {plan.items.length > 0 && (
          <div className="summary">
            <div>
              <span className="summary-label">Items</span>
              <span className="summary-value">{totals.count}</span>
            </div>
            <div>
              <span className="summary-label">Estimated total</span>
              <span className="summary-value">{money(totals.all)}</span>
            </div>
            <div>
              <span className="summary-label">Still to get</span>
              <span className="summary-value">{money(totals.remaining)}</span>
            </div>
          </div>
        )}
      </div>

      {plan.items.length === 0 && (
        <p className="empty">
          <PixelWheat className="sprite sprite-sm" /> Nothing collected yet — search the market above.
        </p>
      )}
    </section>
  );
}

export default Plan;
