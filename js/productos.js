"use strict";

window.PRODUCTOS = [
  /* ---------- Labiales ---------- */
  { id: 1, nombre: "Labial Terciopelo Nude", categoria: "Labiales", precio: 14, viejo: 19, desc: "Acabado mate de larga duración con manteca de cacao que hidrata mientras colorea.", emoji: "💄", colores: ["#e8c4c8", "#d98f8f"] },
  { id: 2, nombre: "Brillo Labial Cristal", categoria: "Labiales", precio: 13, desc: "Efecto espejo con infusión de menta para unos labios jugosos y frescos.", emoji: "💋", colores: ["#f6d6d8", "#efa3a9"] },
  { id: 3, nombre: "Labial Mate Amapola", categoria: "Labiales", precio: 15, desc: "Rojo intenso de pigmento puro, desliza como seda y no transfiere.", emoji: "🌺", colores: ["#f2c2be", "#d97a74"] },

  /* ---------- Maquillaje ---------- */
  { id: 4, nombre: "Paleta Sombras Aurora", categoria: "Maquillaje", precio: 26, desc: "8 tonos neutros y dorados con pigmentación intensa y acabado sedoso.", emoji: "🎨", colores: ["#eadfc2", "#c8a96e"] },
  { id: 5, nombre: "Máscara de Pestañas Volumen", categoria: "Maquillaje", precio: 18, desc: "Volumen extremo con curva prolongada y fórmula que no se corre.", emoji: "👁️", colores: ["#d9d9d9", "#b9bec9"] },
  { id: 6, nombre: "Rubor Melocotón", categoria: "Maquillaje", precio: 12, desc: "Calor natural en segundos, se difumina con la yema de los dedos.", emoji: "🍑", colores: ["#f7dcc4", "#efb68d"] },

  /* ---------- Cremas ---------- */
  { id: 7, nombre: "Crema Hidratante Rosa", categoria: "Cremas", precio: 22, desc: "Hidratación profunda con extracto de rosas, ceramidas y ácido hialurónico.", emoji: "🧴", colores: ["#f4d9e2", "#eec9d6"] },
  { id: 8, nombre: "Sérum Glow Radiante", categoria: "Cremas", precio: 28, viejo: 34, desc: "Vitamina C y ácido hialurónico para una piel luminosa de día a día.", emoji: "✨", colores: ["#f6e7dd", "#e3c4f0"] },
  { id: 9, nombre: "Helado de Manos Karité", categoria: "Cremas", precio: 11, desc: "Crema de manos ultra rica de rápida absorción que repara grietas.", emoji: "🤲", colores: ["#f7ecd8", "#ecd3a8"] },

  /* ---------- Mascarillas ---------- */
  { id: 10, nombre: "Mascarilla de Arcilla Rosa", categoria: "Mascarillas", precio: 18, desc: "Purifica y refina poros con caolín rosa y aloe vera, 10 minutos de ritual.", emoji: "🎭", colores: ["#e9e3f2", "#c2b0e0"] },
  { id: 11, nombre: "Mascarilla Exfoliante de Azúcar", categoria: "Mascarillas", precio: 16, desc: "Renueva la piel con partículas de azúcar y manteca de karité.", emoji: "🍬", colores: ["#f3e3c8", "#e2c79a"] },
  { id: 12, nombre: "Mascarilla Nocturna de Aloe", categoria: "Mascarillas", precio: 20, desc: "Piel jugosa al despertar: aloe, glicerina y camomila mientras duermes.", emoji: "🌿", colores: ["#dcefe0", "#a8d4b6"] },

  /* ---------- Corporal ---------- */
  { id: 13, nombre: "Aceite Corporal de Almendra", categoria: "Corporal", precio: 19, desc: "Nutre y suaviza con un aroma envolvente y acabado sedoso sin brillo graso.", emoji: "🫧", colores: ["#e6e4f0", "#c9c4e0"] },
  { id: 14, nombre: "Body Butter de Cacao", categoria: "Corporal", precio: 17, desc: "Manteca corporal extra rica para pieles secas, textura de mousse.", emoji: "🍫", colores: ["#ecd3bf", "#d4a58a"] },
  { id: 15, nombre: "Gel de Ducha Aloe-Menta", categoria: "Corporal", precio: 14, desc: "Limpieza suave que deja la piel fresca y tonificada, pH balanceado.", emoji: "🚿", colores: ["#d8f0ea", "#a9d8cc"] },

  /* ---------- Fragancias ---------- */
  { id: 16, nombre: "Perfume Flor de Noche", categoria: "Fragancias", precio: 45, viejo: 55, desc: "Jazmín, vainilla y ámbar para un aura que perdura más de 8 horas.", emoji: "🌸", colores: ["#f2dce3", "#ddb4c4"] },
  { id: 17, nombre: "Eau de Toilette Amor de Vainilla", categoria: "Fragancias", precio: 39, desc: "Vainilla cálida con toques de sándalo y naranja, dulce pero sofisticada.", emoji: "🍦", colores: ["#f7ead2", "#e9cf9a"] },
  { id: 18, nombre: "Bruma Corporal de Jazmín", categoria: "Fragancias", precio: 24, desc: "Rocío perfumado ligero para el cuerpo, ideal para después del baño.", emoji: "💐", colores: ["#ede2cf", "#d3cba0"] }
];

window.CATEGORIAS = {
  "Labiales": {
    emoji: "💄",
    tagline: "Color que dura y labios que se sienten besables.",
    desc: "Cremosos, mates y en brillo cristal. Pigmentos nobles sobre mantecas que cuidan tus labios.",
    grad: ["#f3d9df", "#dfa8b6"],
    n: "01"
  },
  "Maquillaje": {
    emoji: "🎨",
    tagline: "Rostro, ojos y color con acabado de estudio.",
    desc: "Productos de maquillaje pensados para durar de la mañana a la noche, con fórmula limpia.",
    grad: ["#eadfc2", "#c8a96e"],
    n: "02"
  },
  "Cremas": {
    emoji: "🧴",
    tagline: "Hidratación que abraza la piel todo el día.",
    desc: "Cremas y sérums con ceramidas, vitamina C y extractos botánicos de ósmosis pura.",
    grad: ["#f4d9e2", "#eec9d6"],
    n: "03"
  },
  "Mascarillas": {
    emoji: "🎭",
    tagline: "Rituales de 10 minutos que sí se notan.",
    desc: "Arcillas, azúcar y aloe para purificar, renovar y despertar con glow visible.",
    grad: ["#e9e3f2", "#c2b0e0"],
    n: "04"
  },
  "Corporal": {
    emoji: "🫧",
    tagline: "Cuidado de pies a cabeza, sin pretextos.",
    desc: "Aceites, mantecas y geles que nutren la piel del cuerpo con aromas que enamoran.",
    grad: ["#e6e4f0", "#c9c4e0"],
    n: "05"
  },
  "Fragancias": {
    emoji: "🌸",
    tagline: "Aromas que se quedan en la memoria.",
    desc: "Perfumes y brumas con notas de jazmín, vainilla y ámbar, libres de alcohol agresivo.",
    grad: ["#f2dce3", "#ddb4c4"],
    n: "06"
  }
};

window.ORDEN_CATEGORIAS = ["Labiales", "Maquillaje", "Cremas", "Mascarillas", "Corporal", "Fragancias"];