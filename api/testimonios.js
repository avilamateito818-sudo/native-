// ruta API Vercel: GET/POST /api/testimonios
const { leerCatalogo, guardarCatalogo, cabeceras } = require("./_db.js");

module.exports = async (req, res) => {
  cabeceras(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const cat = await leerCatalogo();

  if (req.method === "POST") {
    const tests = (req.body && req.body.testimonios) || req.body;
    if (!Array.isArray(tests)) {
      return res.status(400).json({ ok: false, message: "Formato inválido: se esperaba un arreglo de testimonios" });
    }
    const catActual = cat || {};
    catActual.testimonios = tests;
    await guardarCatalogo(catActual);
    return res.status(200).json({ ok: true, message: "Testimonios guardados con éxito" });
  }

  res.status(200).json({ ok: true, data: (cat && cat.testimonios) || [] });
};