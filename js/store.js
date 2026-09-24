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
      if (parsed && typeof parsed === "object") {
        const mezclado = { ...window.CONFIG_TIENDA_DEFECTO, ...parsed };
        if (parsed.tema && typeof parsed.tema === "object") {
          mezclado.tema = { ...(window.CONFIG_TIENDA_DEFECTO.tema || {}), ...parsed.tema };
        }
        return mezclado;
      }
    }
  } catch (e) {}
  return { ...window.CONFIG_TIENDA_DEFECTO };
};

window.guardarConfigTienda = function(cfg) {
  try {
    window.__CFG_DIRTY_AT = Date.now();
    localStorage.setItem("NATIVE_CONFIG_TIENDA", JSON.stringify(cfg));
    localStorage.setItem("NATIVE_CONFIG_TIENDA_AT", String(Date.now()));
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
    localStorage.removeItem("NATIVE_CONFIG_TIENDA_AT");
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
    ["/api/config", (d) => {
      // No sobreescribir una edición local reciente con datos viejos del servidor:
      // si el guardado en servidor aún no llegó (o falló), el local manda.
      const dirty = window.__CFG_DIRTY_AT || 0;
      if (Date.now() - dirty < 1500) return;
      const editado = parseInt(localStorage.getItem("NATIVE_CONFIG_TIENDA_AT") || "0", 10) || 0;
      const serverAt = window.__CFG_SERVER_AT || 0;
      if (editado && serverAt && serverAt < editado - 3000) return;
      if (d && !d.tema && window.CONFIG_TIENDA && window.CONFIG_TIENDA.tema) d = { ...d, tema: window.CONFIG_TIENDA.tema };
      window.guardarConfigTienda(d);
    }, (d) => d && typeof d === "object" && Object.keys(d).length > 0],
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
          if (url === "/api/config") window.__CFG_SERVER_AT = json.updateAt || 0;
          guardar(json.data);
          if (url === "/api/config" && window.__CFG_SERVER_AT) {
            localStorage.setItem("NATIVE_CONFIG_TIENDA_AT", String(window.__CFG_SERVER_AT));
          }
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

/* =====================================================================
   APARIENCIA (tema) — convierte el objeto `tema` de la configuración
   en variables CSS sobre <html>, repintando la página al instante.
   Se aplica en la tienda y, si se elige, también en el panel admin.
   ===================================================================== */

const FUENTES_TITULOS = [
  "Playfair Display", "Lora", "Merriweather", "Cormorant Garamond",
  "Montserrat", "Poppins", "Quicksand", "Raleway", "Josefin Sans"
];
const FUENTES_TEXTO = [
  "DM Sans", "Inter", "Nunito Sans", "Montserrat", "Poppins",
  "Raleway", "Quicksand", "Source Sans 3"
];
window.FUENTES_TITULOS = FUENTES_TITULOS;
window.FUENTES_TEXTO = FUENTES_TEXTO;

function aMayus(nombre) {
  return nombre.split(/[\s-]+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

window.aplicarTema = function(tema) {
  const t = tema || {};
  const set = (prop, valor, sufijo) => {
    if (valor === undefined || valor === null || valor === "") return;
    document.documentElement.style.setProperty(prop, sufijo ? valor + sufijo : valor);
  };
  const hexRgb = (hex) => {
    if (!hex) return "0, 0, 0";
    let h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    if (isNaN(n)) return "0, 0, 0";
    return ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
  };

  const paleta = {
    wine: t.wine || "#5e1a33",
    wineDark: t.wineDark || "#3f1022",
    blush: t.blush || "#f4e3dd",
    cream: t.cream || "#fbf6f0",
    gold: t.gold || "#c8a96e",
    goldLight: t.goldLight || "#e9d9b8",
    charcoal: t.charcoal || "#241b20",
    muted: t.muted || "#8a7780",
    white: t.white || "#ffffff"
  };
  Object.keys(paleta).forEach((k) => {
    set("--" + k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()), paleta[k]);
    set("--" + k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + "-rgb", hexRgb(paleta[k]));
  });

  set("--nav-bg-rgb", hexRgb(t.navBg || "#fbf6f0"));
  set("--hero-start", t.heroStart || "#fdf6ef");
  set("--hero-mid", t.heroMid || "#f6e7dd");
  set("--hero-end", t.heroEnd || "#f1dcd6");
  set("--btn-bg", t.btnBg || "#5e1a33");
  set("--btn-bg-hover", t.btnHover || "#3f1022");
  set("--btn-text", t.btnText || "#fbf6f0");
  set("--card-bg", t.cardBg || "#ffffff");
  set("--marquee-bg", t.marqueeBg || "#5e1a33");
  set("--marquee-text", t.marqueeText || "#fbf6f0");
  set("--promo-bg", t.promoBg || "#3f1022");
  set("--footer-bg", t.footerBg || "#3f1022");
  set("--footer-text", t.footerText || "#fbf6f0");
  set("--font-display", (t.fontDisplay ? '"' + aMayus(t.fontDisplay) + '", Georgia, serif' : ""));
  set("--font-body", (t.fontBody ? '"' + aMayus(t.fontBody) + '", "Segoe UI", sans-serif' : ""));
  const base = parseInt(t.fontSizeBase, 10);
  set("--font-size-base", isNaN(base) ? 16 : base, "px");
  const rad = parseInt(t.radius, 10);
  set("--radius", isNaN(rad) ? 20 : rad, "px");

  const disp = aMayus(t.fontDisplay || "Playfair Display");
  const bodyF = aMayus(t.fontBody || "DM Sans");
  const href = "https://fonts.googleapis.com/css2?family=" + disp.replace(/ /g, "+") +
    ":wght@400;500;600;700&family=" + bodyF.replace(/ /g, "+") +
    ":wght@400;500;600;700&display=swap";
  const link = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
  if (link) link.href = href;
};

/* Aplica el nombre del negocio y, si existe, el logo subido desde el panel.
   Si no hay logo, deja el monograma (primera letra) como está hoy.
   Cuando el nombre difiere del estándar, renombra también otros lugares
   fijos (pestaña, meta, copyright, historias, sidebar del admin). */
window.aplicarMarca = function(cfg) {
  if (typeof document === "undefined") return;
  const c = cfg || window.CONFIG_TIENDA || {};
  const nombre = c.nombreMarca || "Native·Origen";
  const logo = c.logoUrl || "";
  const DEFAULTS = ["Native·Origen", "Native Origen"];
  const previa = window.__MARCA_PREVIA || "";

  document.querySelectorAll(".brand__name, .admin-brand__title").forEach((el) => {
    if (el && el.textContent.trim() !== nombre) el.textContent = nombre;
  });

  document.querySelectorAll(".brand__mark, .preloader__logo, .admin-brand__mark").forEach((mark) => {
    if (!mark) return;
    if (logo) {
      let img = mark.querySelector && mark.querySelector("img");
      if (!img && mark.tagName.toLowerCase() === "img") img = mark;
      if (img) {
        img.src = logo;
        img.alt = nombre;
      } else {
        const nuevo = document.createElement("img");
        nuevo.className = "brand__logo";
        nuevo.src = logo;
        nuevo.alt = nombre;
        mark.innerHTML = "";
        mark.appendChild(nuevo);
      }
    } else {
      // Monograma con la inicial del nombre (refresca también si cambia el título)
      mark.innerHTML = "";
      mark.appendChild(document.createTextNode(nombre.charAt(0).toUpperCase()));
    }
  });

  // Renombrados globales (título, meta, copyright, historias, _subject…)
  const viejos = [];
  DEFAULTS.forEach((v) => { if (v && v !== nombre) viejos.push(v); });
  if (previa && previa !== nombre) viejos.push(previa);
  window.__MARCA_PREVIA = nombre;
  if (!viejos.length) return;

  const reemplaza = (txt) => {
    let out = txt;
    viejos.forEach((v) => { out = out.split(v).join(nombre); });
    return out;
  };

  if (document.title) document.title = reemplaza(document.title);
  document.querySelectorAll("meta[content]").forEach((m) => {
    const cont = m.getAttribute("content");
    if (cont) m.setAttribute("content", reemplaza(cont));
  });
  document.querySelectorAll("input, textarea").forEach((el) => {
    if (el.hasAttribute("placeholder")) el.placeholder = reemplaza(el.placeholder);
    if (el.type !== "checkbox" && el.type !== "radio") el.value = reemplaza(el.value);
  });
  document.querySelectorAll("[aria-label]").forEach((el) => {
    el.setAttribute("aria-label", reemplaza(el.getAttribute("aria-label")));
  });

  // Texto visible de la página (copyright, historias, etc.)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodos = [];
  while (walker.nextNode()) nodos.push(walker.currentNode);
  nodos.forEach((n) => {
    const v = n.nodeValue || "";
    const nv = reemplaza(v);
    if (nv !== v) n.nodeValue = nv;
  });
};

/* Re-sincronizar con el backend al volver a la pestaña:
   así los cambios hechos desde otro dispositivo se reflejan al entrar. */
function resincronizarDesdeServidor() {
  if (window.sincronizarDesdeServidor && document.visibilityState === "visible") {
    window.sincronizarDesdeServidor(function() {});
  }
}
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resincronizarDesdeServidor();
  });
  window.addEventListener("focus", () => setTimeout(resincronizarDesdeServidor, 80));

  /* Aplicar el tema y la marca guardados, y re-aplicar cuando lleguen cambios */
  window.aplicarTema(window.CONFIG_TIENDA && window.CONFIG_TIENDA.tema);
  window.aplicarMarca(window.CONFIG_TIENDA);
  window.addEventListener("configTiendaActualizada", (e) => {
    const cfg = ((e && e.detail) || window.CONFIG_TIENDA || {});
    window.aplicarTema(cfg.tema);
    window.aplicarMarca(cfg);
  });
}