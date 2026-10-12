import { useState } from "react";
import Orders from "./components/Orders.jsx";
import Plan from "./components/Plan.jsx";
import Products from "./components/Products.jsx";
import Recipes from "./components/Recipes.jsx";
import {
  PixelFlower,
  PixelHeart,
  PixelHouse,
  PixelLeaf,
  PixelMushroom,
  PixelStar,
  PixelTree,
  PixelWheat,
} from "./components/PixelSprites.jsx";
import { useBase } from "./lib/hooks.js";

const TABS = [
  { id: "products", label: "Products", icon: <PixelWheat className="sprite sprite-sm" /> },
  { id: "orders", label: "Orders", icon: <PixelHouse className="sprite sprite-sm" /> },
  { id: "recipes", label: "Recipes", icon: <PixelHeart className="sprite sprite-sm" /> },
  { id: "plan", label: "Plan", icon: <PixelStar className="sprite sprite-sm" /> },
];

export default function App() {
  const [tab, setTab] = useState("products");
  const { loading, error, products, orders, orderProducts } = useBase();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-sprites">
            <PixelHouse className="sprite sprite-md" />
            <PixelFlower className="sprite sprite-sm" />
            <PixelTree className="sprite sprite-sm" />
          </div>
          <div>
            <h1>Home Base</h1>
            <p className="tagline">Live from Feishu · no account needed</p>
          </div>
          <div className="brand-sprites" style={{ marginLeft: "auto" }}>
            <PixelMushroom className="sprite sprite-sm" />
            <PixelStar className="sprite sprite-sm" />
          </div>
        </div>

        <div className="header-decor">
          <PixelWheat className="sprite" />
          <PixelFlower className="sprite" />
          <PixelLeaf className="sprite" />
          <PixelTree className="sprite" />
          <PixelMushroom className="sprite" />
          <PixelHeart className="sprite" />
          <PixelStar className="sprite" />
          <PixelFlower className="sprite" />
          <PixelWheat className="sprite" />
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
        <div className="header-decor" style={{ padding: "4px 0" }}>
          <PixelFlower className="sprite" />
          <PixelWheat className="sprite" />
          <PixelMushroom className="sprite" />
          <PixelLeaf className="sprite" />
          <PixelStar className="sprite" />
        </div>
        <span>
          Products and orders are read live from the Feishu Base. Recipes and plans are kept in this
          browser only.
        </span>
      </footer>
    </div>
  );
}