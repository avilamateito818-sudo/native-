"use strict";

/* =====================================================================
   STORE.JS — Capa de datos compartida de Native Origen
   ---------------------------------------------------------------
   Responsabilidad ÚNICA: lectura/escritura de datos (productos,
   categorías, config, testimonios, pedidos) con persistencia local
   (localStorage) y sincronización opcional con el servidor /api/*.

   Los DATOS por defecto viven en js/productos.js (generado por el
   servidor a partir de data/catalogo.json). Este archivo NO se
   regenera: solo contiene lógica.
   ===================================================================== */

window.obtenerProductos = function() {
  try {
    const raw = localStorage.getItem("NATIVE_PRODUCTOS");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return window.PRODUCTOS_DEFECTO;
};

window.guardarProductos = function(lista) {
  try {
    localStorage.setItem("NATIVE_PRODUCTOS", JSON.stringify(lista));
    window.PRODUCTOS = lista;
    window.dispatchEvent(new CustomEvent("productosActualizados", { detail: lista }));

    // Sincronizar en segundo plano con el servidor si está activo
    if (window.fetch) {
      fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos: lista })
      }).catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
};

window.obtenerCategorias = function() {
  try {
    const raw = localStorage.getItem("NATIVE_CATEGORIAS");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {}
  return window.CATEGORIAS_DEFECTO;
};

window.guardarCategorias = function(cats) {
  try {
    localStorage.setItem("NATIVE_CATEGORIAS", JSON.stringify(cats));
    window.CATEGORIAS = cats;
    window.dispatchEvent(new CustomEvent("categoriasActualizadas", { detail: cats }));
    if (window.fetch) {
      fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorias: cats })
      }).catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
};

window.obtenerConfigTienda = function() {
  try {
    const raw = localStorage.getItem("NATIVE_CONFIG_TIENDA");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return { ...window.CONFIG_TIENDA_DEFECTO, ...parsed };
    }
  } catch (e) {}
  return { ...window.CONFIG_TIENDA_DEFECTO };
};

window.guardarConfigTienda = function(cfg) {
  try {
    localStorage.setItem("NATIVE_CONFIG_TIENDA", JSON.stringify(cfg));
    window.CONFIG_TIENDA = cfg;
    window.dispatchEvent(new CustomEvent("configTiendaActualizada", { detail: cfg }));
    if (window.fetch) {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configTienda: cfg })
      }).catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
};

window.obtenerTestimonios = function() {
  try {
    const raw = localStorage.getItem("NATIVE_TESTIMONIOS");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return window.TESTIMONIOS_DEFECTO;
};

window.guardarTestimonios = function(lista) {
  try {
    localStorage.setItem("NATIVE_TESTIMONIOS", JSON.stringify(lista));
    window.TESTIMONIOS = lista;
    window.dispatchEvent(new CustomEvent("testimoniosActualizados", { detail: lista }));
    if (window.fetch) {
      fetch("/api/testimonios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonios: lista })
      }).catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
};

window.obtenerPedidos = function() {
  try {
    const raw = localStorage.getItem("NATIVE_PEDIDOS");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

window.guardarPedidos = function(lista) {
  try {
    localStorage.setItem("NATIVE_PEDIDOS", JSON.stringify(lista));
    window.PEDIDOS = lista;
    window.dispatchEvent(new CustomEvent("pedidosActualizados", { detail: lista }));
    if (window.fetch) {
      fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidos: lista })
      }).catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
};

window.restablecerCatalogo = function() {
  try {
    localStorage.removeItem("NATIVE_PRODUCTOS");
    localStorage.removeItem("NATIVE_CATEGORIAS");
    localStorage.removeItem("NATIVE_CONFIG_TIENDA");
    localStorage.removeItem("NATIVE_TESTIMONIOS");
    localStorage.removeItem("NATIVE_PEDIDOS");
    window.PRODUCTOS = [...window.PRODUCTOS_DEFECTO];
    window.CATEGORIAS = { ...window.CATEGORIAS_DEFECTO };
    window.ORDEN_CATEGORIAS = [...window.ORDEN_CATEGORIAS_DEFECTO];
    window.CONFIG_TIENDA = { ...window.CONFIG_TIENDA_DEFECTO };
    window.TESTIMONIOS = [...window.TESTIMONIOS_DEFECTO];
    window.PEDIDOS = [];
    window.dispatchEvent(new CustomEvent("productosActualizados", { detail: window.PRODUCTOS }));
    window.dispatchEvent(new CustomEvent("categoriasActualizadas", { detail: window.CATEGORIAS }));
    window.dispatchEvent(new CustomEvent("configTiendaActualizada", { detail: window.CONFIG_TIENDA }));
    window.dispatchEvent(new CustomEvent("testimoniosActualizados", { detail: window.TESTIMONIOS }));
    if (window.fetch) {
      fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos: window.PRODUCTOS_DEFECTO })
      }).catch(() => {});
      fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorias: window.CATEGORIAS_DEFECTO })
      }).catch(() => {});
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configTienda: window.CONFIG_TIENDA_DEFECTO })
      }).catch(() => {});
      fetch("/api/testimonios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonios: window.TESTIMONIOS_DEFECTO })
      }).catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
};

/* Sincronizar una sola vez con el servidor: si hay catálogo guardado en el
   backend (data/catalogo.json), se trae a este navegador y se re-renderiza. */
window.sincronizarDesdeServidor = function(callback) {
  if (!window.fetch) {
    if (callback) callback(false);
    return;
  }

  const tareas = [
    ["/api/productos", window.guardarProductos, (d) => Array.isArray(d) && d.length > 0],
    ["/api/categorias", window.guardarCategorias, (d) => d && typeof d === "object" && Object.keys(d).length > 0],
    ["/api/config", window.guardarConfigTienda, (d) => d && typeof d === "object" && Object.keys(d).length > 0],
    ["/api/testimonios", window.guardarTestimonios, (d) => Array.isArray(d) && d.length > 0],
    ["/api/pedidos", window.guardarPedidos, (d) => Array.isArray(d)]
  ];

  let terminadas = 0;
  let huboDatos = false;

  tareas.forEach(([url, guardar, valido]) => {
    if (typeof guardar !== "function") { terminadas++; return; }
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json && json.ok && valido(json.data)) {
          guardar(json.data);
          huboDatos = true;
        }
      })
      .catch(() => {})
      .finally(() => {
        terminadas++;
        if (terminadas === tareas.length && callback) callback(huboDatos);
      });
  });
};

/* Inicializar datos globales (js/productos.js debe cargarse antes) */
window.PRODUCTOS = window.obtenerProductos();
window.CATEGORIAS = window.obtenerCategorias();
window.ORDEN_CATEGORIAS = window.ORDEN_CATEGORIAS_DEFECTO;
window.CONFIG_TIENDA = window.obtenerConfigTienda();
window.TESTIMONIOS = window.obtenerTestimonios();
window.PEDIDOS = window.obtenerPedidos();