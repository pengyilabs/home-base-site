import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only proxy: forward /api/* to the deployed site so `npm run dev` shows
// real data without running Netlify Functions locally. Uses fetch() (not a raw
// socket) so it also works in environments that route egress through a proxy.
const API_ORIGIN = "https://home-base-site.netlify.app";

function devApiProxy() {
  return {
    name: "dev-api-proxy",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();
        try {
          const upstream = await fetch(API_ORIGIN + req.url, {
            headers: { accept: req.headers.accept || "*/*" },
          });
          res.statusCode = upstream.status;
          upstream.headers.forEach((value, key) => {
            if (!["content-encoding", "content-length", "transfer-encoding", "connection"].includes(key)) {
              res.setHeader(key, value);
            }
          });
          res.end(Buffer.from(await upstream.arrayBuffer()));
        } catch (err) {
          res.statusCode = 502;
          res.end(`dev api proxy error: ${err.message}`);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiProxy()],
  server: {
    host: true,
  },
});