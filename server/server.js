const path = require("path");
const crypto = require("crypto");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

const USER_HASH = "21297e6e966afbd06e8f08c4525ae2edcbd3696cc6bc436037e278d4b1e67b4d";
const PASS_HASH = "56318228b3a39a2af341c080cc2d8b1d7e088ed24bd28d6cc9b34a8711253434";
const USUARIO_ADMIN = "omar";

const publicDir = path.join(__dirname, "..");

app.use(express.json());
app.use(express.static(publicDir, { extensions: ["html"] }));

const sesiones = new Set();

function sha256(texto) {
  return crypto.createHash("sha256").update(texto).digest("hex");
}

app.post("/api/login", (req, res) => {
  const { usuario, contraseña } = req.body || {};
  if (!usuario || !contraseña) {
    return res.status(400).json({ ok: false, message: "Faltan usuario o contraseña" });
  }
  if (sha256(String(usuario)) !== USER_HASH || sha256(String(contraseña)) !== PASS_HASH) {
    return res.status(401).json({ ok: false, message: "Usuario o contraseña incorrectos" });
  }
  const token = crypto.randomBytes(32).toString("hex");
  sesiones.add(token);
  res.json({ ok: true, token, usuario: USUARIO_ADMIN });
});

app.post("/api/logout", (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (token) sesiones.delete(token);
  res.json({ ok: true });
});

app.get("/api/auth", (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token || !sesiones.has(token)) {
    return res.status(401).json({ ok: false, message: "Sesión no válida" });
  }
  res.json({ ok: true, usuario: USUARIO_ADMIN });
});

app.get("/api/productos", (req, res) => {
  res.json({
    ok: true,
    data: [
      { id: 1, nombre: "Sérum Glow Radiante", categoria: "Cuidado Facial", precio: 28 },
      { id: 2, nombre: "Crema Hidratante Rosa", categoria: "Cuidado Facial", precio: 22 },
      { id: 3, nombre: "Labial Terciopelo Nude", categoria: "Maquillaje", precio: 14 },
      { id: 4, nombre: "Perfume Flor de Noche", categoria: "Fragancias", precio: 45 }
    ],
    total: 4
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Recurso no encontrado" });
});

app.listen(PORT, () => {
  console.log(`✨ Native Origen disponible en http://localhost:${PORT}`);
});