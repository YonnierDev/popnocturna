const { Usuario } = require("../models");

class PerfilService {
  // Obtener perfil del usuario
  async obtenerPerfilUsuario(id) {
    console.log("🔍 Buscando usuario con ID:", id);
    const usuario = await Usuario.findByPk(id, {
      attributes: ['id', 'nombre', 'apellido', 'correo', 'imagen', 'fecha_nacimiento', 'genero'],  // Incluye la imagen en la consulta
    });
    console.log("🧠 Usuario encontrado:", usuario);
    return usuario;
  }

  // Método para actualizar el perfil del usuario
  async actualizarPerfilUsuario(id, perfilData) {
    console.log("🔄 Actualizando perfil con ID:", id);
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }


      const usuarioActualizado = await usuario.update(perfilData);
      return usuarioActualizado;
    } catch (error) {
      console.error("❌ Error al actualizar el perfil:", error);
      throw error;
    }
  }
}

module.exports = new PerfilService();