// Streams attachment files (product photos) out of Feishu.
//   GET /api/media/<file_token>

const API = "https://open.feishu.cn/open-apis";
const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;

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

export default async (req) => {
  try {
    const fileToken = new URL(req.url).pathname.split("/").pop();
    if (!fileToken) return new Response("Missing file token", { status: 400 });

    const upstream = await fetch(`${API}/drive/v1/medias/${fileToken}/download`, {
      headers: { Authorization: `Bearer ${await tenantToken()}` },
    });
    if (!upstream.ok) return new Response("Not found", { status: upstream.status });

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return new Response(err.message ?? String(err), { status: 500 });
  }
};