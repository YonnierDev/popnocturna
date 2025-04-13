const { Lugar, Usuario, Categoria, Evento } = require("../models");

class LugarService {
  async listarLugares() {
    return await Lugar.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"], 
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"], 
        },
        {
          model: Evento,
          as: "eventos",
          attributes: ["nombre", "descripcion"], 
        },
      ],
    });
  }

  async buscarLugar(id, conRelaciones = false) {
    const options = { where: { id } };
  
    if (conRelaciones) {
      options.include = [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
        {
          model: Evento,
          as: "eventos",
          attributes: ["nombre", "fecha_hora"],
        },
      ];
    }
  
    return await Lugar.findOne(options);
  }

  async crearLugar({ usuarioid, categoriaid, nombre, descripcion, ubicacion, estado = true, imagen }) {
    return await Lugar.create({ usuarioid, categoriaid, nombre, descripcion, ubicacion, estado, imagen });
  }
  
  async actualizarLugar(id, dataLugar) {
    try {
      const lugar = await Lugar.findByPk(id);
      if (!lugar) {
        throw new Error("Lugar no encontrado");
      }

      const lugarActualizado = await lugar.update(dataLugar);
      return lugarActualizado;
    } catch (error) {
      console.error("❌ Error al actualizar el lugar:", error);
      throw error;
    }
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
