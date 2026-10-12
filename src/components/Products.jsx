import { useEffect, useMemo, useState } from "react";
import {
  largeUrl,
  money,
  productImage,
  productName,
  productNameEs,
  productNameZh,
  storage,
  thumbUrl,
} from "../lib/values.js";
import { PixelStar } from "./PixelSprites.jsx";

const STORAGE_TONE = { 常温: "ambient", 冷藏: "chilled", 冷冻: "frozen" };

function matches(record, query) {
  const f = record.fields;
  return [f["English Name"], f["产品名称"], f["Nombre en Español"], f["品牌"], f["类别"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

/* Facts shown in the detail panel, in reading order. Anything the Base does
 * not actually have is skipped rather than rendered blank. */
const DETAIL_FACTS = [
  ["Brand", "品牌"],
  ["Category", "类别"],
  ["Storage", "存储方式"],
  ["Net weight", "净含量"],
  ["Unit", "单位"],
  ["Notes", "备注"],
];

function ProductDetail({ record, onClose }) {
  const f = record.fields;
  const image = largeUrl(productImage(f), 900);
  const title = productName(f);
  const zh = productNameZh(f);
  const es = productNameEs(f);
  const price = money(f["单价"]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="modal-scrim" aria-label="Close" onClick={onClose} />
      <div className="modal-panel">
        <button type="button" className="btn btn-icon modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <div className="modal-media">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <div className="modal-media-ph">
              <PixelStar className="sprite sprite-lg" />
              <span>{title.slice(0, 1)}</span>
            </div>
          )}
        </div>

        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          {zh && zh !== title && <p className="name-zh">{zh}</p>}
          {es && <p className="name-es">{es}</p>}

          {price && (
            <p className="modal-price">
              {price}
              {f["单位"] && <span className="unit">/{f["单位"]}</span>}
            </p>
          )}

          <div className="meta">
            {storage(f) && (
              <span className={`tag tag-${STORAGE_TONE[storage(f)] ?? "ambient"}`}>{storage(f)}</span>
            )}
            {f["净含量"] && (
              <span className="tag tag-quiet">
                {f["净含量"]}
                {f["单位"]}
              </span>
            )}
          </div>

          <dl className="facts">
            {DETAIL_FACTS.map(([label, key]) => {
              const raw = f[key];
              if (raw === null || raw === undefined || raw === "") return null;
              return (
                <div className="fact" key={key}>
                  <dt>{label}</dt>
                  <dd>{String(raw)}</dd>
                </div>
              );
            })}
            {price && (
              <div className="fact">
                <dt>Unit price</dt>
                <dd>
                  {price}
                  {f["单位"] && ` / ${f["单位"]}`}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Products({ products }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const [place, setPlace] = useState(null);
  const [openId, setOpenId] = useState(null);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const record of products) {
      const value = record.fields["类别"];
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const places = useMemo(() => {
    const counts = new Map();
    for (const record of products) {
      const value = storage(record.fields);
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((record) => {
        if (category && record.fields["类别"] !== category) return false;
        if (place && storage(record.fields) !== place) return false;
        return q === "" || matches(record, q);
      })
      .sort((a, b) => productName(a.fields).localeCompare(productName(b.fields)));
  }, [products, query, category, place]);

  const openRecord = openId ? products.find((r) => r.id === openId) : null;

  return (
    <section>
      <div className="controls">
        <input
          className="input"
          type="search"
          value={query}
          placeholder="Search products, brands, 中文…"
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="chips" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={category === null ? "chip chip-on" : "chip"}
            onClick={() => setCategory(null)}
          >
            All
          </button>
          {categories.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={category === name ? "chip chip-on" : "chip"}
              onClick={() => setCategory(category === name ? null : name)}
            >
              {name} <span className="chip-count">{count}</span>
            </button>
          ))}
        </div>

        <div className="chips" role="group" aria-label="Filter by storage">
          {places.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={place === name ? "chip chip-on" : "chip chip-quiet"}
              onClick={() => setPlace(place === name ? null : name)}
            >
              {name} <span className="chip-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="count">
        {visible.length} of {products.length} products · tap a card to see it large
      </p>

      {visible.length === 0 && <p className="empty">Nothing matches those filters.</p>}

      <div className="cards">
        {visible.map((record) => {
          const f = record.fields;
          const image = thumbUrl(productImage(f), 320);
          const title = productName(f);
          const zh = productNameZh(f);
          const price = money(f["单价"]);
          const unit = f["单位"];
          const store = storage(f);

          return (
            <button type="button" className="card card-tile" key={record.id} onClick={() => setOpenId(record.id)}>
              <div className="tile-media">
                {image ? (
                  <img src={image} alt={title} loading="lazy" />
                ) : (
                  <span className="thumb-ph">{title.slice(0, 1)}</span>
                )}
              </div>

              <div className="tile-body">
                <h3 className="card-title">{title}</h3>
                {zh && zh !== title && <p className="name-zh">{zh}</p>}

                <div className="meta">
                  {price && (
                    <span className="price">
                      {price}
                      {unit && <span className="unit">/{unit}</span>}
                    </span>
                  )}
                  {store && <span className={`tag tag-${STORAGE_TONE[store] ?? "ambient"}`}>{store}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {openRecord && <ProductDetail record={openRecord} onClose={() => setOpenId(null)} />}
    </section>
  );
}

export default Products;
