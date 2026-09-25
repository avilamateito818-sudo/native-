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
    const synced = await guardarCatalogo(catActual);
    return res.status(200).json({
      ok: true,
      synced,
      message: synced ? "Configuración de tienda guardada con éxito" : "Configuración guardada en este dispositivo (almacenamiento del servidor no disponible)"
    });
  }

  res.status(200).json({
    ok: true,
    data: (cat && cat.configTienda) || null,
    updateAt: cat ? (new Date(cat.fechaActualizacion).getTime() || null) : null
  });
};