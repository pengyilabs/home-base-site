import { useState } from "react";
import ProductPicker from "./ProductPicker.jsx";
import { useLocalState } from "../lib/hooks.js";
import { productName } from "../lib/values.js";

const MEALS = ["早餐", "午餐", "晚餐", "烘焙", "甜品", "饮品", "酱料", "汤"];
const STATUSES = ["想尝试", "常做", "已做过"];
const UNITS = ["g", "kg", "ml", "L", "个", "片", "勺", "杯"];

// Matches the 食谱 table shape, but held in the browser: this tool does not
// write to the Feishu Base yet, so a saved recipe lives in localStorage only.
const blankDraft = () => ({
  id: null,
  nameZh: "",
  nameEn: "",
  nameEs: "",
  servings: "",
  meal: "",
  status: "",
  notes: "",
  ingredients: [],
});

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function Recipes({ products }) {
  const [recipes, setRecipes] = useLocalState("home-base.recipes", []);
  const [draft, setDraft] = useState(null);
  const [open, setOpen] = useState(() => new Set());

  const patch = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

  const addIngredient = (record) =>
    setDraft((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          key: uid(),
          productId: record.id,
          name: productName(record.fields),
          amount: "",
          unit: "g",
        },
      ],
    }));

  const patchIngredient = (key, changes) =>
    setDraft((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    }));

  const removeIngredient = (key) =>
    setDraft((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((row) => row.key !== key),
    }));

  const save = () => {
    const recipe = {
      ...draft,
      nameZh: draft.nameZh.trim(),
      nameEn: draft.nameEn.trim(),
      nameEs: draft.nameEs.trim(),
      notes: draft.notes.trim(),
    };
    if (!recipe.nameZh && !recipe.nameEn) return;

    if (recipe.id) {
      setRecipes((prev) => prev.map((item) => (item.id === recipe.id ? recipe : item)));
    } else {
      setRecipes((prev) => [...prev, { ...recipe, id: uid(), savedAt: Date.now() }]);
    }
    setDraft(null);
  };

  const remove = (id) => {
    setRecipes((prev) => prev.filter((item) => item.id !== id));
    setOpen((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* --- editor ------------------------------------------------------------ */

  if (draft) {
    const canSave = draft.nameZh.trim() !== "" || draft.nameEn.trim() !== "";

    return (
      <section>
        <div className="tool-bar">
          <h2 className="tool-title">{draft.id ? "Edit recipe" : "New recipe"}</h2>
          <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
            Cancel
          </button>
        </div>

        <div className="form">
          <label className="field">
            <span>English name</span>
            <input
              className="input"
              value={draft.nameEn}
              onChange={(event) => patch({ nameEn: event.target.value })}
              placeholder="Butter chicken"
            />
          </label>

          <label className="field">
            <span>菜名</span>
            <input
              className="input"
              value={draft.nameZh}
              onChange={(event) => patch({ nameZh: event.target.value })}
              placeholder="黄油鸡"
            />
          </label>

          <label className="field">
            <span>Nombre en Español</span>
            <input
              className="input"
              value={draft.nameEs}
              onChange={(event) => patch({ nameEs: event.target.value })}
              placeholder="Pollo a la mantequilla"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>几人份</span>
              <input
                className="input"
                type="number"
                min="1"
                inputMode="numeric"
                value={draft.servings}
                onChange={(event) => patch({ servings: event.target.value })}
              />
            </label>

            <label className="field">
              <span>餐次</span>
              <select
                className="input"
                value={draft.meal}
                onChange={(event) => patch({ meal: event.target.value })}
              >
                <option value="">—</option>
                {MEALS.map((meal) => (
                  <option key={meal} value={meal}>
                    {meal}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>状态</span>
              <select
                className="input"
                value={draft.status}
                onChange={(event) => patch({ status: event.target.value })}
              >
                <option value="">—</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field">
            <span>Products in this recipe</span>
            <ProductPicker products={products} onPick={addIngredient} placeholder="Search a product to add…" />

            {draft.ingredients.length === 0 ? (
              <p className="empty">No products added yet.</p>
            ) : (
              <ul className="rows">
                {draft.ingredients.map((row) => (
                  <li className="row" key={row.key}>
                    <span className="row-name">{row.name}</span>
                    <input
                      className="input input-sm"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={row.amount}
                      placeholder="0"
                      aria-label={`Amount for ${row.name}`}
                      onChange={(event) => patchIngredient(row.key, { amount: event.target.value })}
                    />
                    <select
                      className="input input-sm"
                      value={row.unit}
                      aria-label={`Unit for ${row.name}`}
                      onChange={(event) => patchIngredient(row.key, { unit: event.target.value })}
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-icon"
                      aria-label={`Remove ${row.name}`}
                      onClick={() => removeIngredient(row.key)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="field">
            <span>做法与备注</span>
            <textarea
              className="input"
              rows="4"
              value={draft.notes}
              onChange={(event) => patch({ notes: event.target.value })}
              placeholder="Steps, tweaks, what to change next time…"
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-primary" disabled={!canSave} onClick={save}>
              Save recipe
            </button>
            {!canSave && <span className="muted">Give it an English or Chinese name first.</span>}
          </div>
        </div>
      </section>
    );
  }

  /* --- list -------------------------------------------------------------- */

  return (
    <section>
      <div className="tool-bar">
        <h2 className="tool-title">
          Recipes <span className="count-inline">{recipes.length}</span>
        </h2>
        <button type="button" className="btn btn-primary" onClick={() => setDraft(blankDraft())}>
          New recipe
        </button>
      </div>

      <p className="notice">
        Saved in this browser only — these recipes are not written to your Feishu Base yet.
      </p>

      {recipes.length === 0 && <p className="empty">No recipes yet. Build your first one.</p>}

      <div className="orders">
        {recipes.map((recipe) => {
          const expanded = open.has(recipe.id);
          const title = recipe.nameEn || recipe.nameZh || "(untitled)";
          return (
            <article className={expanded ? "order order-open" : "order"} key={recipe.id}>
              <button type="button" className="order-head" onClick={() => toggle(recipe.id)}>
                <span className="order-id">
                  <span className="order-no">{title}</span>
                  <span className="order-sub">
                    {recipe.nameZh || "no 菜名"}
                    {recipe.servings && ` · ${recipe.servings} servings`}
                    {recipe.meal && ` · ${recipe.meal}`}
                    {recipe.status && ` · ${recipe.status}`}
                  </span>
                </span>
                <span className="order-total">
                  <span className="muted">{recipe.ingredients.length} items</span>
                  <span className="chev">{expanded ? "▲" : "▼"}</span>
                </span>
              </button>

              {expanded && (
                <div className="order-body">
                  {recipe.nameEs && <p className="name-es">{recipe.nameEs}</p>}

                  {recipe.ingredients.length > 0 && (
                    <ul className="lines">
                      {recipe.ingredients.map((row) => (
                        <li className="line" key={row.key}>
                          <span className="line-name">{row.name}</span>
                          <span className="line-calc">
                            <span className="line-sum">
                              {row.amount}
                              {row.unit}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {recipe.notes && <p className="notes">{recipe.notes}</p>}

                  <div className="form-actions">
                    <button type="button" className="btn" onClick={() => setDraft(recipe)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(recipe.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Recipes;