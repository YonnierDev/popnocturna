const { Categoria } = require('../models');

class CategoriaService {
    async listarCategorias() {
        try {
            const categorias = await Categoria.findAll();
            console.log("✅ Categorías obtenidas:", categorias);
            return categorias;
        } catch (error) {
            console.error("❌ Error en listarCategorias:", error);
            throw new Error("Error al obtener las categorías");
        }
    }

    async crearCategoria(tipo) {
        try {
            const nuevaCategoria = await Categoria.create({ tipo });
            console.log("✅ Categoría creada:", nuevaCategoria);
            return nuevaCategoria;
        } catch (error) {
            console.error("❌ Error al crear categoría:", error);
            throw new Error("Error al crear categoría");
        }
    }

    async actualizarCategoria(id, tipo) {
        try {
            const categoria = await Categoria.findOne({ where: { id } });
            if (!categoria) {
                console.warn("⚠️ Categoría no encontrada para actualizar:", id);
                return null;
            }
            await categoria.update({ tipo });
            console.log("✅ Categoría actualizada:", categoria);
            return categoria;
        } catch (error) {
            console.error("❌ Error al actualizar categoría:", error);
            throw new Error("Error al actualizar categoría");
        }
    }

    async eliminarCategoria(id) {
        try {
            const categoria = await Categoria.findOne({ where: { id } });
            if (!categoria) {
                console.warn("⚠️ Categoría no encontrada para eliminar:", id);
                return null;
            }
            await categoria.destroy();
            console.log("✅ Categoría eliminada:", id);
            return categoria;
        } catch (error) {
            console.error("❌ Error al eliminar categoría:", error);
            throw new Error("Error al eliminar categoría");
        }
    }

    async buscarCategoria(id) {
        try {
            const categoria = await Categoria.findByPk(id);
            if (!categoria) {
                console.warn("⚠️ Categoría no encontrada:", id);
                return null;
            }
            console.log("✅ Categoría encontrada:", categoria);
            return categoria;
        } catch (error) {
            console.error("❌ Error al buscar categoría:", error);
            throw new Error("Error al buscar categoría");
        }
    }
}

module.exports = new CategoriaService();
