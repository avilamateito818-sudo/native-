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
    cargarDatos();
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

    // Credenciales permitidas: admin / admin o admi / nativa2026
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

  /* ============ Elementos del DOM ============ */
  const productsGrid = document.getElementById("admin-products-grid");
  const metricTotal = document.getElementById("metric-total");
  const metricCats = document.getElementById("metric-cats");
  const metricPrecio = document.getElementById("metric-precio");
  const metricOfertas = document.getElementById("metric-ofertas");
  const searchInput = document.getElementById("admin-search");
  const catFilter = document.getElementById("admin-cat-filter");
  const btnNuevoProd = document.getElementById("btn-nuevo-prod");
  const btnDescargarJs = document.getElementById("btn-descargar-js");
  const btnRestablecer = document.getElementById("btn-restablecer");

  /* Modal y Formulario */
  const modal = document.getElementById("product-modal");
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
  const prodDesc = document.getElementById("prod-desc");
  const prodFile = document.getElementById("prod-file");
  const imageDropzone = document.getElementById("image-dropzone");
  const prodImgUrl = document.getElementById("prod-img-url");
  const prodEmoji = document.getElementById("prod-emoji");
  const prodColorA = document.getElementById("prod-color-a");
  const prodColorB = document.getElementById("prod-color-b");

  /* Vista previa en vivo */
  const previewMedia = document.getElementById("preview-media");
  const previewMediaContent = document.getElementById("preview-media-content");
  const previewBadge = document.getElementById("preview-badge");
  const previewCat = document.getElementById("preview-cat");
  const previewName = document.getElementById("preview-name");
  const previewDesc = document.getElementById("preview-desc");
  const previewPrice = document.getElementById("preview-price");
  const previewOld = document.getElementById("preview-old");

  let imagenActualBase64 = "";

  /* ============ Carga y Render de Datos ============ */
  function cargarDatos() {
    const prods = window.obtenerProductos();
    actualizarMetricas(prods);
    actualizarSelectorCategorias(prods);
    renderizarProductos(prods);
  }

  function actualizarMetricas(prods) {
    metricTotal.textContent = prods.length;
    const cats = new Set(prods.map((p) => p.categoria));
    metricCats.textContent = cats.size;
    const suma = prods.reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0);
    metricPrecio.textContent = prods.length ? `$${(suma / prods.length).toFixed(1)}` : "$0";
    const ofertas = prods.filter((p) => p.viejo && parseFloat(p.viejo) > parseFloat(p.precio));
    metricOfertas.textContent = ofertas.length;
  }

  function actualizarSelectorCategorias(prods) {
    const cats = Array.from(new Set(prods.map((p) => p.categoria)));
    const catActual = catFilter.value;

    catFilter.innerHTML = '<option value="Todos">Todas las categorías</option>';
    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      catFilter.appendChild(opt);
    });

    if (cats.includes(catActual)) catFilter.value = catActual;
  }

  function renderizarProductos(prods) {
    const busqueda = (searchInput.value || "").toLowerCase().trim();
    const filtro = catFilter.value;

    const filtrados = prods.filter((p) => {
      const matchCat = filtro === "Todos" || p.categoria === filtro;
      const matchText = !busqueda || p.nombre.toLowerCase().includes(busqueda) || (p.desc && p.desc.toLowerCase().includes(busqueda));
      return matchCat && matchText;
    });

    productsGrid.innerHTML = "";

    if (filtrados.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--muted); background: var(--white); border-radius: 20px; border: 1px dashed var(--border);">
          <span style="font-size: 40px; display: block; margin-bottom: 10px;">🔍</span>
          <h3>No se encontraron productos</h3>
          <p>Prueba con otros términos de búsqueda o añade un nuevo producto.</p>
        </div>`;
      return;
    }

    filtrados.forEach((p) => {
      const card = document.createElement("article");
      card.className = "admin-card";
      const colA = (p.colores && p.colores[0]) || "#f6e7dd";
      const colB = (p.colores && p.colores[1]) || "#e7cfc6";
      card.style.setProperty("--media-a", colA);
      card.style.setProperty("--media-b", colB);

      const mediaHtml = p.imagen
        ? `<img src="${p.imagen}" alt="${p.nombre}" />`
        : `<span style="font-size: 60px;">${p.emoji || "✨"}</span>`;

      const badgeHtml = p.viejo ? '<span class="admin-card__badge">Oferta</span>' : "";
      const viejoHtml = p.viejo ? `<span class="admin-card__old-price">$${p.viejo}.00</span>` : "";

      card.innerHTML = `
        <div class="admin-card__media">
          ${badgeHtml}
          <span class="admin-card__id">#${p.id}</span>
          ${mediaHtml}
        </div>
        <div class="admin-card__body">
          <span class="admin-card__cat">${p.categoria}</span>
          <h3 class="admin-card__title">${p.nombre}</h3>
          <p class="admin-card__desc">${p.desc}</p>
          <div class="admin-card__price-row">
            <span class="admin-card__price">$${p.precio}.00</span>
            ${viejoHtml}
          </div>
          <div class="admin-card__actions">
            <button class="btn-action btn-action--edit" data-id="${p.id}">✏️ Editar</button>
            <button class="btn-action btn-action--delete" data-id="${p.id}">🗑️ Eliminar</button>
          </div>
        </div>
      `;

      card.querySelector(".btn-action--edit").addEventListener("click", () => abrirModalEditar(p));
      card.querySelector(".btn-action--delete").addEventListener("click", () => confirmarEliminar(p));

      productsGrid.appendChild(card);
    });
  }

  /* ============ Búsqueda y Filtro ============ */
  searchInput.addEventListener("input", () => renderizarProductos(window.obtenerProductos()));
  catFilter.addEventListener("change", () => renderizarProductos(window.obtenerProductos()));

  /* ============ Modal Editor ============ */
  function abrirModalNuevo() {
    modalTitle.textContent = "Añadir Nuevo Producto";
    prodId.value = "";
    productForm.reset();
    imagenActualBase64 = "";
    groupNuevaCat.style.display = "none";
    prodColorA.value = "#f6e7dd";
    prodColorB.value = "#e7cfc6";
    prodEmoji.value = "✨";
    actualizarVistaPrevia();
    modal.classList.add("open");
    prodNombre.focus();
  }

  function abrirModalEditar(p) {
    modalTitle.textContent = `Editar Producto #${p.id}`;
    prodId.value = p.id;
    prodNombre.value = p.nombre || "";
    
    // Categoría
    const catOptions = Array.from(prodCategoria.options).map(o => o.value);
    if (catOptions.includes(p.categoria)) {
      prodCategoria.value = p.categoria;
      groupNuevaCat.style.display = "none";
      prodNuevaCat.value = "";
    } else {
      prodCategoria.value = "NUEVA";
      groupNuevaCat.style.display = "block";
      prodNuevaCat.value = p.categoria;
    }

    prodPrecio.value = p.precio || "";
    prodViejo.value = p.viejo || "";
    prodDesc.value = p.desc || "";
    prodEmoji.value = p.emoji || "✨";
    prodImgUrl.value = (p.imagen && p.imagen.startsWith("http")) ? p.imagen : "";
    imagenActualBase64 = (p.imagen && p.imagen.startsWith("data:")) ? p.imagen : "";
    
    prodColorA.value = (p.colores && p.colores[0]) || "#f6e7dd";
    prodColorB.value = (p.colores && p.colores[1]) || "#e7cfc6";

    actualizarVistaPrevia();
    modal.classList.add("open");
  }

  function cerrarModal() {
    modal.classList.remove("open");
  }

  btnNuevoProd.addEventListener("click", abrirModalNuevo);
  modalCloseBtn.addEventListener("click", cerrarModal);
  modalCancelBtn.addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
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

  /* ============ Subida y Procesamiento de Imágenes ============ */
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
        // Redimensionar para optimizar tamaño en almacenamiento
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

  /* ============ Actualización en Vivo de la Vista Previa ============ */
  function actualizarVistaPrevia() {
    const nombre = prodNombre.value.trim() || "Nombre del Producto";
    const cat = prodCategoria.value === "NUEVA"
      ? (prodNuevaCat.value.trim() || "Nueva Categoría")
      : prodCategoria.value;
    const desc = prodDesc.value.trim() || "Descripción del producto tal como aparecerá en el catálogo.";
    const precio = parseFloat(prodPrecio.value) || 0;
    const viejo = parseFloat(prodViejo.value) || 0;
    const emoji = prodEmoji.value.trim() || "✨";
    const colorA = prodColorA.value;
    const colorB = prodColorB.value;
    const urlImg = prodImgUrl.value.trim();

    previewName.textContent = nombre;
    previewCat.textContent = cat;
    previewDesc.textContent = desc;
    previewPrice.textContent = `$${precio.toFixed(2)}`;

    if (viejo > precio) {
      previewBadge.style.display = "block";
      previewOld.textContent = `$${viejo.toFixed(2)}`;
    } else {
      previewBadge.style.display = "none";
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

  [prodNombre, prodNuevaCat, prodPrecio, prodViejo, prodDesc, prodEmoji, prodImgUrl, prodColorA, prodColorB].forEach((el) => {
    el.addEventListener("input", () => {
      if (el === prodImgUrl && prodImgUrl.value.trim()) {
        imagenActualBase64 = ""; // Priorizar URL si se escribe una
      }
      actualizarVistaPrevia();
    });
  });

  /* ============ Guardar Producto ============ */
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const idExistente = prodId.value ? parseInt(prodId.value, 10) : null;
    const nombre = prodNombre.value.trim();
    const categoria = prodCategoria.value === "NUEVA"
      ? prodNuevaCat.value.trim()
      : prodCategoria.value;
    const precio = parseFloat(prodPrecio.value);
    const viejo = prodViejo.value ? parseFloat(prodViejo.value) : undefined;
    const desc = prodDesc.value.trim();
    const emoji = prodEmoji.value.trim() || "✨";
    const colores = [prodColorA.value, prodColorB.value];
    const imagen = prodImgUrl.value.trim() || imagenActualBase64 || "";

    if (!nombre || !categoria || isNaN(precio)) {
      mostrarToast("⚠ Por favor completa los campos obligatorios");
      return;
    }

    const productos = window.obtenerProductos();

    if (idExistente) {
      // Editar
      const idx = productos.findIndex((p) => p.id === idExistente);
      if (idx !== -1) {
        productos[idx] = {
          ...productos[idx],
          nombre,
          categoria,
          precio,
          viejo,
          desc,
          emoji,
          imagen,
          colores
        };
        mostrarToast(`✓ Producto "${nombre}" actualizado`);
      }
    } else {
      // Crear nuevo
      const nuevoId = productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
      const nuevoProd = {
        id: nuevoId,
        nombre,
        categoria,
        precio,
        viejo,
        desc,
        emoji,
        imagen,
        colores
      };
      productos.push(nuevoProd);
      mostrarToast(`✓ Producto "${nombre}" añadido al catálogo`);
    }

    window.guardarProductos(productos);
    cerrarModal();
    cargarDatos();
  });

  /* ============ Eliminar Producto ============ */
  function confirmarEliminar(p) {
    if (confirm(`¿Estás seguro de eliminar "${p.nombre}" del catálogo?`)) {
      let productos = window.obtenerProductos();
      productos = productos.filter((item) => item.id !== p.id);
      window.guardarProductos(productos);
      mostrarToast(`✓ "${p.nombre}" eliminado`);
      cargarDatos();
    }
  }

  /* ============ Exportar a Git (Descargar productos.js) ============ */
  btnDescargarJs.addEventListener("click", () => {
    const prods = window.obtenerProductos();
    const cats = window.obtenerCategorias();
    const orden = window.ORDEN_CATEGORIAS_DEFECTO || [];

    const contenidoJs = `"use strict";

window.PRODUCTOS_DEFECTO = ${JSON.stringify(prods, null, 2)};

window.CATEGORIAS_DEFECTO = ${JSON.stringify(cats, null, 2)};

window.ORDEN_CATEGORIAS_DEFECTO = ${JSON.stringify(orden, null, 2)};

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
    return true;
  } catch (e) {
    return false;
  }
};

window.restablecerCatalogo = function() {
  try {
    localStorage.removeItem("NATIVE_PRODUCTOS");
    localStorage.removeItem("NATIVE_CATEGORIAS");
    window.PRODUCTOS = [...window.PRODUCTOS_DEFECTO];
    window.CATEGORIAS = { ...window.CATEGORIAS_DEFECTO };
    window.ORDEN_CATEGORIAS = [...window.ORDEN_CATEGORIAS_DEFECTO];
    window.dispatchEvent(new CustomEvent("productosActualizados", { detail: window.PRODUCTOS }));
    return true;
  } catch (e) {
    return false;
  }
};

/* Inicializar datos globales */
window.PRODUCTOS = window.obtenerProductos();
window.CATEGORIAS = window.obtenerCategorias();
window.ORDEN_CATEGORIAS = window.ORDEN_CATEGORIAS_DEFECTO;
`;

    const blob = new Blob([contenidoJs], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "productos.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast("📥 Archivo productos.js descargado para guardar en Git");
  });

  /* ============ Restablecer Catálogo ============ */
  btnRestablecer.addEventListener("click", () => {
    if (confirm("¿Deseas restaurar todos los productos originales de fábrica? Se perderán las modificaciones locales.")) {
      window.restablecerCatalogo();
      mostrarToast("✓ Catálogo restaurado con éxito");
      cargarDatos();
    }
  });

  /* ============ Toast ============ */
  let toastTimer;
  function mostrarToast(msg) {
    const toast = document.getElementById("admin-toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }
});
