const cloudinaryService = require('../service/cloudinaryService');
const CategoriaService = require('../service/categoriaService');

class CategoriaController {
    async listarCategorias(req, res) {
        try {
            console.log("🔍 Intentando listar categorías");
            const listaCategorias = await CategoriaService.listarCategorias();
            
            // Formatear la respuesta para el rol 1 (Super Admin)
            const categoriasFormateadas = listaCategorias.map(categoria => ({
                id: categoria.id,
                tipo: categoria.tipo,
                descripcion: categoria.descripcion,
                imagen: categoria.imagen,
                estado: categoria.estado,
                createdAt: categoria.createdAt,
                updatedAt: categoria.updatedAt
            }));

            console.log("✅ Categorías encontradas:", categoriasFormateadas);
            res.json(categoriasFormateadas);
        } catch (e) {
            console.error("❌ Error al listar categorías:", e);
            res.status(500).json({ 
                success: false,
                message: "Error al obtener categorías",
                error: e.message,
                details: e.stack
            });
        }
    }

    async crearCategoria(req, res) {
        try {
            const { tipo, descripcion } = req.body;
            let imagenUrl = null;
    
            // Verifica si se recibió una imagen
            if (req.file) {
                console.log('Subiendo imagen de categoría a Cloudinary...');
                const resultadoSubida = await cloudinaryService.subirImagenCategoria(
                    req.file.buffer, 
                    `categoria-${Date.now()}`
                );
    
                if (!resultadoSubida || !resultadoSubida.secure_url) {
                    console.error('Error en la respuesta de Cloudinary:', resultadoSubida);
                    return res.status(500).json({ 
                        mensaje: "Error al subir la imagen a Cloudinary",
                        error: 'Respuesta inválida de Cloudinary'
                    });
                }
    
                imagenUrl = resultadoSubida.secure_url;
                console.log('Imagen de categoría subida correctamente:', imagenUrl);
            }
    
            // Verificar si ya existe una categoría con el mismo tipo
            const categoriaExistente = await CategoriaService.buscarCategoriaPorTipo(tipo);
            if (categoriaExistente) {
                // Si la categoría existe pero está inactiva, la reactivamos
                if (!categoriaExistente.estado) {
                    const categoriaActualizada = await CategoriaService.actualizarCategoria(categoriaExistente.id, {
                        estado: true,
                        descripcion,
                        imagen: imagenUrl || categoriaExistente.imagen
                    });
                    return res.status(200).json({
                        mensaje: "Categoría reactivada con éxito",
                        categoria: categoriaActualizada
                    });
                }
                // Si ya existe una categoría activa con el mismo tipo, devolvemos un error
                return res.status(400).json({ 
                    mensaje: `Ya existe una categoría con el tipo '${tipo}'.` 
                });
            }

            // Si no existe, creamos una nueva categoría
            const nuevaCategoria = await CategoriaService.crearCategoria(tipo, descripcion, imagenUrl);
            res.status(201).json({
                mensaje: "Categoría creada con éxito",
                categoria: nuevaCategoria,
            });
        } catch (e) {
            console.error('Error en crearCategoria:', e);
            
            // Manejar errores específicos de validación de Sequelize
            if (e.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ 
                    mensaje: `Ya existe una categoría con el tipo '${e.fields?.tipo || 'especificado'}'`,
                    error: 'VALIDATION_ERROR',
                    fields: e.fields
                });
            }
            
            // Manejar otros errores
            res.status(500).json({ 
                mensaje: "Error al crear la categoría", 
                error: process.env.NODE_ENV === 'development' ? e.message : 'Error interno del servidor',
                ...(process.env.NODE_ENV === 'development' && { stack: e.stack })
            });
        }
    }
    
    
    async actualizarCategoria(req, res) {
        try {
            const { id } = req.params;
            const { tipo, descripcion, estado } = req.body;
            let datosActualizar = { tipo, descripcion };
            
            // Obtener la categoría actual para manejar la imagen existente
            const categoriaActual = await CategoriaService.buscarCategoria(id);
            if (!categoriaActual) {
                return res.status(404).json({ mensaje: 'Categoría no encontrada' });
            }

            // Si se envía una nueva imagen
            if (req.file) {
                console.log('Actualizando imagen de categoría...');
                
                // 1. Subir la nueva imagen
                const resultadoSubida = await cloudinaryService.subirImagenCategoria(
                    req.file.buffer,
                    `categoria-${Date.now()}`
                );

                if (!resultadoSubida || !resultadoSubida.secure_url) {
                    console.error('Error al subir la nueva imagen a Cloudinary');
                    return res.status(500).json({ 
                        mensaje: 'Error al subir la nueva imagen a Cloudinary' 
                    });
                }

                // 2. Eliminar la imagen anterior si existe
                if (categoriaActual.imagen) {
                    try {
                        console.log('Eliminando imagen anterior de Cloudinary...');
                        await cloudinaryService.eliminarImagenCategoria(categoriaActual.imagen);
                    } catch (error) {
                        console.error('Error al eliminar la imagen anterior:', error);
                        // Continuamos aunque falle la eliminación de la imagen anterior
                    }
                }

                // 3. Actualizar la URL de la imagen
                datosActualizar.imagen = resultadoSubida.secure_url;
                console.log('Imagen de categoría actualizada correctamente');
            }

            // Actualizar el estado si se proporciona
            if (estado !== undefined) {
                datosActualizar.estado = estado === 'true' || estado === true;
            }

            // Actualizar la categoría
            const categoriaActualizada = await CategoriaService.actualizarCategoria(id, datosActualizar);
            
            res.status(200).json({
                mensaje: 'Categoría actualizada correctamente',
                categoria: categoriaActualizada
            });

        } catch (error) {
            console.error('Error al actualizar la categoría:', error);
            res.status(500).json({ 
                mensaje: 'Error al actualizar la categoría',
                error: error.message 
            });
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
