const CategoriaService = require('../service/categoriaService');

class CategoriaController {
    async listarCategorias(req, res) {
        try {
            const listaCategorias = await CategoriaService.listarCategorias();
            console.log("✅ Enviando categorías al cliente:", listaCategorias);
            res.json(listaCategorias);
        } catch (e) {
            console.error("❌ Error en listarCategorias:", e);
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async crearCategoria(req, res) {
        try {
            const { tipo } = req.body;
            console.log("📌 Datos recibidos en crearCategoria:", tipo);
            const respuesta = await CategoriaService.crearCategoria(tipo);
            res.status(201).json(respuesta);
        } catch (e) {
            console.error("❌ Error en crearCategoria:", e);
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async actualizarCategoria(req, res) {
        try {
            const { tipo } = req.body;
            const { id } = req.params;
            console.log(`📌 Datos recibidos para actualizar: ID=${id}, Tipo=${tipo}`);
            const resp = await CategoriaService.actualizarCategoria(id, tipo);
            if (!resp) {
                return res.status(404).json({ mensaje: "Categoría no encontrada" });
            }
            res.json(resp);
        } catch (e) {
            console.error("❌ Error en actualizarCategoria:", e);
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async eliminarCategoria(req, res) {
        try {
            const { id } = req.params;
            console.log("📌 ID recibido para eliminar:", id);
            const resultado = await CategoriaService.eliminarCategoria(id);
            if (!resultado) {
                return res.status(404).json({ mensaje: "Categoría no encontrada" });
            }
            res.json({ mensaje: "Categoría eliminada" });
        } catch (e) {
            console.error("❌ Error en eliminarCategoria:", e);
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }

    async buscarCategoria(req, res) {
        try {
            const { id } = req.params;
            console.log("📌 Buscando categoría con ID:", id);
            const categoria = await CategoriaService.buscarCategoria(id);
            if (!categoria) {
                return res.status(404).json({ mensaje: "Categoría no encontrada" });
            }
            res.json(categoria);
        } catch (e) {
            console.error("❌ Error en buscarCategoria:", e);
            res.status(500).json({ mensaje: "Error en el servicio", error: e.message });
        }
    }
}

module.exports = new CategoriaController();
