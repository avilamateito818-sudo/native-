module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    ok: true,
    data: [
      { id: 1, nombre: "Sérum Glow Radiante", categoria: "Cuidado Facial", precio: 28 },
      { id: 2, nombre: "Crema Hidratante Rosa", categoria: "Cuidado Facial", precio: 22 },
      { id: 3, nombre: "Labial Terciopelo Nude", categoria: "Maquillaje", precio: 14 },
      { id: 4, nombre: "Perfume Flor de Noche", categoria: "Fragancias", precio: 45 }
    ],
    total: 4
  });
};
