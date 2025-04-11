const { Usuario, Lugar } = require('../../models');

const verificarUsuarioEsPropietario = async (usuarioId) => {
  const usuario = await Usuario.findOne({
    where: { id: usuarioId },
  });

  if (!usuario) {
    return false;
  }

  if (usuario.rolid !== 3) {
    return false;
  }

  return true;
};

const obtenerLugaresPorPropietario = async (usuarioId) => {
  return await Lugar.findAll({
    where: { usuarioid: usuarioId },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['nombre', 'apellido']
      }
    ]
  });
};

module.exports = {
  verificarUsuarioEsPropietario,
  obtenerLugaresPorPropietario,
};
