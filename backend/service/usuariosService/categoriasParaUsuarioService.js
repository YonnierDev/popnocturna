const { Categoria, Lugar } = require('../../models');

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

    async lugaresDeCadaCaregoria() {
        try {
            return await Categoria.findAll({
                attributes: ['tipo'],
                include: [
                    {
                        model: Lugar,
                        as: 'lugares',
                        where: { estado: true }, 
                        attributes: ['categoriaid', 'nombre', 'descripcion', 'ubicacion', 'imagen'] 
                    }
                ]
            });
        } catch (error) {
            throw new Error('Error al obtener lugares de cada categoría: ' + error.message);
        }
    }
    
    
}

module.exports = new CategoriasParaUsuarioService();
