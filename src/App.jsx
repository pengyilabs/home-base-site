import { useState } from "react";
import Orders from "./components/Orders.jsx";
import Plan from "./components/Plan.jsx";
import Products from "./components/Products.jsx";
import Recipes from "./components/Recipes.jsx";
import { useBase } from "./lib/hooks.js";

const TABS = [
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "recipes", label: "Recipes" },
  { id: "plan", label: "Plan" },
];

export default function App() {
  const [tab, setTab] = useState("products");
  const { loading, error, products, orders, orderProducts } = useBase();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Home Base</h1>
          <p className="tagline">Live from Feishu · no account needed</p>
        </div>

        <nav className="tabs" aria-label="Sections">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={tab === entry.id ? "tab tab-on" : "tab"}
              aria-current={tab === entry.id ? "page" : undefined}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {loading && <p className="empty">Loading your Base…</p>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <>
            {tab === "products" && <Products products={products} />}
            {tab === "orders" && <Orders orders={orders} orderProducts={orderProducts} />}
            {tab === "recipes" && <Recipes products={products} />}
            {tab === "plan" && <Plan products={products} />}
          </>
        )}
      </main>

      <footer className="footer">
        <span>
          Products and orders are read live from the Feishu Base. Recipes and plans are kept in this
          browser only.
        </span>
      </footer>
    </div>
  );
}