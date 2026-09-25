/* ============ Mini menús de categorías (solo tienda pública) ============
   - Desplegable "Catálogo": al pasar el cursor sobre una categoría muestra un
     panel con los productos (foto, nombre, precio) que llevan al detalle.
   - Home: al hacer clic en una tarjeta de categoría (showcase) se abre un
     popover con esos productos (foto, nombre, precio) que llevan al detalle.
============================================================================ */
(function () {
  var PRODS = window.PRODUCTOS || [];
  var CATS = window.CATEGORIAS || {};

  function slug(cat) {
    return cat.toLowerCase().replace(/ó/g, "o").replace(/á/g, "a");
  }
  function detalle(p) {
    return "producto.html?id=" + encodeURIComponent(p.id);
  }
  function emojiCat(cat) {
    return (CATS[cat] && CATS[cat].emoji) || "";
  }
  function precioHTML(p) {
    var h = "$" + Number(p.precio).toFixed(2);
    if (p.viejo) h += ' <del>$' + Number(p.viejo).toFixed(2) + "</del>";
    return h;
  }
  function thumbHTML(p) {
    if (p.imagen && p.imagen.indexOf("http") === 0) {
      return '<img src="' + p.imagen + '" alt="" loading="lazy">';
    }
    return '<span class="mini-th-emoji">' + (p.emoji || "🛍") + "</span>";
  }
  function catDeLink(a) {
    return (a.textContent || "").replace(/^[^\p{L}]+/u, "").trim();
  }

  /* ---------- Desplegable Catálogo con panel de productos ---------- */
  function activarMenuCatalogo() {
    var menu = document.querySelector(".has-menu .cat__menu");
    if (!menu) return;
    var links = Array.prototype.slice.call(menu.children);
    links = links.filter(function (n) { return n.tagName === "LI" && n.querySelector("a"); });
    if (!links.length) return;

    var lista = document.createElement("div");
    lista.className = "cat__list";
    links.forEach(function (li) { lista.appendChild(li); });
    menu.appendChild(lista);

    var mini = document.createElement("div");
    mini.className = "cat__mini";
    menu.appendChild(mini);
    menu.classList.add("cat__menu--mega");

    function construir(cat) {
      var items = PRODS.filter(function (p) { return p.categoria === cat; }).slice(0, 4);
      var h = '<div class="cat__mini__head">' + emojiCat(cat) + " " + cat + "</div>";
      if (!items.length) {
        h += '<a class="cat-mini-item cat-mini-item--vacio" href="' + slug(cat) + '.html">Próximamente</a>';
      }
      items.forEach(function (p) {
        h += '<a class="cat-mini-item" href="' + detalle(p) + '">'
          + '<span class="cat-mini-th">' + thumbHTML(p) + "</span>"
          + '<span class="cat-mini-info"><span class="cat-mini-nombre">' + (p.nombre || "") + "</span>"
          + '<span class="cat-mini-precio">' + precioHTML(p) + "</span></span></a>";
      });
      h += '<a class="cat-mini-ver" href="' + slug(cat) + '.html">Ver todos en ' + cat + " →</a>";
      return h;
    }
    function aplicar(a) {
      mini.innerHTML = construir(catDeLink(a));
      links.forEach(function (x) {
        var aEl = x.querySelector("a");
        if (aEl) aEl.classList.toggle("on", aEl === a);
      });
    }
    links.forEach(function (li) {
      var a = li.querySelector("a");
      a.addEventListener("mouseenter", function () { aplicar(a); });
      a.addEventListener("focus", function () { aplicar(a); });
    });
    aplicar(links[0].querySelector("a"));

    window.addEventListener("productosActualizados", function () {
      var activo = menu.querySelector(".cat__list a.on");
      aplicar(activo || links[0].querySelector("a"));
    });
  }

  /* ---------- Popover de categoría (home) ---------- */
  function activarPopoverShowcase() {
    var cards = document.querySelectorAll(".showcase__card[data-categoria]");
    if (!cards.length) return;
    var popEl = null;
    var backEl = null;

    function cerrar() {
      if (backEl) { backEl.remove(); backEl = null; }
      if (popEl) { popEl.remove(); popEl = null; }
    }
    function posicionar(card) {
      var r = card.getBoundingClientRect();
      var ancho = popEl.offsetWidth;
      var alto = popEl.offsetHeight;
      var x = Math.min(r.right - ancho, window.innerWidth - ancho - 12);
      if (x < 12) x = 12;
      var y = r.bottom + 10;
      if (y + alto > window.innerHeight - 12) y = Math.max(12, r.top - alto - 10);
      popEl.style.left = x + "px";
      popEl.style.top = y + "px";
    }
    function abrir(card) {
      var cat = card.dataset.categoria;
      cerrar();
      var items = PRODS.filter(function (p) { return p.categoria === cat; }).slice(0, 5);
      var h = '<button class="cat-pop__close" aria-label="Cerrar">✕</button>'
        + '<div class="cat-pop__titulo">' + emojiCat(cat) + " " + cat + "</div>"
        + '<div class="cat-pop__lista">';
      if (!items.length) h += '<span class="cat-pop__vacio">Próximamente</span>';
      items.forEach(function (p) {
        h += '<a class="cat-pop__item" href="' + detalle(p) + '">'
          + '<span class="cat-pop__th">' + thumbHTML(p) + "</span>"
          + '<span class="cat-pop__info"><span class="cat-pop__nombre">' + (p.nombre || "") + "</span>"
          + '<span class="cat-pop__precio">' + precioHTML(p) + "</span></span>"
          + '<span class="cat-pop__flecha">→</span></a>';
      });
      h += '</div><a class="cat-pop__ver" href="' + slug(cat) + '.html">Ver todos en ' + cat + " →</a>";

      backEl = document.createElement("div");
      backEl.className = "cat-pop__back";
      document.body.appendChild(backEl);

      popEl = document.createElement("div");
      popEl.className = "cat-pop";
      popEl.innerHTML = h;
      document.body.appendChild(popEl);
      posicionar(card);

      popEl.querySelector(".cat-pop__close").addEventListener("click", cerrar);
      backEl.addEventListener("click", cerrar);
    }
    cards.forEach(function (card) {
      card.addEventListener("click", function () { abrir(card); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrar();
    });
  }

  /* El encabezado es de dos filas (marca + buscador, y enlaces debajo) y al
     hacer scroll se compacta a una sola. Su alto real cambia, asi que se mide
     y se publica en --nav-h; de ese valor dependen el salto a los anclajes, las
     barras fijas y el relleno de las secciones. Vive aquí porque nav.js está
     en todas las páginas, incluida la ficha de producto. */
  function medirNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const alto = Math.round(nav.getBoundingClientRect().height);
    if (alto > 0) document.documentElement.style.setProperty("--nav-h", alto + "px");
  }

  /* Al bajar, el encabezado se compacta (oculta la fila de marca + buscador y
     deja la barra de enlaces) y la cinta de anuncios se retira. Vive aquí
     para que ocurra igual en la portada, en las categorías y en la ficha. */
  function alDesplazar() {
    const nav = document.getElementById("nav");
    if (nav) {
      if (window.scrollY > 30) nav.classList.add("scrolled", "compacto");
      else nav.classList.remove("scrolled", "compacto");
    }
    if (document.querySelector(".marquee--top")) {
      document.body.classList.toggle("marquee-oculta", window.scrollY > 40);
    }
  }

  function iniciar() {
    activarMenuCatalogo();
    activarPopoverShowcase();
    medirNav();
    alDesplazar();
    const nav = document.getElementById("nav");
    if (nav && typeof ResizeObserver !== "undefined") new ResizeObserver(medirNav).observe(nav);
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", medirNav);
    window.addEventListener("load", () => { medirNav(); alDesplazar(); });
  }
  // El grid de categorías se genera después, así que re-enlazamos cuando llegue.
  document.addEventListener("amelisa:categorias", activarPopoverShowcase);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();