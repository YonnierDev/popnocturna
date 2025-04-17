const categoriasParaUsuarioService = require('../../service/usuariosService/categoriasParaUsuarioService');

class CategoriaParaUsuarioController {
    async categoriasParaUsuario(req, res) {
        try {
            const categorias = await categoriasParaUsuarioService.categoriasParaUsuario();
            res.json(categorias);
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
        }
    }
}

module.exports = new CategoriaParaUsuarioController();
