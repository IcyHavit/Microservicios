import express from "express";

const app = express();
app.use(express.json());

// stock en memoria
const stock = {
  1: 10, // Mayonesa
  2: 8,  // Atún
  3: 5,  // Café
  4: 12  // Arroz
};

app.get("/inventory", (_, res) => {
  const items = Object.entries(stock).map(([productId, qty]) => ({
    productId: Number(productId),
    stock: qty
  }));
  res.json(items);
});

app.get("/inventory/:productId", (req, res) => {
  const id = Number(req.params.productId);
  res.json({ productId: id, stock: stock[id] ?? 0 });
});

app.post("/inventory/decrease", (req, res) => {
  const { productId, quantity } = req.body ?? {};
  if (!productId || !quantity) return res.status(400).json({ error: "productId y quantity requeridos" });

  const current = stock[productId] ?? 0;
  if (current < quantity) return res.status(400).json({ error: "Stock insuficiente" });

  stock[productId] = current - Number(quantity);
  res.json({ ok: true, remaining: stock[productId] });
});

app.post("/inventory/increase", (req, res) => {
  const { productId, quantity } = req.body ?? {};
  if (!productId || !quantity) return res.status(400).json({ error: "productId y quantity requeridos" });

  stock[productId] = (stock[productId] ?? 0) + Number(quantity);
  res.json({ ok: true, stock: stock[productId] });
});

app.listen(3000, () => console.log("inventory-service on 3000"));
