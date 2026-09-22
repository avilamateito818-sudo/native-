"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ============ Preloader ============ */
  const preloader = document.getElementById("preloader");
  const preloaderBar = document.getElementById("preloader-bar");
  let carga = 0;
  const interval = setInterval(() => {
    carga = Math.min(carga + Math.random() * 22, 100);
    preloaderBar.style.width = carga + "%";
    if (carga === 100) {
      clearInterval(interval);
      setTimeout(() => preloader.classList.add("hidden"), 250);
    }
  }, 90);
  window.addEventListener("load", () => {
    clearInterval(interval);
    preloaderBar.style.width = "100%";
    setTimeout(() => preloader.classList.add("hidden"), 200);
  });

  let PRODUCTOS = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
  let CATEGORIAS = (window.obtenerCategorias ? window.obtenerCategorias() : window.CATEGORIAS) || {};
  let TESTIMONIOS = (window.obtenerTestimonios ? window.obtenerTestimonios() : window.TESTIMONIOS) || [];
  let ORDEN = window.ORDEN_CATEGORIAS || Object.keys(CATEGORIAS);
  const categoria = document.body.dataset.categoria;

  const grid = document.getElementById("catalog-grid");
  const countBadge = document.getElementById("bag-count");
  const bagBtn = document.getElementById("bag-btn");
  const drawer = document.getElementById("drawer");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const drawerItems = document.getElementById("drawer-items");
  const drawerSubtotal = document.getElementById("drawer-subtotal");
  const body = document.body;

  let bolsa = [];
  try { bolsa = JSON.parse(sessionStorage.getItem("NATIVE_BOLSA") || "[]") || []; } catch (e) { bolsa = []; }
  let filtro = "Todos";

  /* ============ Aplicar Configuración de Contenido Dinámico ============ */
  function aplicarConfigTienda() {
    const cfg = window.obtenerConfigTienda ? window.obtenerConfigTienda() : (window.CONFIG_TIENDA || {});
    const sim = cfg.monedaSimbolo || "$";

    // 1. Marquee
    const marqueeTrack = document.querySelector(".marquee__track span");
    if (marqueeTrack && cfg.marqueeTexto) {
      marqueeTrack.innerHTML = cfg.marqueeTexto;
    }

    // 2. Hero
    const heroEyebrow = document.querySelector(".hero__eyebrow");
    if (heroEyebrow && cfg.heroEyebrow) heroEyebrow.textContent = cfg.heroEyebrow;

    const heroTitulo = document.querySelector(".hero__inner h1");
    if (heroTitulo && cfg.heroTitulo) heroTitulo.innerHTML = cfg.heroTitulo;

    const heroCopy = document.querySelector(".hero__copy");
    if (heroCopy && cfg.heroCopy) heroCopy.textContent = cfg.heroCopy;

    // Estadísticas
    const statsNodes = document.querySelectorAll(".hero__stats div");
    if (statsNodes.length >= 3) {
      if (cfg.stat1Num) statsNodes[0].querySelector(".num").textContent = cfg.stat1Num;
      if (cfg.stat1Label) statsNodes[0].querySelector("small").textContent = cfg.stat1Label;
      if (cfg.stat2Num) statsNodes[1].querySelector(".num").textContent = cfg.stat2Num;
      if (cfg.stat2Label) statsNodes[1].querySelector("small").textContent = cfg.stat2Label;
      if (cfg.stat3Num) statsNodes[2].querySelector(".num").textContent = cfg.stat3Num;
      if (cfg.stat3Label) statsNodes[2].querySelector("small").textContent = cfg.stat3Label;
    }

    // 3. Ofertas / Promo
    const promoSection = document.getElementById("ofertas");
    if (promoSection) {
      const promoTag = promoSection.querySelector(".section__tag");
      const promoH2 = promoSection.querySelector("h2");
      const promoP = promoSection.querySelector("p");
      const promoBig = promoSection.querySelector(".promo__offer .big");
      const promoSpan = promoSection.querySelector(".promo__offer span");

      if (promoTag && cfg.promoTag) promoTag.textContent = cfg.promoTag;
      if (promoH2 && cfg.promoTitulo) promoH2.innerHTML = cfg.promoTitulo;
      if (promoP && cfg.promoDesc) promoP.textContent = cfg.promoDesc;
      if (promoBig && cfg.promoDescuento) promoBig.textContent = cfg.promoDescuento;
      if (promoSpan && cfg.promoSubtexto) promoSpan.textContent = cfg.promoSubtexto;
    }

    // 4. Contacto y Footer
    if (cfg.telefonoContacto) {
      document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
        a.href = `tel:+${cfg.telefonoContacto.replace(/\D/g, "")}`;
        a.textContent = `📞 ${cfg.telefonoContacto}`;
      });
    }

    if (cfg.emailContacto) {
      document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
        a.href = `mailto:${cfg.emailContacto}`;
        a.textContent = `✉ ${cfg.emailContacto}`;
      });
    }
  }

  /* ============ Renderizado de Testimonios ============ */
  function renderTestimonios() {
    const cont = document.querySelector(".testimonials__grid");
    if (!cont) return;

    TESTIMONIOS = (window.obtenerTestimonios ? window.obtenerTestimonios() : window.TESTIMONIOS) || [];
    if (TESTIMONIOS.length === 0) return;

    cont.innerHTML = "";
    TESTIMONIOS.forEach((t) => {
      const card = document.createElement("div");
      card.className = "testimonial reveal visible";
      const stars = "★".repeat(t.estrellas || 5);
      card.innerHTML = `
        <div class="stars">${stars}</div>
        <p>"${t.comentario}"</p>
        <footer>${t.nombre} <small>${t.ciudad || ""}</small></footer>
      `;
      cont.appendChild(card);
    });
  }

  /* ============ Renderizado de Productos ============ */
  function renderProductos(cat) {
    if (!grid) return;
    PRODUCTOS = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
    const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
    const sim = cfg.monedaSimbolo || "$";

    // Filtrar productos ocultos para clientes públicos
    const visibles = PRODUCTOS.filter((p) => p.stock !== "oculto");
    const items = !cat || cat === "Todos" ? visibles : visibles.filter((p) => p.categoria === cat);
    grid.innerHTML = "";

    if (items.length === 0) {
      grid.insertAdjacentHTML("beforeend", '<p class="catalog__empty" style="display:block">No hay productos en esta categoría por el momento.</p>');
      return;
    }

    items.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card reveal visible";
      const colA = (p.colores && p.colores[0]) ? p.colores[0] : "#f6e7dd";
      const colB = (p.colores && p.colores[1]) ? p.colores[1] : "#e7cfc6";
      card.style.setProperty("--media-a", colA);
      card.style.setProperty("--media-b", colB);

      const isAgotado = p.stock === "agotado";

      let badgeHtml = "";
      if (isAgotado) {
        badgeHtml = '<span class="card__badge" style="background:#c92a2a;color:#fff;">Agotado</span>';
      } else if (p.badge) {
        badgeHtml = `<span class="card__badge">${p.badge}</span>`;
      } else if (p.viejo && parseFloat(p.viejo) > parseFloat(p.precio)) {
        badgeHtml = '<span class="card__badge">Oferta</span>';
      }

      const viejo = p.viejo ? `<del>${sim}${p.viejo}.00</del>` : "";
      const mediaHtml = p.imagen
        ? `<img src="${p.imagen}" alt="${p.nombre}" class="card__img" loading="lazy" />`
        : `<span class="emoji" loading="lazy">${p.emoji || "✨"}</span>`;

      card.innerHTML = `
        <div class="card__media">
          ${badgeHtml}
          <button class="card__wish" aria-label="Agregar a favoritos">♡</button>
          <button class="card__zoom" aria-label="Ver imagen completa">🔍</button>
          ${mediaHtml}
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
      grid.appendChild(card);

      card.querySelector(".card__wish").addEventListener("click", (e) => {
        const btn = e.currentTarget;
        btn.classList.toggle("liked");
        btn.textContent = btn.classList.contains("liked") ? "♥" : "♡";
        showToast(btn.classList.contains("liked") ? `♥ ${p.nombre} guardado en favoritos` : `♡ ${p.nombre} eliminado de favoritos`);
      });

      card.querySelector(".card__zoom").addEventListener("click", () => {
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
      if (!isAgotado) {
        btnAdd.addEventListener("click", () => agregarAlBolsa(p));
      }

      card.querySelector(".btn-more").addEventListener("click", () => {
        window.location.href = `producto.html?id=${p.id}`;
      });

      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        window.location.href = `producto.html?id=${p.id}`;
      });
    });
  }

  /* ============ Filtros Dinámicos en Home ============ */
  function renderFiltrosHome() {
    const filterContainer = document.getElementById("catalog-filters");
    if (!filterContainer) return;

    PRODUCTOS = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
    CATEGORIAS = (window.obtenerCategorias ? window.obtenerCategorias() : window.CATEGORIAS) || {};

    const listaCats = Array.from(new Set([
      ...(window.ORDEN_CATEGORIAS_DEFECTO || []),
      ...Object.keys(CATEGORIAS),
      ...PRODUCTOS.map((p) => p.categoria)
    ])).filter(Boolean);

    filterContainer.innerHTML = "";

    const btnTodos = document.createElement("button");
    btnTodos.className = `filter-btn ${filtro === "Todos" ? "active" : ""}`;
    btnTodos.dataset.filter = "Todos";
    btnTodos.textContent = "Todos";
    btnTodos.addEventListener("click", () => setFiltro("Todos"));
    filterContainer.appendChild(btnTodos);

    listaCats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = `filter-btn ${filtro === cat ? "active" : ""}`;
      btn.dataset.filter = cat;
      const emoji = (CATEGORIAS[cat] && CATEGORIAS[cat].emoji) || "🏷️";
      btn.textContent = `${emoji} ${cat}`;
      btn.addEventListener("click", () => setFiltro(cat));
      filterContainer.appendChild(btn);
    });
  }

  function setFiltro(cat) {
    filtro = cat;
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.filter === cat));
    renderProductos(cat);
  }

  /* ============ Eventos de Actualización en Vivo ============ */
  window.addEventListener("productosActualizados", (e) => {
    PRODUCTOS = e.detail || (window.obtenerProductos ? window.obtenerProductos() : []);
    if (!categoria) renderFiltrosHome();
    renderProductos(categoria || filtro);
  });

  window.addEventListener("categoriasActualizadas", (e) => {
    CATEGORIAS = e.detail || (window.obtenerCategorias ? window.obtenerCategorias() : {});
    if (!categoria) renderFiltrosHome();
  });

  window.addEventListener("testimoniosActualizados", (e) => {
    TESTIMONIOS = e.detail || (window.obtenerTestimonios ? window.obtenerTestimonios() : []);
    renderTestimonios();
  });

  window.addEventListener("configTiendaActualizada", () => {
    aplicarConfigTienda();
    renderProductos(categoria || filtro);
  });

  window.addEventListener("storage", (e) => {
    if (e.key === "NATIVE_PRODUCTOS" || e.key === "NATIVE_CATEGORIAS" || e.key === "NATIVE_CONFIG_TIENDA" || e.key === "NATIVE_TESTIMONIOS") {
      PRODUCTOS = window.obtenerProductos ? window.obtenerProductos() : [];
      CATEGORIAS = window.obtenerCategorias ? window.obtenerCategorias() : {};
      TESTIMONIOS = window.obtenerTestimonios ? window.obtenerTestimonios() : [];
      if (!categoria) renderFiltrosHome();
      renderProductos(categoria || filtro);
      renderTestimonios();
      aplicarConfigTienda();
    }
  });

  /* ============ Inicialización ============ */
  aplicarConfigTienda();
  renderTestimonios();

  if (categoria) {
    const meta = CATEGORIAS[categoria] || {
      emoji: "✨",
      tagline: `Productos de ${categoria}`,
      desc: `Selección curada de ${categoria}`,
      grad: ["#f4d9e2", "#eec9d6"],
      n: "01"
    };

    document.title = `${categoria} — Native Origen`;

    const banner = document.getElementById("cat-banner");
    if (banner) {
      banner.style.setProperty("--cat-a", meta.grad[0]);
      banner.style.setProperty("--cat-b", meta.grad[1]);
      banner.innerHTML = `
        <div class="cat-banner__inner">
          <div class="cat-banner__text">
            <span class="section__tag">Catálogo · ${meta.n || "01"}</span>
            <h1 class="cat-banner__title">${meta.emoji} ${categoria}</h1>
            <p class="cat-banner__tagline">${meta.tagline}</p>
            <p class="cat-banner__desc">${meta.desc}</p>
            <div class="cat-banner__meta">
              <span><strong>${PRODUCTOS.filter((p) => p.categoria === categoria && p.stock !== 'oculto').length}</strong> productos</span>
              <span><strong>Envio gratis</strong> +$50</span>
              <span><strong>100%</strong> cruelty free</span>
            </div>
          </div>
          <div class="cat-banner__emoji" aria-hidden="true">${meta.emoji}</div>
        </div>`;
    }

    const otros = document.getElementById("otros");
    if (otros) {
      ORDEN.filter((c) => c !== categoria).forEach((c) => {
        if (CATEGORIAS[c]) {
          const chip = document.createElement("a");
          chip.className = "chip";
          chip.href = `${c.toLowerCase().replace(/ó/g, "o").replace(/á/g, "a")}.html`;
          chip.textContent = `${CATEGORIAS[c].emoji} ${c}`;
          otros.appendChild(chip);
        }
      });
    }

    renderProductos(categoria);
  } else {
    renderFiltrosHome();

    renderProductos("Todos");
  }

  /* ============ Sincronización con el servidor ============ */
  if (window.sincronizarDesdeServidor) {
    setTimeout(() => window.sincronizarDesdeServidor(), 350);
  }

  /* ============ Bolsa / Carrito ============ */
  function agregarAlBolsa(producto) {
    const existente = bolsa.find((b) => b.id === producto.id);
    if (existente) existente.cantidad += 1;
    else bolsa.push({ ...producto, cantidad: 1 });

    countBadge.textContent = totalUnidades();
    countBadge.classList.remove("bag-bump");
    void countBadge.offsetWidth;
    countBadge.classList.add("bag-bump");
    showToast(`✓ ${producto.nombre} añadido a tu bolsa`);
    renderDrawer();
  }

  function totalUnidades() {
    return bolsa.reduce((acc, b) => acc + b.cantidad, 0);
  }

  function totalPrecio() {
    return bolsa.reduce((acc, b) => acc + b.precio * b.cantidad, 0);
  }

  function renderDrawer() {
    try { sessionStorage.setItem("NATIVE_BOLSA", JSON.stringify(bolsa)); } catch (e) {}
    const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
    const sim = cfg.monedaSimbolo || "$";

    countBadge.textContent = totalUnidades();
    if (bolsa.length === 0) {
      drawerItems.innerHTML = `
        <div class="drawer__empty">
          <span class="ico">🛍</span>
          Tu bolsa está vacía<br>Descubre nuestros favoritos en el catálogo.
        </div>`;
      drawerSubtotal.textContent = `${sim}0.00`;
      setCheckoutState(false);
      return;
    }

    drawerItems.innerHTML = "";
    bolsa.forEach((b) => {
      const item = document.createElement("div");
      item.className = "drawer__item";
      const colA = (b.colores && b.colores[0]) ? b.colores[0] : "#f6e7dd";
      const colB = (b.colores && b.colores[1]) ? b.colores[1] : "#e7cfc6";
      item.style.setProperty("--media-a", colA);
      item.style.setProperty("--media-b", colB);
      const thumbHtml = b.imagen
        ? `<img src="${b.imagen}" alt="${b.nombre}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" />`
        : (b.emoji || "🛍");
      item.innerHTML = `
        <div class="thumb">${thumbHtml}</div>
        <div class="info">
          <strong>${b.nombre}</strong>
          <small>${b.categoria}</small>
          <div class="qty">
            <button class="qty-minus" data-id="${b.id}">−</button>
            <span>${b.cantidad}</span>
            <button class="qty-plus" data-id="${b.id}">+</button>
          </div>
        </div>
        <div class="price">${sim}${(b.precio * b.cantidad).toFixed(2)}</div>
        <button class="remove" data-id="${b.id}" aria-label="Eliminar">✕</button>
      `;
      item.querySelector(".qty-minus").addEventListener("click", () => cambiarCantidad(b.id, -1));
      item.querySelector(".qty-plus").addEventListener("click", () => cambiarCantidad(b.id, 1));
      item.querySelector(".remove").addEventListener("click", () => quitarDeBolsa(b.id));
      drawerItems.appendChild(item);
    });

    drawerSubtotal.textContent = `${sim}${totalPrecio().toFixed(2)}`;
    setCheckoutState(true);
  }

  function cambiarCantidad(id, delta) {
    const item = bolsa.find((b) => b.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) quitarDeBolsa(id);
    else renderDrawer();
  }

  function quitarDeBolsa(id) {
    bolsa = bolsa.filter((b) => b.id !== id);
    renderDrawer();
  }

  function setCheckoutState(activo) {
    const btn = document.getElementById("btn-checkout");
    if (btn) btn.disabled = !activo;
  }

  /* ---------- Abrir / cerrar drawer ---------- */
  function abrirDrawer() {
    if (bolsa.length === 0) renderDrawer();
    drawer.classList.add("open");
    drawerOverlay.classList.add("open");
    body.style.overflow = "hidden";
  }

  function cerrarDrawer() {
    drawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
    body.style.overflow = "";
  }

  bagBtn.addEventListener("click", abrirDrawer);
  drawerOverlay.addEventListener("click", cerrarDrawer);
  document.getElementById("drawer-close").addEventListener("click", cerrarDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarDrawer();
  });

  const checkoutBtn = document.getElementById("btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
      const sim = cfg.monedaSimbolo || "$";
      const total = totalPrecio().toFixed(2);

      // Registrar pedido en el historial para el admin
      const pedidos = window.obtenerPedidos ? window.obtenerPedidos() : [];
      const nuevoPedido = {
        id: (pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id || 100)) + 1 : 101),
        fecha: new Date().toLocaleString(),
        items: bolsa.map((b) => ({ id: b.id, nombre: b.nombre, cantidad: b.cantidad, precio: b.precio })),
        total: totalPrecio(),
        estado: "Completado"
      };
      pedidos.push(nuevoPedido);
      if (window.guardarPedidos) window.guardarPedidos(pedidos);

      // Si tiene WhatsApp configurado, abrir chat opcionalmente
      if (cfg.whatsappContacto) {
        const textoMsg = encodeURIComponent(`Hola Native Origen, me gustaría confirmar mi pedido #${nuevoPedido.id} por total de ${sim}${total}`);
        const urlWp = `https://wa.me/${cfg.whatsappContacto}?text=${textoMsg}`;
        window.open(urlWp, "_blank");
      }

      cerrarDrawer();
      bolsa = [];
      renderDrawer();
      showToast(`✓ ¡Pedido #${nuevoPedido.id} procesado con éxito por ${sim}${total}!`);
    });
  }

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

  /* ============ Scroll: navbar + menú activo + back-to-top ============ */
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("to-top");
  const secciones = ["inicio", "nosotros", "catalogo", "ofertas", "testimonios", "contacto"];

  window.addEventListener("scroll", () => {
    if (nav) {
      if (window.scrollY > 30) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }

    if (toTop) {
      toTop.classList.toggle("show", window.scrollY > 600);
    }

    const pos = window.scrollY + 140;
    let actual = secciones[0];
    for (const s of secciones) {
      const el = document.getElementById(s);
      if (el && el.offsetTop <= pos) actual = s;
    }
    if (navLinks) {
      navLinks.querySelectorAll("a").forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === `#${actual}`);
      });
    }
  });

  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  renderDrawer();
  if (location.search.includes("bolsa=1")) {
    setTimeout(abrirDrawer, 300);
  }

  /* ============ Animación de contadores ============ */
  const stats = document.querySelectorAll(".hero__stats div");
  const statsIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || en.target.dataset.conteo) return;
        en.target.dataset.conteo = "";
        const nodo = en.target.querySelector(".num");
        if (!nodo) return;
        const fin = parseFloat(nodo.textContent.replace(/[^0-9.]/g, "") || "0");
        if (fin > 0) animarNumero(nodo, fin);
        en.target.classList.add("counted");
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((s) => statsIO.observe(s));

  function animarNumero(nodo, fin) {
    const raw = nodo.textContent;
    const prefijo = raw.startsWith("+") ? "+" : "";
    const sufijo = raw.endsWith("k") ? "k" : "";
    const decimals = Number.isInteger(fin) ? 0 : 1;
    const duracion = 1400;
    const inicio = performance.now();
    function paso(now) {
      const t = Math.min((now - inicio) / duracion, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const valor = decimals ? (ease * fin).toFixed(decimals) : Math.round(ease * fin).toString();
      nodo.textContent = prefijo + valor + sufijo;
      if (t < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  /* ============ Parallax hero ============ */
  const blob = document.querySelector(".hero__blob");
  if (blob) {
    window.addEventListener("scroll", () => {
      if (window.scrollY < window.innerHeight) {
        const y = window.scrollY * 0.18;
        blob.style.transform = `translateY(${y}px)`;
      }
    }, { passive: true });
  }

  /* ============ Reveal on scroll ============ */
  const revealables = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealables.forEach((el) => io.observe(el));

  /* ============ Toast ============ */
  let toastTimeout;
  function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
  }
});