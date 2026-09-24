// ruta API Vercel: GET/POST /api/pedidos
const { leerCatalogo, guardarCatalogo, cabeceras } = require("./_db.js");

/* Fusiona pedidos por id (dedupe) para que un guardado desde un
   dispositivo no borre pedidos creados desde otro. */
function fusionarPedidos(existentes, entrantes) {
  const mapa = new Map();
  (existentes || []).forEach((p) => {
    if (p && p.id !== undefined && p.id !== null) mapa.set(String(p.id), p);
  });
  (entrantes || []).forEach((p) => {
    if (p && p.id !== undefined && p.id !== null) mapa.set(String(p.id), p);
  });
  const conId = Array.from(mapa.values());
  const sinId = (existentes || []).concat(entrantes || []).filter(
    (p) => !p || p.id === undefined || p.id === null
  );
  return conId.concat(sinId);
}

module.exports = async (req, res) => {
  cabeceras(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const cat = await leerCatalogo();

  if (req.method === "POST") {
    const pedidos = (req.body && req.body.pedidos) || req.body;
    if (!Array.isArray(pedidos)) {
      return res.status(400).json({ ok: false, message: "Formato inválido: se esperaba un arreglo de pedidos" });
    }
    const previos = (cat && Array.isArray(cat.pedidos)) ? cat.pedidos : [];
    const catActual = cat || {};
    catActual.pedidos = pedidos.length > 0 ? fusionarPedidos(previos, pedidos) : [];
    await guardarCatalogo(catActual);
    return res.status(200).json({ ok: true, message: "Pedidos guardados con éxito", data: catActual.pedidos });
  }

  res.status(200).json({
    ok: true,
    data: (cat && cat.pedidos) || [],
    updateAt: cat && cat.fechaActualizacion ? new Date(cat.fechaActualizacion).getTime() : null
  });
};