const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

const publicDir = path.join(__dirname, "..");
const dataDir = path.join(publicDir, "data");
const catalogoPath = path.join(dataDir, "catalogo.json");
const productosJsPath = path.join(publicDir, "js", "productos.js");

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Servir archivos estáticos del sitio
app.use(express.static(publicDir, { extensions: ["html"] }));

// Asegurar que exista carpeta data
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.error("No se pudo crear carpeta data:", e);
  }
}

// Función auxiliar para leer catálogo
function leerCatalogo() {
  if (fs.existsSync(catalogoPath)) {
    try {
      const raw = fs.readFileSync(catalogoPath, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error leyendo catalogo.json:", e);
    }
  }
  return null;
}

// Función para generar js/productos.js (SOLO los datos por defecto).
// La lógica de lectura/escritura vive separada en js/store.js, que el
// servidor nunca toca. Así hay una única fuente de lógica en el cliente.
function generarProductosJs(catalogo) {
  if (!catalogo || !catalogo.productos) return;
  try {
    const prods = catalogo.productos || [];
    const cats = catalogo.categorias || {};
    const orden = catalogo.orden || Object.keys(cats);
    const cfg = catalogo.configTienda || {};
    const tests = catalogo.testimonios || [];

    const code = `"use strict";

/* =====================================================================
   PRODUCTOS.JS — Datos por defecto del catálogo Native Origen
   ---------------------------------------------------------------
   ARCHIVO GENERADO por el servidor (server/server.js) a partir de
   data/catalogo.json. NO editar a mano: tus cambios se perderán en la
   próxima publicación desde el Panel Administrador.

   Si editas desde Vercel/static, este archivo es la fuente de datos.
   La LÓGICA (leer/guardar/sincronizar) vive en js/store.js.
   ===================================================================== */

window.PRODUCTOS_DEFECTO = ${JSON.stringify(prods, null, 2)};

window.CATEGORIAS_DEFECTO = ${JSON.stringify(cats, null, 2)};

window.ORDEN_CATEGORIAS_DEFECTO = ${JSON.stringify(orden, null, 2)};

window.CONFIG_TIENDA_DEFECTO = ${JSON.stringify(cfg, null, 2)};

window.TESTIMONIOS_DEFECTO = ${JSON.stringify(tests, null, 2)};
`;
    fs.writeFileSync(productosJsPath, code, "utf-8");
  } catch (e) {
    console.error("Error actualizando js/productos.js:", e);
  }
}

// ============ API ENDPOINTS ============

// Obtener productos
app.get("/api/productos", (req, res) => {
  const cat = leerCatalogo();
  if (cat && cat.productos) {
    return res.json({ ok: true, data: cat.productos, total: cat.productos.length });
  }
  res.json({ ok: true, data: [], total: 0 });
});

// Guardar / Publicar productos
app.post("/api/productos", (req, res) => {
  try {
    const lista = req.body.productos || req.body;
    if (!Array.isArray(lista)) {
      return res.status(400).json({ ok: false, message: "Formato inválido: se esperaba un arreglo de productos" });
    }

    let cat = leerCatalogo() || {};
    cat.productos = lista;
    cat.fechaActualizacion = new Date().toISOString();

    fs.writeFileSync(catalogoPath, JSON.stringify(cat, null, 2), "utf-8");
    generarProductosJs(cat);

    res.json({ ok: true, message: "Productos guardados y publicados con éxito", total: lista.length });
  } catch (e) {
    console.error("Error en POST /api/productos:", e);
    res.status(500).json({ ok: false, message: "Error al guardar productos" });
  }
});

// Guardar / Publicar Categorías
app.post("/api/categorias", (req, res) => {
  try {
    const cats = req.body.categorias || req.body;
    let cat = leerCatalogo() || {};
    cat.categorias = cats;
    cat.fechaActualizacion = new Date().toISOString();

    fs.writeFileSync(catalogoPath, JSON.stringify(cat, null, 2), "utf-8");
    generarProductosJs(cat);

    res.json({ ok: true, message: "Categorías guardadas con éxito" });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error al guardar categorías" });
  }
});

// Obtener Categorías
app.get("/api/categorias", (req, res) => {
  const cat = leerCatalogo();
  res.json({ ok: true, data: cat && cat.categorias ? cat.categorias : {} });
});

// Obtener Configuración de Tienda
app.get("/api/config", (req, res) => {
  const cat = leerCatalogo();
  res.json({ ok: true, data: cat && cat.configTienda ? cat.configTienda : null });
});

// Obtener Testimonios
app.get("/api/testimonios", (req, res) => {
  const cat = leerCatalogo();
  res.json({ ok: true, data: cat && cat.testimonios ? cat.testimonios : [] });
});

// Obtener Pedidos
app.get("/api/pedidos", (req, res) => {
  const cat = leerCatalogo();
  res.json({ ok: true, data: cat && cat.pedidos ? cat.pedidos : [] });
});

// Guardar / Publicar Configuración de Tienda
app.post("/api/config", (req, res) => {
  try {
    const cfg = req.body.configTienda || req.body;
    let cat = leerCatalogo() || {};
    cat.configTienda = cfg;
    cat.fechaActualizacion = new Date().toISOString();

    fs.writeFileSync(catalogoPath, JSON.stringify(cat, null, 2), "utf-8");
    generarProductosJs(cat);

    res.json({ ok: true, message: "Configuración de tienda guardada con éxito" });
  } catch (e) {
    console.error("Error en POST /api/config:", e);
    res.status(500).json({ ok: false, message: "Error al guardar configuración de tienda" });
  }
});

// Guardar / Publicar Testimonios
app.post("/api/testimonios", (req, res) => {
  try {
    const tests = req.body.testimonios || req.body;
    let cat = leerCatalogo() || {};
    cat.testimonios = tests;
    cat.fechaActualizacion = new Date().toISOString();

    fs.writeFileSync(catalogoPath, JSON.stringify(cat, null, 2), "utf-8");
    generarProductosJs(cat);

    res.json({ ok: true, message: "Testimonios guardados con éxito" });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error al guardar testimonios" });
  }
});

// Guardar Pedidos
app.post("/api/pedidos", (req, res) => {
  try {
    const pedidos = req.body.pedidos || req.body;
    let cat = leerCatalogo() || {};
    cat.pedidos = pedidos;

    fs.writeFileSync(catalogoPath, JSON.stringify(cat, null, 2), "utf-8");
    res.json({ ok: true, message: "Pedidos guardados con éxito" });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error al guardar pedidos" });
  }
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Recurso no encontrado" });
});

app.listen(PORT, () => {
  console.log(`✨ Servidor Native Origen activo en http://localhost:${PORT}`);
});