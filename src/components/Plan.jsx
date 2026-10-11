import { useMemo } from "react";
import ProductPicker from "./ProductPicker.jsx";
import { useLocalState } from "../lib/hooks.js";
import { money, num, productName } from "../lib/values.js";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// A name shaped like the PLAN- orders already in the Base, so a plan made here
// can be pasted straight into Feishu later if you want to keep it.
function defaultPlanName() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `PLAN-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
}

function Plan({ products }) {
  const [plan, setPlan] = useLocalState("home-base.plan", () => ({
    name: defaultPlanName(),
    items: [],
  }));

  const addItem = (record) => {
    const fields = record.fields;
    setPlan((prev) => {
      const existing = prev.items.find((item) => item.productId === record.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.productId === record.id ? { ...item, qty: String((num(item.qty) ?? 0) + 1) } : item
          ),
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            key: uid(),
            productId: record.id,
            name: productName(fields),
            qty: "1",
            unit: fields["单位"] ?? "",
            price: num(fields["单价"]),
            done: false,
          },
        ],
      };
    });
  };

  const patchItem = (key, changes) =>
    setPlan((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.key === key ? { ...item, ...changes } : item)),
    }));

  const removeItem = (key) =>
    setPlan((prev) => ({ ...prev, items: prev.items.filter((item) => item.key !== key) }));

  const totals = useMemo(() => {
    let all = 0;
    let remaining = 0;
    let count = 0;
    for (const item of plan.items) {
      const qty = num(item.qty) ?? 0;
      const line = qty * (item.price ?? 0);
      all += line;
      count += qty;
      if (!item.done) remaining += line;
    }
    return { all, remaining, count };
  }, [plan.items]);

  return (
    <section>
      <div className="tool-bar">
        <h2 className="tool-title">Plan an order</h2>
        {plan.items.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPlan({ name: defaultPlanName(), items: [] })}
          >
            Clear
          </button>
        )}
      </div>

      <p className="notice">
        A local scratchpad for building a big order — nothing is written to your Feishu Base.
      </p>

      <label className="field">
        <span>Plan name</span>
        <input
          className="input"
          value={plan.name}
          onChange={(event) => setPlan((prev) => ({ ...prev, name: event.target.value }))}
        />
      </label>

      <div className="field">
        <span>Add products</span>
        <ProductPicker products={products} onPick={addItem} placeholder="Search a product to add…" />
      </div>

      {plan.items.length === 0 ? (
        <p className="empty">Nothing planned yet. Search above to add products.</p>
      ) : (
        <>
          <ul className="rows rows-plan">
            {plan.items.map((item) => {
              const qty = num(item.qty) ?? 0;
              const line = qty * (item.price ?? 0);
              return (
                <li className={item.done ? "row row-done" : "row"} key={item.key}>
                  <input
                    type="checkbox"
                    className="check"
                    checked={item.done}
                    aria-label={`Mark ${item.name} as done`}
                    onChange={(event) => patchItem(item.key, { done: event.target.checked })}
                  />
                  <span className="row-name">
                    {item.name}
                    {item.price !== null && <span className="row-sub">{money(item.price)} each</span>}
                  </span>
                  <input
                    className="input input-sm"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={item.qty}
                    aria-label={`Quantity for ${item.name}`}
                    onChange={(event) => patchItem(item.key, { qty: event.target.value })}
                  />
                  {item.unit && <span className="row-unit">{item.unit}</span>}
                  <span className="row-total">{money(line)}</span>
                  <button
                    type="button"
                    className="btn btn-icon"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.key)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>

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
        </>
      )}
    </section>
  );
}

export default Plan;