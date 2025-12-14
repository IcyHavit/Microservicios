import express from "express";

const app = express();
app.use(express.json());

// CORS simple (para que el frontend en :8080 pueda llamar al gateway :3000)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});


const CATALOG = "http://catalog:3000";
const CART = "http://cart:3000";
const INVENTORY = "http://inventory:3000";
const CHECKOUT = "http://checkout:3000";

async function forward(req, res, baseUrl, pathRewritePrefix) {
  try {
    const targetPath = req.originalUrl.replace(pathRewritePrefix, "");
    const url = baseUrl + targetPath;

    const opts = {
      method: req.method,
      headers: { "Content-Type": "application/json" }
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
      opts.body = JSON.stringify(req.body ?? {});
    }

    const r = await fetch(url, opts);
    const text = await r.text();

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Gateway error" });
  }
}

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/catalog", (req, res) => forward(req, res, CATALOG, "/api/catalog"));
app.use("/api/cart", (req, res) => forward(req, res, CART, "/api/cart"));
app.use("/api/inventory", (req, res) => forward(req, res, INVENTORY, "/api/inventory"));
app.use("/api/checkout", (req, res) => forward(req, res, CHECKOUT, "/api/checkout"));

app.listen(3000, () => console.log("api-gateway on 3000"));
