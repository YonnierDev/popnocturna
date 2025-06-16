const { Categoria, Lugar } = require('../models');

class CategoriaService {
    async listarCategorias() {
        return await Categoria.findAll({
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

    async crearCategoria(tipo, descripcion, imagenUrl) {
        return await Categoria.create({
            tipo,
            descripcion, 
            imagen: imagenUrl || null, 
            estado: true 
        });
    }
    

    async actualizarCategoria(id, datos) {
        const categoria = await Categoria.findByPk(id);
        
        await categoria.update(datos);
    
        return await Categoria.findByPk(id, {
            attributes: ['id', 'tipo', 'descripcion', 'imagen', 'estado'], 
            include: [{
                model: Lugar,
                as: 'lugares',
                attributes: ['id', 'nombre', 'imagen'], 
            }]
        });
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
