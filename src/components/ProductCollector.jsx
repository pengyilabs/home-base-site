import { useMemo, useState } from "react";
import { money, productImage, productName, productNameZh, thumbUrl } from "../lib/values.js";
import { PixelFlower, PixelStar } from "./PixelSprites.jsx";

function matches(record, query) {
  const f = record.fields;
  return [f["English Name"], f["产品名称"], f["Nombre en Español"], f["品牌"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

/**
 * The "market + pouch" flow shared by Recipes and Plan: search the catalog,
 * tap a product to collect it, then tune the stack in your pouch. Keeps both
 * tools feeling like the same game rather than two different forms.
 */
export default function ProductCollector({
  products,
  items,
  onAdd,
  onPatch,
  onRemove,
  showDone = false,
  showPrice = false,
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q === "" ? products : products.filter((record) => matches(record, q));
    return [...pool]
      .sort((a, b) => productName(a.fields).localeCompare(productName(b.fields)))
      .slice(0, 30);
  }, [products, query]);

  const collected = new Set(items.map((item) => item.productId));

  return (
    <div className="market">
      <div className="market-head">
        <PixelStar className="sprite sprite-sm" />
        <h3 className="market-title">Market</h3>
        <input
          className="input input-search"
          type="search"
          value={query}
          placeholder="Search to collect…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="market-grid">
        {results.map((record) => {
          const f = record.fields;
          const image = thumbUrl(productImage(f), 160);
          const title = productName(f);
          const zh = productNameZh(f);
          const has = collected.has(record.id);
          return (
            <button
              type="button"
              key={record.id}
              className={has ? "market-item market-item-has" : "market-item"}
              onClick={() => onAdd(record)}
              title={has ? `${title} — tap to add another` : `Collect ${title}`}
            >
              <span className="market-thumb">
                {image ? (
                  <img src={image} alt="" loading="lazy" />
                ) : (
                  <span className="thumb-ph">{title.slice(0, 1)}</span>
                )}
              </span>
              <span className="market-name">{title}</span>
              {zh && zh !== title && <span className="market-zh">{zh}</span>}
              <span className="market-add">{has ? "+1" : "＋ collect"}</span>
            </button>
          );
        })}
        {results.length === 0 && <p className="empty">Nothing matches “{query.trim()}”.</p>}
      </div>

      {items.length > 0 && (
        <div className="pouch">
          <div className="pouch-head">
            <PixelFlower className="sprite sprite-sm" />
            <h3 className="pouch-title">Your pouch</h3>
            <span className="pouch-count">{items.length} collected</span>
          </div>

          <ul className="pouch-grid">
            {items.map((item) => (
              <li key={item.key} className={item.done ? "slot slot-done" : "slot"}>
                <span className="slot-thumb">
                  {item.image ? (
                    <img src={item.image} alt="" loading="lazy" />
                  ) : (
                    <span className="thumb-ph">{item.name.slice(0, 1)}</span>
                  )}
                </span>

                <span className="slot-name" title={item.name}>
                  {item.name}
                </span>

                {showPrice && item.price !== null && item.price !== undefined && (
                  <span className="slot-price">{money(item.price * (item.qty || 1))}</span>
                )}

                <span className="slot-ctrl">
                  <button
                    type="button"
                    className="btn btn-icon btn-step"
                    aria-label={`One less ${item.name}`}
                    onClick={() => onPatch(item.key, { qty: Math.max(1, (item.qty || 1) - 1) })}
                  >
                    −
                  </button>
                  <span className="slot-qty">{item.qty || 1}</span>
                  <button
                    type="button"
                    className="btn btn-icon btn-step"
                    aria-label={`One more ${item.name}`}
                    onClick={() => onPatch(item.key, { qty: (item.qty || 1) + 1 })}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-icon btn-x"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onRemove(item.key)}
                  >
                    ×
                  </button>
                </span>

                {showDone && (
                  <label className="slot-check">
                    <input
                      type="checkbox"
                      checked={!!item.done}
                      onChange={(event) => onPatch(item.key, { done: event.target.checked })}
                    />
                    <span>got it</span>
                  </label>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
