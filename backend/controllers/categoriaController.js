const CategoriaService = require('../service/categoriaService');

class CategoriaController {
    async listarCategorias(req, res) {
        try {
            const listaCategorias = await CategoriaService.listarCategorias();
            res.json(listaCategorias);
        } catch (e) {
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async crearCategoria(req, res) {
        try {
            const { tipo } = req.body;
            const respuesta = await CategoriaService.crearCategoria(tipo);
            res.status(201).json(respuesta);
        } catch (e) {
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async actualizarCategoria(req, res) {
        try {
            const { tipo } = req.body;
            const { id } = req.params;
            const resp = await CategoriaService.actualizarCategoria(id, tipo);
            const buscarC = await CategoriaService.buscarCategoria(id);
                res.json({ mensaje: "Categoria actualizada", categoriaActualizado: buscarC });
        } catch (e) {
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async eliminarCategoria(req, res) {
        try {
            const { id } = req.params;
            const resultado = await CategoriaService.eliminarCategoria(id);
            if (!resultado) {
                return res.status(404).json({ mensaje: "Categoría no encontrada" });
            }
            res.json({ mensaje: "Categoría eliminada" });
        } catch (e) {
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async buscarCategoria(req, res) {
        try {
            const { id } = req.params;
            const categoria = await CategoriaService.buscarCategoria(id);
            if (!categoria) {
                return res.status(404).json({ mensaje: "Categoría no encontrada" });
            }
            res.json(categoria);
        } catch (e) {
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async actualizarEstado(req, res) {
        try {
          const { id } = req.params;
          const { estado } = req.body;
          await CategoriaService.actualizarEstado(id, estado);
          res.json({ mensaje: "Estado actualizado correctamente" });
        } catch (error) {
          res.status(500).json({ mensaje: "Error al actualizar estado", error });
        }
    }

}

module.exports = new CategoriaController();
