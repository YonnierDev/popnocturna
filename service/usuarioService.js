const { Op } = require('sequelize');
const { 
  Usuario, 
  Rol, 
  Lugar, 
  Comentario, 
  Reserva, 
  Calificacion, 
  Evento, 
  Notificacion 
} = require("../models");
const { sequelize } = require("../models");

class UsuarioService {
  async listarUsuarios() {
    return await Usuario.findAll({
      where: { rolid: { [Op.ne]: 1 } },
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre"] }],
    });
  }

  async listarRelacionesUsuarios() {
    return await Usuario.findAll({
      attributes: ['nombre', 'apellido', 'correo'],
      include: [
        {
          model: Rol,
          as: "rol",
          attributes: ["nombre"]
        },
        {
          model: Lugar,
          as: "lugares",
          attributes: ["descripcion", "ubicacion"],
        },
        {
          model: Reserva,
          as: "reservas",
          attributes: ["fecha_hora"],
          include: [
            {
              model: Evento,
              as: "evento",
              attributes: ["nombre", "fecha_hora"],
            }
          ]
        },
        {
          model: Comentario,
          as: "comentarios",
          attributes: ["nombre"],
          include: [
            {
              model: Evento,
              as: "evento",
              attributes: ["descripcion"],
            }
          ]
        },
        {
          model: Calificacion,
          as: "calificaciones",
          attributes: ["puntuacion"],
          include: [
            {
              model: Evento,
              as: "evento",
              attributes: ["descripcion"]
            }
          ]
        }
      ]
    });
  }


  async buscarUsuario(id) {
    return await Usuario.findByPk(id, {
      attributes: ['id', 'nombre', 'apellido', 'correo', 'contrasena'],
      include: [
        {
          model: Rol,
          as: "rol",
          attributes: ["nombre"]
        },
        {
          model: Lugar,
          as: "lugares",
          attributes: ["descripcion", "ubicacion"]
        },
        {
          model: Reserva,
          as: "reservas",
          attributes: ["fecha_hora"],
          include: [
            {
              model: Evento,
              as: "evento",
              attributes: ["descripcion", "fecha_hora"]
            }
          ]
        },
        {
          model: Comentario,
          as: "comentarios",
          attributes: ["contenido", "fecha_hora"],
          include: [
            {
              model: Evento,
              as: "evento",
              attributes: ["descripcion"]
            }
          ]
        },
        {
          model: Calificacion,
          as: "calificaciones",
          attributes: ["puntuacion"],
          include: [
            {
              model: Evento,
              as: "evento",
              attributes: ["descripcion"]
            }
          ]
        }
      ]
    });
  }


  async buscarPorCorreo(correo) {
    console.log('\n[buscarPorCorreo] Iniciando búsqueda de usuario');
    console.log('[buscarPorCorreo] Correo a buscar:', correo);

    try {
      const usuario = await Usuario.findOne({ where: { correo } });
      console.log('[buscarPorCorreo] Resultado de la búsqueda:', usuario ? 'Usuario encontrado' : 'Usuario no encontrado');
      if (usuario) {
        console.log('[buscarPorCorreo] Detalles del usuario:', {
          id: usuario.id,
          correo: usuario.correo,
          estado: usuario.estado
        });
      }
      return usuario;
    } catch (error) {
      console.error('[buscarPorCorreo] Error en la búsqueda:', error);
      throw error;
    }
  }

  async crearUsuario(datos) {
    try {
      // Verificar si el correo ya está en uso
      const usuarioExistente = await this.buscarPorCorreo(datos.correo);
      if (usuarioExistente) {
        throw new Error(`El correo ${datos.correo} ya está registrado`);
      }

      // Crear el usuario si el correo no existe
      return await Usuario.create(datos);
    } catch (error) {
      console.error('[crearUsuario] Error al crear usuario:', error);
      throw error;
    }
  }

  async activarUsuario(correo) {
    await Usuario.update(
      { estado: true, codigoVerificacion: null },
      { where: { correo } }
    );
  }

  async guardarCodigoRecuperacion(correo, codigo) {
    await Usuario.update({ codigoRecuperacion: codigo }, { where: { correo } });
  }

  async actualizarContrasena(correo, nuevaContrasena) {
    await Usuario.update(
      { contrasena: nuevaContrasena, codigoRecuperacion: null },
      { where: { correo } }
    );
  }

  async actualizarUsuario(id, datos) {
    const usuario = await this.buscarUsuario(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    await Usuario.update(datos, { where: { id } });
    return await this.buscarUsuario(id);
  }

  async eliminarUsuario(id) {
    const transaction = await sequelize.transaction();
    try {
      const usuario = await Usuario.findByPk(id, { transaction });
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      // Eliminar dependencias en orden inverso
      await Calificacion.destroy({ where: { usuarioid: id }, transaction });
      await Comentario.destroy({ where: { usuarioid: id }, transaction });
      await Reserva.destroy({ where: { usuarioid: id }, transaction });
      
      // Si el usuario es propietario, eliminar sus lugares
      if (usuario.rolid === 2) { // Asumiendo que 2 es el ID del rol de propietario
        await Lugar.destroy({ where: { usuarioid: id }, transaction });
      }

      // Eliminar notificaciones donde el usuario es el receptor
      await Notificacion.destroy({ where: { receptor_id: id }, transaction });
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      // Eliminar dependencias en orden inverso
      await Calificacion.destroy({ where: { usuarioid: id }, transaction });
      await Comentario.destroy({ where: { usuarioid: id }, transaction });
      await Reserva.destroy({ where: { usuarioid: id }, transaction });
      
      // Si el usuario es propietario, eliminar sus lugares
      if (usuario.rolid === 2) { // Asumiendo que 2 es el ID del rol de propietario
        await Lugar.destroy({ where: { usuarioid: id }, transaction });
      }

      // Finalmente, eliminar el usuario
      await usuario.destroy({ transaction });
      
      // Si todo sale bien, hacemos commit de la transacción
      await transaction.commit();
      
      return { mensaje: "Usuario eliminado correctamente" };
    } catch (error) {
      // Si hay algún error, hacemos rollback
      await transaction.rollback();
      throw error;
    }
  }


  async verificarRol(rolid) {
    return await Rol.findByPk(rolid);
  }

  async buscarPorRol(rolId) {
    return await Usuario.findAll({
      where: { rolid: rolId },
    });
  }

  async buscarPorId(id) {
    return await Usuario.findByPk(id, {
      attributes: { exclude: ["contrasena"] },
    });
  }

  async actualizarContrasenaPorId(id, nuevaContrasena) {
    const usuario = await this.buscarPorId(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    await Usuario.update({ contrasena: nuevaContrasena }, { where: { id } });
    return await this.buscarPorId(id);
  }

  async buscarPorNombre(nombre) {
    return await Usuario.findOne({ where: { nombre } });
  }
}

module.exports = new UsuarioService();