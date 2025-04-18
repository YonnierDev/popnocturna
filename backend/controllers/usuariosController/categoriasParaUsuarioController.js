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

    async lugaresDeCadaCaregoria(req, res) {
        try {
            const lugares = await categoriasParaUsuarioService.lugaresDeCadaCaregoria();
            res.status(200).json(lugares);
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al obtener lugares de cada categoría', error: error.message });
        }
    }
    

}

module.exports = new CategoriaParaUsuarioController();
