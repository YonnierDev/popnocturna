const { Comentario, Usuario } = require('../models');

class ComentarioService {
    async listarComentarios() {
        return await Comentario.findAll({
            
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ["id", "contenido", "fecha_hora"],
                },
            ],

        });
    }

    async listarRelacionesComentarios() {
        return await Comentario.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ["id", "nombre", "correo"],
                },
            ],
        });
    }

    async crearComentario(usuarioid, contenido, fecha_hora, estado) {  
        return await Comentario.create({ usuarioid, contenido, fecha_hora, estado });
    }
    

    async actualizarComentario(id, usuarioid, contenido, fecha_hora, estado) {
        return await Comentario.update({usuarioid, contenido, fecha_hora, estado}, { where: { id } });
    }

    async eliminarComentario(id) {
        return await Comentario.destroy({ where: { id } });
    }

    async buscarComentario(id) {
        return await Comentario.findOne({ where: { id } });
    }

    async verificarUsuario(usuarioid) {
        return await Usuario.findByPk(usuarioid);
    }
}

module.exports = new ComentarioService();
