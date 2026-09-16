"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("login-view");
  const dashView = document.getElementById("dash-view");
  const loginForm = document.getElementById("login-form");
  const loginErr = document.getElementById("login-err");
  const logoutBtn = document.getElementById("logout-btn");
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

  function showDash() {
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
    ORDEN.forEach((c) => {
      const n = PRODUCTOS.filter((p) => p.categoria === c).length;
      const a = document.createElement("a");
      a.className = "chip";
      a.href = `${c.toLowerCase().replace(/ó/g, "o").replace(/á/g, "a")}.html`;
      a.textContent = `${CATEGORIAS[c].emoji} ${c} (${n})`;
      el.appendChild(a);
    });
  }

  async function init() {
    const { ok } = await api("/api/auth", { headers: authHeaders() });
    if (ok) {
      renderStats();
      renderCats();
      showDash();
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
    showDash();
  });

  logoutBtn.addEventListener("click", async () => {
    await api("/api/logout", { method: "POST", headers: authHeaders() });
    sessionStorage.removeItem(KEY);
    showLogin();
  });

  init();
});