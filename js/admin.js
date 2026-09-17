"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("login-view");
  const dashView = document.getElementById("dash-view");
  const loginForm = document.getElementById("login-form");
  const loginErr = document.getElementById("login-err");
  const logoutBtn = document.getElementById("logout-btn");
  const dashUser = document.getElementById("dash-user");
  const prodSearch = document.getElementById("prod-search");
  const prodCat = document.getElementById("prod-cat");
  const prodBox = document.getElementById("dash-productos");
  const KEY = "no_session";

  const PRODUCTOS = window.PRODUCTOS || [];
  const CATEGORIAS = window.CATEGORIAS || {};
  const ORDEN = window.ORDEN_CATEGORIAS || [];

  async function api(url, opts = {}) {
    const res = await fetch(url, opts);
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    return { ok: res.ok, data };
  }

  function authHeaders() {
    const token = sessionStorage.getItem(KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function showLogin(err) {
    dashView.hidden = true;
    loginView.style.display = "flex";
    loginErr.textContent = err || "";
  }

  function showDash(usuario) {
    dashUser.textContent = usuario || "omar";
    loginView.style.display = "none";
    dashView.hidden = false;
  }

  function renderStats() {
    const cats = new Set(PRODUCTOS.map((p) => p.categoria)).size;
    const ofertas = PRODUCTOS.filter((p) => p.viejo).length;
    document.getElementById("dash-stats").innerHTML = `
      <div class="stat"><strong>${PRODUCTOS.length}</strong><span>Productos activos</span></div>
      <div class="stat"><strong>${cats}</strong><span>Categorías</span></div>
      <div class="stat"><strong>${ofertas}</strong><span>En oferta</span></div>
      <div class="stat"><strong>${ORDEN.length}</strong><span>Páginas de tienda</span></div>`;
  }

  function renderCats() {
    const el = document.getElementById("dash-cats");
    el.innerHTML = "";
    const opts = [];
    ORDEN.forEach((c) => {
      const n = PRODUCTOS.filter((p) => p.categoria === c).length;
      const a = document.createElement("a");
      a.className = "chip";
      a.href = `${c.toLowerCase().replace(/ó/g, "o").replace(/á/g, "a")}.html`;
      a.textContent = `${CATEGORIAS[c].emoji} ${c} (${n})`;
      el.appendChild(a);
      opts.push(`<option value="${c}">${CATEGORIAS[c].emoji} ${c}</option>`);
    });
    prodCat.insertAdjacentHTML("beforeend", opts.join(""));
  }

  function renderProductos() {
    const q = (prodSearch.value || "").trim().toLowerCase();
    const cat = prodCat.value;
    const list = PRODUCTOS.filter((p) => {
      const okCat = !cat || p.categoria === cat;
      const okQ = !q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
      return okCat && okQ;
    });
    if (!list.length) {
      prodBox.innerHTML = `<p class="prod-table__empty">No hay productos que coincidan con tu búsqueda.</p>`;
      return;
    }
    prodBox.innerHTML = `
      <table class="prod-table__grid">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((p) => `
            <tr>
              <td data-label="Producto"><span class="prod-table__emoji">${CATEGORIAS[p.categoria] ? CATEGORIAS[p.categoria].emoji : "🛍️"}</span>${p.nombre}</td>
              <td data-label="Categoría"><span class="prod-table__cat">${CATEGORIAS[p.categoria] ? CATEGORIAS[p.categoria].emoji : ""} ${p.categoria}</span></td>
              <td data-label="Precio"><strong>$${p.precio}</strong>${p.viejo ? ` <span class="prod-table__old">$${p.viejo}</span>` : ""}</td>
              <td data-label="Estado">${p.viejo ? '<span class="prod-table__tag prod-table__tag--oferta">En oferta</span>' : '<span class="prod-table__tag">Activo</span>'}</td>
            </tr>`).join("")}
        </tbody>
      </table>`;
  }

  async function init() {
    if (!sessionStorage.getItem(KEY)) {
      showLogin();
      return;
    }
    const { ok, data } = await api("/api/auth", { headers: authHeaders() });
    if (ok) {
      renderStats();
      renderCats();
      renderProductos();
      showDash(data.usuario);
    } else {
      showLogin();
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginErr.textContent = "";
    const body = {
      usuario: loginForm.usuario.value.trim(),
      contraseña: loginForm.contrasena.value
    };
    const { ok, data } = await api("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!ok) {
      showLogin(data.message || "Usuario o contraseña incorrectos");
      return;
    }
    sessionStorage.setItem(KEY, data.token);
    renderStats();
    renderCats();
    renderProductos();
    showDash(data.usuario);
  });

  prodSearch.addEventListener("input", renderProductos);
  prodCat.addEventListener("change", renderProductos);

  logoutBtn.addEventListener("click", async () => {
    await api("/api/logout", { method: "POST", headers: authHeaders() });
    sessionStorage.removeItem(KEY);
    showLogin();
  });

  init();
});