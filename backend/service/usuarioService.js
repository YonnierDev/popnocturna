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
              attributes: ["descripcion", "fecha_hora"],
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
    return await Usuario.findByPk(id);
  }

  async buscarPorCorreo(correo) {
    return await Usuario.findOne({ where: { correo } });
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
    const usuario = await this.buscarUsuario(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    await Usuario.destroy({ where: { id } });
    return { mensaje: "Usuario eliminado correctamente", usuarioEliminado: usuario };
  }
  

  async verificarRol(rolid) {
    return await Rol.findByPk(rolid);
  }

  async buscarPorRol(rolId) {
    return await Usuario.findAll({
      where: { rolid: rolId },
    });
  }
}

module.exports = new UsuarioService();
