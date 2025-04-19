const cloudinaryService = require('../service/cloudinaryService');
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
            const { tipo, descripcion } = req.body;
            let imagenUrl = null;
    
            // Verifica si se recibió una imagen
            if (req.file) {
                const actualizacionRespuesta = await cloudinaryService.subirImagen(
                    req.file.buffer, 
                    `categoria-${Date.now()}`
                );
    
                if (!actualizacionRespuesta) {
                    return res.status(500).json({ mensaje: "Error al subir la imagen a Cloudinary" });
                }
    
                imagenUrl = actualizacionRespuesta.secure_url; // Obtiene la URL de la imagen subida
            }
    
            const nuevaCategoria = await CategoriaService.crearCategoria(tipo, descripcion, imagenUrl);
            res.status(201).json({
                mensaje: "Categoría creada con éxito",
                categoria: nuevaCategoria,
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ mensaje: "Error al crear la categoría", error: e.message });
        }
    }
    
    
    async actualizarCategoria(req, res) {
        try {
            const { id } = req.params; 
            const { tipo, descripcion, estado } = req.body; 
            let imagenUrl = null;
    
            if (req.file) {
                const actualizacionRespuesta = await cloudinaryService.subirImagen(req.file.buffer, `categoria-${Date.now()}`);
                if (!actualizacionRespuesta) {
                    return res.status(500).json({ mensaje: "Error al subir la imagen a Cloudinary" });
                }
                imagenUrl = actualizacionRespuesta.secure_url;
            }
            

            const categoriaData = {
                tipo,
                descripcion,
                estado: estado === 'true' || estado === true,  
                imagen: imagenUrl || undefined,  
            };
            const categoriaActualizada = await CategoriaService.actualizarCategoria(id, categoriaData);
    
            res.status(200).json({
                mensaje: "Categoría actualizada con éxito",
                categoria: categoriaActualizada,
            });
    
        } catch (e) {
            console.error(e);
            res.status(500).json({ mensaje: "Error al actualizar la categoría", error: e.message });
        }
    }
    
    

    async obtenerLugaresPorCategoria(req, res) {
        try {
            const { id } = req.params;
            const lugares = await CategoriaService.obtenerLugaresPorCategoria(id);
            if (lugares.length === 0) {
                return res.status(404).json({ mensaje: "No hay lugares para esta categoría" });
            }
            res.status(200).json(lugares);
        } catch (e) {
            res.status(500).json({ mensaje: "Error al obtener lugares por categoría", error: e.message });
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
