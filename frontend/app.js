const API = "http://localhost:3000";

function setMsg(t) { document.getElementById("msg").textContent = t; }

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

async function loadProducts() {
  const q = document.getElementById("q").value.trim();
  const url = q ? `/api/catalog/products?q=${encodeURIComponent(q)}` : `/api/catalog/products`;
  const products = await api(url);

  const el = document.getElementById("products");
  el.innerHTML = "";

  for (const p of products) {
    const card = document.createElement("div");
    card.style.border = "1px solid #ddd";
    card.style.borderRadius = "10px";
    card.style.padding = "10px";
    card.innerHTML = `
      <img src="${p.image}" style="width:100%; border-radius:8px;" />
      <div style="margin-top:6px;"><b>${p.name}</b></div>
      <div style="font-size:13px;">${p.description}</div>
      <div style="margin-top:6px;">$${p.price.toFixed(2)}</div>
      <button style="margin-top:8px;" data-id="${p.id}">Agregar</button>
    `;
    card.querySelector("button").onclick = () => addToCart(p.id);
    el.appendChild(card);
  }

  setMsg("Catálogo cargado ✅");
}

async function addToCart(productId) {
  await api(`/api/cart/cart/add`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity: 1 })
  });
  setMsg("Agregado al carrito ✅");
}

async function loadCart() {
  const items = await api(`/api/cart/cart`);
  const cartEl = document.getElementById("cart");

  if (items.length === 0) {
    cartEl.textContent = "Carrito vacío";
    setMsg("Carrito vacío");
    return;
  }

  // Enriquecer con catálogo
  let total = 0;
  const lines = [];
  for (const it of items) {
    const p = await api(`/api/catalog/products/${it.productId}`);
    const sub = p.price * it.quantity;
    total += sub;
    lines.push({ ...it, name: p.name, price: p.price, sub });
  }

  cartEl.innerHTML = `
    ${lines.map(r => `
      <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;">
        <div>${r.name} x${r.quantity}</div>
        <div>
          $${r.sub.toFixed(2)}
          <button onclick="removeItem(${r.productId})">X</button>
        </div>
      </div>
    `).join("")}
    <div style="margin-top:10px;"><b>Total:</b> $${total.toFixed(2)}</div>
  `;
  setMsg("Carrito cargado ✅");
}

async function removeItem(productId) {
  await api(`/api/cart/cart/item/${productId}`, { method: "DELETE" });
  await loadCart();
  setMsg("Item eliminado ✅");
}

async function clearCart() {
  await api(`/api/cart/cart/clear`, { method: "DELETE" });
  await loadCart();
  setMsg("Carrito vaciado ✅");
}

async function loadInventory() {
  const inv = await api(`/api/inventory/inventory`);
  const invEl = document.getElementById("inventory");

  if (inv.length === 0) {
    invEl.textContent = "Sin inventario";
    return;
  }

  // Enriquecer con nombres
  const rows = [];
  for (const it of inv) {
    const p = await api(`/api/catalog/products/${it.productId}`);
    rows.push({ ...it, name: p.name });
  }

  invEl.innerHTML = rows.map(r => `
    <div style="border-bottom:1px solid #eee; padding:6px 0;">
      ${r.name} (id=${r.productId}) → stock: <b>${r.stock}</b>
    </div>
  `).join("");
  setMsg("Inventario cargado ✅");
}

async function checkout() {
  try {
    const r = await api(`/api/checkout/checkout`, { method: "POST", body: JSON.stringify({}) });
    setMsg(`✅ ${r.message}. Total: $${r.total.toFixed(2)}`);
    await loadInventory();
    await loadCart();
  } catch (e) {
    setMsg(`❌ ${e.error || "No se pudo comprar"}`);
  }
}

loadProducts();
