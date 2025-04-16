const { Usuario, Categoria, Lugar, Rol } = require("../../models");

class CategoriaUsuarioRolService {
  async obtenerCategoriaPorPropietario(usuarioid) {
    const usuario = await Usuario.findOne({
      where: { id: usuarioid, rolid: 3 },
    });

    if (!usuario) {
      throw new Error("El usuario no existe o no es un propietario");
    }

    const categorias = await Categoria.findAll({
      where: {
        estado: true,
      },
      attributes: ["id", "nombre", "descripcion"],
      include: [
        {
          model: Lugar,
          as: "lugares",
          required: true,
          attributes: ["nombre", "descripcion", "ubicacion"],
          where: { usuarioid, estado: true },
        },
      ],
    });

    return categorias;
  }
}

module.exports = new CategoriaUsuarioRolService();
