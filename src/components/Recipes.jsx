import { useState } from "react";
import ProductCollector from "./ProductCollector.jsx";
import { useLocalState } from "../lib/hooks.js";
import { productImage, productName, productNameZh, thumbUrl } from "../lib/values.js";
import { PixelHeart, PixelLeaf, PixelStar } from "./PixelSprites.jsx";

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
  };
}

function Recipes({ products }) {
  const [recipes, setRecipes] = useLocalState("home-base.recipes", []);
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  const add = (record) =>
    setItems((prev) => {
      const found = prev.find((row) => row.productId === record.id);
      if (found) return prev.map((row) => (row.productId === record.id ? { ...row, qty: row.qty + 1 } : row));
      return [...prev, toSlot(record)];
    });

  const patch = (key, changes) =>
    setItems((prev) => prev.map((row) => (row.key === key ? { ...row, ...changes } : row)));

  const remove = (key) => setItems((prev) => prev.filter((row) => row.key !== key));

  const canSave = name.trim() !== "" && items.length > 0;

  const save = () => {
    if (!canSave) return;
    setRecipes((prev) => [{ id: uid(), name: name.trim(), items, savedAt: Date.now() }, ...prev]);
    setName("");
    setItems([]);
  };

  return (
    <section>
      <div className="tool-bar">
        <h2 className="tool-title">
          <PixelHeart className="sprite sprite-sm" /> Recipes{" "}
          <span className="count-inline">{recipes.length}</span>
        </h2>
      </div>

      <p className="notice">
        Name it, collect the products, save. Recipes live in this browser only — nothing is written
        to your Feishu Base.
      </p>

      <div className="builder">
        <label className="field">
          <span>Recipe name</span>
          <input
            className="input input-name"
            value={name}
            placeholder="Butter chicken…"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <ProductCollector
          products={products}
          items={items}
          onAdd={add}
          onPatch={patch}
          onRemove={remove}
        />

        <div className="form-actions">
          <button type="button" className="btn btn-primary" disabled={!canSave} onClick={save}>
            <PixelStar className="sprite sprite-sm" /> Save recipe
          </button>
          {items.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setItems([])}>
              Empty pouch
            </button>
          )}
          {!canSave && (
            <span className="muted">Give it a name and collect at least one product.</span>
          )}
        </div>
      </div>

      {recipes.length > 0 && (
        <div className="saved">
          <h3 className="saved-title">
            <PixelLeaf className="sprite sprite-sm" /> Saved recipes
          </h3>
          <ul className="saved-list">
            {recipes.map((recipe) => {
              const open = openId === recipe.id;
              return (
                <li className={open ? "saved-item saved-item-open" : "saved-item"} key={recipe.id}>
                  <button
                    type="button"
                    className="saved-head"
                    onClick={() => setOpenId(open ? null : recipe.id)}
                  >
                    <span className="saved-name">{recipe.name}</span>
                    <span className="saved-sub">{recipe.items.length} products</span>
                  </button>

                  {open && (
                    <div className="saved-body">
                      <ul className="pouch-grid pouch-grid-saved">
                        {recipe.items.map((row) => (
                          <li className="slot" key={row.key}>
                            <span className="slot-thumb">
                              {row.image ? (
                                <img src={row.image} alt="" loading="lazy" />
                              ) : (
                                <span className="thumb-ph">{row.name.slice(0, 1)}</span>
                              )}
                            </span>
                            <span className="slot-name">{row.name}</span>
                            <span className="slot-qty">{row.qty}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

export default Recipes;
