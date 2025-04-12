const { Usuario, Lugar } = require('../../models');

class UsuarioDetalleService {
  async verificarUsuarioEsPropietario(usuarioId) {
    const usuario = await Usuario.findOne({
      where: { id: usuarioId },
    });

    return usuario && usuario.rolid === 3;
  }

  async obtenerLugaresPorPropietario(usuarioId) {
    return await Lugar.findAll({
      where: { usuarioid: usuarioId },
      attributes: ['id', 'nombre', 'descripcion'], 
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'correo']
        }
      ]
    });
  }
}

module.exports = new UsuarioDetalleService();
