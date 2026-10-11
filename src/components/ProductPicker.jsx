import { useMemo, useState } from "react";
import { money, productName, productNameZh } from "../lib/values.js";

/**
 * Type-ahead product search against the live product list. Used by both the
 * recipe builder and the order planner so picking a product feels the same.
 */
export default function ProductPicker({ products, onPick, placeholder = "Search a product…" }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((record) => {
        const f = record.fields;
        return [f["English Name"], f["产品名称"], f["Nombre en Español"], f["品牌"]]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 20);
  }, [products, query]);

  return (
    <div className="picker">
      <input
        className="input"
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(event) => setQuery(event.target.value)}
      />

      {query.trim() !== "" && (
        <ul className="picker-list">
          {results.map((record) => {
            const f = record.fields;
            const zh = productNameZh(f);
            const price = money(f["单价"]);
            return (
              <li key={record.id}>
                <button
                  type="button"
                  className="picker-item"
                  onClick={() => {
                    onPick(record);
                    setQuery("");
                  }}
                >
                  <span className="picker-main">
                    <span className="picker-name">{productName(f)}</span>
                    {zh && zh !== productName(f) && <span className="picker-sub">{zh}</span>}
                  </span>
                  {price && <span className="picker-price">{price}</span>}
                </button>
              </li>
            );
          })}
          {results.length === 0 && <li className="picker-empty">No product matches “{query.trim()}”.</li>}
        </ul>
      )}
    </div>
  );
}