const { Reserva, Usuario, Evento, Lugar } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

class ReservaService {

  async listarReservas() {
    return await Reserva.findAll({
      include: [
        { 
          model: Usuario, 
          as: "usuario", 
          attributes: ["nombre", "correo"]
          // Ya no estamos filtrando por estado en Usuario
        },
        { 
          model: Evento, 
          as: "evento", 
          attributes: ["nombre", "fecha_hora"],
          include: [{ 
            model: Lugar, 
            as: "lugar", 
            attributes: ["nombre"]

          }]
        }
      ],
      attributes: ["numero_reserva", "fecha_hora", "aprobacion", "estado"],
    });
  }
  

  
  async listarReservasPorPropietario(usuarioid) {
    try {
      const reservas = await Reserva.findAll({
        include: [
          {
            model: Evento,
            as: "evento",
            attributes: ["nombre", "fecha_hora"],
            include: [
              {
                model: Lugar,
                as: "lugar",
                attributes: ["nombre", "usuarioid"],
                // Aquí está la clave: traer solo los lugares del propietario
                where: { usuarioid }
              }
            ]
          },
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "correo"]
          }
        ],
        attributes: [
          "numero_reserva",
          "fecha_hora",
          "aprobacion",
          "estado"
        ]
      });
  
      return reservas;
    } catch (error) {
      console.error("Error al listar reservas del propietario:", error);
      throw new Error("No se pudieron obtener las reservas");
    }
  }
  

  async listarReservasPorUsuario(usuarioid) {
    return await Reserva.findAll({
      include: [
        {
          model: Evento,
          as: "evento",
          attributes: ["nombre", "fecha_hora"],
          where: { estado: true },
          include: [{
            model: Lugar,
            as: "lugar",
            attributes: ["nombre", "ubicacion"],
            where: { estado: true }
          }]
        }
      ],
      attributes: ["numero_reserva", "fecha_hora", "aprobacion"],
      where: { 
        usuarioid,
        estado: true 
      }
    });
  }
  
  

async verificarUsuario(usuarioid) {
  return await Usuario.findOne({
    where: {
      id: usuarioid,
      estado: true,
    },
  });
}

async verificarEvento(eventoid) {
  return await Evento.findOne({
    where: {
      id: eventoid,
      estado: true,
    },
    include: {
      model: Lugar,
      as: "lugar",
      where: {
        estado: true,
      },
    },
  });
}

async crearReserva(usuarioid, eventoid, fecha_hora, aprobacion, estado) {
  const ultimoNumeroReserva = await Reserva.max("numero_reserva");

  const ultimoNumero = ultimoNumeroReserva
    ? parseInt(ultimoNumeroReserva.split("-")[1])
    : 0;

  const nuevoNumeroReserva = `RES-${String(ultimoNumero + 1).padStart(4, "0")}`;

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
    const evento = await Evento.findOne({
      where: { id: eventoid, estado: true },
      include: {
        model: Lugar,
        as: "lugar",
        attributes: ["id", "nombre", "usuarioid", "estado"],
        where: { estado: true },
      },
    });
  
    return evento;
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

  async buscarReservaPorId(id) {
    return await Reserva.findByPk(id, {
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
  }
  
  async buscarReservaPorNumero(numero_reserva) {
    return await Reserva.findOne({
      where: { numero_reserva },
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
