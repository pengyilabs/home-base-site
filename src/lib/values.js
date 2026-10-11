// Helpers for turning Feishu cell values into something displayable.
//
// Feishu is loose about types: the same logical "price" arrives as the string
// "46.9" in one table and the number 59.9 in another, and datetime fields come
// back as epoch milliseconds. Everything is coerced here so components stay
// dumb.

/** Parse a numeric cell. Returns null when there is no usable number. */
export function num(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Format a price in yuan, trimming pointless decimals (¥46.9, ¥308.40). */
export function money(value) {
  const n = num(value);
  if (n === null) return null;
  const fixed = n.toFixed(2);
  return `¥${fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed}`;
}

/** Format an epoch-millisecond cell as a short local date. */
export function formatDate(value) {
  const ms = num(value);
  if (ms === null) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** Coerce a number-ish cell to a display string without trailing zeros. */
export function formatQty(value) {
  const n = num(value);
  if (n === null) return null;
  return String(n);
}

/* --- product naming -------------------------------------------------------
 * Products carry three names. English and Chinese are complete, Spanish is
 * present on ~78% of rows, so English leads and Spanish only shows when set. */

export const productName = (fields) => fields["English Name"] || fields["产品名称"] || "(unnamed)";
export const productNameZh = (fields) => fields["产品名称"] || null;
export const productNameEs = (fields) => fields["Nombre en Español"] || null;

/** First attachment url on a cell, or null. */
export function imageUrl(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const first = list.find((v) => v && typeof v === "object" && v.url);
  return first?.url ?? null;
}

/** Normalised storage value (常温 / 冷藏 / 冷冻) or null. */
export function storage(fields) {
  const value = fields["存储方式"];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}