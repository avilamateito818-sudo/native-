/* ============ Visor de fotos en grande (lightbox) ============
   Uso (tienda pública):
     window.abrirLightbox({ titulo, imagenes: [urls], emoji, colA, colB, inicio })
   - Si hay fotos reales muestra la imagen completa con flechas ‹ › y contador.
   - Si no hay fotos reales muestra el emblema del producto en grande.
================================================================== */
(function () {
  var lb = null;
  var est = { titulo: "", imagenes: [], activo: 0, emoji: "", a: "#f6e7dd", b: "#e7cfc6", prevOverflow: "" };

  window.imagenesProducto = function (p) {
    var arr = [];
    if (p && p.imagen && String(p.imagen).indexOf("http") === 0) arr.push(p.imagen);
    if (p && Array.isArray(p.galeria)) {
      p.galeria.forEach(function (u) {
        if (String(u).indexOf("http") === 0 && arr.indexOf(u) === -1) arr.push(u);
      });
    }
    return arr;
  };

  function cerrar() {
    if (!lb) return;
    lb.remove();
    lb = null;
    document.body.style.overflow = est.prevOverflow;
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowRight") navegar(1);
    if (e.key === "ArrowLeft") navegar(-1);
  }

  function navegar(dir) {
    if (est.imagenes.length < 2) return;
    est.activo = (est.activo + dir + est.imagenes.length) % est.imagenes.length;
    renderMain();
  }

  function renderMain() {
    if (!lb) return;
    var media = lb.querySelector(".lbox__media");
    var count = lb.querySelector(".lbox__count");
    var prev = lb.querySelector(".lbox__prev");
    var next = lb.querySelector(".lbox__next");
    media.innerHTML = "";
    if (est.imagenes.length) {
      var img = document.createElement("img");
      img.src = est.imagenes[est.activo];
      img.alt = est.titulo || "Foto del producto";
      media.appendChild(img);
      prev.style.visibility = next.style.visibility = "visible";
      count.textContent = (est.activo + 1) + " / " + est.imagenes.length;
    } else {
      var emoji = document.createElement("div");
      emoji.className = "lbox__emoji";
      emoji.style.background = "linear-gradient(140deg," + est.a + "," + est.b + ")";
      emoji.textContent = est.emoji || "🛍";
      media.appendChild(emoji);
      prev.style.visibility = next.style.visibility = "hidden";
      count.textContent = "";
    }
  }

  window.abrirLightbox = function (opts) {
    if (typeof opts === "string") opts = { titulo: opts };
    opts = opts || {};
    cerrar();

    est.titulo = opts.titulo || "";
    est.imagenes = (opts.imagenes && opts.imagenes.length) ? opts.imagenes.slice() : [];
    est.emoji = opts.emoji || "";
    est.a = opts.colA || "#f6e7dd";
    est.b = opts.colB || "#e7cfc6";
    est.activo = Math.min(Math.max(0, opts.inicio || 0), Math.max(0, est.imagenes.length - 1));
    est.prevOverflow = document.body.style.overflow;

    lb = document.createElement("div");
    lb.className = "lbox";
    lb.innerHTML =
      '<div class="lbox__back"></div>' +
      '<div class="lbox__panel" role="dialog" aria-modal="true">' +
        '<div class="lbox__top"><span class="lbox__titulo"></span><button class="lbox__close" aria-label="Cerrar">✕</button></div>' +
        '<div class="lbox__media"></div>' +
        '<button class="lbox__prev" aria-label="Anterior">‹</button>' +
        '<button class="lbox__next" aria-label="Siguiente">›</button>' +
        '<div class="lbox__count"></div>' +
      '</div>';
    document.body.appendChild(lb);
    lb.querySelector(".lbox__titulo").textContent = est.titulo;

    lb.querySelector(".lbox__back").addEventListener("click", cerrar);
    lb.querySelector(".lbox__close").addEventListener("click", cerrar);
    lb.querySelector(".lbox__prev").addEventListener("click", function () { navegar(-1); });
    lb.querySelector(".lbox__next").addEventListener("click", function () { navegar(1); });
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    renderMain();
    lb.querySelector(".lbox__media").scrollIntoView({ block: "center" });
  };
})();