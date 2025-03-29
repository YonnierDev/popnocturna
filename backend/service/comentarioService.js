const { Comentario, Usuario } = require('../models');

class ComentarioService {
    async listarComentarios() {
        return await Comentario.findAll();
    }

    async crearComentario(usuarioid, contenido, fecha_hora) {  
        return await Comentario.create({ usuarioid, contenido, fecha_hora });
    }
    

    async actualizarComentario(id, usuarioid, contenido, fecha_hora) {
        return await Comentario.update({usuarioid, contenido, fecha_hora}, { where: { id } });
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
