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
  async listarLugaresAdmin() {
    return await Lugar.findAll({
      where: {
        aprobacion: true
      },
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

  async listarLugaresPropietario(usuarioid) {
    return await Lugar.findAll({
      where: {
        usuarioid,
        estado: true,
        aprobacion: true
      },
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


  async buscarLugarAdmin(id) {
    return await Lugar.findOne({
      where: { id },
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
          attributes: ["nombre", "fecha_hora"],
        },
      ],
    });
  }

  async buscarLugarPropietario(id, usuarioid) {
    return await Lugar.findOne({
      where: { 
        id,
        usuarioid,
        estado: true,
        aprobacion: true
      },
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
          attributes: ["nombre", "fecha_hora"],
        },
      ],
    });
  }

  async buscarLugarUsuario(id) {
    return await Lugar.findOne({
      where: { 
        id,
        estado: true,
        aprobacion: true
      },
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
          attributes: ["nombre", "fecha_hora"],
        },
      ],
    });
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
    try {
      console.log('=== Inicio actualizarEstado ===');
      console.log('ID del lugar:', id);
      console.log('Estado a actualizar:', estado);

      const lugarAntes = await Lugar.findByPk(id);
      console.log('Lugar antes de actualizar:', lugarAntes ? lugarAntes.toJSON() : 'No encontrado');

      const actualizados = await Lugar.update(
        { 
          aprobacion: estado,
          estado: estado
        }, 
        { where: { id } }
      );
      console.log('Resultado de actualización:', actualizados);

      const lugarDespues = await Lugar.findByPk(id);
      console.log('Lugar después de actualizar:', lugarDespues ? lugarDespues.toJSON() : 'No encontrado');

      return actualizados;
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      throw error;
    }
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarCategoria(categoriaid) {
    return await Categoria.findByPk(categoriaid);
  }
}

module.exports = new LugarService();
