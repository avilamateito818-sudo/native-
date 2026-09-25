"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ============ Recordar por donde ibas scrolling ============
     Al abrir una ficha y volver, el catalogo te devuelve justo donde
     lo dejaste en vez de tener que bajar de nuevo desde arriba. */
  const LLAVE_SCROLL = "NATIVE_SCROLL_CATALOGO";
  const recordarPosicion = () => {
    try { sessionStorage.setItem(LLAVE_SCROLL, String(window.scrollY)); } catch (e) {}
  };
  window.addEventListener("pagehide", recordarPosicion);
  window.addEventListener("beforeunload", recordarPosicion);
  const restaurarPosicion = () => {
    if (location.hash || location.search.includes("id=")) return;
    let guardado = null;
    try { guardado = sessionStorage.getItem(LLAVE_SCROLL); } catch (e) {}
    if (guardado === null) return;
    sessionStorage.removeItem(LLAVE_SCROLL);
    const y = parseInt(guardado, 10);
    if (!y || y < 200) return;
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
  };

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

    // 0. Logo y nombre del negocio
    if (window.aplicarMarca) window.aplicarMarca(cfg);

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
  /* Tarjeta de producto reutilizable: la usan el catalogo y las vitrinas */
  function crearTarjeta(p) {
    const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
    const sim = cfg.monedaSimbolo || "$";
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

    // Un arrastre para desplazar la pagina NUNCA debe abrir la ficha:
    // solo cuenta como clic si el dedo casi no se movio.
    let downX = 0;
    let downY = 0;
    card.addEventListener("pointerdown", (e) => {
      downX = e.clientX;
      downY = e.clientY;
    }, { passive: true });

    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const movX = Math.abs(e.clientX - downX);
      const movY = Math.abs(e.clientY - downY);
      if (movX > 12 || movY > 12) return; // fue un scroll, no un clic
      window.location.href = `producto.html?id=${p.id}`;
    });

    return card;
  }

  function renderProductos(cat) {
    if (!grid) return;
    PRODUCTOS = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];

    // Filtrar productos ocultos para clientes públicos
    const visibles = PRODUCTOS.filter((p) => p.stock !== "oculto");
    const items = !cat || cat === "Todos" ? visibles : visibles.filter((p) => p.categoria === cat);
    grid.innerHTML = "";

    if (items.length === 0) {
      grid.insertAdjacentHTML("beforeend", '<p class="catalog__empty" style="display:block">No hay productos en esta categoría por el momento.</p>');
      return;
    }

    items.forEach((p) => grid.appendChild(crearTarjeta(p)));
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

  /* ============ Grid de categorías ============
     Reutiliza las clases del antiguo showcase para que el popover de
     js/nav.js siga funcionando, y se rellena con TODAS las categorías
     que existan en el catálogo (no una lista fija). */
  const DESCRIPCION_CATEGORIA = {
    Labiales: "Acabados mate, cremosos y brillo cristal que duran todo el día.",
    Cremas: "Hidratación profunda con extractos botánicos y mantecas nobles.",
    Mascarillas: "Arcillas, caolín y flores para un glow visible desde la primera aplicación.",
    Fragancias: "Jazmín, vainilla y ámbar que dejan un recuerdo imposible de olvidar."
  };

  function renderCategoriasGrid() {
    const cont = document.getElementById("categorias-grid");
    if (!cont) return;

    PRODUCTOS = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
    CATEGORIAS = (window.obtenerCategorias ? window.obtenerCategorias() : window.CATEGORIAS) || {};

    const lista = Array.from(new Set([
      ...(window.ORDEN_CATEGORIAS_DEFECTO || []),
      ...Object.keys(CATEGORIAS),
      ...PRODUCTOS.map((p) => p.categoria)
    ])).filter(Boolean);

    cont.classList.add("showcase");
    cont.innerHTML = "";

    if (!lista.length) return;

    lista.forEach((cat) => {
      const info = CATEGORIAS[cat] || {};
      const n = PRODUCTOS.filter((p) => p.categoria === cat).length;
      const desc = DESCRIPCION_CATEGORIA[cat];
      const tile = document.createElement("button");
      tile.className = "showcase__card reveal visible";
      tile.dataset.categoria = cat;
      tile.setAttribute("aria-label", `Ver ${cat}`);
      tile.innerHTML = `
        <span class="showcase__emoji">${info.emoji || "🏷️"}</span>
        <strong>${cat}</strong>
        ${desc ? `<p>${desc}</p>` : ""}
        <span class="showcase__cta">Ver Catálogo →</span>
        ${n ? `<span class="showcase__count">${n} producto${n === 1 ? "" : "s"}</span>` : ""}
      `;
      cont.appendChild(tile);
    });

    // nav.js engancha el popover cuando este grid ya existe
    document.dispatchEvent(new CustomEvent("amelisa:categorias"));
  }

  /* ============ Vitrinas de producto ============
     Rejillos destacados con encabezado de sección, al estilo de las
    /Home de tienda: "título + Ver todo". */
  function renderVitrinas() {
    PRODUCTOS = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];

    const disponibles = PRODUCTOS.filter((p) => p.stock !== "oculto" && p.stock !== "agotado");

    // Solo cuenta como oferta un precio tachado REAL, no una etiqueta
    const conDescuento = disponibles.filter((p) => p.viejo && parseFloat(p.viejo) > parseFloat(p.precio));

    // "Los más sentidos": primero los destacados por etiqueta (Bestseller/Nuevo)
    const peso = (p) => (/bestseller|nuevo/i.test(p.badge || "") ? 0 : 1);
    const destacados = disponibles.slice().sort((a, b) => peso(a) - peso(b)).slice(0, 4);

    const llenar = (id, items) => {
      const cont = document.getElementById(id);
      if (!cont) return;
      cont.innerHTML = "";
      const seccion = cont.closest(".vitrina");
      if (!items.length) {
        if (seccion) seccion.hidden = true;
        return;
      }
      if (seccion) seccion.hidden = false;
      items.forEach((p) => cont.appendChild(crearTarjeta(p)));
    };

    llenar("vitrina-destacados", destacados);
    llenar("vitrina-ofertas", conDescuento.slice(0, 4));
  }

  /* ============ Hero / carrusel ============
     Tres diapositivas construidas con datos reales del catálogo:
     portada, oferta con el descuento más fuerte y categorías.
     Cada slide acepta una foto: si en la configuración se guarda una
     ruta, se usa de fondo; si no, se ve el degradado de la marca. */
  function renderHero() {
    const pista = document.getElementById("hero-pista");
    if (!pista) return;

    PRODUCTOS = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
    CATEGORIAS = (window.obtenerCategorias ? window.obtenerCategorias() : window.CATEGORIAS) || {};
    const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
    const sim = cfg.monedaSimbolo || "$";
    const banners = Array.isArray(cfg.banners) ? cfg.banners : [];

    const disponibles = PRODUCTOS.filter((p) => p.stock !== "oculto" && p.stock !== "agotado");
    const conDescuento = disponibles.filter((p) => p.viejo && parseFloat(p.viejo) > parseFloat(p.precio));

    // El slide con mayor descuento manda el mensaje de oferta
    const topOferta = conDescuento.slice().sort((a, b) => {
      const da = 1 - parseFloat(a.precio) / parseFloat(a.viejo);
      const db = 1 - parseFloat(b.precio) / parseFloat(b.viejo);
      return db - da;
    })[0];

    const slides = [];

    // 1) Portada (siempre primero)
    slides.push({
      eyebrow: cfg.heroEyebrow || "Cosmética & Belleza desde 2012",
      titulo: cfg.heroTitulo || "Despierta tu belleza <em>natural</em>, cada día.",
      texto: cfg.heroCopy || "Descubre una selección curada de cosmética facial, maquillaje, cuidado corporal y fragancias. Ingredientes nobles, fórmulas limpias y resultados que se ven y se sienten.",
      cta: "Ver Catálogo",
      ctaHref: "#catalogo",
      cta2: "Conócenos",
      cta2Href: "#nosotros",
      gradiente: "wine",
      foto: banners[0] && banners[0].imagen,
      stats: true
    });

    // 2) Oferta real, si existe
    if (topOferta) {
      const dto = Math.round((1 - parseFloat(topOferta.precio) / parseFloat(topOferta.viejo)) * 100);
      slides.push({
        etiqueta: `-${dto}%`,
        eyebrow: "Precio especial",
        titulo: topOferta.nombre,
        texto: topOferta.desc,
        precio: `${sim}${topOferta.precio}.00`,
        precioViejo: `${sim}${topOferta.viejo}.00`,
        cta: "Ver la oferta",
        ctaHref: `producto.html?id=${topOferta.id}`,
        gradiente: "gold",
        foto: banners[1] && banners[1].imagen
      });
    }

    // 3) Categorías
    const cats = Array.from(new Set(disponibles.map((p) => p.categoria))).filter(Boolean).slice(0, 5);
    slides.push({
      eyebrow: "Tu rutina",
      titulo: "Encuentra lo que <em>tu piel</em> pide",
      texto: "Explora todas nuestras categorías y arma tu rutina de belleza en un solo lugar.",
      chips: cats.map((c) => ({ txt: `${(CATEGORIAS[c] || {}).emoji || "🏷️"} ${c}`, href: `${slugCategoria(c)}.html` })),
      cta: "Ver todo el catálogo",
      ctaHref: "#catalogo",
      gradiente: "plum",
      foto: banners[2] && banners[2].imagen
    });

    pista.innerHTML = "";
    slides.forEach((s, i) => {
      const art = document.createElement("article");
      art.className = `hero__slide hero__slide--${s.gradiente}`;
      art.setAttribute("role", "group");
      art.setAttribute("aria-roledescription", "diapositiva");
      art.setAttribute("aria-label", `${i + 1} de ${slides.length}`);
      art.hidden = i !== 0;
      if (s.foto) {
        art.style.setProperty("--hero-foto", `url("${s.foto}")`);
        art.classList.add("has-foto");
      }

      const chips = (s.chips || []).map((c) => `<a class="hero__chip" href="${c.href}">${c.txt}</a>`).join("");

      art.innerHTML = `
        <div class="hero__inner">
          <div class="hero__content">
            ${s.etiqueta ? `<span class="hero__sale">${s.etiqueta}</span>` : ""}
            <span class="hero__eyebrow">${s.eyebrow}</span>
            <h1 class="hero__title">${s.titulo}</h1>
            ${s.precio ? `<p class="hero__precio"><strong>${s.precio}</strong><del>${s.precioViejo}</del></p>` : ""}
            <p class="hero__copy">${s.texto}</p>
            ${chips ? `<div class="hero__chips">${chips}</div>` : ""}
            <div class="hero__actions">
              <a href="${s.ctaHref}" class="btn btn--gold">${s.cta}</a>
              ${s.cta2 ? `<a href="${s.cta2Href}" class="btn btn--ghost">${s.cta2}</a>` : ""}
            </div>
            ${s.stats ? `
            <div class="hero__stats">
              <div data-prefix="+" data-num="12" data-suffix="k"><span class="num">+12k</span> <small>Clientas felices</small></div>
              <div data-prefix="+" data-num="${PRODUCTOS.length}" data-suffix=""><span class="num">+${PRODUCTOS.length}</span> <small>Productos</small></div>
              <div data-prefix="" data-num="4.9" data-suffix=""><span class="num">4.9</span> <small>Valoración</small></div>
            </div>` : ""}
          </div>
        </div>
      `;
      pista.appendChild(art);
    });

    iniciarCarrusel(slides.length);
  }

  function slugCategoria(cat) {
    return String(cat).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  /* Lógica del carrusel: flechas, puntos, autoplay y deslizamiento */
  function iniciarCarrusel(total) {
    const pista = document.getElementById("hero-pista");
    const dots = document.getElementById("hero-dots");
    const prev = document.getElementById("hero-prev");
    const next = document.getElementById("hero-next");
    if (!pista || total < 2) {
      if (dots) dots.innerHTML = "";
      return;
    }

    const slides = [...pista.querySelectorAll(".hero__slide")];
    let actual = 0;
    let timer = null;

    const ir = (i) => {
      actual = (i + total) % total;
      slides.forEach((s, k) => { s.hidden = k !== actual; });
      if (dots) {
        [...dots.children].forEach((d, k) => {
          d.classList.toggle("is-active", k === actual);
          d.setAttribute("aria-selected", k === actual ? "true" : "false");
        });
      }
    };

    if (dots) {
      dots.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const d = document.createElement("button");
        d.className = "hero__dot";
        d.type = "button";
        d.setAttribute("role", "tab");
        d.setAttribute("aria-label", `Diapositiva ${i + 1}`);
        d.addEventListener("click", () => { ir(i); reiniciar(); });
        dots.appendChild(d);
      }
    }

    const reiniciar = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => ir(actual + 1), 6500);
    };

    if (prev) prev.addEventListener("click", () => { ir(actual - 1); reiniciar(); });
    if (next) next.addEventListener("click", () => { ir(actual + 1); reiniciar(); });

    // Pausa el autoplay si la pestaña no está a la vista
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (timer) clearInterval(timer); }
      else reiniciar();
    });

    // Deslizar con el dedo. Se escuchan los dos juegos de eventos porque en
    // táctil el navegador puede emitir pointercancel en cuanto decide que va
    // a hacer scroll, y entonces pointerup nunca llega.
    let sx = 0, sy = 0, modo = null;
    const empezar = (x, y, m) => {
      sx = x; sy = y; modo = m;
      if (timer) clearInterval(timer);
    };
    const terminar = (x, y) => {
      if (!modo) return;
      const dx = x - sx, dy = y - sy;
      modo = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) ir(dx < 0 ? actual + 1 : actual - 1);
      reiniciar();
    };

    pista.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      empezar(e.clientX, e.clientY, "puntero");
    }, { passive: true });
    pista.addEventListener("pointerup", (e) => {
      if (e.pointerType === "touch") return;
      terminar(e.clientX, e.clientY);
    });
    pista.addEventListener("pointercancel", () => { modo = null; reiniciar(); });

    pista.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      if (t) empezar(t.clientX, t.clientY, "tactil");
    }, { passive: true });
    pista.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      if (t) terminar(t.clientX, t.clientY);
    });

    /* Cada diapositiva tiene distinto contenido, asi que sin esto el alto del
       banner cambiaria al pasar de una a otra y la pagina daria un salto. Se
       mide la mas alta y se aplica a todas. */
    let alturaFija = 0;
    const fijarAlto = () => {
      pista.style.height = "";
      slides.forEach((s) => { s.hidden = false; });
      const alto = Math.ceil(Math.max(...slides.map((s) => s.getBoundingClientRect().height)));
      slides.forEach((s) => { s.hidden = true; });
      if (alto > 0) {
        alturaFija = alto;
        pista.style.height = alto + "px";
      }
    };
    slides.forEach((s) => { s.style.minHeight = alturaFija ? alturaFija + "px" : ""; });

    let tAlto = null;
    window.addEventListener("resize", () => {
      if (tAlto) clearTimeout(tAlto);
      tAlto = setTimeout(() => {
        fijarAlto();
        ir(actual);
      }, 200);
    });

    ir(0);
    fijarAlto();
    reiniciar();
  }

  /* ============ Buscador del encabezado ============
     Filtra por nombre, categoría y descripción; los resultados son
     enlaces directos a la ficha. */
  function iniciarBuscador() {
    const form = document.getElementById("nav-search-form");
    const input = document.getElementById("nav-search");
    const box = document.getElementById("nav-search-results");
    if (!form || !input || !box) return;

    const cfg = (window.obtenerConfigTienda ? window.obtenerConfigTienda() : window.CONFIG_TIENDA) || {};
    const sim = cfg.monedaSimbolo || "$";

    const cerrar = () => { box.hidden = true; input.setAttribute("aria-expanded", "false"); };

    const pintar = (q) => {
      const datos = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
      const t = q.trim().toLowerCase();
      if (t.length < 2) return cerrar();

      const res = datos.filter((p) =>
        p.stock !== "oculto" &&
        ((p.nombre || "") + " " + (p.categoria || "") + " " + (p.desc || "") + " " + (p.beneficios || []).join(" "))
          .toLowerCase().includes(t)
      ).slice(0, 6);

      if (!res.length) {
        box.innerHTML = `<p class="nav__search-empty">Sin resultados para “${q.trim()}”.</p>`;
      } else {
        box.innerHTML = res.map((p) => `
          <a class="nav__search-item" href="producto.html?id=${p.id}" role="option">
            <span class="nav__search-emoji">${p.emoji || "✨"}</span>
            <span class="nav__search-info">
              <span class="nav__search-name">${p.nombre}</span>
              <span class="nav__search-cat">${p.categoria}</span>
            </span>
            <span class="nav__search-price">${sim}${p.precio}.00</span>
          </a>`).join("");
      }
      box.hidden = false;
      input.setAttribute("aria-expanded", "true");
    };

    input.addEventListener("input", () => pintar(input.value));
    input.addEventListener("focus", () => { if (input.value.trim().length >= 2) pintar(input.value); });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const t = input.value.trim();
      if (!t) return;
      const datos = (window.obtenerProductos ? window.obtenerProductos() : window.PRODUCTOS) || [];
      const res = datos.filter((p) => p.stock !== "oculto" &&
        ((p.nombre || "") + " " + (p.categoria || "") + " " + (p.desc || "")).toLowerCase().includes(t.toLowerCase()));

      if (res.length === 1) {
        window.location.href = `producto.html?id=${res[0].id}`;
        return;
      }
      // Varios: llevamos al catálogo filtrado
      cerrar();
      const destino = document.getElementById("catalogo");
      if (destino) destino.scrollIntoView({ behavior: "smooth" });
    });

    document.addEventListener("click", (e) => {
      if (!form.contains(e.target)) cerrar();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
  }

  /* ============ Eventos de Actualización en Vivo ============ */
  window.addEventListener("productosActualizados", (e) => {
    PRODUCTOS = e.detail || (window.obtenerProductos ? window.obtenerProductos() : []);
    if (!categoria) renderFiltrosHome();
    renderProductos(categoria || filtro);
    renderCategoriasGrid();
    renderVitrinas();
  });

  window.addEventListener("categoriasActualizadas", (e) => {
    CATEGORIAS = e.detail || (window.obtenerCategorias ? window.obtenerCategorias() : {});
    if (!categoria) renderFiltrosHome();
    renderCategoriasGrid();
  });

  window.addEventListener("testimoniosActualizados", (e) => {
    TESTIMONIOS = e.detail || (window.obtenerTestimonios ? window.obtenerTestimonios() : []);
    renderTestimonios();
  });

  window.addEventListener("configTiendaActualizada", () => {
    aplicarConfigTienda();
    renderProductos(categoria || filtro);
    renderVitrinas();
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

    document.title = `${categoria} — Amelisa C0smetico`;

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
    renderCategoriasGrid();
    renderVitrinas();
  }

  renderHero();
  iniciarBuscador();
  // El hero se dibuja después de aplicar la configuración: se vuelve a
  // aplicar para que las cifras y textos editados desde el panel lleguen.
  aplicarConfigTienda();

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
        const textoMsg = encodeURIComponent(`Hola Amelisa C0smetico, me gustaría confirmar mi pedido #${nuevoPedido.id} por total de ${sim}${total}`);
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
    /* El alto maximo del panel se calcula al abrirlo: la barra de anuncios
       empuja el encabezado hacia abajo, asi que el espacio libre no se puede
       anticipar con una cuenta fija en el CSS. Se mide desde el encabezado y
       no desde el panel, que durante la transicion todavia esta desplazado. */
    const ajustarPanel = () => {
      if (!navLinks.classList.contains("open")) return;
      const nav = document.getElementById("nav");
      const base = nav ? nav.getBoundingClientRect().bottom : navLinks.getBoundingClientRect().top;
      const disponible = window.innerHeight - base - 16;
      navLinks.style.maxHeight = Math.max(180, Math.floor(disponible)) + "px";
    };

    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", navLinks.classList.contains("open"));
      ajustarPanel();
    });

    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        navLinks.classList.remove("open");
        navLinks.style.maxHeight = "";
      });
    });

    window.addEventListener("resize", ajustarPanel);
    window.addEventListener("orientationchange", ajustarPanel);
  }

  document.querySelectorAll(".menu-toggle").forEach((t) => {
    t.addEventListener("click", (e) => {
      e.preventDefault();
      const li = t.closest(".has-menu");
      if (li) li.classList.toggle("open");
    });
  });

  /* ============ Scroll: menú activo + back-to-top ============
     El encabezado (compacto + barra de anuncios) se controla desde nav.js,
     que está cargado en todas las páginas. */
  const toTop = document.getElementById("to-top");
  const secciones = ["inicio", "nosotros", "categorias", "destacados", "catalogo", "ofertas", "testimonios", "contacto"];

  window.addEventListener("scroll", () => {
    if (toTop) {
      // Aparece mas tarde en movil: antes podia pulsarse por error al
      // deslizar el pulgar y devolverte de golpe al inicio de la pagina.
      toTop.classList.toggle("show", window.scrollY > (window.innerWidth < 560 ? 1400 : 600));
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

  restaurarPosicion();

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