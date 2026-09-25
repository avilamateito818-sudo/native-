// Auxiliar de persistencia compartido por las rutas /api/* (Vercel).
// Guarda el catálogo completo en Vercel Blob con una copia por guardado
// (ruta versionada por fecha) para que la lectura siempre obtenga los
// datos recién escritos sin que interfiera la caché del CDN público.
// Respaldo local en data/catalogo.json cuando Blob no está disponible.
const fs = require("fs");
const path = require("path");
const { list, put, del, head } = require("@vercel/blob");

const PREFIJO = "native/catalogo";
const CLAVE_FIJA = PREFIJO + ".json";
const MAX_COPIAS = 8;

function niceTs(d) {
  return d.toISOString().replace(/[:.]/g, "-");
}

async function leerDeBlob(blob) {
  const r = await fetch(blob.url + "?t=" + Date.now(), { cache: "no-store" });
  if (!r.ok) throw new Error("Blob status " + r.status);
  const j = await r.json();
  if (!j || !Array.isArray(j.productos)) throw new Error("Blob sin productos");
  return j;
}

async function leerCatalogo() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    for (let i = 0; i < 3; i++) {
      try {
        const l = await list({ prefix: PREFIJO });
        if (l.blobs.length) {
          const blobs = l.blobs.slice().sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
          return await leerDeBlob(blobs[0]);
        }
      } catch (e) {
        if (i === 2) break;
        await new Promise((r) => setTimeout(r, 150));
      }
    }
    try {
      const fijo = await head(CLAVE_FIJA, { access: "public" });
      return await leerDeBlob(fijo);
    } catch (e) {}
  }
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "catalogo.json"), "utf-8"));
  } catch (e) {
    return null;
  }
}

async function guardarCatalogo(cat) {
  cat.fechaActualizacion = new Date().toISOString();
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    const clave = PREFIJO + "/" + niceTs(new Date()) + ".json";
    await put(clave, JSON.stringify(cat), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 0
    });
  } catch (e) {
    // Blob suspendido/caido: la tienda sigue leyendo el respaldo local.
    // Nunca propagamos el error para no devolver 500 al panel.
    return false;
  }
  try {
    const l = await list({ prefix: PREFIJO });
    const viejos = l.blobs
      .map((b) => b.pathname)
      .filter((p) => p !== clave)
      .sort()
      .reverse();
    const sobrantes = viejos.slice(MAX_COPIAS - 1);
    if (sobrantes.length) await del([...sobrantes]);
  } catch (e) {}
  return true;
}

function cabeceras(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = { leerCatalogo, guardarCatalogo, cabeceras };