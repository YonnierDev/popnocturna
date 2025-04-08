const { Lugar, Usuario, Categoria, Evento } = require("../models");

class LugarService {
  static relacionesBase = [
    {
      model: Usuario,
      as: "usuario",
      attributes: ["id", "nombre"],
    },
    {
      model: Categoria,
      as: "categoria",
      attributes: ["id", "tipo"],
    },
    {
      model: Evento,
      as: "eventos",
      attributes: ["id", "descripcion"],
    },
  ];

  async listarLugares() {
    return await Lugar.findAll(); // Básico, sin relaciones
  }

  async listarLugaresConRelaciones() {
    return await Lugar.findAll({ include: LugarService.relacionesBase });
  }

  async buscarLugar(id, conRelaciones = false) {
    return await Lugar.findByPk(id, {
      include: conRelaciones ? LugarService.relacionesBase : [],
    });
  }

  async crearLugar({ usuarioid, categoriaid, nombre, descripcion, ubicacion, estado = true }) {
    return await Lugar.create({ usuarioid, categoriaid, nombre, descripcion, ubicacion, estado });
  }

  async actualizarLugar(id, datos) {
    await Lugar.update(datos, { where: { id } });
    return await this.buscarLugar(id);
  }

  async eliminarLugar(id) {
    return await Lugar.destroy({ where: { id } });
  }

  async actualizarEstado(id, estado) {
    return await Lugar.update({ estado }, { where: { id } });
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarCategoria(categoriaid) {
    return await Categoria.findByPk(categoriaid);
  }
}

module.exports = new LugarService();
