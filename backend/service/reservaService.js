// service/reservaService.js
const { Reserva, Usuario, Lugar } = require('../models');

class ReservaService {
    async listarReservas() {
        return await Reserva.findAll();
    }

    async buscarReserva(id) {
        return await Reserva.findByPk(id);
    }

    async crearReserva(datos) {
        return await Reserva.create(datos);
    }

    async actualizarReserva(id, datos) {
        await Reserva.update(datos, { where: { id } });
        return await this.buscarReserva(id);
    }

    async eliminarReserva(id) {
        return await Reserva.destroy({ where: { id } });
    }
    
    async verificarUsuario(usuarioId) {
        return await Usuario.findByPk(usuarioId);
    }
    
    async verificarLugar(lugarId) {
        return await Lugar.findByPk(lugarId);
    }
}

module.exports = new ReservaService();