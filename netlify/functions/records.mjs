// Reads records from the Feishu Base through the OpenAPI, so the browser never
// needs Feishu credentials or a Feishu account.
//
//   GET /api/records            -> the tables this site is allowed to expose
//   GET /api/records?table=key  -> records for one of those tables
//
// Only the tables in ALLOWED are reachable. Everything else in the Base
// (vaccinations, pet records, expenses, ...) is deliberately not exposed to the
// public site, so this list is the security boundary — not a filter.

const API = "https://open.feishu.cn/open-apis";
const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;
const BASE_TOKEN = process.env.FEISHU_BASE_TOKEN;

// Public allowlist. The key is what the browser asks for; the id is the
// Feishu table it maps to. Adding a table here makes it world-readable.
const ALLOWED = {
  products: { id: "tblXMVegHFLeL3UR", name: "商品清单 (Productos)" },
  orders: { id: "tblkG8JSvW6U0jp3", name: "购买记录 (Orders)" },
  orderProducts: { id: "tblbXb5pDQeo3j9a", name: "订单商品 (Order Products)" },
};

// tenant_access_token lives ~2h; reuse it across warm invocations.
let cachedToken = null;
let cachedUntil = 0;

async function tenantToken() {
  if (cachedToken && Date.now() < cachedUntil) return cachedToken;

  const res = await fetch(`${API}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Feishu auth failed (${data.code}): ${data.msg}`);

  cachedToken = data.tenant_access_token;
  cachedUntil = Date.now() + Math.max(60, data.expire - 300) * 1000;
  return cachedToken;
}

async function lark(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${await tenantToken()}` },
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Feishu error (${data.code}): ${data.msg}`);
  return data.data;
}

function json(body, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

// Feishu returns rich cell objects (text segments, select options, user refs,
// attachments, linked records). Flatten them into plain values for the browser.
function normalizeCell(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    // Attachment cells are arrays of file objects: keep them structured so the
    // browser can render images instead of "[object Object]".
    if (value.length && value.every((v) => v && typeof v === "object" && v.file_token)) {
      return value.map((file) => ({
        type: "attachment",
        name: file.name ?? "",
        url: `/api/media/${file.file_token}`,
      }));
    }
    const parts = value.map(normalizeCell).filter((v) => v !== null && v !== "");
    return parts.length ? parts.join(", ") : null;
  }

  if (value.file_token) {
    return { type: "attachment", name: value.name ?? "", url: `/api/media/${value.file_token}` };
  }
  if (typeof value.text === "string") return value.text;
  if (typeof value.name === "string") return value.name;
  if (typeof value.link === "string") return value.link;
  return null;
}

function normalizeRecord(record) {
  const fields = {};
  for (const [name, value] of Object.entries(record.fields ?? {})) {
    fields[name] = normalizeCell(value);
  }
  return { id: record.record_id, fields };
}

export default async (req) => {
  try {
    if (!APP_ID || !APP_SECRET || !BASE_TOKEN) {
      return json({ error: "Missing FEISHU_APP_ID / FEISHU_APP_SECRET / FEISHU_BASE_TOKEN" }, { status: 500 });
    }

    const requested = new URL(req.url).searchParams.get("table");

    if (!requested) {
      return json(
        Object.entries(ALLOWED).map(([key, table]) => ({ key, id: table.id, name: table.name }))
      );
    }

    const entry =
      ALLOWED[requested] ?? Object.values(ALLOWED).find((table) => table.id === requested);
    if (!entry) {
      return json({ error: `Table not exposed by this site: ${requested}` }, { status: 404 });
    }

    const records = [];
    let pageToken = "";
    do {
      const params = new URLSearchParams({ page_size: "500" });
      if (pageToken) params.set("page_token", pageToken);
      const page = await lark(`/bitable/v1/apps/${BASE_TOKEN}/tables/${entry.id}/records?${params}`);
      records.push(...(page.items ?? []).map(normalizeRecord));
      pageToken = page.has_more ? page.page_token : "";
    } while (pageToken);

    // Short cache keeps the Base feeling live while staying well inside the
    // 20 requests/second OpenAPI limit.
    return json(records, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" } });
  } catch (err) {
    return json({ error: err.message ?? String(err) }, { status: 500 });
  }
};