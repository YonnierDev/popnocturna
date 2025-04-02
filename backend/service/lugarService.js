const { Lugar, Usuario, Categoria } = require("../models");
class LugarService {
  
  async listarLugares() {
    return await Lugar.findAll({
      include: [
        {
          model: Usuario,
          as: "usuarios", // Usar el alias definido en el modelo
          attributes: ["id", "nombre"], // Obtener solo el nombre
        },
        {
          model: Categoria,
          as: "categorias", // Usar el alias definido en el modelo
          attributes: ["id", "tipo"],
        },
      ],
    });
  }

  async crearLugar(usuarioid, categoriaid, nombre, descripcion, ubicacion, estado) {
    return await Lugar.create({ usuarioid, categoriaid, nombre, descripcion, ubicacion, estado });
  }

  async buscarLugar(id) {
    return await Lugar.findByPk(id);
  }

  async actualizarLugar(id, datos) {
    await Lugar.update(datos, { where: { id } });
    return await this.buscarLugar(id);
  }

  async eliminarLugar(id) {
    return await Lugar.destroy({ where: { id } });
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarCategoria(categoriaid) {
    return await Categoria.findByPk(categoriaid);
  }
}

module.exports = new LugarService();
