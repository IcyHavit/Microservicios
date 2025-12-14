import express from "express";

const app = express();
app.use(express.json());

const CART = "http://cart:3000";
const CATALOG = "http://catalog:3000";
const INVENTORY = "http://inventory:3000";

async function getJson(url, opts) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!r.ok) throw { status: r.status, data };
  return data;
}

app.post("/checkout", async (_, res) => {
  try {
    // 1) Obtener carrito
    const cart = await getJson(`${CART}/cart`);
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    // 2) Validar stock y armar items con datos del catálogo
    const items = [];
    let total = 0;

    for (const it of cart) {
      const product = await getJson(`${CATALOG}/products/${it.productId}`);
      const inv = await getJson(`${INVENTORY}/inventory/${it.productId}`);

      if ((inv.stock ?? 0) < it.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
      }

      const sub = product.price * it.quantity;
      total += sub;

      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: it.quantity,
        subtotal: Number(sub.toFixed(2))
      });
    }

    // 3) Descontar inventario (si algo falla aquí, en memoria no hay transacciones, pero para práctica está OK)
    for (const it of items) {
      await getJson(`${INVENTORY}/inventory/decrease`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: it.productId, quantity: it.quantity })
      });
    }

    // 4) Vaciar carrito
    await fetch(`${CART}/cart/clear`, { method: "DELETE" });

    res.json({
      ok: true,
      items,
      total: Number(total.toFixed(2)),
      message: "Compra realizada"
    });
  } catch (e) {
    res.status(500).json({ error: "Checkout error", detail: e?.data ?? null });
  }
});

app.listen(3000, () => console.log("checkout-service on 3000"));
