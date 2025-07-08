const cloudinaryService = require("../service/cloudinaryService");
const PerfilService = require("../service/perfilService");

class PerfilController {
  
  async obtenerPerfil(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const perfil = await PerfilService.obtenerPerfilUsuario(usuarioId);

      if (!perfil) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      res.json(perfil);
    } catch (error) {
      console.error("❌ Error al obtener el perfil:", error);
      res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async actualizarPerfil(req, res) {
    try {
      const { nombre, apellido, correo, fecha_nacimiento, genero } = req.body;
      const usuarioId = req.usuario.id;
      let imagenUrl = null;

      if (req.file) {
        console.log("Imagen recibida en el backend:", req.file);
        
        // Subir la imagen a Cloudinary
        const uploadResponse = await cloudinaryService.subirImagen(
          req.file.buffer,
          `perfil-${Date.now()}`
        );

        if (!uploadResponse) {
          return res.status(500).json({ mensaje: "Error al subir la imagen" });
        }

        imagenUrl = uploadResponse.secure_url;  
      }

      console.log("URL de imagen subida a Cloudinary:", imagenUrl);  

      const perfilActualizado = await PerfilService.actualizarPerfilUsuario(usuarioId, {
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        genero,
        imagen: imagenUrl || null,  
        });

      res.json({
        mensaje: "Perfil actualizado con éxito",
        usuario: {
          ...perfilActualizado.dataValues,
          imagen: imagenUrl || perfilActualizado.imagen
        },
      });
    } catch (error) {
      console.error("❌ Error al actualizar el perfil:", error);
      res.status(500).json({ mensaje: "Error al actualizar el perfil", error: error.message });
    }
  }
}

module.exports = new PerfilController();