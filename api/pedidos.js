// ruta API Vercel: GET/POST /api/pedidos
const { leerCatalogo, guardarCatalogo, cabeceras } = require("./_db.js");

module.exports = async (req, res) => {
  cabeceras(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const cat = await leerCatalogo();

  if (req.method === "POST") {
    const pedidos = (req.body && req.body.pedidos) || req.body;
    if (!Array.isArray(pedidos)) {
      return res.status(400).json({ ok: false, message: "Formato inválido: se esperaba un arreglo de pedidos" });
    }
    const catActual = cat || {};
    catActual.pedidos = pedidos;
    await guardarCatalogo(catActual);
    return res.status(200).json({ ok: true, message: "Pedidos guardados con éxito" });
  }

  res.status(200).json({ ok: true, data: (cat && cat.pedidos) || [] });
};