
/**
 * Formatea una respuesta paginada estándar
 * @param {Object} params
 * @param {number} params.total - Total de registros encontrados
 * @param {Array} params.rows - Array de resultados de la página
 * @param {number|string} params.page - Página actual
 * @param {number|string} params.limit - Tamaño de página
 * @param {string} params.nombreColeccion - Nombre de la colección (ej: 'usuarios', 'lugares', 'calificaciones')
 * @returns {Object} Objeto de respuesta paginada
 */
function formatearRespuestaPaginada({ total, rows, page, limit, nombreColeccion }) {
  return {
    total,
    [nombreColeccion]: rows,
    paginas: Math.ceil(total / limit),
    paginaActual: parseInt(page)
  };
}

module.exports = { formatearRespuestaPaginada };
