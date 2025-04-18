const categoriasParaUsuarioService = require('../../service/usuariosService/categoriasParaUsuarioService');

class CategoriaParaUsuarioController {
  // Obtener todas las categorías con sus lugares
  async categoriasParaUsuario(req, res) {
      try {
          const categorias = await categoriasParaUsuarioService.categoriasConLugares();
          res.json(categorias);
      } catch (error) {
          res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
      }
  }

  // Obtener lugares por categoría específica
  async lugaresDeCadaCaregoria(req, res) {
      try {
        const { categoriaid } = req.params;  
        const lugares = await categoriasParaUsuarioService.lugaresDeCategoria(categoriaid); 
        res.status(200).json(lugares);  
      } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener lugares de cada categoría', error: error.message });
      }
  }
}

module.exports = new CategoriaParaUsuarioController();
