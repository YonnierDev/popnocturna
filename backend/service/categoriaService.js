const { Categoria } = require('../models');

class CategoriaService {
    async listarCategorias() {
        return await Categoria.findAll();
    }

    async crearCategoria(tipo) {
        return await Categoria.create({ tipo });
    }

    async actualizarCategoria(id, tipo) {
        return await Categoria.update({ tipo }, { where: { id } });
    }

    async eliminarCategoria(id) {
        return await Categoria.destroy({ where: { id } });
    }

    async buscarCategoria(id) {
        return await Categoria.findOne({ where: { id } });
    }
}

module.exports = new CategoriaService();
