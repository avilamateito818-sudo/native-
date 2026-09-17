const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

const publicDir = path.join(__dirname, "..");

app.use(express.json());
app.use(express.static(publicDir, { extensions: ["html"] }));

app.get("/api/productos", (req, res) => {
  res.json({
    ok: true,
    data: [
      { id: 1, nombre: "Sérum Glow Radiante", categoria: "Cuidado Facial", precio: 28 },
      { id: 2, nombre: "Crema Hidratante Rosa", categoria: "Cuidado Facial", precio: 22 },
      { id: 3, nombre: "Labial Terciopelo Nude", categoria: "Maquillaje", precio: 14 },
      { id: 4, nombre: "Perfume Flor de Noche", categoria: "Fragancias", precio: 45 }
    ],
    total: 4
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Recurso no encontrado" });
});

app.listen(PORT, () => {
  console.log(`✨ Native Origen disponible en http://localhost:${PORT}`);
});