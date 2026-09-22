// ruta API Vercel: GET/POST /api/config
const fs = require("fs");
const path = require("path");

const catalogoPath = path.join(__dirname, "..", "data", "catalogo.json");

function leerCatalogo() {
  try {
    return JSON.parse(fs.readFileSync(catalogoPath, "utf-8"));
  } catch (e) {
    return null;
  }
}

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const cat = leerCatalogo();

  if (req.method === "POST") {
    return res.status(200).json({ ok: true, message: "Modo solo lectura (Vercel)" });
  }

  res.status(200).json({ ok: true, data: (cat && cat.configTienda) || null });
};