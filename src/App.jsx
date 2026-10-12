import { useState } from "react";
import Orders from "./components/Orders.jsx";
import Plan from "./components/Plan.jsx";
import Products from "./components/Products.jsx";
import Recipes from "./components/Recipes.jsx";
import {
  PixelFlower,
  PixelHeart,
  PixelHouse,
  PixelMushroom,
  PixelStar,
  PixelTree,
  PixelWheat,
} from "./components/PixelSprites.jsx";
import { useBase } from "./lib/hooks.js";

const NAV = [
  { id: "products", label: "Products", hint: "Browse the catalog", Icon: PixelWheat },
  { id: "orders", label: "Orders", hint: "Order history and details", Icon: PixelHouse },
  { id: "recipes", label: "Recipes", hint: "Build recipes from products", Icon: PixelHeart },
  { id: "plan", label: "Plan", hint: "Plan your next order", Icon: PixelStar },
];

export default function App() {
  const [tab, setTab] = useState("products");
  const { loading, error, products, orders, orderProducts } = useBase();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <PixelTree className="sprite sprite-lg" />
          <div className="brand-text">
            <h1>Home Base</h1>
            <p className="tagline">Live from Feishu</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Sections">
          {NAV.map((entry) => {
            const { Icon } = entry;
            const on = tab === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                className={on ? "nav-item nav-on" : "nav-item"}
                aria-current={on ? "page" : undefined}
                title={entry.hint}
                onClick={() => setTab(entry.id)}
              >
                <Icon className="sprite sprite-md" />
                <span className="nav-label">{entry.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot" aria-hidden="true">
          <PixelFlower className="sprite sprite-sm" />
          <PixelWheat className="sprite sprite-sm" />
          <PixelMushroom className="sprite sprite-sm" />
        </div>
      </aside>

      <div className="content">
        <main className="main">
          {loading && <p className="empty">Loading your Base…</p>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <>
              {tab === "products" && <Products products={products} />}
              {tab === "orders" && (
                <Orders orders={orders} orderProducts={orderProducts} products={products} />
              )}
              {tab === "recipes" && <Recipes products={products} />}
              {tab === "plan" && <Plan products={products} />}
            </>
          )}
        </main>

        <footer className="footer">
          <span>
            Products and orders are read live from the Feishu Base. Recipes and plans are kept in
            this browser only.
          </span>
        </footer>
      </div>
    </div>
  );
}
