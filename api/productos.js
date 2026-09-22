// ruta API Vercel: GET/POST /api/productos
// Lee el catálogo desde Vercel Blob (multidispositivo) y, si aún no hay
// blob, usa data/catalogo.json del repo como respaldo inicial.
const { leerCatalogo, guardarCatalogo, cabeceras } = require("./_db.js");

module.exports = async (req, res) => {
  cabeceras(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const cat = await leerCatalogo();
  const productos = (cat && cat.productos) || [];

  if (req.method === "POST") {
    const lista = (req.body && req.body.productos) || req.body;
    if (!Array.isArray(lista)) {
      return res.status(400).json({ ok: false, message: "Formato inválido: se esperaba un arreglo de productos" });
    }
    const catActual = cat || {};
    catActual.productos = lista;
    await guardarCatalogo(catActual);
    return res.status(200).json({ ok: true, message: "Productos guardados y publicados con éxito", total: lista.length });
  }

  res.status(200).json({ ok: true, data: productos, total: productos.length });
};