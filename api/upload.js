// ruta API Vercel: POST /api/upload
// Sube una imagen (logo del negocio) a Vercel Blob y devuelve su URL pública.
// Recibe JSON: { mime, filename, data(base64 dataURL), anteriorLogoUrl(opcional) }
const { put, del } = require("@vercel/blob");

const MAX_BYTES = 6 * 1024 * 1024;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Método no permitido" });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ ok: false, message: "Almacenamiento en la nube no configurado en este entorno" });
  }

  const { mime, filename, data } = req.body || {};
  const base64 = String(data || "").replace(/^data:[^;]+;base64,/, "");
  if (!base64) return res.status(400).json({ ok: false, message: "No se recibieron datos de imagen" });

  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length || buffer.length > MAX_BYTES) {
    return res.status(400).json({ ok: false, message: "Imagen vacía o demasiado grande (máximo 6 MB)" });
  }

  const ext = (filename && String(filename).split(".").pop()) || (mime && String(mime).split("/")[1]) || "png";
  const clave = "native/media/logo-" + Date.now() + "." + ext.replace(/[^a-z0-9]/gi, "");

  try {
    const nuevo = await put(clave, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: mime || "image/png",
      cacheControlMaxAge: 0
    });

    const anterior = req.body && req.body.anteriorLogoUrl;
    if (anterior && /blob\.vercel-storage\.com/.test(anterior)) {
      try { await del(anterior); } catch (e) {}
    }

    return res.status(200).json({ ok: true, url: nuevo.url });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Error al subir la imagen: " + e.message });
  }
};