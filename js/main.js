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

  const PRODUCTOS = window.PRODUCTOS || [];
  const CATEGORIAS = window.CATEGORIAS || {};
  const ORDEN = window.ORDEN_CATEGORIAS || [];
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
  let filtro = "Todos";

  function renderProductos(cat) {
    if (!grid) return;
    const items = !cat || cat === "Todos" ? PRODUCTOS : PRODUCTOS.filter((p) => p.categoria === cat);
    grid.innerHTML = "";

    if (items.length === 0) {
      grid.insertAdjacentHTML("beforeend", '<p class="catalog__empty" style="display:block">No hay productos en esta categoría por el momento.</p>');
      return;
    }

    items.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "card reveal";
      card.style.setProperty("--media-a", p.colores[0]);
      card.style.setProperty("--media-b", p.colores[1]);
      card.style.animation = "none";
      void card.offsetWidth;
      card.style.animation = `cardIn 0.55s ease both`;

      const badge = p.viejo ? '<span class="card__badge">Oferta</span>' : "";
      const viejo = p.viejo ? `<del>$${p.viejo}.00</del>` : "";

      card.innerHTML = `
        <div class="card__media">
          ${badge}
          <button class="card__wish" aria-label="Agregar a favoritos">♡</button>
          <span class="emoji" loading="lazy">${p.emoji}</span>
        </div>
        <div class="card__body">
          <span class="card__cat">${p.categoria}</span>
          <h3 class="card__name">${p.nombre}</h3>
          <p class="card__desc">${p.desc}</p>
          <div class="card__foot">
            <div class="card__price">$${p.precio}.00${viejo}</div>
            <button class="btn-add" data-id="${p.id}">Añadir +</button>
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
      card.querySelector(".btn-add").addEventListener("click", () => agregarAlBolsa(p));
    });
  }

  /* ============ Página de categoría ============ */
  if (categoria) {
    const meta = CATEGORIAS[categoria];
    document.title = `${categoria} — Native Origen`;

    const banner = document.getElementById("cat-banner");
    if (banner && meta) {
      banner.style.setProperty("--cat-a", meta.grad[0]);
      banner.style.setProperty("--cat-b", meta.grad[1]);
      banner.innerHTML = `
        <div class="cat-banner__inner">
          <div class="cat-banner__text">
            <span class="section__tag">Catálogo · ${meta.n} / 06</span>
            <h1 class="cat-banner__title">${meta.emoji} ${categoria}</h1>
            <p class="cat-banner__tagline">${meta.tagline}</p>
            <p class="cat-banner__desc">${meta.desc}</p>
            <div class="cat-banner__meta">
              <span><strong>${PRODUCTOS.filter((p) => p.categoria === categoria).length}</strong> productos</span>
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
        const chip = document.createElement("a");
        chip.className = "chip";
        chip.href = `${c.toLowerCase().replace(/ó/g, "o").replace(/á/g, "a")}.html`;
        chip.textContent = `${CATEGORIAS[c].emoji} ${c}`;
        otros.appendChild(chip);
      });
    }

    renderProductos(categoria);
  } else {
    /* ============ Home: filtros + catálogo completo ============ */
    const buttons = document.querySelectorAll(".filter-btn");
    function setFiltro(cat) {
      filtro = cat;
      buttons.forEach((b) => b.classList.toggle("active", b.dataset.filter === cat));
      renderProductos(cat);
    }
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => setFiltro(btn.dataset.filter));
    });

    /* Showcase (sobre nosotros) → su página de categoría */
    document.querySelectorAll(".showcase__card").forEach((card) => {
      card.addEventListener("click", () => {
        const c = card.dataset.categoria;
        if (!c) return;
        const file = c.toLowerCase().replace(/ó/g, "o").replace(/á/g, "a") + ".html";
        window.location.href = file;
      });
    });

    renderProductos("Todos");
  }

  /* ============ Bolsa / carrito ============ */
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
    countBadge.textContent = totalUnidades();
    if (bolsa.length === 0) {
      drawerItems.innerHTML = `
        <div class="drawer__empty">
          <span class="ico">🛍</span>
          Tu bolsa está vacía<br>Descubre nuestros favoritos en el catálogo.
        </div>`;
      drawerSubtotal.textContent = "$0.00";
      setCheckoutState(false);
      return;
    }

    drawerItems.innerHTML = "";
    bolsa.forEach((b) => {
      const item = document.createElement("div");
      item.className = "drawer__item";
      item.style.setProperty("--media-a", b.colores[0]);
      item.style.setProperty("--media-b", b.colores[1]);
      item.innerHTML = `
        <div class="thumb">${b.emoji}</div>
        <div class="info">
          <strong>${b.nombre}</strong>
          <small>${b.categoria}</small>
          <div class="qty">
            <button class="qty-minus" data-id="${b.id}">−</button>
            <span>${b.cantidad}</span>
            <button class="qty-plus" data-id="${b.id}">+</button>
          </div>
        </div>
        <div class="price">$${(b.precio * b.cantidad).toFixed(2)}</div>
        <button class="remove" data-id="${b.id}" aria-label="Eliminar">✕</button>
      `;
      item.querySelector(".qty-minus").addEventListener("click", () => cambiarCantidad(b.id, -1));
      item.querySelector(".qty-plus").addEventListener("click", () => cambiarCantidad(b.id, 1));
      item.querySelector(".remove").addEventListener("click", () => quitarDeBolsa(b.id));
      drawerItems.appendChild(item);
    });

    drawerSubtotal.textContent = `$${totalPrecio().toFixed(2)}`;
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
      const total = totalPrecio().toFixed(2);
      cerrarDrawer();
      bolsa = [];
      renderDrawer();
      showToast(`✓ Compra simulada por $${total}. ¡Gracias!`);
    });
  }

  /* ============ Menú móvil ============ */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("nav-links");

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
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    toTop.classList.toggle("show", window.scrollY > 600);

    const pos = window.scrollY + 140;
    let actual = secciones[0];
    for (const s of secciones) {
      const el = document.getElementById(s);
      if (el && el.offsetTop <= pos) actual = s;
    }
    navLinks.querySelectorAll("a").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${actual}`);
    });
  });

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ============ Animación de contadores ============ */
  const stats = document.querySelectorAll(".hero__stats div");
  const statsIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || en.target.dataset.conteo) return;
        en.target.dataset.conteo = "";
        const nodo = en.target.querySelector(".num");
        if (!nodo) return;
        const prefijo = en.target.dataset.prefix || "";
        const sufijo = en.target.dataset.suffix || "";
        const fin = parseFloat(en.target.dataset.num || "0");
        animarNumero(nodo, prefijo, sufijo, fin);
        en.target.classList.add("counted");
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((s) => statsIO.observe(s));

  function animarNumero(nodo, prefijo, sufijo, fin) {
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
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
  }
});