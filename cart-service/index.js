import express from "express";

const app = express();
app.use(express.json());

// carrito en memoria: { productId: quantity }
const cart = {};

app.get("/cart", (_, res) => {
  const items = Object.entries(cart).map(([productId, quantity]) => ({
    productId: Number(productId),
    quantity
  }));
  res.json(items);
});

app.post("/cart/add", (req, res) => {
  const { productId, quantity } = req.body ?? {};
  if (!productId || !quantity) return res.status(400).json({ error: "productId y quantity requeridos" });

  cart[productId] = (cart[productId] ?? 0) + Number(quantity);
  res.json({ ok: true });
});

app.post("/cart/set", (req, res) => {
  const { productId, quantity } = req.body ?? {};
  if (!productId || quantity == null) return res.status(400).json({ error: "productId y quantity requeridos" });

  const q = Number(quantity);
  if (q <= 0) delete cart[productId];
  else cart[productId] = q;

  res.json({ ok: true });
});

app.delete("/cart/item/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  delete cart[productId];
  res.json({ ok: true });
});

app.delete("/cart/clear", (_, res) => {
  for (const k of Object.keys(cart)) delete cart[k];
  res.json({ ok: true });
});

app.listen(3000, () => console.log("cart-service on 3000"));
