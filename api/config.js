// ruta API Vercel: GET/POST /api/config
const { leerCatalogo, guardarCatalogo, cabeceras } = require("./_db.js");

module.exports = async (req, res) => {
  cabeceras(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const cat = await leerCatalogo();

  if (req.method === "POST") {
    const cfg = (req.body && req.body.configTienda) || req.body;
    if (!cfg || typeof cfg !== "object") {
      return res.status(400).json({ ok: false, message: "Formato inválido: se esperaba un objeto de configuración" });
    }
    const catActual = cat || {};
    catActual.configTienda = cfg;
    await guardarCatalogo(catActual);
    return res.status(200).json({ ok: true, message: "Configuración de tienda guardada con éxito" });
  }

  res.status(200).json({ ok: true, data: (cat && cat.configTienda) || null });
};