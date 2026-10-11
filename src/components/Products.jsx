import { useMemo, useState } from "react";
import {
  imageUrl,
  money,
  productName,
  productNameEs,
  productNameZh,
  storage,
} from "../lib/values.js";

const STORAGE_TONE = { 常温: "ambient", 冷藏: "chilled", 冷冻: "frozen" };

function matches(record, query) {
  const f = record.fields;
  return [f["English Name"], f["产品名称"], f["Nombre en Español"], f["品牌"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function Products({ products }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const [place, setPlace] = useState(null);

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
        {visible.length} of {products.length} products
      </p>

      {visible.length === 0 && <p className="empty">Nothing matches those filters.</p>}

      <div className="cards">
        {visible.map((record) => {
          const f = record.fields;
          const image = imageUrl(f["图片"]);
          const title = productName(f);
          const zh = productNameZh(f);
          const es = productNameEs(f);
          const price = money(f["单价"]);
          const unit = f["单位"];
          const store = storage(f);
          const size = f["净含量"];

          return (
            <article className="card" key={record.id}>
              <div className="thumb">
                {image ? (
                  <img src={image} alt="" loading="lazy" />
                ) : (
                  <span className="thumb-ph">{title.slice(0, 1)}</span>
                )}
              </div>

              <div className="card-body">
                <h3 className="card-title">{title}</h3>
                {zh && zh !== title && <p className="name-zh">{zh}</p>}
                {es && <p className="name-es">{es}</p>}

                <div className="meta">
                  {price && (
                    <span className="price">
                      {price}
                      {unit && <span className="unit">/{unit}</span>}
                    </span>
                  )}
                  {store && <span className={`tag tag-${STORAGE_TONE[store] ?? "ambient"}`}>{store}</span>}
                  {f["品牌"] && <span className="tag">{f["品牌"]}</span>}
                  {size && (
                    <span className="tag tag-quiet">
                      {size}
                      {unit}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Products;