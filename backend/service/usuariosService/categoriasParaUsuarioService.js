const { Categoria } = require('../../models');

class CategoriasParaUsuarioService {
    async categoriasParaUsuario() {
        try {
            return await Categoria.findAll({
                attributes: ['tipo']
            });
        } catch (e) {
            throw new Error('Error al obtener categorías: ' + e.message);
        }
    }
}

module.exports = new CategoriasParaUsuarioService();
