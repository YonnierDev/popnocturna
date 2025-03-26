const { Comentario, Usuario, Evento } = require('../models');

class ComentarioService {
    async listarComentarios() {
        try {
            return await Comentario.findAll({
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['nombre', 'apellido']
                    },
                    {
                        model: Evento,
                        as: 'evento',
                        attributes: ['titulo']
                    }
                ]
            });
        } catch (error) {
            console.error("❌ Error al listar comentarios:", error);
            throw new Error("Error al obtener los comentarios");
        }
    }

    async crearComentario(datos) {
        try {
            // Verificar que existe el evento
            const evento = await Evento.findByPk(datos.id_evento);
            if (!evento) {
                throw new Error("El evento especificado no existe");
            }
            return await Comentario.create(datos);
        } catch (error) {
            console.error("❌ Error al crear comentario:", error);
            throw new Error("Error al crear el comentario");
        }
    }

    async actualizarComentario(id, datos) {
        try {
            const comentario = await Comentario.findByPk(id);
            if (!comentario) return null;
            await comentario.update(datos);
            return comentario;
        } catch (error) {
            console.error("❌ Error al actualizar comentario:", error);
            throw new Error("Error al actualizar el comentario");
        }
    }

    async eliminarComentario(id) {
        try {
            const comentario = await Comentario.findByPk(id);
            if (!comentario) return null;
            await comentario.destroy();
            return true;
        } catch (error) {
            console.error("❌ Error al eliminar comentario:", error);
            throw new Error("Error al eliminar el comentario");
        }
    }

    async buscarComentario(id) {
        try {
            return await Comentario.findByPk(id, {
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nombre', 'apellido']
                }]
            });
        } catch (error) {
            console.error("❌ Error al buscar comentario:", error);
            throw new Error("Error al buscar el comentario");
        }
    }

    async buscarComentariosPorUsuario(id_user) {
        try {
            return await Comentario.findAll({
                where: { id_user },
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nombre', 'apellido']
                }]
            });
        } catch (error) {
            console.error("❌ Error al buscar comentarios del usuario:", error);
            throw new Error("Error al buscar comentarios del usuario");
        }
    }
}

module.exports = new ComentarioService(); 