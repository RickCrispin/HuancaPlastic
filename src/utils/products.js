// ⚠️ DATOS LOCALES - USANDO SOLO COMO FALLBACK
// Los productos se cargan desde Supabase en producción
// Este archivo es un backup en caso de que la BD no esté disponible

export const PRODUCTS = [
  {
    id: 'local-1',
    name: 'Caja Organizadora Transparente 30L',
    description: 'Caja de almacenamiento resistente',
    category: 'hogar',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80',
    details: ['Capacidad 30L', 'Tapa hermética', 'Resistente']
  },
  {
    id: 'local-2',
    name: 'Canasta Industrial Apilable 60L',
    description: 'Canasta robusta para uso industrial',
    category: 'industrial',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
    details: ['Capacidad 60L', 'Apilable', 'Resistente a químicos']
  },
  {
    id: 'local-3',
    name: 'Silla Plástica Reforzada',
    description: 'Silla cómoda y resistente',
    category: 'muebles',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    details: ['Soporta 150kg', 'Fácil de limpiar', 'Interior/Exterior']
  },
  {
    id: 'local-4',
    name: 'Sistema de Gavetas 5 Niveles',
    description: 'Sistema de almacenamiento modular',
    category: 'organizacion',
    price: 98.00,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80',
    details: ['5 niveles', 'Deslizables', 'Divisores ajustables']
  },
  {
    id: 'local-5',
    name: 'Mesa Plegable Rectangular 180x90cm',
    description: 'Mesa plegable para eventos',
    category: 'muebles',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    details: ['180x90cm', 'Estructura aluminio', 'Fácil transporte']
  },
  {
    id: 'local-6',
    name: 'Palet de Plástico 120x100cm',
    description: 'Palet resistente para logística',
    category: 'industrial',
    price: 150.00,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=80',
    details: ['Carga 1000kg', 'Reutilizable', 'Higiénico']
  },
  {
    id: 'local-7',
    name: 'Organizador de Gaveta 4 Compartimentos',
    description: 'Organizador modular para gavetas',
    category: 'hogar',
    price: 12.50,
    image: 'https://images.unsplash.com/photo-1554909811-aea14fbe979e?w=400&q=80',
    details: ['4 compartimentos', 'Modular', 'Fácil instalación']
  },
  {
    id: 'local-8',
    name: 'Banqueta Taburete Plástico 45cm',
    description: 'Taburete resistente de altura',
    category: 'muebles',
    price: 42.50,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    details: ['Altura 45cm', 'Base antideslizante', 'Acero inoxidable']
  },
  {
    id: 'local-9',
    name: 'Colgador de Herramientas Panel',
    description: 'Panel organizador de herramientas',
    category: 'organizacion',
    price: 55.00,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80',
    details: ['120x60cm', 'Ganchos ajustables', 'Gran capacidad']
  },
  {
    id: 'local-10',
    name: 'Estante Modular 4 Niveles',
    description: 'Estante de almacenamiento modular',
    category: 'muebles',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    details: ['4 niveles', '30kg por nivel', 'Sin herramientas']
  }
];
