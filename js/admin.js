"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* ============ Autenticación ============ */
  const loginScreen = document.getElementById("login-screen");
  const adminApp = document.getElementById("admin-app");
  const loginForm = document.getElementById("login-form");
  const userInput = document.getElementById("admin-user");
  const passInput = document.getElementById("admin-pass");
  const btnLogout = document.getElementById("btn-logout");

  function estaAutenticado() {
    return sessionStorage.getItem("NATIVE_ADMIN_AUTH") === "true" || localStorage.getItem("NATIVE_ADMIN_AUTH") === "true";
  }

  function mostrarApp() {
    loginScreen.style.display = "none";
    adminApp.style.display = "block";
    cargarTodosLosDatos();
    // Traer del servidor cualquier cambio guardado en otro navegador/dispositivo
    if (window.sincronizarDesdeServidor) {
      setTimeout(() => window.sincronizarDesdeServidor(() => cargarTodosLosDatos()), 300);
    }
  }

  function mostrarLogin() {
    loginScreen.style.display = "grid";
    adminApp.style.display = "none";
  }

  if (estaAutenticado()) {
    mostrarApp();
  } else {
    mostrarLogin();
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = userInput.value.trim().toLowerCase();
    const p = passInput.value.trim();

    if ((u === "admin" && (p === "admin" || p === "nativa2026" || p === "omar2026")) ||
        (u === "admi" && (p === "nativa2026" || p === "omar2026" || p === "admin"))) {
      sessionStorage.setItem("NATIVE_ADMIN_AUTH", "true");
      mostrarToast("✓ Sesión iniciada con éxito");
      mostrarApp();
    } else {
      mostrarToast("⚠ Usuario o contraseña incorrectos");
      passInput.value = "";
      passInput.focus();
    }
  });

  btnLogout.addEventListener("click", () => {
    sessionStorage.removeItem("NATIVE_ADMIN_AUTH");
    localStorage.removeItem("NATIVE_ADMIN_AUTH");
    mostrarToast("Sesión cerrada");
    mostrarLogin();
  });

  /* ============ Navegación por Pestañas ============ */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.dataset.tab;
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });

  /* ============ Elementos del DOM ============ */
  // Métricas
  const metricTotal = document.getElementById("metric-total");
  const metricCats = document.getElementById("metric-cats");
  const metricPrecio = document.getElementById("metric-precio");
  const metricOfertas = document.getElementById("metric-ofertas");
  const countPedidosTab = document.getElementById("count-pedidos-tab");

  // Filtros y Búsqueda
  const searchInput = document.getElementById("admin-search");
  const catFilter = document.getElementById("admin-cat-filter");
  const sortFilter = document.getElementById("admin-sort-filter");
  const productsGrid = document.getElementById("admin-products-grid");
  const categoriesGrid = document.getElementById("admin-categories-grid");
  const testimonialsGrid = document.getElementById("admin-testimonials-grid");
  const ordersTableBody = document.getElementById("orders-table-body");

  // Bulk bar
  const bulkBar = document.getElementById("bulk-bar");
  const bulkCount = document.getElementById("bulk-count");
  const btnSelectAll = document.getElementById("btn-select-all");
  const btnBulkOferta = document.getElementById("btn-bulk-oferta");
  const btnBulkStock = document.getElementById("btn-bulk-stock");
  const btnBulkCat = document.getElementById("btn-bulk-cat");
  const btnBulkDelete = document.getElementById("btn-bulk-delete");
  const btnBulkCancel = document.getElementById("btn-bulk-cancel");
  let productosSeleccionados = new Set();

  // Botones principales
  const btnNuevoProd = document.getElementById("btn-nuevo-prod");
  const btnNuevoProdMain = document.getElementById("btn-nuevo-prod-main");
  const btnNuevaCat = document.getElementById("btn-nueva-cat");
  const btnNuevoTestimonio = document.getElementById("btn-nuevo-testimonio");
  const btnExportarPedidos = document.getElementById("btn-exportar-pedidos");
  const btnLimpiarPedidos = document.getElementById("btn-limpiar-pedidos");
  const btnDescargarJs = document.getElementById("btn-descargar-js");
  const btnExportarJson = document.getElementById("btn-exportar-json");
  const btnImportarJson = document.getElementById("btn-importar-json");
  const inputImportarJson = document.getElementById("input-importar-json");
  const btnRestablecer = document.getElementById("btn-restablecer");

  // Modal de Producto
  const productModal = document.getElementById("product-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  const modalTitle = document.getElementById("modal-title");
  const productForm = document.getElementById("product-form");

  const prodId = document.getElementById("prod-id");
  const prodNombre = document.getElementById("prod-nombre");
  const prodCategoria = document.getElementById("prod-categoria");
  const prodNuevaCat = document.getElementById("prod-nueva-cat");
  const groupNuevaCat = document.getElementById("group-nueva-cat");
  const prodPrecio = document.getElementById("prod-precio");
  const prodViejo = document.getElementById("prod-viejo");
  const prodStock = document.getElementById("prod-stock");
  const prodBadge = document.getElementById("prod-badge");
  const prodDesc = document.getElementById("prod-desc");
  const prodBeneficios = document.getElementById("prod-beneficios");
  const prodUso = document.getElementById("prod-uso");
  const prodFile = document.getElementById("prod-file");
  const imageDropzone = document.getElementById("image-dropzone");
  const prodImgUrl = document.getElementById("prod-img-url");
  const prodGaleria = document.getElementById("prod-galeria");
  const prodEmoji = document.getElementById("prod-emoji");
  const prodColorA = document.getElementById("prod-color-a");
  const prodColorB = document.getElementById("prod-color-b");

  // Vista previa de Producto
  const previewMedia = document.getElementById("preview-media");
  const previewMediaContent = document.getElementById("preview-media-content");
  const previewBadge = document.getElementById("preview-badge");
  const previewCat = document.getElementById("preview-cat");
  const previewName = document.getElementById("preview-name");
  const previewDesc = document.getElementById("preview-desc");
  const previewPrice = document.getElementById("preview-price");
  const previewOld = document.getElementById("preview-old");

  let imagenActualBase64 = "";

  // Modal de Categoría
  const categoryModal = document.getElementById("category-modal");
  const catModalCloseBtn = document.getElementById("cat-modal-close-btn");
  const catModalCancelBtn = document.getElementById("cat-modal-cancel-btn");
  const catModalTitle = document.getElementById("cat-modal-title");
  const categoryForm = document.getElementById("category-form");
  const catNombreOriginal = document.getElementById("cat-nombre-original");
  const catNombre = document.getElementById("cat-nombre");
  const catEmoji = document.getElementById("cat-emoji");
  const catTagline = document.getElementById("cat-tagline");
  const catDesc = document.getElementById("cat-desc");
  const catGradA = document.getElementById("cat-grad-a");
  const catGradB = document.getElementById("cat-grad-b");

  // Modal de Testimonio
  const testimonioModal = document.getElementById("testimonio-modal");
  const testimonioModalCloseBtn = document.getElementById("testimonio-modal-close-btn");
  const testimonioModalCancelBtn = document.getElementById("testimonio-modal-cancel-btn");
  const testimonioModalTitle = document.getElementById("testimonio-modal-title");
  const testimonioForm = document.getElementById("testimonio-form");
  const testimonioId = document.getElementById("testimonio-id");
  const testimonioNombre = document.getElementById("testimonio-nombre");
  const testimonioCiudad = document.getElementById("testimonio-ciudad");
  const testimonioEstrellas = document.getElementById("testimonio-estrellas");
  const testimonioTexto = document.getElementById("testimonio-texto");

  // Formulario de Contenido
  const formContenidoTienda = document.getElementById("form-contenido-tienda");
  const cfgMarquee = document.getElementById("cfg-marquee");
  const cfgHeroEyebrow = document.getElementById("cfg-hero-eyebrow");
  const cfgHeroTitulo = document.getElementById("cfg-hero-titulo");
  const cfgHeroCopy = document.getElementById("cfg-hero-copy");
  const cfgStat1Num = document.getElementById("cfg-stat1-num");
  const cfgStat1Label = document.getElementById("cfg-stat1-label");
  const cfgPromoTag = document.getElementById("cfg-promo-tag");
  const cfgPromoDescuento = document.getElementById("cfg-promo-descuento");
  const cfgPromoTitulo = document.getElementById("cfg-promo-titulo");
  const cfgPromoSubtexto = document.getElementById("cfg-promo-subtexto");
  const cfgPromoDesc = document.getElementById("cfg-promo-desc");

  // Formulario de Ajustes
  const formAjustesTienda = document.getElementById("form-ajustes-tienda");
  const cfgBrandName = document.getElementById("cfg-brand-name");
  const cfgMonedaSimbolo = document.getElementById("cfg-moneda-simbolo");
  const cfgEnvioMinimo = document.getElementById("cfg-envio-minimo");
  const cfgWhatsapp = document.getElementById("cfg-whatsapp");
  const cfgTelefono = document.getElementById("cfg-telefono");
  const cfgEmail = document.getElementById("cfg-email");

  // Formulario de Apariencia & Colores
  const formTemaTienda = document.getElementById("form-tema-tienda");
  const btnRestablecerTema = document.getElementById("btn-restablecer-tema");
  const cfgBrandNameApariencia = document.getElementById("cfg-brand-name-apariencia");
  const inputLogoFile = document.getElementById("input-logo-file");
  const btnElegirLogo = document.getElementById("btn-elegir-logo");
  const btnQuitarLogo = document.getElementById("btn-quitar-logo");
  const cfgLogoUrl = document.getElementById("cfg-logo-url");
  const logoPreview = document.getElementById("logo-preview");
  const logoSinLogo = document.getElementById("logo-sin-logo");

  /* ============ Carga General ============ */
  function cargarTodosLosDatos() {
    const prods = window.obtenerProductos();
    const cats = window.obtenerCategorias();
    const cfg = window.obtenerConfigTienda ? window.obtenerConfigTienda() : (window.CONFIG_TIENDA || {});
    const testimonios = window.obtenerTestimonios ? window.obtenerTestimonios() : [];
    const pedidos = window.obtenerPedidos ? window.obtenerPedidos() : [];

    actualizarMetricas(prods, pedidos);
    actualizarSelectorCategorias(prods, cats);
    renderizarProductos(prods);
    renderizarCategorias(cats, prods);
    renderizarTestimonios(testimonios);
    renderizarPedidos(pedidos);
    cargarContenidoTienda(cfg);
    cargarAjustesTienda(cfg);
    cargarTemaTienda(cfg);
  }

  function actualizarMetricas(prods, pedidos) {
    metricTotal.textContent = prods.length;
    const cats = new Set(prods.map((p) => p.categoria));
    metricCats.textContent = cats.size;
    const suma = prods.reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0);
    metricPrecio.textContent = prods.length ? `$${(suma / prods.length).toFixed(1)}` : "$0";
    const ofertas = prods.filter((p) => (p.viejo && parseFloat(p.viejo) > parseFloat(p.precio)) || p.badge === "Oferta");
    metricOfertas.textContent = ofertas.length;
    if (countPedidosTab) countPedidosTab.textContent = (pedidos || []).length;
  }

  function actualizarSelectorCategorias(prods, cats) {
    const listaCategorias = Array.from(new Set([
      ...(window.ORDEN_CATEGORIAS_DEFECTO || []),
      ...Object.keys(cats || {}),
      ...prods.map((p) => p.categoria)
    ])).filter(Boolean);

    const catActualFiltro = catFilter.value;

    catFilter.innerHTML = '<option value="Todos">Todas las categorías</option>';
    listaCategorias.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      const emoji = (cats[c] && cats[c].emoji) || "🏷️";
      opt.textContent = `${emoji} ${c}`;
      catFilter.appendChild(opt);
    });
    if (listaCategorias.includes(catActualFiltro)) catFilter.value = catActualFiltro;

    prodCategoria.innerHTML = "";
    listaCategorias.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      const emoji = (cats[c] && cats[c].emoji) || "🏷️";
      opt.textContent = `${emoji} ${c}`;
      prodCategoria.appendChild(opt);
    });
    const optNueva = document.createElement("option");
    optNueva.value = "NUEVA";
    optNueva.textContent = "➕ Otra categoría nueva...";
    prodCategoria.appendChild(optNueva);
  }

  /* ============ RENDERIZADO DE PRODUCTOS ============ */
  function renderizarProductos(prods) {
    const busqueda = (searchInput.value || "").toLowerCase().trim();
    const filtroCat = catFilter.value;
    const orden = sortFilter ? sortFilter.value : "orden-manual";

    let filtrados = prods.map((p, originalIndex) => ({ ...p, _index: originalIndex })).filter((p) => {
      const matchCat = filtroCat === "Todos" || p.categoria === filtroCat;
      const matchText = !busqueda || p.nombre.toLowerCase().includes(busqueda) || (p.desc && p.desc.toLowerCase().includes(busqueda));
      return matchCat && matchText;
    });

    // Ordenamiento
    if (orden === "nombre") {
      filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === "precio-menor") {
      filtrados.sort((a, b) => (parseFloat(a.precio) || 0) - (parseFloat(b.precio) || 0));
    } else if (orden === "precio-mayor") {
      filtrados.sort((a, b) => (parseFloat(b.precio) || 0) - (parseFloat(a.precio) || 0));
    } else if (orden === "ofertas") {
      filtrados = filtrados.filter((p) => (p.viejo && parseFloat(p.viejo) > parseFloat(p.precio)) || p.badge === "Oferta");
    } else if (orden === "agotados") {
      filtrados = filtrados.filter((p) => p.stock === "agotado");
    } else if (orden === "recientes") {
      filtrados.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    productsGrid.innerHTML = "";
    actualizarBarraAccionesEnLote();

    if (filtrados.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--muted); background: var(--white); border-radius: 20px; border: 1px dashed var(--border);">
          <span style="font-size: 40px; display: block; margin-bottom: 10px;">🔍</span>
          <h3>No se encontraron productos</h3>
          <p>Prueba con otros términos de búsqueda o añade un nuevo producto con el botón superior.</p>
        </div>`;
      return;
    }

    filtrados.forEach((p, idxVisual) => {
      const card = document.createElement("article");
      card.className = "admin-card";
      card.dataset.stock = p.stock || "disponible";
      const colA = (p.colores && p.colores[0]) || "#f6e7dd";
      const colB = (p.colores && p.colores[1]) || "#e7cfc6";
      card.style.setProperty("--media-a", colA);
      card.style.setProperty("--media-b", colB);

      const mediaHtml = p.imagen
        ? `<img src="${p.imagen}" alt="${p.nombre}" />`
        : `<span style="font-size: 60px;">${p.emoji || "✨"}</span>`;

      let badgeHtml = "";
      if (p.badge) {
        badgeHtml = `<span class="admin-card__badge">${p.badge}</span>`;
      } else if (p.viejo && parseFloat(p.viejo) > parseFloat(p.precio)) {
        badgeHtml = '<span class="admin-card__badge">Oferta</span>';
      }

      const viejoHtml = p.viejo ? `<span class="admin-card__old-price">$${p.viejo}.00</span>` : "";

      // Stock pill
      const estadoStock = p.stock || "disponible";
      const stockLabels = {
        disponible: "🟢 En Stock",
        poco: "🟡 Pocas Unidades",
        agotado: "🔴 Agotado",
        oculto: "👁️ Oculto"
      };

      const isChecked = productosSeleccionados.has(p.id);

      card.innerHTML = `
        <!-- Botones de Reordenar / Mover -->
        <div class="admin-card__top-actions">
          <button class="btn-icon-sm btn-pin-top" data-id="${p.id}" title="Fijar de primero en la tienda">⭐</button>
          <button class="btn-icon-sm btn-move-up" data-index="${p._index}" title="Subir posición">⬆️</button>
          <button class="btn-icon-sm btn-move-down" data-index="${p._index}" title="Bajar posición">⬇️</button>
        </div>

        <input type="checkbox" class="admin-card__select" data-id="${p.id}" ${isChecked ? "checked" : ""} />

        <div class="admin-card__media">
          ${badgeHtml}
          <span class="admin-card__id">#${p.id}</span>
          ${mediaHtml}
        </div>
        <div class="admin-card__body">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="admin-card__cat">${p.categoria}</span>
            <span class="stock-pill stock-pill--${estadoStock}">${stockLabels[estadoStock]}</span>
          </div>
          <h3 class="admin-card__title">${p.nombre}</h3>
          <p class="admin-card__desc">${p.desc}</p>
          <div class="admin-card__price-row">
            <span class="admin-card__price">$${p.precio}.00</span>
            ${viejoHtml}
          </div>
          <div class="admin-card__actions">
            <button class="btn-action btn-action--edit" data-id="${p.id}">✏️ Editar</button>
            <button class="btn-action btn-action--duplicate" data-id="${p.id}" title="Duplicar producto">📋 Duplicar</button>
            <button class="btn-action btn-action--delete" data-id="${p.id}">🗑️ Eliminar</button>
          </div>
        </div>
      `;

      // Eventos de tarjeta
      card.querySelector(".admin-card__select").addEventListener("change", (e) => {
        if (e.target.checked) productosSeleccionados.add(p.id);
        else productosSeleccionados.delete(p.id);
        actualizarBarraAccionesEnLote();
      });

      card.querySelector(".btn-pin-top").addEventListener("click", () => fijarProductoArriba(p._index));
      card.querySelector(".btn-move-up").addEventListener("click", () => moverProducto(p._index, -1));
      card.querySelector(".btn-move-down").addEventListener("click", () => moverProducto(p._index, 1));
      card.querySelector(".btn-action--edit").addEventListener("click", () => abrirModalEditar(p));
      card.querySelector(".btn-action--duplicate").addEventListener("click", () => duplicarProducto(p));
      card.querySelector(".btn-action--delete").addEventListener("click", () => confirmarEliminar(p));

      productsGrid.appendChild(card);
    });
  }

  /* ============ MOVER Y REORDENAR PRODUCTOS ============ */
  function moverProducto(index, delta) {
    const prods = window.obtenerProductos();
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= prods.length) return;

    const item = prods.splice(index, 1)[0];
    prods.splice(newIndex, 0, item);
    window.guardarProductos(prods);
    mostrarToast("✓ Orden de productos actualizado en la tienda");
    cargarTodosLosDatos();
  }

  function fijarProductoArriba(index) {
    const prods = window.obtenerProductos();
    if (index === 0) return;
    const item = prods.splice(index, 1)[0];
    prods.unshift(item);
    window.guardarProductos(prods);
    mostrarToast(`✓ "${item.nombre}" fijado en la primera posición`);
    cargarTodosLosDatos();
  }

  /* ============ ACCIONES EN LOTE (BULK ACTIONS) ============ */
  function actualizarBarraAccionesEnLote() {
    if (productosSeleccionados.size > 0) {
      bulkBar.style.display = "flex";
      bulkCount.textContent = productosSeleccionados.size;
    } else {
      bulkBar.style.display = "none";
    }
  }

  btnSelectAll.addEventListener("click", () => {
    const prods = window.obtenerProductos();
    if (productosSeleccionados.size === prods.length) {
      productosSeleccionados.clear();
    } else {
      prods.forEach((p) => productosSeleccionados.add(p.id));
    }
    renderizarProductos(prods);
  });

  btnBulkCancel.addEventListener("click", () => {
    productosSeleccionados.clear();
    renderizarProductos(window.obtenerProductos());
  });

  btnBulkOferta.addEventListener("click", () => {
    const pct = prompt("Ingresa el porcentaje de descuento a aplicar (ej. 20 para 20%):", "20");
    if (!pct || isNaN(pct)) return;
    const factor = (100 - parseFloat(pct)) / 100;
    const prods = window.obtenerProductos();

    prods.forEach((p) => {
      if (productosSeleccionados.has(p.id)) {
        p.viejo = p.precio;
        p.precio = Math.max(1, Math.round(p.precio * factor));
        p.badge = "Oferta";
      }
    });

    window.guardarProductos(prods);
    mostrarToast(`✓ Descuento del ${pct}% aplicado a ${productosSeleccionados.size} productos`);
    productosSeleccionados.clear();
    cargarTodosLosDatos();
  });

  btnBulkStock.addEventListener("click", () => {
    const nuevoStock = prompt("Elige estado: 1: En Stock, 2: Pocas Unidades, 3: Agotado, 4: Oculto", "1");
    const mapa = { "1": "disponible", "2": "poco", "3": "agotado", "4": "oculto" };
    if (!mapa[nuevoStock]) return;

    const prods = window.obtenerProductos();
    prods.forEach((p) => {
      if (productosSeleccionados.has(p.id)) {
        p.stock = mapa[nuevoStock];
      }
    });

    window.guardarProductos(prods);
    mostrarToast(`✓ Estado de stock actualizado en lote`);
    productosSeleccionados.clear();
    cargarTodosLosDatos();
  });

  btnBulkCat.addEventListener("click", () => {
    const cats = Object.keys(window.obtenerCategorias());
    const elegida = prompt(`Escribe la categoría destino:\n(${cats.join(", ")})`);
    if (!elegida) return;

    const prods = window.obtenerProductos();
    prods.forEach((p) => {
      if (productosSeleccionados.has(p.id)) {
        p.categoria = elegida;
      }
    });

    window.guardarProductos(prods);
    mostrarToast(`✓ Productos movidos a la categoría "${elegida}"`);
    productosSeleccionados.clear();
    cargarTodosLosDatos();
  });

  btnBulkDelete.addEventListener("click", () => {
    if (confirm(`¿Estás seguro de eliminar los ${productosSeleccionados.size} productos seleccionados?`)) {
      let prods = window.obtenerProductos();
      prods = prods.filter((p) => !productosSeleccionados.has(p.id));
      window.guardarProductos(prods);
      mostrarToast(`✓ Productos eliminados`);
      productosSeleccionados.clear();
      cargarTodosLosDatos();
    }
  });

  /* Filtros y búsqueda interactiva */
  searchInput.addEventListener("input", () => renderizarProductos(window.obtenerProductos()));
  catFilter.addEventListener("change", () => renderizarProductos(window.obtenerProductos()));
  if (sortFilter) sortFilter.addEventListener("change", () => renderizarProductos(window.obtenerProductos()));

  /* ============ Modal de Producto ============ */
  function abrirModalNuevo() {
    modalTitle.textContent = "Añadir Nuevo Producto";
    prodId.value = "";
    productForm.reset();
    imagenActualBase64 = "";
    groupNuevaCat.style.display = "none";
    prodNuevaCat.required = false;
    prodStock.value = "disponible";
    prodBadge.value = "";
    prodColorA.value = "#f6e7dd";
    prodColorB.value = "#e7cfc6";
    prodEmoji.value = "✨";

    actualizarSelectorCategorias(window.obtenerProductos(), window.obtenerCategorias());
    actualizarVistaPrevia();
    productModal.classList.add("open");
    prodNombre.focus();
  }

  function abrirModalEditar(p) {
    modalTitle.textContent = `Editar Producto #${p.id}`;
    prodId.value = p.id;
    prodNombre.value = p.nombre || "";

    actualizarSelectorCategorias(window.obtenerProductos(), window.obtenerCategorias());

    const catOptions = Array.from(prodCategoria.options).map((o) => o.value);
    if (catOptions.includes(p.categoria)) {
      prodCategoria.value = p.categoria;
      groupNuevaCat.style.display = "none";
      prodNuevaCat.value = "";
      prodNuevaCat.required = false;
    } else {
      prodCategoria.value = "NUEVA";
      groupNuevaCat.style.display = "block";
      prodNuevaCat.value = p.categoria;
      prodNuevaCat.required = true;
    }

    prodPrecio.value = p.precio || "";
    prodViejo.value = p.viejo || "";
    prodStock.value = p.stock || "disponible";
    prodBadge.value = p.badge || "";
    prodDesc.value = p.desc || "";
    if (prodBeneficios) prodBeneficios.value = Array.isArray(p.beneficios) ? p.beneficios.join("\n") : (p.beneficios || "");
    if (prodUso) prodUso.value = p.uso || "";
    prodEmoji.value = p.emoji || "✨";
    prodImgUrl.value = p.imagen && p.imagen.startsWith("http") ? p.imagen : "";
    imagenActualBase64 = p.imagen && p.imagen.startsWith("data:") ? p.imagen : "";
    prodGaleria.value = Array.isArray(p.galeria) ? p.galeria.join("\n") : "";

    prodColorA.value = (p.colores && p.colores[0]) || "#f6e7dd";
    prodColorB.value = (p.colores && p.colores[1]) || "#e7cfc6";

    actualizarVistaPrevia();
    productModal.classList.add("open");
  }

  function duplicarProducto(p) {
    const productos = window.obtenerProductos();
    const nuevoId = productos.length > 0 ? Math.max(...productos.map((item) => item.id)) + 1 : 1;
    const clon = {
      ...p,
      id: nuevoId,
      nombre: `${p.nombre} (Copia)`,
      badge: "Nuevo"
    };

    productos.unshift(clon);
    window.guardarProductos(productos);
    mostrarToast(`✓ Producto duplicado como #${nuevoId}`);
    cargarTodosLosDatos();
  }

  function cerrarModal() {
    productModal.classList.remove("open");
  }

  function abrirModalNuevoConTab() {
    const btnTabProds = document.querySelector('[data-tab="tab-productos"]');
    if (btnTabProds && !btnTabProds.classList.contains("active")) {
      btnTabProds.click();
    }
    abrirModalNuevo();
  }

  btnNuevoProd.addEventListener("click", abrirModalNuevoConTab);
  if (btnNuevoProdMain) btnNuevoProdMain.addEventListener("click", abrirModalNuevoConTab);
  modalCloseBtn.addEventListener("click", cerrarModal);
  modalCancelBtn.addEventListener("click", cerrarModal);
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) cerrarModal();
  });

  // Botón Guardar como Borrador
  const btnGuardarBorrador = document.getElementById("btn-guardar-borrador");
  if (btnGuardarBorrador) {
    btnGuardarBorrador.addEventListener("click", () => {
      prodStock.value = "oculto";
      productForm.requestSubmit();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarModal();
      cerrarModalCategoria();
      cerrarModalTestimonio();
    }
  });

  prodCategoria.addEventListener("change", () => {
    if (prodCategoria.value === "NUEVA") {
      groupNuevaCat.style.display = "block";
      prodNuevaCat.required = true;
      prodNuevaCat.focus();
    } else {
      groupNuevaCat.style.display = "none";
      prodNuevaCat.required = false;
    }
    actualizarVistaPrevia();
  });

  /* ============ Procesamiento de Imágenes ============ */
  imageDropzone.addEventListener("click", () => prodFile.click());

  imageDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageDropzone.classList.add("dragover");
  });
  imageDropzone.addEventListener("dragleave", () => imageDropzone.classList.remove("dragover"));
  imageDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    imageDropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarArchivoImagen(e.dataTransfer.files[0]);
    }
  });

  prodFile.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      procesarArchivoImagen(e.target.files[0]);
    }
  });

  function procesarArchivoImagen(file) {
    if (!file.type.startsWith("image/")) {
      mostrarToast("⚠ Por favor selecciona un archivo de imagen válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        imagenActualBase64 = canvas.toDataURL("image/webp", 0.85);
        prodImgUrl.value = "";
        actualizarVistaPrevia();
        mostrarToast("✓ Foto cargada y optimizada");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* Vista Previa en Vivo */
  function actualizarVistaPrevia() {
    const nombre = prodNombre.value.trim() || "Nombre del Producto";
    const cat = prodCategoria.value === "NUEVA" ? prodNuevaCat.value.trim() || "Nueva Categoría" : prodCategoria.value;
    const desc = prodDesc.value.trim() || "Descripción del producto tal como aparecerá en el catálogo.";
    const precio = parseFloat(prodPrecio.value) || 0;
    const viejo = parseFloat(prodViejo.value) || 0;
    const badge = prodBadge.value;
    const emoji = prodEmoji.value.trim() || "✨";
    const colorA = prodColorA.value;
    const colorB = prodColorB.value;
    const urlImg = prodImgUrl.value.trim();

    previewName.textContent = nombre;
    previewCat.textContent = cat;
    previewDesc.textContent = desc;
    previewPrice.textContent = `$${precio.toFixed(2)}`;

    if (badge) {
      previewBadge.style.display = "block";
      previewBadge.textContent = badge;
    } else if (viejo > precio) {
      previewBadge.style.display = "block";
      previewBadge.textContent = "Oferta";
    } else {
      previewBadge.style.display = "none";
    }

    if (viejo > precio) {
      previewOld.textContent = `$${viejo.toFixed(2)}`;
    } else {
      previewOld.textContent = "";
    }

    previewMedia.style.setProperty("--media-a", colorA);
    previewMedia.style.setProperty("--media-b", colorB);

    const imgSrc = urlImg || imagenActualBase64;
    if (imgSrc) {
      previewMediaContent.innerHTML = `<img src="${imgSrc}" alt="${nombre}" style="width:100%;height:100%;object-fit:cover;" />`;
    } else {
      previewMediaContent.innerHTML = `<span style="font-size: 64px;">${emoji}</span>`;
    }
  }

  [prodNombre, prodNuevaCat, prodPrecio, prodViejo, prodBadge, prodStock, prodDesc, prodEmoji, prodImgUrl, prodColorA, prodColorB].forEach((el) => {
    if (el) {
      el.addEventListener("input", () => {
        if (el === prodImgUrl && prodImgUrl.value.trim()) {
          imagenActualBase64 = "";
        }
        actualizarVistaPrevia();
      });
      el.addEventListener("change", actualizarVistaPrevia);
    }
  });

  /* Guardar Producto */
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Efecto de carga en el botón publicar
    const btnPublicar = document.getElementById("btn-publicar-prod");
    if (btnPublicar) {
      btnPublicar.classList.add("loading");
      btnPublicar.disabled = true;
    }
    const btnBorrador = document.getElementById("btn-guardar-borrador");
    if (btnBorrador) btnBorrador.disabled = true;

    // Pequeño timeout para efecto visual
    setTimeout(() => {
      _procesarGuardadoProducto();
      if (btnPublicar) { btnPublicar.classList.remove("loading"); btnPublicar.disabled = false; }
      if (btnBorrador) btnBorrador.disabled = false;
    }, 420);
  });

  function _procesarGuardadoProducto() {
    const idExistente = prodId.value ? parseInt(prodId.value, 10) : null;
    const nombre = prodNombre.value.trim();
    let categoria = prodCategoria.value === "NUEVA" ? prodNuevaCat.value.trim() : prodCategoria.value;
    const precio = parseFloat(prodPrecio.value);
    const viejo = prodViejo.value ? parseFloat(prodViejo.value) : undefined;
    const stock = prodStock.value || "disponible";
    const badge = prodBadge.value || undefined;
    const desc = prodDesc.value.trim();
    const beneficios = prodBeneficios
      ? prodBeneficios.value.split("\n").map((s) => s.trim()).filter(Boolean)
      : [];
    const uso = prodUso ? prodUso.value.trim() : "";
    const emoji = prodEmoji.value.trim() || "✨";
    const colores = [prodColorA.value, prodColorB.value];
    const imagen = prodImgUrl.value.trim() || imagenActualBase64 || "";
    const galeria = prodGaleria ? prodGaleria.value.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    const esBorrador = stock === "oculto";

    if (!nombre || !categoria || isNaN(precio)) {
      mostrarToast("⚠ Por favor completa los campos obligatorios", "warning");
      return;
    }

    const cats = window.obtenerCategorias();
    if (!cats[categoria]) {
      cats[categoria] = {
        emoji: emoji,
        tagline: `Productos exclusivos de ${categoria}.`,
        desc: `Cuidado botánico y formulaciones puras de ${categoria}.`,
        grad: colores,
        n: Object.keys(cats).length + 1 < 10 ? `0${Object.keys(cats).length + 1}` : `${Object.keys(cats).length + 1}`
      };
      window.guardarCategorias(cats);
    }

    const productos = window.obtenerProductos();

    if (idExistente) {
      const idx = productos.findIndex((p) => p.id === idExistente);
      if (idx !== -1) {
        productos[idx] = {
          ...productos[idx],
          nombre,
          categoria,
          precio,
          viejo,
          stock,
          badge,
          desc,
          beneficios,
          uso,
          emoji,
          imagen,
          galeria,
          colores
        };
        if (esBorrador) {
          mostrarToast(`📝 "${nombre}" guardado como borrador`, "warning");
        } else {
          mostrarToast(`✅ "${nombre}" actualizado y publicado en tienda. <a href="index.html#catalogo" target="_blank" style="color:#7fff9e;margin-left:8px;font-weight:700;text-decoration:underline;">Ver tienda ↗</a>`, "success");
        }
      }
    } else {
      const nuevoId = productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
      const nuevoProd = {
        id: nuevoId,
        nombre,
        categoria,
        precio,
        viejo,
        stock,
        badge,
        desc,
        beneficios,
        uso,
        emoji,
        imagen,
        galeria,
        colores
      };
      productos.unshift(nuevoProd);
      if (esBorrador) {
        mostrarToast(`📝 "${nombre}" guardado como borrador (oculto en tienda)`, "warning");
      } else {
        mostrarToast(`🚀 ¡"${nombre}" publicado en la tienda! <a href="index.html#catalogo" target="_blank" style="color:#7fff9e;margin-left:8px;font-weight:700;text-decoration:underline;">Ver ahora ↗</a>`, "success");
      }
    }

    window.guardarProductos(productos);
    cerrarModal();
    cargarTodosLosDatos();
  }

  /* Eliminar Producto */
  function confirmarEliminar(p) {
    if (confirm(`¿Estás seguro de eliminar "${p.nombre}" del catálogo?`)) {
      let productos = window.obtenerProductos();
      productos = productos.filter((item) => item.id !== p.id);
      window.guardarProductos(productos);
      mostrarToast(`✓ "${p.nombre}" eliminado`);
      cargarTodosLosDatos();
    }
  }

  /* ============ GESTIÓN DE CATEGORÍAS ============ */
  function renderizarCategorias(cats, prods) {
    categoriesGrid.innerHTML = "";
    const nombres = Object.keys(cats);

    if (nombres.length === 0) {
      categoriesGrid.innerHTML = '<p style="color: var(--muted);">No hay categorías configuradas.</p>';
      return;
    }

    nombres.forEach((nombreCat) => {
      const data = cats[nombreCat];
      const count = prods.filter((p) => p.categoria === nombreCat).length;
      const card = document.createElement("div");
      card.className = "cat-card";

      const gradA = (data.grad && data.grad[0]) || "#f4d9e2";
      const gradB = (data.grad && data.grad[1]) || "#eec9d6";

      card.innerHTML = `
        <span class="cat-card__badge">${count} producto${count === 1 ? "" : "s"}</span>
        <div class="cat-card__icon-box" style="background: linear-gradient(135deg, ${gradA}, ${gradB});">
          ${data.emoji || "🏷️"}
        </div>
        <div>
          <h3 class="cat-card__title">${nombreCat}</h3>
          <span class="cat-card__tagline">${data.tagline || ""}</span>
        </div>
        <p class="cat-card__desc">${data.desc || ""}</p>
        <div class="cat-card__actions">
          <button class="btn-action btn-action--edit btn-edit-cat" data-name="${nombreCat}">✏️ Editar</button>
          <button class="btn-action btn-action--delete btn-delete-cat" data-name="${nombreCat}">🗑️ Eliminar</button>
        </div>
      `;

      card.querySelector(".btn-edit-cat").addEventListener("click", () => abrirModalEditarCategoria(nombreCat, data));
      card.querySelector(".btn-delete-cat").addEventListener("click", () => confirmarEliminarCategoria(nombreCat, count));

      categoriesGrid.appendChild(card);
    });
  }

  function abrirModalNuevaCategoria() {
    catModalTitle.textContent = "Nueva Categoría";
    catNombreOriginal.value = "";
    categoryForm.reset();
    catGradA.value = "#f4d9e2";
    catGradB.value = "#eec9d6";
    catEmoji.value = "🧴";
    categoryModal.classList.add("open");
    catNombre.focus();
  }

  function abrirModalEditarCategoria(nombre, data) {
    catModalTitle.textContent = `Editar Categoría: ${nombre}`;
    catNombreOriginal.value = nombre;
    catNombre.value = nombre;
    catEmoji.value = data.emoji || "🏷️";
    catTagline.value = data.tagline || "";
    catDesc.value = data.desc || "";
    catGradA.value = (data.grad && data.grad[0]) || "#f4d9e2";
    catGradB.value = (data.grad && data.grad[1]) || "#eec9d6";
    categoryModal.classList.add("open");
  }

  function cerrarModalCategoria() {
    categoryModal.classList.remove("open");
  }

  btnNuevaCat.addEventListener("click", abrirModalNuevaCategoria);
  catModalCloseBtn.addEventListener("click", cerrarModalCategoria);
  catModalCancelBtn.addEventListener("click", cerrarModalCategoria);
  categoryModal.addEventListener("click", (e) => {
    if (e.target === categoryModal) cerrarModalCategoria();
  });

  categoryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const orig = catNombreOriginal.value;
    const nuevoNombre = catNombre.value.trim();
    const emoji = catEmoji.value.trim() || "🏷️";
    const tagline = catTagline.value.trim();
    const desc = catDesc.value.trim();
    const grad = [catGradA.value, catGradB.value];

    if (!nuevoNombre) {
      mostrarToast("⚠ El nombre de la categoría es requerido");
      return;
    }

    const cats = window.obtenerCategorias();
    const prods = window.obtenerProductos();

    if (orig && orig !== nuevoNombre) {
      delete cats[orig];
      prods.forEach((p) => {
        if (p.categoria === orig) p.categoria = nuevoNombre;
      });
      window.guardarProductos(prods);
    }

    cats[nuevoNombre] = {
      emoji,
      tagline,
      desc,
      grad,
      n: Object.keys(cats).length + 1 < 10 ? `0${Object.keys(cats).length + 1}` : `${Object.keys(cats).length + 1}`
    };

    window.guardarCategorias(cats);
    cerrarModalCategoria();
    mostrarToast(`✓ Categoría "${nuevoNombre}" guardada con éxito`);
    cargarTodosLosDatos();
  });

  function confirmarEliminarCategoria(nombreCat, count) {
    const msg = count > 0
      ? `¿Eliminar la categoría "${nombreCat}"? Hay ${count} producto(s) en ella.`
      : `¿Estás seguro de eliminar la categoría "${nombreCat}"?`;

    if (confirm(msg)) {
      const cats = window.obtenerCategorias();
      delete cats[nombreCat];
      window.guardarCategorias(cats);
      mostrarToast(`✓ Categoría "${nombreCat}" eliminada`);
      cargarTodosLosDatos();
    }
  }

  /* ============ GESTIÓN DE TESTIMONIOS ============ */
  function renderizarTestimonios(testimonios) {
    testimonialsGrid.innerHTML = "";
    if (testimonios.length === 0) {
      testimonialsGrid.innerHTML = '<p style="color: var(--muted); grid-column: 1 / -1;">No hay testimonios registrados aún.</p>';
      return;
    }

    testimonios.forEach((t) => {
      const card = document.createElement("div");
      card.className = "testimonio-card";
      const starsStr = "★".repeat(t.estrellas || 5) + "☆".repeat(5 - (t.estrellas || 5));

      card.innerHTML = `
        <div class="testimonio-card__stars">${starsStr}</div>
        <p class="testimonio-card__text">"${t.comentario}"</p>
        <div class="testimonio-card__author">${t.nombre} <small>${t.ciudad || ""}</small></div>
        <div class="cat-card__actions">
          <button class="btn-action btn-action--edit btn-edit-testimonio" data-id="${t.id}">✏️ Editar</button>
          <button class="btn-action btn-action--delete btn-delete-testimonio" data-id="${t.id}">🗑️ Eliminar</button>
        </div>
      `;

      card.querySelector(".btn-edit-testimonio").addEventListener("click", () => abrirModalEditarTestimonio(t));
      card.querySelector(".btn-delete-testimonio").addEventListener("click", () => confirmarEliminarTestimonio(t.id));

      testimonialsGrid.appendChild(card);
    });
  }

  function abrirModalNuevoTestimonio() {
    testimonioModalTitle.textContent = "Añadir Testimonio";
    testimonioId.value = "";
    testimonioForm.reset();
    testimonioModal.classList.add("open");
    testimonioNombre.focus();
  }

  function abrirModalEditarTestimonio(t) {
    testimonioModalTitle.textContent = `Editar Testimonio de ${t.nombre}`;
    testimonioId.value = t.id;
    testimonioNombre.value = t.nombre;
    testimonioCiudad.value = t.ciudad || "";
    testimonioEstrellas.value = t.estrellas || 5;
    testimonioTexto.value = t.comentario || "";
    testimonioModal.classList.add("open");
  }

  function cerrarModalTestimonio() {
    testimonioModal.classList.remove("open");
  }

  if (btnNuevoTestimonio) btnNuevoTestimonio.addEventListener("click", abrirModalNuevoTestimonio);
  if (testimonioModalCloseBtn) testimonioModalCloseBtn.addEventListener("click", cerrarModalTestimonio);
  if (testimonioModalCancelBtn) testimonioModalCancelBtn.addEventListener("click", cerrarModalTestimonio);
  if (testimonioModal) {
    testimonioModal.addEventListener("click", (e) => {
      if (e.target === testimonioModal) cerrarModalTestimonio();
    });
  }

  if (testimonioForm) {
    testimonioForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = testimonioId.value ? parseInt(testimonioId.value, 10) : null;
      const nombre = testimonioNombre.value.trim();
      const ciudad = testimonioCiudad.value.trim();
      const estrellas = parseInt(testimonioEstrellas.value, 10);
      const comentario = testimonioTexto.value.trim();

      const testimonios = window.obtenerTestimonios ? window.obtenerTestimonios() : [];

      if (id) {
        const idx = testimonios.findIndex((t) => t.id === id);
        if (idx !== -1) {
          testimonios[idx] = { id, nombre, ciudad, estrellas, comentario };
          mostrarToast("✓ Testimonio actualizado con éxito");
        }
      } else {
        const nuevoId = testimonios.length > 0 ? Math.max(...testimonios.map((t) => t.id)) + 1 : 1;
        testimonios.push({ id: nuevoId, nombre, ciudad, estrellas, comentario });
        mostrarToast("✓ Testimonio añadido y publicado en la tienda");
      }

      if (window.guardarTestimonios) window.guardarTestimonios(testimonios);
      cerrarModalTestimonio();
      cargarTodosLosDatos();
    });
  }

  function confirmarEliminarTestimonio(id) {
    if (confirm("¿Estás seguro de eliminar este testimonio?")) {
      let testimonios = window.obtenerTestimonios ? window.obtenerTestimonios() : [];
      testimonios = testimonios.filter((t) => t.id !== id);
      if (window.guardarTestimonios) window.guardarTestimonios(testimonios);
      mostrarToast("✓ Testimonio eliminado");
      cargarTodosLosDatos();
    }
  }

  /* ============ GESTIÓN DE CONTENIDO Y ANUNCIOS ============ */
  function cargarContenidoTienda(cfg) {
    if (cfgMarquee) cfgMarquee.value = cfg.marqueeTexto || "";
    if (cfgHeroEyebrow) cfgHeroEyebrow.value = cfg.heroEyebrow || "";
    if (cfgHeroTitulo) cfgHeroTitulo.value = cfg.heroTitulo || "";
    if (cfgHeroCopy) cfgHeroCopy.value = cfg.heroCopy || "";
    if (cfgStat1Num) cfgStat1Num.value = cfg.stat1Num || "+12k";
    if (cfgStat1Label) cfgStat1Label.value = cfg.stat1Label || "Clientas felices";
    if (cfgPromoTag) cfgPromoTag.value = cfg.promoTag || "";
    if (cfgPromoDescuento) cfgPromoDescuento.value = cfg.promoDescuento || "";
    if (cfgPromoTitulo) cfgPromoTitulo.value = cfg.promoTitulo || "";
    if (cfgPromoSubtexto) cfgPromoSubtexto.value = cfg.promoSubtexto || "";
    if (cfgPromoDesc) cfgPromoDesc.value = cfg.promoDesc || "";
  }

  if (formContenidoTienda) {
    formContenidoTienda.addEventListener("submit", (e) => {
      e.preventDefault();
      const actual = window.obtenerConfigTienda ? window.obtenerConfigTienda() : {};
      const nuevoCfg = {
        ...actual,
        marqueeTexto: cfgMarquee.value.trim(),
        heroEyebrow: cfgHeroEyebrow.value.trim(),
        heroTitulo: cfgHeroTitulo.value.trim(),
        heroCopy: cfgHeroCopy.value.trim(),
        stat1Num: cfgStat1Num.value.trim(),
        stat1Label: cfgStat1Label.value.trim(),
        promoTag: cfgPromoTag.value.trim(),
        promoDescuento: cfgPromoDescuento.value.trim(),
        promoTitulo: cfgPromoTitulo.value.trim(),
        promoSubtexto: cfgPromoSubtexto.value.trim(),
        promoDesc: cfgPromoDesc.value.trim()
      };

      if (window.guardarConfigTienda) window.guardarConfigTienda(nuevoCfg);
      mostrarToast("✓ Banners y anuncios actualizados en vivo");
    });
  }

  /* ============ AJUSTES DE TIENDA ============ */
  function cargarAjustesTienda(cfg) {
    if (cfgBrandName) cfgBrandName.value = cfg.nombreMarca || "Native·Origen";
    if (cfgMonedaSimbolo) cfgMonedaSimbolo.value = cfg.monedaSimbolo || "$";
    if (cfgEnvioMinimo) cfgEnvioMinimo.value = cfg.envioGratisMinimo || 50;
    if (cfgWhatsapp) cfgWhatsapp.value = cfg.whatsappContacto || "573154729668";
    if (cfgTelefono) cfgTelefono.value = cfg.telefonoContacto || "315 472 9668";
    if (cfgEmail) cfgEmail.value = cfg.emailContacto || "aliados.online36@gmail.com";
  }

  if (formAjustesTienda) {
    formAjustesTienda.addEventListener("submit", (e) => {
      e.preventDefault();
      const actual = window.obtenerConfigTienda ? window.obtenerConfigTienda() : {};
      const nuevoCfg = {
        ...actual,
        nombreMarca: cfgBrandName.value.trim(),
        monedaSimbolo: cfgMonedaSimbolo.value,
        envioGratisMinimo: parseFloat(cfgEnvioMinimo.value) || 50,
        whatsappContacto: cfgWhatsapp.value.trim(),
        telefonoContacto: cfgTelefono.value.trim(),
        emailContacto: cfgEmail.value.trim()
      };
      if (cfgBrandNameApariencia) cfgBrandNameApariencia.value = cfgBrandName.value.trim();

      if (window.guardarConfigTienda) window.guardarConfigTienda(nuevoCfg);
      mostrarToast("✓ Ajustes de tienda guardados con éxito");
    });
  }

  /* ============ APARIENCIA & COLORES (tema) ============ */
  const TEMA_DEFECTO_LOCAL = (window.CONFIG_TIENDA_DEFECTO && window.CONFIG_TIENDA_DEFECTO.tema) || {};
  const TEMA_MAP = {
    "tema-wine": "wine", "tema-winedark": "wineDark", "tema-cream": "cream",
    "tema-blush": "blush", "tema-gold": "gold", "tema-goldlight": "goldLight",
    "tema-charcoal": "charcoal", "tema-muted": "muted", "tema-white": "white",
    "tema-navbg": "navBg", "tema-herostart": "heroStart", "tema-heroend": "heroEnd",
    "tema-btnbg": "btnBg", "tema-btnhover": "btnHover", "tema-btntext": "btnText",
    "tema-cardbg": "cardBg", "tema-marqueebg": "marqueeBg",
    "tema-promobg": "promoBg", "tema-footerbg": "footerBg"
  };

  function leerTemaForm(actual) {
    const tema = { ...(actual || {}) };
    Object.keys(TEMA_MAP).forEach((id) => {
      const el = document.getElementById(id);
      if (el) tema[TEMA_MAP[id]] = el.value;
    });
    const fd = document.getElementById("tema-fontdisplay");
    const fb = document.getElementById("tema-fontbody");
    if (fd) tema.fontDisplay = fd.value;
    if (fb) tema.fontBody = fb.value;
    const fs = document.getElementById("tema-fontsize");
    if (fs) tema.fontSizeBase = parseInt(fs.value, 10) || 16;
    const rd = document.getElementById("tema-radius");
    if (rd) tema.radius = parseInt(rd.value, 10) || 20;
    return tema;
  }

  function cargarTemaTienda(cfg) {
    const t = (cfg && cfg.tema) || {};
    Object.keys(TEMA_MAP).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const clave = TEMA_MAP[id];
      const valor = (t[clave] !== undefined && t[clave] !== null) ? t[clave] : TEMA_DEFECTO_LOCAL[clave];
      el.value = valor !== undefined ? valor : "#000000";
      const text = document.getElementById(id + "-text");
      if (text) text.value = valor !== undefined ? valor : "#000000";
    });

    const fd = document.getElementById("tema-fontdisplay");
    const fb = document.getElementById("tema-fontbody");
    const llenarSelect = (sel, lista, valor) => {
      if (!sel) return;
      sel.innerHTML = "";
      (lista || []).forEach((f) => {
        const o = document.createElement("option");
        o.value = f;
        o.textContent = f;
        sel.appendChild(o);
      });
      if (lista && lista.indexOf(valor) > -1) sel.value = valor;
    };
    llenarSelect(fd, window.FUENTES_TITULOS, t.fontDisplay || TEMA_DEFECTO_LOCAL.fontDisplay || "Playfair Display");
    llenarSelect(fb, window.FUENTES_TEXTO, t.fontBody || TEMA_DEFECTO_LOCAL.fontBody || "DM Sans");

    const fs = document.getElementById("tema-fontsize");
    if (fs) fs.value = t.fontSizeBase || TEMA_DEFECTO_LOCAL.fontSizeBase || 16;
    const rd = document.getElementById("tema-radius");
    if (rd) rd.value = t.radius !== undefined ? t.radius : (TEMA_DEFECTO_LOCAL.radius || 20);

    // Logo & Título del Negocio
    if (cfgBrandNameApariencia) {
      cfgBrandNameApariencia.value = (cfg && cfg.nombreMarca) || window.CONFIG_TIENDA_DEFECTO.nombreMarca || "Native·Origen";
    }
    const logo = (cfg && cfg.logoUrl) || "";
    if (cfgLogoUrl) cfgLogoUrl.value = logo;
    mostrarLogoPanel(logo);
    if (window.aplicarMarca) window.aplicarMarca(cfg || window.CONFIG_TIENDA);
  }

  /* Actualiza la vista previa del logo y el estado de los botones */
  function mostrarLogoPanel(url) {
    if (!logoPreview || !logoSinLogo) return;
    if (url) {
      logoPreview.src = url;
      logoPreview.style.display = "block";
      logoSinLogo.style.display = "none";
      if (btnQuitarLogo) btnQuitarLogo.style.display = "inline-flex";
    } else {
      logoPreview.style.display = "none";
      logoPreview.removeAttribute("src");
      logoSinLogo.style.display = "";
      if (btnQuitarLogo) btnQuitarLogo.style.display = "none";
    }
  }

  /* Sube el archivo elegido y deja su URL lista para guardar */
  async function subirLogo(file) {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      mostrarToast("⚠ La imagen supera los 6 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mime: file.type || "image/png",
            filename: file.name || "logo.png",
            data: event.target.result,
            anteriorLogoUrl: (cfgLogoUrl && cfgLogoUrl.value) || ""
          })
        });
        const json = await res.json();
        if (json.ok && json.url) {
          if (cfgLogoUrl) cfgLogoUrl.value = json.url;
          mostrarLogoPanel(json.url);
          if (window.aplicarMarca) window.aplicarMarca({ ...window.CONFIG_TIENDA, logoUrl: json.url });
          mostrarToast("🖼️ Logo subido. Pulsa 💾 Guardar para publicarlo en toda la tienda");
        } else {
          mostrarToast("⚠ Error al subir el logo: " + (json.message || "inténtalo de nuevo"));
        }
      } catch (err) {
        mostrarToast("⚠ No se pudo subir el logo (revisa tu conexión)");
      }
    };
    reader.readAsDataURL(file);
  }

  if (formTemaTienda) {
    formTemaTienda.addEventListener("submit", (e) => {
      e.preventDefault();
      const actual = (window.obtenerConfigTienda && window.obtenerConfigTienda()) || {};
      const nuevoTema = leerTemaForm(actual.tema);
      const nombre = (cfgBrandNameApariencia && cfgBrandNameApariencia.value.trim()) || "Native·Origen";
      const logo = (cfgLogoUrl && cfgLogoUrl.value.trim()) || "";
      if (cfgBrandName) cfgBrandName.value = nombre;
      if (window.guardarConfigTienda) window.guardarConfigTienda({ ...actual, nombreMarca: nombre, logoUrl: logo, tema: nuevoTema });
      mostrarToast("🎨 Apariencia y logo guardados en toda la tienda");
    });

    if (btnElegirLogo && inputLogoFile) btnElegirLogo.addEventListener("click", () => inputLogoFile.click());
    if (inputLogoFile) inputLogoFile.addEventListener("change", () => {
      if (inputLogoFile.files && inputLogoFile.files[0]) subirLogo(inputLogoFile.files[0]);
      inputLogoFile.value = "";
    });
    if (btnQuitarLogo) btnQuitarLogo.addEventListener("click", () => {
      if (cfgLogoUrl) cfgLogoUrl.value = "";
      mostrarLogoPanel("");
      if (window.aplicarMarca) window.aplicarMarca({ ...window.CONFIG_TIENDA, logoUrl: "" });
      mostrarToast("🗑️ Logo quitado. Pulsa 💾 Guardar para publicarlo");
    });

    if (btnRestablecerTema) {
      btnRestablecerTema.addEventListener("click", () => {
        const actual = (window.obtenerConfigTienda && window.obtenerConfigTienda()) || {};
        const temaOriginal = { ...(window.CONFIG_TIENDA_DEFECTO && window.CONFIG_TIENDA_DEFECTO.tema) };
        if (window.guardarConfigTienda) window.guardarConfigTienda({ ...actual, tema: temaOriginal });
        cargarTemaTienda({ tema: temaOriginal });
        mostrarToast("♻️ Estilo original restablecido en toda la tienda");
      });
    }

    formTemaTienda.querySelectorAll("input[type=color][id]").forEach((cp) => {
      const txt = document.getElementById(cp.id + "-text");
      cp.addEventListener("input", () => {
        if (txt) txt.value = cp.value;
        window.aplicarTema && window.aplicarTema(leerTemaForm((window.obtenerConfigTienda && window.obtenerConfigTienda().tema) || {}));
      });
      if (txt) txt.addEventListener("input", () => {
        if (/^#[0-9a-fA-F]{3,8}$/.test(txt.value.trim())) cp.value = txt.value.trim();
        window.aplicarTema && window.aplicarTema(leerTemaForm((window.obtenerConfigTienda && window.obtenerConfigTienda().tema) || {}));
      });
    });
    formTemaTienda.querySelectorAll("select, input[type=number]").forEach((el) => {
      el.addEventListener("input", () => {
        window.aplicarTema && window.aplicarTema(leerTemaForm((window.obtenerConfigTienda && window.obtenerConfigTienda().tema) || {}));
      });
    });
  }

  /* ============ HISTORIAL DE PEDIDOS ============ */
  function renderizarPedidos(pedidos) {
    if (!ordersTableBody) return;
    ordersTableBody.innerHTML = "";

    if (!pedidos || pedidos.length === 0) {
      ordersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted); padding: 40px;">No hay pedidos registrados aún.</td></tr>';
      return;
    }

    pedidos.slice().reverse().forEach((p) => {
      const tr = document.createElement("tr");
      const itemsList = (p.items || []).map((it) => `${it.nombre} (x${it.cantidad})`).join(", ");
      tr.innerHTML = `
        <td><strong>#${p.id || "101"}</strong></td>
        <td>${p.fecha || new Date().toLocaleString()}</td>
        <td style="max-width:300px;">${itemsList || "Productos varios"}</td>
        <td><strong>$${(p.total || 0).toFixed(2)}</strong></td>
        <td><span class="stock-pill stock-pill--disponible">${p.estado || "Completado"}</span></td>
      `;
      ordersTableBody.appendChild(tr);
    });
  }

  if (btnExportarPedidos) {
    btnExportarPedidos.addEventListener("click", () => {
      const pedidos = window.obtenerPedidos ? window.obtenerPedidos() : [];
      descargarArchivo(JSON.stringify(pedidos, null, 2), `pedidos_${new Date().toISOString().slice(0, 10)}.json`, "application/json");
      mostrarToast("📥 Historial de pedidos descargado");
    });
  }

  if (btnLimpiarPedidos) {
    btnLimpiarPedidos.addEventListener("click", () => {
      if (confirm("¿Estás seguro de vaciar el historial de pedidos?")) {
        if (window.guardarPedidos) window.guardarPedidos([]);
        mostrarToast("✓ Historial de pedidos vaciado");
        cargarTodosLosDatos();
      }
    });
  }

  /* ============ RESPALDOS, EXPORTAR Y GIT ============ */
  btnDescargarJs.addEventListener("click", () => {
    const prods = window.obtenerProductos();
    const cats = window.obtenerCategorias();
    const cfg = window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA;
    const testimonios = window.obtenerTestimonios ? window.obtenerTestimonios() : [];
    const orden = window.ORDEN_CATEGORIAS_DEFECTO || Object.keys(cats);

    const contenidoJs = `"use strict";

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

window.TESTIMONIOS_DEFECTO = ${JSON.stringify(testimonios, null, 2)};
`;

    descargarArchivo(contenidoJs, "productos.js", "application/javascript;charset=utf-8");
    mostrarToast("📥 Archivo js/productos.js descargado para Git");
  });

  btnExportarJson.addEventListener("click", () => {
    const data = {
      version: "2.5",
      fecha: new Date().toISOString(),
      productos: window.obtenerProductos(),
      categorias: window.obtenerCategorias(),
      testimonios: window.obtenerTestimonios ? window.obtenerTestimonios() : [],
      configTienda: window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA
    };
    descargarArchivo(JSON.stringify(data, null, 2), `respaldo_total_${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    mostrarToast("💾 Respaldo JSON completo generado y descargado");
  });

  btnImportarJson.addEventListener("click", () => inputImportarJson.click());

  inputImportarJson.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed.productos)) window.guardarProductos(parsed.productos);
        else if (Array.isArray(parsed)) window.guardarProductos(parsed);

        if (parsed.categorias && typeof parsed.categorias === "object") window.guardarCategorias(parsed.categorias);
        if (Array.isArray(parsed.testimonios) && window.guardarTestimonios) window.guardarTestimonios(parsed.testimonios);
        if (parsed.configTienda && typeof parsed.configTienda === "object") window.guardarConfigTienda(parsed.configTienda);

        mostrarToast("✓ Catálogo y configuraciones importadas con éxito");
        cargarTodosLosDatos();
      } catch (err) {
        mostrarToast("⚠ Error al leer el archivo JSON");
      }
    };
    reader.readAsText(file);
    inputImportarJson.value = "";
  });

  btnRestablecer.addEventListener("click", () => {
    if (confirm("¿Estás seguro de restaurar todos los productos, categorías, testimonios y textos a sus valores originales?")) {
      window.restablecerCatalogo();
      mostrarToast("✓ Todo restablecido a valores originales de fábrica");
      cargarTodosLosDatos();
    }
  });

  function descargarArchivo(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ============ Toast ============ */
  let toastTimer;
  function mostrarToast(msg, tipo = "") {
    const toast = document.getElementById("admin-toast");
    toast.innerHTML = msg;
    toast.className = "admin-toast";
    if (tipo) toast.classList.add(`toast--${tipo}`);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    const duracion = tipo === "success" ? 5000 : 3500;
    toastTimer = setTimeout(() => toast.classList.remove("show"), duracion);
  }
});
