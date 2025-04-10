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
  async crearCategoria(tipo) {
    return await Categoria.create({ tipo, estado: true }); // estado por defecto
  }

  async actualizarCategoria(id, tipo, estado) {
    return await Categoria.update({ tipo, estado }, { where: { id } });
  }

  async eliminarCategoria(id) {
    return await Categoria.destroy({ where: { id } });
  }

  async buscarCategoria(id) {
    return await Categoria.findOne({ where: { id } });
  }

  async actualizarEstado(id, estado) {
    return await Categoria.update({ estado }, { where: { id } });
  }

}

module.exports = new CategoriaService();
