// Datos oficiales integrados de basebase.txt y mockups.pen
export const CATEGORIAS = [
  { id: 1, nombre: 'almuerzos', display: 'Almuerzos' },
  { id: 2, nombre: 'desayunos', display: 'Desayunos' },
  { id: 3, nombre: 'bebidas', display: 'Bebidas' },
  { id: 4, nombre: 'tortas', display: 'Tortas' },
  { id: 5, nombre: 'postres', display: 'Postres' },
  { id: 6, nombre: 'bocaditos', display: 'Bocaditos' }
];

export const PERSONALIZACIONES = {
  mensaje: {
    id: 1,
    nombre: 'Mensaje Personalizado',
    tipo: 'texto',
    requerido: false,
    placeholder: 'Escribe aquí tu mensaje especial...'
  },
  saborCake: {
    id: 2,
    nombre: 'Sabor del cake',
    tipo: 'seleccion',
    requerido: true,
    opciones: [
      { id: 21, valor: 'Chocolate', precio_extra: 0 },
      { id: 22, valor: 'Vainilla', precio_extra: 0 }
    ]
  },
  relleno: {
    id: 3,
    nombre: 'Relleno',
    tipo: 'seleccion',
    requerido: true,
    opciones: [
      { id: 31, valor: 'Manjar', precio_extra: 0 },
      { id: 32, valor: 'Fresa', precio_extra: 0 },
      { id: 33, valor: 'Oreo', precio_extra: 0 }
    ]
  },
  tamano: {
    id: 4,
    nombre: 'Tamaño',
    tipo: 'seleccion',
    requerido: true,
    opciones: [
      { id: 41, valor: '15 porciones', precio_extra: 0, descripcion: 'Pequeña (8 porciones en mockup)' },
      { id: 42, valor: '20 porciones', precio_extra: 15.00, descripcion: 'Mediana (10-12 porciones en mockup)' },
      { id: 43, valor: '30 porciones', precio_extra: 25.00, descripcion: 'Grande (15-20 porciones en mockup)' }
    ]
  }
};

export const PRODUCTOS = [
  // --- PRODUCTOS DESDE BASEBASE.TXT (INSERT) ---
  {
    id: 1,
    nombre: 'Torta Tralalero Tralala',
    descripcion: 'Bizcocho de cacao intenso con mousse de avellanas y baño de chocolate belga. Torta para ocasiones especiales.',
    precio: 80.00,
    stock: 10,
    categoria: 'tortas',
    imagen_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: true,
    tag: 'TOP VENTAS',
    rating: 4.9,
    reseñas_count: 42,
    personalizaciones: [
      PERSONALIZACIONES.mensaje,
      PERSONALIZACIONES.saborCake,
      PERSONALIZACIONES.relleno,
      PERSONALIZACIONES.tamano
    ]
  },
  {
    id: 2,
    nombre: 'Torta de vainilla con frutas',
    descripcion: 'Bizcocho de vainilla decorado con frutas frescas de estación y crema chantilly premium.',
    precio: 90.00,
    stock: 8,
    categoria: 'tortas',
    imagen_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.7,
    reseñas_count: 12,
    personalizaciones: [
      PERSONALIZACIONES.mensaje,
      PERSONALIZACIONES.saborCake,
      PERSONALIZACIONES.relleno,
      PERSONALIZACIONES.tamano
    ]
  },
  {
    id: 3,
    nombre: 'Cheesecake de maracuyá',
    descripcion: 'Postre frío con base de galleta y crema de maracuyá. Equilibrio perfecto entre la cremosidad del queso y la acidez vibrante del maracuyá fresco.',
    precio: 25.00,
    stock: 15,
    categoria: 'postres',
    imagen_url: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: true,
    rating: 4.8,
    reseñas_count: 28,
    personalizaciones: [
      PERSONALIZACIONES.mensaje
    ]
  },
  {
    id: 4,
    nombre: 'Brownies artesanales',
    descripcion: 'Brownies de chocolate con nueces. Húmedos, densos y cargados de nueces seleccionadas. El acompañante ideal para un café.',
    precio: 5.00,
    stock: 50,
    categoria: 'postres',
    imagen_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: true,
    rating: 4.6,
    reseñas_count: 35,
    personalizaciones: []
  },
  {
    id: 5,
    nombre: 'Desayuno gourmet',
    descripcion: 'Caja premium de desayuno con jugo de fresa, sándwich de jamón serrano, ensalada de frutas y un mini postre.',
    precio: 45.00,
    stock: 12,
    categoria: 'desayunos',
    imagen_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.9,
    reseñas_count: 19,
    personalizaciones: [
      PERSONALIZACIONES.mensaje
    ]
  },
  {
    id: 6,
    nombre: 'Almuerzo ejecutivo',
    descripcion: 'Menú balanceado gourmet: Plato principal premium + jugo natural + mini postre de la casa.',
    precio: 30.00,
    stock: 20,
    categoria: 'almuerzos',
    imagen_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.5,
    reseñas_count: 14,
    personalizaciones: []
  },
  {
    id: 7,
    nombre: 'Jugo natural de fresa',
    descripcion: 'Bebida refrescante elaborada con fresas frescas seleccionadas. Prensado en frío al instante.',
    precio: 8.00,
    stock: 30,
    categoria: 'bebidas',
    imagen_url: 'https://images.unsplash.com/photo-1589733901241-5e514f26b54a?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.7,
    reseñas_count: 9,
    personalizaciones: []
  },
  {
    id: 8,
    nombre: 'Bocaditos salados surtidos',
    descripcion: 'Bandeja variada de mini empanaditas, tequeños rellenos y croquetas artesanales crujientes.',
    precio: 60.00,
    stock: 5,
    categoria: 'bocaditos',
    imagen_url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.8,
    reseñas_count: 22,
    personalizaciones: []
  },

  // --- PRODUCTOS DESDE MOCKUPS.PEN PARA COMPLEMENTAR DISEÑO ---
  {
    id: 9,
    nombre: 'Torta Ganache Royale',
    descripcion: 'Bizcocho de chocolate 70% cacao con capas de ganache suave, mousse de chocolate y perlas crujientes belgas.',
    precio: 120.00,
    stock: 7,
    categoria: 'tortas',
    imagen_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.9,
    reseñas_count: 31,
    personalizaciones: [
      PERSONALIZACIONES.mensaje,
      PERSONALIZACIONES.saborCake,
      PERSONALIZACIONES.relleno,
      PERSONALIZACIONES.tamano
    ]
  },
  {
    id: 10,
    nombre: 'Macarons de Autor (x12)',
    descripcion: 'Colección de sabores estacionales hechos a mano: Lavanda, Pistacho y Frutos Rojos con harina de almendras fina.',
    precio: 45.00,
    stock: 25,
    categoria: 'postres',
    imagen_url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.8,
    reseñas_count: 53,
    personalizaciones: []
  },
  {
    id: 11,
    nombre: 'Cupcakes Red Velvet',
    descripcion: 'Pack de 6 unidades con bizcocho Red Velvet húmedo, frosting de queso crema premium y decoraciones de chocolate.',
    precio: 55.00,
    stock: 15,
    categoria: 'postres',
    imagen_url: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.9,
    reseñas_count: 24,
    personalizaciones: []
  },
  {
    id: 12,
    nombre: 'Cheesecake New York',
    descripcion: 'Clásico horneado al estilo neoyorquino con base de galleta de mantequilla, coulis de frutos rojos estacionales y fresas frescas.',
    precio: 90.00,
    precio_oferta: 72.00,
    stock: 10,
    categoria: 'postres',
    imagen_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.8,
    reseñas_count: 17,
    personalizaciones: [
      PERSONALIZACIONES.mensaje
    ]
  },
  {
    id: 13,
    nombre: 'Cookies Artesanales',
    descripcion: 'Selección de 8 galletas gigantes horneadas diariamente: Choco-chips con sal marina y cookies con doble chocolate.',
    precio: 38.00,
    stock: 40,
    categoria: 'postres',
    imagen_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.7,
    reseñas_count: 11,
    personalizaciones: []
  },
  {
    id: 14,
    nombre: 'Mini Quiches Salados',
    descripcion: 'Bandeja de 24 bocaditos salados: jamón serrano con gruyere, champiñones con espinaca y cebolla caramelizada.',
    precio: 65.00,
    stock: 12,
    categoria: 'bocaditos',
    imagen_url: 'https://images.unsplash.com/photo-1628113310479-90be225965f2?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.8,
    reseñas_count: 15,
    personalizaciones: []
  },
  {
    id: 15,
    nombre: 'Jugo Natural Detox',
    descripcion: 'Prensado en frío con naranjas de estación, zanahoria, manzana verde y un toque de jengibre fresco.',
    precio: 12.00,
    stock: 35,
    categoria: 'bebidas',
    imagen_url: 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: true,
    rating: 4.6,
    reseñas_count: 8,
    personalizaciones: []
  },
  {
    id: 16,
    nombre: 'Pastel de Zanahoria',
    descripcion: 'Bizcocho especiado de zanahoria con nueces tostadas y capas suaves de frosting de queso crema.',
    precio: 95.00,
    stock: 6,
    categoria: 'tortas',
    imagen_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.8,
    reseñas_count: 21,
    personalizaciones: [
      PERSONALIZACIONES.mensaje,
      PERSONALIZACIONES.tamano
    ]
  },
  {
    id: 17,
    nombre: 'Red Velvet Clásico',
    descripcion: 'Bizcocho esponjoso con sutil sabor a cacao, relleno y cubierto con frosting de queso dulce artesanal.',
    precio: 110.00,
    stock: 8,
    categoria: 'tortas',
    imagen_url: 'https://images.unsplash.com/photo-1586985289688-ca9cf499150a?w=600&auto=format&fit=crop&q=80',
    activo: true,
    destacado: false,
    rating: 4.9,
    reseñas_count: 33,
    personalizaciones: [
      PERSONALIZACIONES.mensaje,
      PERSONALIZACIONES.saborCake,
      PERSONALIZACIONES.tamano
    ]
  }
];

export const RESEÑAS = [
  {
    id: 1,
    iniciales: 'MJ',
    usuario: 'María José',
    fecha: 'Hace 2 días',
    calificacion: 5,
    comentario: 'El pastel superó mis expectativas. El sabor del cacao es intenso y sutil a la vez, y el bizcocho estaba increíblemente húmedo. El envío llegó perfecto.'
  },
  {
    id: 2,
    iniciales: 'CR',
    usuario: 'Carlos Ramírez',
    fecha: 'Hace 1 semana',
    calificacion: 4,
    comentario: 'Muy rico, a mi familia le encantó. Llegó en perfectas condiciones gracias al buen empaque. Solo sugiero agregar una opción de menor dulzor.'
  }
];
