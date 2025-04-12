const { Categoria, Lugar } = require('../models');

class CategoriaService {
    async listarCategorias() {
        return await Categoria.findAll({
            include: [
                {
                    model: Lugar,
                    as: 'lugares',
                    attributes: ['nombre', 'descripcion', 'estado'],
                },
            ],
        });
    }

    async obtenerLugaresPorCategoria(categoriaid) {
        return await Lugar.findAll({
            where: { categoriaid },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['tipo'],
                },
            ],
        });
    }

    async crearCategoria(tipo) {
        return await Categoria.create({ tipo, estado: true });
    }

    async actualizarCategoria(id, tipo) {
        return await Categoria.update({ tipo }, { where: { id } });
    }

    async eliminarCategoria(id) {
        return await Categoria.destroy({ where: { id } });
    }

    async buscarCategoria(id) {
        return await Categoria.findOne({
            where: { id },
            include: [
                {
                    model: Lugar,
                    as: 'lugares',
                    attributes: ['nombre', 'descripcion', 'estado',],
                },
            ],
        });
    }

    async actualizarEstado(id, estado) {
        return await Categoria.update({ estado }, { where: { id } });
    }
}

module.exports = new CategoriaService();
