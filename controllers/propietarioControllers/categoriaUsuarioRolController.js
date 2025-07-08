const CategoriaUsuarioRolService = require("../../service/propietarioService/categoriaUsuarioRolService");
const { Usuario } = require("../../models");

class CategoriaUsuarioRolController {
  async obtenerCategoriaPorPropietario(req, res) {
    try {
      const usuarioid = req.usuario.id; // Usamos el ID del usuario desde el token

      const usuario = await Usuario.findByPk(usuarioid);
      if (!usuario) {
        return res.status(404).json({ mensaje: "El usuario no existe" });
      }
      if (usuario.rolid !== 3) {
        return res.status(403).json({ mensaje: "El usuario no es propietario" });
      }

      const categorias = await CategoriaUsuarioRolService.obtenerCategoriaPorPropietario(usuarioid);

      return res.json(categorias);
    } catch (error) {
      console.error("Error al listar categorías por propietario", error);
      return res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new CategoriaUsuarioRolController();
