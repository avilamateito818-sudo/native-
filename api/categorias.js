// ruta API Vercel: GET/POST /api/categorias
const { leerCatalogo, guardarCatalogo, cabeceras } = require("./_db.js");

module.exports = async (req, res) => {
  cabeceras(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const cat = await leerCatalogo();

  if (req.method === "POST") {
    const cats = (req.body && req.body.categorias) || req.body;
    if (!cats || typeof cats !== "object") {
      return res.status(400).json({ ok: false, message: "Formato inválido: se esperaba un objeto de categorías" });
    }
    const catActual = cat || {};
    catActual.categorias = cats;
    const synced = await guardarCatalogo(catActual);
    return res.status(200).json({
      ok: true,
      synced,
      message: synced ? "Categorías guardadas con éxito" : "Categorías guardadas en este dispositivo (almacenamiento del servidor no disponible)"
    });
  }

  res.status(200).json({ ok: true, data: (cat && cat.categorias) || {} });
};