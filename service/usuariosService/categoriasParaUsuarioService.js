const { Categoria, Lugar } = require("../../models");

class CategoriasParaUsuarioService {
  // obtener todas las categorías con sus lugares
  async categoriasConLugares() {
    const categorias = await Categoria.findAll({
      where: { estado: true },
      attributes: ['tipo'],
      include: [
        {
          model: Lugar,
          as: 'lugares',
          attributes: ['imagen', 'nombre', 'descripcion', 'ubicacion'],
        }
      ]
    });

    return categorias.map(cat => {
      return {
        tipo: cat.tipo,
        lugares: cat.lugares.map(lugar => {
          return {
            imagen: lugar.imagen,
            nombre: lugar.nombre,
            descripcion: lugar.descripcion,
            ubicacion: lugar.ubicacion
          };
        })
      };
    });
  }

  //obtener lugares por categoría específica
  async lugaresDeCategoria(categoriaid) {
    if (!categoriaid) {
      throw new Error("El id de la categoría es requerido");
    }

    const categoria = await Categoria.findOne({
      where: { id: categoriaid, estado: true },
      attributes: ['tipo'],
      include: [
        {
          model: Lugar,
          as: 'lugares',
          attributes: ['imagen', 'nombre', 'descripcion', 'ubicacion'],
          where: { estado: true }
        },
      ],
    });

    if (!categoria) {
      throw new Error("Categoría no encontrada o desactivada");
    }

    return {
      tipo: categoria.tipo,
      lugares: categoria.lugares.map(lugar => ({
        nombre: lugar.nombre,
        descripcion: lugar.descripcion,
        ubicacion: lugar.ubicacion,
        imagen: lugar.imagen,
      }))
    };
  }
}

module.exports = new CategoriasParaUsuarioService();
