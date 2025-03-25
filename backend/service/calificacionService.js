const { Calificacion } = require('../models');

class CalificacionService {
    async listarCalificaciones() {
        return await Calificacion.findAll();
    }

    async crearCalificacion(datos) {
        return await Calificacion.create({ datos });
    }

    async actualizarCalificacion(id, datos) {
        return await Calificacion.update({ datos }, { where: { id } });
    }

    async eliminarCalificacion(id) {
        return await Calificacion.destroy({ where: { id } });
    }

    async buscarCalificacion(id) {
        return await Calificacion.findOne({ where: { id } });
    }

    async verificarUsuario(usuarioid) {
        return await Calificacion.findByPk(usuarioid);
    }

    async verificarEvento(eventoid) {
        return await Calificacion.findByPk(eventoid);
    }
}

module.exports = new CalificacionService();

