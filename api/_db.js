// Auxiliar de persistencia compartido por las rutas /api/* (Vercel).
// Guarda el catálogo completo en Vercel Blob (multidispositivo) con
// respaldo local en data/catalogo.json cuando Blob no está disponible.
const fs = require("fs");
const path = require("path");
const { get, put } = require("@vercel/blob");

const CLAVE = "native/catalogo.json";

function cms(cat) {
  return JSON.stringify(cat);
}

async function leerCatalogo() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await get(CLAVE, { access: "public" });
      if (blob && blob.url) {
        const r = await fetch(blob.url + "?t=" + Date.now());
        if (r.ok) {
          const j = await r.json();
          if (j && typeof j === "object" && j.productos) return j;
        }
      }
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
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(CLAVE, cms(cat), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 0
    });
    return true;
  }
  return false;
}

function cabeceras(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = { leerCatalogo, guardarCatalogo, cabeceras };