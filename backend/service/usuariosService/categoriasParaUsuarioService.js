const { Categoria, Lugar } = require('../../models');

class CategoriasParaUsuarioService {
    async categoriasParaUsuario() {
        return await Categoria.findAll({
          include: [
            {
              model: Lugar,
              as: 'lugares',
              attributes: ['imagen', 'nombre', 'descripcion', 'ubicacion'], 
              include: [
                {
                  model: Categoria, 
                  as: 'categoria',  
                  attributes: ['tipo'], 
                },
              ],
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
            attributes: ['categoriaid', 'nombre', 'imagen', 'descripcion', 'ubicacion'], 
        });
    }
    
    
}

module.exports = new CategoriasParaUsuarioService();
