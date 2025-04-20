const { Reserva, Usuario, Evento } = require("../models");
const { v4: uuidv4 } = require("uuid");

class ReservaService {
  async listarReservas() {
    try {
      const reservas = await Reserva.findAll({
        attributes: [
          "id",
          "usuarioid",
          "eventoid",
          "fecha_hora",
          "aprobacion",
          "estado",
          "numero_reserva",
          "createdAt",
          "updatedAt"
        ],
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "correo"],
          },
          {
            model: Evento,
            as: "evento",
            attributes: ["nombre", "fecha_hora"], 
          },
        ],
      });
  
      return reservas;
    } catch (error) {
      console.error("Error al listar reservas:", error);
      throw new Error("Error al obtener las reservas");
    }
  }
  

  async crearReserva(usuarioid, eventoid, fecha_hora, aprobacion, estado) {

    const ultimoNumeroReserva = await Reserva.max('numero_reserva'); // Obtén el último número de reserva
    const ultimoNumero = ultimoNumeroReserva ? parseInt(ultimoNumeroReserva.split('-')[1]) : 0; // Extrae el número
  
    // Generar el siguiente número de reserva con el formato RES-XXXX
    const nuevoNumeroReserva = `RES-${String(ultimoNumero + 1).padStart(4, '0')}`;
  
    return await Reserva.create({
      usuarioid,
      eventoid,
      fecha_hora,
      aprobacion,
      estado,
      numero_reserva: nuevoNumeroReserva, 
    });
  }
  

  async buscarReserva(id) {
    return await Reserva.findByPk(id);
  }

  async actualizarReserva(id, usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    await Reserva.update({ usuarioid, eventoid, fecha_hora, aprobacion, estado }, { where: { id } });
    return await this.buscarReserva(id);
  }

  async eliminarReserva(id) {
    return await Reserva.destroy({ where: { id } });
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarEvento(eventoid) {
    return await Evento.findByPk(eventoid);
  }

  async actualizarEstado(id, estado) {
    return await Reserva.update({ estado }, { where: { id } });
  }

  async buscarPorId(id) {
    return await Reserva.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"],
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["nombre", "descripcion", "fecha_hora"],
        },
      ],
    });
  }
  

  async listarRelaciones() {
    return await this.listarReservas();
  }

  async buscarReserva(numero_reserva) {
    try {
      console.log("Buscando reserva con numero_reserva:", numero_reserva);
  
      const reserva = await Reserva.findOne({
        where: { numero_reserva }, // Buscar por el campo numero_reserva
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo'], 
          },
          {
            model: Evento,
            as: 'evento',
            attributes: ['descripcion', 'fecha_hora'], 
          },
        ],
      });
  
      if (!reserva) {
        console.log("No se encontró la reserva.");
        return null;
      }
  
      const reservaResponse = {
        id: reserva.id,
        numero_reserva: reserva.numero_reserva,
        usuario: {
          nombre: reserva.usuario.nombre,
          correo: reserva.usuario.correo,
        },
        evento: {
          descripcion: reserva.evento.descripcion,
          fecha_hora: reserva.evento.fecha_hora,
        },
        estado: reserva.estado,
        fecha_hora: reserva.fecha_hora,
      };
    
      return reservaResponse;
    } catch (error) {
      console.error("Error al buscar reserva:", error);
      throw new Error("Error en la búsqueda de reserva: " + error.message); 
    }
  }
  


  async actualizarAprobacionPorNumero(numero_reserva, aprobacion) {
    try {
      const reserva = await Reserva.findOne({ where: { numero_reserva } });
      if (!reserva) return null;
  
      reserva.aprobacion = aprobacion;
      await reserva.save();
  
      const reservaConInfo = await Reserva.findOne({
        where: { numero_reserva },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'correo'],
          },
          {
            model: Evento,
            as: 'evento',
            attributes: ['nombre', 'fecha_hora'],
          },
        ],
      });
  
      return reservaConInfo;
    } catch (error) {
      throw new Error("Error al actualizar la reserva: " + error.message);
    }
  }

}

module.exports = new ReservaService();
