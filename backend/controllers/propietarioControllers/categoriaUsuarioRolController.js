const CategoriaUsuarioRolService = require("../../service/propietarioService/categoriaUsuarioRolService");
const UsuarioService = require("../../service/usuarioService");
const { Usuario } = require("../../models");

class CategoriaUsuarioRolController {
  async obtenerCategoriaPorPropietario(req, res) {
    try {
      const { usuarioid } = req.params;
      const usuario = await Usuario.findByPk(usuarioid);
      if(!usuario){
        return res.json({mensaje: "El usuario no existe"})

      }
      if(usuario.rolid !==3){
        return res.json({mensaje: "El usuario no es propietario"})
      }
      const categorias =
        await CategoriaUsuarioRolService.obtenerCategoriaPorPropietario(
          usuarioid
        );

      res.json(categorias);
    } catch (error) {
      console.error("error al listar categorias por propietario", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new CategoriaUsuarioRolController();
