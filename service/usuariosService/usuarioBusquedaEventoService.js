const { Evento } = require('../../models');
const { Op } = require('sequelize');

class UsuarioBusquedaService {
  async buscarEventosPorNombre(nombre) {
    return await Evento.findAll({
      where: {
        nombre: {
          [Op.like]: `%${nombre}%`,
        },
        estado: true,
      },
      attributes: ['id', 'nombre', 'fecha_hora'],
      limit: 10,
    });
  }
}

module.exports = new UsuarioBusquedaService();
