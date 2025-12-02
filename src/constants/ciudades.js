/**
 * CIUDADES DEL PERÚ
 * 22 ciudades principales para el campo de ubicación
 */

export const CIUDADES_PERU = [
  'Seleccionar ciudad',
  'Abancay',           // Capital de Apurímac
  'Ica',               // Capital de Ica
  'Arequipa',          // Capital de Arequipa (segunda ciudad más importante)
  'Ayacucho',          // Capital de Ayacucho
  'Cajamarca',         // Capital de Cajamarca
  'Cusco',             // Capital de Cusco (ciudad histórica)
  'Huancayo',          // Capital de Junín
  'Huaraz',            // Capital de Ancash
  'Junín',             // Ciudad en Junín
  'La Paz',            // Capital de Itapampa
  'Lima',              // Capital de Perú (más importante)
  'Moquegua',          // Capital de Moquegua
  'Nazca',             // Ciudad en Ica
  'Piura',             // Capital de Piura
  'Pucallpa',          // Capital de Ucayali
  'Puerto Maldonado',  // Capital de Madre de Dios
  'Puno',              // Capital de Puno
  'Tarapoto',          // Capital de San Martín
  'Tacna',             // Capital de Tacna
  'Trujillo',          // Capital de La Libertad (tercera ciudad)
  'Tumbes'             // Capital de Tumbes
];

/**
 * MAPEO DE CIUDADES A DEPARTAMENTOS
 */
export const CIUDAD_DEPARTAMENTO = {
  'Abancay': 'Apurímac',
  'Ica': 'Ica',
  'Arequipa': 'Arequipa',
  'Ayacucho': 'Ayacucho',
  'Cajamarca': 'Cajamarca',
  'Cusco': 'Cusco',
  'Huancayo': 'Junín',
  'Huaraz': 'Ancash',
  'Junín': 'Junín',
  'La Paz': 'Itapampa',
  'Lima': 'Lima',
  'Moquegua': 'Moquegua',
  'Nazca': 'Ica',
  'Piura': 'Piura',
  'Pucallpa': 'Ucayali',
  'Puerto Maldonado': 'Madre de Dios',
  'Puno': 'Puno',
  'Tarapoto': 'San Martín',
  'Tacna': 'Tacna',
  'Trujillo': 'La Libertad',
  'Tumbes': 'Tumbes'
};

/**
 * MÉTODOS ÚTILES
 */
export const ciudadUtils = {
  /**
   * Obtiene el departamento de una ciudad
   */
  obtenerDepartamento: (ciudad) => CIUDAD_DEPARTAMENTO[ciudad] || 'Desconocido',

  /**
   * Valida si una ciudad es válida
   */
  esValida: (ciudad) => {
    return ciudad && city !== 'Seleccionar ciudad' && CIUDADES_PERU.includes(ciudad);
  },

  /**
   * Obtiene todas las ciudades ordenadas
   */
  obtenerTodas: () => CIUDADES_PERU,

  /**
   * Obtiene ciudades por departamento
   */
  obtenerPorDepartamento: (departamento) => {
    return Object.entries(CIUDAD_DEPARTAMENTO)
      .filter(([_, dept]) => dept === departamento)
      .map(([ciudad, _]) => ciudad);
  }
};

/**
 * INFORMACIÓN GEOGRÁFICA
 */
export const GEOGRAFICO_PERU = {
  pais: 'Perú',
  codigo_iso: 'PE',
  region: 'América del Sur',
  zona_horaria: 'UTC-5',
  moneda: 'PEN (Nuevo Sol)',
  idioma_oficial: 'Español',
  capital: 'Lima',
  poblacion_total: '34,000,000 (aproximado)',
  area_km2: '1,285,216 km²',
  ciudades_principales: 3, // Lima, Arequipa, Trujillo
  departamentos_total: 24
};

/**
 * NOTAS:
 * 
 * - Las 22 ciudades son las capitales de sus respectivos departamentos
 * - Lima es la capital nacional y la ciudad más importante
 * - Arequipa es la segunda ciudad más importante
 * - Trujillo es la tercera ciudad más importante
 * - El país está dividido en 24 departamentos
 * - Incluir "Seleccionar ciudad" como opción por defecto en el select
 */
