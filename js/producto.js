"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(location.search);
  const idParam = parseInt(params.get("id"), 10);
  let productoActual = null;
  let slides = [];
  let slideActivo = 0;
  let cantidad = 1;

  const galleryMain = document.getElementById("gallery-main");
  const galleryThumbs = document.getElementById("gallery-thumbs");
  const galleryCounter = document.getElementById("gallery-counter");
  const galleryPrev = document.getElementById("gallery-prev");
  const galleryNext = document.getElementById("gallery-next");
  const infoBox = document.getElementById("product-info");
  const breadcrumb = document.getElementById("breadcrumb");
  const similarGrid = document.getElementById("similar-grid");
  const toast = document.getElementById("toast");
  const bagCount = document.getElementById("bag-count");

  let toastTimer;
  function mostrarToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function leerBolsa() {
    try { return JSON.parse(sessionStorage.getItem("NATIVE_BOLSA") || "[]") || []; }
    catch (e) { return []; }
  }
  function guardarBolsa(bolsa) {
    try { sessionStorage.setItem("NATIVE_BOLSA", JSON.stringify(bolsa)); } catch (e) {}
  }

  function actualizarContador() {
    const total = leerBolsa().reduce((acc, b) => acc + (b.cantidad || 1), 0);
    if (bagCount) bagCount.textContent = total;
  }

  function obtenerProducto(id) {
    const lista = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
    return lista.find((p) => p.id === id);
  }

  function construirSlides(prod) {
    const reales = [prod.imagen, ...(Array.isArray(prod.galeria) ? prod.galeria : [])]
      .filter((u) => u && typeof u === "string" && u.trim().startsWith("http"))
      .map((u) => u.trim());
    if (reales.length) return reales.map((url) => ({ tipo: "foto", url }));

    const a = (prod.colores && prod.colores[0]) || "#f6e7dd";
    const b = (prod.colores && prod.colores[1]) || "#e7cfc6";
    const emoji = prod.emoji || "✨";
    return [
      { tipo: "emoji", emoji, grad: `linear-gradient(135deg, ${a}, ${b})` },
      { tipo: "emoji", emoji, grad: `linear-gradient(45deg, ${b}, ${a})` },
      { tipo: "emoji", emoji, grad: `radial-gradient(circle at 30% 25%, ${a}, ${b})` }
    ];
  }

  function renderGallery() {
    if (!galleryMain) return;
    slides = construirSlides(productoActual);
    slideActivo = Math.min(slideActivo, slides.length - 1);

    const pintarSlide = (idx) => {
      const s = slides[idx];
      if (s.tipo === "foto") {
        galleryMain.innerHTML = `<img src="${s.url}" alt="${productoActual.nombre}" />`;
      } else {
        galleryMain.innerHTML = `<span class="product-gallery__emoji">${s.emoji}</span>`;
        galleryMain.style.background = s.grad;
      }
      if (galleryCounter) galleryCounter.textContent = `${idx + 1} / ${slides.length}`;
      galleryThumbs.querySelectorAll(".thumb").forEach((t, i) => {
        t.classList.toggle("active", i === idx);
      });
    };

    galleryThumbs.innerHTML = "";
    slides.forEach((s, i) => {
      const thumb = document.createElement("button");
      thumb.className = "thumb" + (i === slideActivo ? " active" : "");
      thumb.setAttribute("aria-label", `Ver foto ${i + 1}`);
      if (s.tipo === "foto") {
        thumb.style.backgroundImage = `url(${s.url})`;
      } else {
        thumb.style.background = s.grad;
        thumb.textContent = s.emoji;
      }
      thumb.addEventListener("click", () => { slideActivo = i; pintarSlide(i); });
      galleryThumbs.appendChild(thumb);
    });

    pintarSlide(slideActivo);
  }

  function incSlide(dir) {
    slideActivo = (slideActivo + dir + slides.length) % slides.length;
    const s = slides[slideActivo];
    const t = galleryThumbs.querySelectorAll(".thumb")[slideActivo];
    if (s.tipo === "foto") {
      galleryMain.innerHTML = `<img src="${s.url}" alt="${productoActual.nombre}" />`;
    } else {
      galleryMain.innerHTML = `<span class="product-gallery__emoji">${s.emoji}</span>`;
      galleryMain.style.background = s.grad;
    }
    if (galleryCounter) galleryCounter.textContent = `${slideActivo + 1} / ${slides.length}`;
    galleryThumbs.querySelectorAll(".thumb").forEach((el, i) => el.classList.toggle("active", i === slideActivo));
    if (t) t.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  if (galleryPrev) galleryPrev.addEventListener("click", () => incSlide(-1));
  if (galleryNext) galleryNext.addEventListener("click", () => incSlide(1));

  const stockMeta = {
    disponible: { icono: "🟢", texto: "En Stock" },
    poco: { icono: "🟡", texto: "Pocas unidades" },
    agotado: { icono: "🔴", texto: "Agotado" },
    oculto: { icono: "👁️", texto: "No disponible" }
  };

  function renderInfo() {
    const p = productoActual;
    const categorias = (window.obtenerCategorias ? window.obtenerCategorias() : window.CATEGORIAS) || {};
    const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
    const sim = cfg.monedaSimbolo || "$";
    const st = stockMeta[p.stock] || stockMeta.disponible;
    const agotado = p.stock === "agotado" || p.stock === "oculto";
    const catEmoji = (categorias[p.categoria] && categorias[p.categoria].emoji) || "🏷️";
    const badge = p.badge ? `<span class="product-info__badge">${p.badge}</span>` : "";
    const viejo = p.viejo ? `<del>${sim}${p.viejo}.00</del>` : "";
    const ws = cfg.whatsappContacto || "";

    infoBox.innerHTML = `
      ${badge}
      <span class="product-info__cat">${catEmoji} ${p.categoria}</span>
      <h1 class="product-info__title">${p.nombre}</h1>
      <div class="product-info__price">
        <span class="actual">${sim}${p.precio}.00</span>
        ${viejo}
        <span class="stock ${p.stock}">${st.icono} ${st.texto}</span>
      </div>
      <p class="product-info__desc">${p.desc || "Descripción próximamente."}</p>
      <ul class="product-info__features">
        <li>🚚 Envío gratis desde ${sim}${cfg.envioGratisMinimo || 50}</li>
        <li>🌱 Cruelty free</li>
        <li>✨ Fórmula limpia y segura</li>
        <li>🔄 Cambios y devoluciones 30 días</li>
      </ul>
      <div class="product-info__cta">
        <div class="qty">
          <button class="qty-btn" id="qty-minus" aria-label="Menos">−</button>
          <span id="qty-val">${cantidad}</span>
          <button class="qty-btn" id="qty-plus" aria-label="Más">+</button>
        </div>
        <button class="btn btn--gold btn-add-detail" id="btn-add-detail" ${agotado ? "disabled" : ""}>
          ${agotado ? st.texto : "Añadir a la bolsa"}
        </button>
      </div>
      <div class="product-info__extra">
        ${ws ? `<a class="btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/${ws.replace(/\D/g, "")}?text=${encodeURIComponent("Hola Amelisa C0smetico, me interesa \"" + p.nombre + "\"")}">💬 ¿Dudas? Escríbenos</a>` : ""}
        <a class="btn-volver" href="index.html#catalogo">← Volver al catálogo</a>
      </div>
      ${agotado ? "" : `
      <div class="product-info__orderbox" id="orderbox">
        <div class="orderbox__head">
          <span class="orderbox__ico">🛒</span>
          <h3>Compra directa</h3>
          <span class="orderbox__resumen">${p.nombre} · ${sim}${p.precio}.00 × <b id="orderbox-qty">${cantidad}</b></span>
        </div>
        <form id="order-form" novalidate>
          <div class="orderbox__grid">
            <label class="orderbox__field">
              <span>Tu nombre</span>
              <input type="text" id="order-nombre" placeholder="Nombre y apellido" autocomplete="name" />
            </label>
            <label class="orderbox__field">
              <span>Tu WhatsApp</span>
              <input type="tel" id="order-tel" placeholder="300 000 0000" autocomplete="tel" />
            </label>
            <label class="orderbox__field">
              <span>Ciudad</span>
              <input type="text" id="order-ciudad" placeholder="Tu ciudad" autocomplete="address-level2" />
            </label>
            <label class="orderbox__field">
              <span>Dirección</span>
              <input type="text" id="order-dir" placeholder="Barrio y dirección" autocomplete="street-address" />
            </label>
            <label class="orderbox__field">
              <span>Tipo de entrega</span>
              <select id="order-entrega">
                <option>Envío a domicilio</option>
                <option>Punto de encuentro</option>
              </select>
            </label>
            <div class="orderbox__field orderbox__field--pago">
              <span>Puedes pagar con</span>
              <ul class="orderbox__pagos">
                <li>💵 Efectivo al recibir</li>
                <li>📱 Nequi</li>
                <li>🏦 Transferencia bancaria</li>
              </ul>
            </div>
          </div>
          <div class="orderbox__total">
            <span>Total a pagar</span>
            <strong id="orderbox-total">${sim}${(p.precio * cantidad).toFixed(2)}</strong>
          </div>
          <button type="submit" class="btn btn--gold" id="btn-orderbox-submit">Confirmar pedido por WhatsApp</button>
          <ol class="orderbox__pasos">
            <li><b>Busca</b> el producto que necesitas en el catálogo.</li>
            <li><b>Llena</b> los datos de tu compra aquí.</li>
            <li><b>Confirma</b> tu pedido por WhatsApp.</li>
            <li><b>Envía</b> el comprobante de pago a este número de WhatsApp:
              ${ws ? `<a class="orderbox__wasap" target="_blank" rel="noopener"
                 href="https://wa.me/${ws.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, acabo de realizar un pedido en Amelisa C0smetico. Adjunto mi comprobante de pago.")}">+${ws.replace(/\D/g, "")}</a>` : "el número que aparece en la página"}
            </li>
          </ol>
        </form>
      </div>`}
    `;

    const qtyVal = document.getElementById("qty-val");

    const sincronizarOrden = () => {
      const q = document.getElementById("orderbox-qty");
      const t = document.getElementById("orderbox-total");
      if (q) q.textContent = cantidad;
      if (t) t.textContent = `${sim}${(p.precio * cantidad).toFixed(2)}`;
    };
    document.getElementById("qty-minus").addEventListener("click", () => {
      cantidad = Math.max(1, cantidad - 1);
      qtyVal.textContent = cantidad;
      sincronizarOrden();
    });
    document.getElementById("qty-plus").addEventListener("click", () => {
      cantidad += 1;
      qtyVal.textContent = cantidad;
      sincronizarOrden();
    });
    document.getElementById("btn-add-detail").addEventListener("click", () => {
      const bolsa = leerBolsa();
      const existente = bolsa.find((b) => b.id === p.id);
      if (existente) existente.cantidad += cantidad;
      else bolsa.push({ ...p, cantidad });
      guardarBolsa(bolsa);
      actualizarContador();
      mostrarToast(`✓ ${p.nombre} añadido a tu bolsa`);
    });

    const formOrden = document.getElementById("order-form");
    if (formOrden) {
      formOrden.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("order-nombre").value.trim();
        const tel = document.getElementById("order-tel").value.trim();
        const ciudad = document.getElementById("order-ciudad").value.trim();
        const dir = document.getElementById("order-dir").value.trim();
        if (!nombre || !tel || !ciudad || !dir) {
          mostrarToast("⚠ Por favor completa nombre, WhatsApp, ciudad y dirección");
          return;
        }
        const entrega = document.getElementById("order-entrega").value;
        const pago = "Efectivo al recibir / Nequi / Transferencia bancaria";
        const pedidos = (window.obtenerPedidos ? window.obtenerPedidos() : []) || [];
        const total = p.precio * cantidad;
        const nuevoPedido = {
          id: (pedidos.length ? Math.max(...pedidos.map((x) => x.id || 100)) + 1 : 101),
          fecha: new Date().toLocaleString(),
          items: [{ id: p.id, nombre: p.nombre, cantidad, precio: p.precio }],
          total,
          estado: "Pedido nuevo",
          cliente: nombre,
          telefono: tel,
          ciudad,
          direccion: dir,
          entrega,
          pago
        };
        pedidos.push(nuevoPedido);
        if (window.guardarPedidos) window.guardarPedidos(pedidos);
        if (ws) {
          const texto = `🧾 NUEVO PEDIDO #${nuevoPedido.id} — Amelisa C0smetico\n\n📦 ${p.nombre} × ${cantidad}\n💰 Total: ${sim}${total.toFixed(2)}\n\n👤 ${nombre}\n📱 ${tel}\n📍 ${ciudad}, ${dir}\n🚚 ${entrega}\n💳 ${pago}`;
          window.open(`https://wa.me/${ws.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`, "_blank");
        }
        mostrarToast(`✓ ¡Pedido #${nuevoPedido.id} enviado por WhatsApp!`);
        formOrden.reset();
        cantidad = 1;
        qtyVal.textContent = cantidad;
        sincronizarOrden();
      });
    }
  }

  function renderBreadcrumb() {
    const categorias = (window.obtenerCategorias ? window.obtenerCategorias() : window.CATEGORIAS) || {};
    const p = productoActual;
    const archivoCat = p.categoria.toLowerCase().replace(/ó/g, "o").replace(/á/g, "a") + ".html";
    const linkCat = document.getElementById(archivoCat) ? archivoCat : "index.html#catalogo";
    breadcrumb.innerHTML = `
      <a href="index.html">Inicio</a>
      <span>›</span>
      <a href="${linkCat}">${p.categoria}</a>
      <span>›</span>
      <span class="actual">${p.nombre}</span>
    `;
  }

  function construirCard(p) {
    const card = document.createElement("article");
    card.className = "card reveal visible";
    const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
    const sim = cfg.monedaSimbolo || "$";
    const colA = (p.colores && p.colores[0]) || "#f6e7dd";
    const colB = (p.colores && p.colores[1]) || "#e7cfc6";
    card.style.setProperty("--media-a", colA);
    card.style.setProperty("--media-b", colB);
    const isAgotado = p.stock === "agotado";
    const badge = p.stock === "agotado"
      ? '<span class="card__badge" style="background:#c92a2a;color:#fff;">Agotado</span>'
      : (p.badge ? `<span class="card__badge">${p.badge}</span>` : "");
    const viejo = p.viejo ? `<del>${sim}${p.viejo}.00</del>` : "";
    const media = p.imagen
      ? `<img src="${p.imagen}" alt="${p.nombre}" class="card__img" loading="lazy" />`
      : `<span class="emoji" loading="lazy">${p.emoji || "✨"}</span>`;

    card.innerHTML = `
      <div class="card__media">
        ${badge}
        <button class="card__wish" aria-label="Agregar a favoritos">♡</button>
        <button class="card__zoom" aria-label="Ver imagen completa">🔍</button>
        ${media}
      </div>
      <div class="card__body">
        <span class="card__cat">${p.categoria}</span>
        <h3 class="card__name">${p.nombre}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__foot">
          <div class="card__price">${sim}${p.precio}.00${viejo}</div>
          <div class="card__actions">
            <button class="btn-more" aria-label="Ver más detalles">Ver más</button>
            <button class="btn-add ${isAgotado ? 'btn-add--disabled' : ''}" data-id="${p.id}" ${isAgotado ? 'disabled style="opacity:0.6;cursor:not-allowed;"' : ''}>
              ${isAgotado ? 'Agotado' : 'Añadir +'}
            </button>
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      window.location.href = `producto.html?id=${p.id}`;
    });
    card.querySelector(".card__wish").addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      btn.classList.toggle("liked");
      btn.textContent = btn.classList.contains("liked") ? "♥" : "♡";
      mostrarToast(btn.classList.contains("liked") ? `♥ ${p.nombre} guardado en favoritos` : `♡ ${p.nombre} eliminado de favoritos`);
    });
    card.querySelector(".card__zoom").addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.abrirLightbox) {
        window.abrirLightbox({
          titulo: p.nombre,
          imagenes: window.imagenesProducto ? window.imagenesProducto(p) : [],
          emoji: p.emoji,
          colA,
          colB
        });
      }
    });
    const btnAdd = card.querySelector(".btn-add");
    if (btnAdd && !isAgotado) {
      btnAdd.addEventListener("click", () => {
        const bolsa = leerBolsa();
        const existente = bolsa.find((b) => b.id === p.id);
        if (existente) existente.cantidad += 1;
        else bolsa.push({ ...p, cantidad: 1 });
        guardarBolsa(bolsa);
        actualizarContador();
        mostrarToast(`✓ ${p.nombre} añadido a tu bolsa`);
      });
    }
    card.querySelector(".btn-more").addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `producto.html?id=${p.id}`;
    });
    return card;
  }

  function renderSimilares() {
    if (!similarGrid) return;
    const lista = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
    const visibles = lista.filter((p) => p.stock !== "oculto");
    const mismos = visibles.filter((p) => p.categoria === productoActual.categoria && p.id !== productoActual.id);
    const sugeridos = mismos.length >= 4 ? mismos : [...mismos, ...visibles.filter((p) => p.id !== productoActual.id && p.categoria !== productoActual.categoria)];
    const unicos = Array.from(new Map(sugeridos.map((p) => [p.id, p])).values()).slice(0, 4);
    similarGrid.innerHTML = "";
    unicos.forEach((p) => similarGrid.appendChild(construirCard(p)));
  }

  function cargarDatos() {
    productoActual = obtenerProducto(idParam);
    if (!productoActual) {
      infoBox.innerHTML = `
        <div class="product-info__notfound">
          <span class="ico">🔍</span>
          <h2>Producto no encontrado</h2>
          <p>Puede que haya sido retirado del catálogo.</p>
          <a class="btn btn--gold" href="index.html#catalogo">Ver catálogo</a>
        </div>`;
      breadcrumb.innerHTML = `<a href="index.html">Inicio</a><span>›</span><span class="actual">Producto no encontrado</span>`;
      if (similarGrid) similarGrid.parentElement.style.display = "none";
      return;
    }
    document.title = `${productoActual.nombre} — Amelisa C0smetico`;
    renderGallery();
    renderInfo();
    renderBreadcrumb();
    renderSimilares();
    actualizarContador();
  }

  if (window.sincronizarDesdeServidor) {
    setTimeout(() => window.sincronizarDesdeServidor(() => cargarDatos()), 350);
  }
  cargarDatos();

  /* ============ Menú móvil ============ */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("nav-links");
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", navLinks.classList.contains("open"));
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  document.querySelectorAll(".menu-toggle").forEach((t) => {
    t.addEventListener("click", (e) => {
      e.preventDefault();
      const li = t.closest(".has-menu");
      if (li) li.classList.toggle("open");
    });
  });

  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    if (nav) {
      if (window.scrollY > 30) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }
  });

  const toTop = document.getElementById("to-top");
  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("show", window.scrollY > 600);
    });
  }
});