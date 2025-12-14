import express from "express";

const app = express();

const products = [
  { id: 1, name: "Mayonesa", description: "Mayonesa clásica 390g", price: 39.90, image: "https://i5.walmartimages.com/asr/c4326ed2-02b9-4d72-80ae-8f22dd0ecd59_1.102d673cb13b7e7580dd7bdf96506d13.jpeg" },
  { id: 2, name: "Atún", description: "Atún en agua 140g", price: 25.90, image: "https://style.shockvisual.net/wp-content/uploads/2021/03/Clasico-Aceite-2020-SIN-SOYA_Lata-Abierta.jpg" },
  { id: 3, name: "Café", description: "Café molido 250g", price: 89.90, image: "https://th.bing.com/th/id/R.ba44a729acbec277ce1890cd622c10b2?rik=gYdu%2bG4uXm0e4w&riu=http%3a%2f%2feasydespensa.com%2fwp-content%2fuploads%2f2020%2f05%2fCafe_Nestle_Clasico-1.jpg&ehk=ruFu7K0VaMd8vtw6uhvAt0261Gv2%2fEXVIF6%2fQI1%2bk20%3d&risl=&pid=ImgRaw&r=0" },
  { id: 4, name: "Arroz", description: "Arroz 1kg", price: 32.50, image: "https://m.media-amazon.com/images/I/71Y5xqMnLDL._AC_SL1500_.jpg" }
];

app.get("/products", (req, res) => {
  const q = (req.query.q ?? "").toString().trim().toLowerCase();
  if (!q) return res.json(products);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
  res.json(filtered);
});

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: "No encontrado" });
  res.json(p);
});

app.listen(3000, () => console.log("catalog-service on 3000"));
