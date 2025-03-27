const { Lugar, Usuario, Categoria } = require("../models");
class LugarService {
  async listarLugares() {
    return await Lugar.findAll();
  }

  async crearLugar(usuarioid, categoriaid, descripcion, ubicacion) {
    return await Lugar.create({ usuarioid, categoriaid, descripcion, ubicacion });
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
