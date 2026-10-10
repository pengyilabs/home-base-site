// Reads records from the Feishu Base through the OpenAPI, so the browser never
// needs Feishu credentials or a Feishu account.
//
//   GET /api/records            -> list tables [{ id, name }]
//   GET /api/records?table=xxx  -> list records for that table

const API = "https://open.feishu.cn/open-apis";
const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;
const BASE_TOKEN = process.env.FEISHU_BASE_TOKEN;

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

    const table = new URL(req.url).searchParams.get("table");

    if (!table) {
      const { items } = await lark(`/bitable/v1/apps/${BASE_TOKEN}/tables?page_size=100`);
      return json(items.map((t) => ({ id: t.table_id, name: t.name })));
    }

    const records = [];
    let pageToken = "";
    do {
      const params = new URLSearchParams({ page_size: "500" });
      if (pageToken) params.set("page_token", pageToken);
      const page = await lark(`/bitable/v1/apps/${BASE_TOKEN}/tables/${table}/records?${params}`);
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