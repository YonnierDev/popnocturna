const {
  Usuario,
  Rol,
  Lugar,
  Comentario,
  Reserva,
  Calificacion,
  Evento,
} = require("../models");

class UsuarioService {
  async listarUsuarios() {
    return await Usuario.findAll({
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
    return await Usuario.create(datos);
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
    try {
      // Buscar usuario incluyendo eliminados para verificar si ya fue eliminado
      const usuario = await Usuario.findOne({
        where: { id },
        paranoid: false // Incluye eliminados
      });

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      // Verificar si ya está eliminado
      if (usuario.deletedAt) {
        return {
          mensaje: 'El usuario ya estaba eliminado',
          eliminadoPreviamente: true,
          usuario
        };
      }

      // Realizar soft delete
      await usuario.destroy();

      // Obtener el usuario actualizado
      const usuarioEliminado = await Usuario.findOne({
        where: { id },
        paranoid: false, // Incluye eliminados
        attributes: { exclude: ['contrasena', 'codigoVerificacion', 'codigoRecuperacion'] },
        include: [{ model: Rol, as: "rol", attributes: ["id", "nombre"] }]
      });

      return {
        mensaje: 'Usuario eliminado correctamente',
        eliminadoPreviamente: false,
        usuario: usuarioEliminado
      };

    } catch (error) {
      console.error('Error en eliminarUsuario:', error);
      throw error;
    }
  }

  async restaurarUsuario(id) {
    try {
      const usuario = await Usuario.findOne({
        where: { id },
        paranoid: false // Incluye eliminados
      });

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      if (!usuario.deletedAt) {
        return { 
          mensaje: 'El usuario no estaba eliminado',
          restaurado: false,
          usuario
        };
      }

      await usuario.restore();

      return { 
        mensaje: 'Usuario restaurado correctamente',
        restaurado: true,
        usuario: await this.buscarUsuario(id) // Devuelve el usuario restaurado
      };

    } catch (error) {
      console.error('Error en restaurarUsuario:', error);
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