const { Lugar, Usuario, Categoria, Evento } = require("../models");
const { Op } = require("sequelize");

class LugarError extends Error {
  constructor(mensaje, tipo = 'VALIDACION') {
    super(mensaje);
    this.name = 'LugarError';
    this.tipo = tipo;
  }
}

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

  async crearLugar(dataLugar) {
    try {
      const nuevoLugar = await Lugar.create(dataLugar);
      return nuevoLugar;
    } catch (error) {
      throw error;
    }
  }
  
  async actualizarLugar(id, dataLugar) {
    try {
      const lugar = await Lugar.findByPk(id);
      if (!lugar) {
        throw new LugarError("Lugar no encontrado", 'NO_ENCONTRADO');
      }

      // Solo validar si se está cambiando el nombre
      if (dataLugar.nombre && dataLugar.nombre !== lugar.nombre) {
        const lugarExistente = await Lugar.findOne({
          where: {
            nombre: dataLugar.nombre
          }
        });

        if (lugarExistente) {
          throw new LugarError("Ya existe un lugar con este nombre", 'DUPLICADO');
        }
      }

      // Actualizar todos los campos sin restricciones
      const lugarActualizado = await lugar.update(dataLugar);
      return lugarActualizado;
    } catch (error) {
      if (error instanceof LugarError) {
        throw error;
      }
      throw new LugarError("Error al actualizar el lugar", 'INTERNO');
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
