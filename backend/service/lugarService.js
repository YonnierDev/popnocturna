const { Lugar, Usuario, Categoria, Evento } = require("../models");
class LugarService {
  
  async listarRelaciones() {
    return await Lugar.findAll({
      include: [
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
      ],
    });
  }

  async actualizarEstado(id, estado) {
    return await Lugar.update({ estado }, { where: { id } });
  }

  async listarRelacionesLugares() {
    return await Lugar.findAll({
      include: [
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
        }
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
