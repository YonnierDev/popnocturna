const usuarioDetalleService = require('../../service/detailsService/usuarioDetalleService');

const obtenerLugaresDelPropietario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de propietario inválido o no proporcionado' });
    }

    const usuarioValido = await usuarioDetalleService.verificarUsuarioEsPropietario(id);
    if (!usuarioValido) {
      return res.status(403).json({ error: 'Usuario no válido: no es un propietario' });
    }

    const lugares = await usuarioDetalleService.obtenerLugaresPorPropietario(id);

    if (!lugares || lugares.length === 0) {
      return res.status(404).json({ error: 'No se encontraron lugares para este propietario' });
    }

    res.status(200).json(lugares);

  } catch (error) {
    console.error('Error en obtenerLugaresDelPropietario:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerLugaresDelPropietario,
};
