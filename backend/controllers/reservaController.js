const ReservaService = require("../service/reservaService");

class ReservaController {
  async listarReservas(req, res) {
    try {
      const { rol: rolid, id: usuarioid } = req.usuario;
      const { page = 1, limit = 10, estado, fechaDesde, fechaHasta } = req.query;

      const opciones = {
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        estado,
        fechaDesde,
        fechaHasta,
      };

      let resultado;
      let rolNombre;

      if (rolid === 1) {
        rolNombre = "Super Administrador";
        resultado = await ReservaService.listarReservas(opciones);
      } else if (rolid === 2) {
        rolNombre = "Administrador";
        resultado = await ReservaService.listarReservas(opciones);
      } else if (rolid === 3) {
        rolNombre = "Propietario";
        resultado = await ReservaService.listarReservasPorPropietario(usuarioid, opciones);
        // Mejorar la respuesta para propietarios incluyendo información detallada
        resultado.rows = resultado.rows.map(reserva => {
          const reservaJson = reserva.get({ plain: true });
          return {
            id: reservaJson.id,
            numero_reserva: reservaJson.numero_reserva,
            fecha_hora: reservaJson.fecha_hora,
            aprobacion: reservaJson.aprobacion,
            estado: reservaJson.estado,
            evento: {
              id: reservaJson.evento?.id,
              nombre: reservaJson.evento?.nombre,
              fecha_hora: reservaJson.evento?.fecha_hora,
              lugar: {
                id: reservaJson.evento?.lugar?.id,
                nombre: reservaJson.evento?.lugar?.nombre,
                direccion: reservaJson.evento?.lugar?.direccion
              }
            },
            usuario: {
              id: reservaJson.usuario?.id,
              nombre: reservaJson.usuario?.nombre,
              correo: reservaJson.usuario?.correo,
              telefono: reservaJson.usuario?.telefono
            }
          };
        });
      } else if (rolid === 4) {
        rolNombre = "Usuario";
        resultado = await ReservaService.listarReservasPorUsuario(usuarioid, opciones);
        // Formatear la respuesta para usuarios
        resultado.rows = resultado.rows.map(reserva => {
          const reservaJson = reserva.get({ plain: true });
          return {
            id: reservaJson.id,
            numero_reserva: reservaJson.numero_reserva,
            fecha_hora: reservaJson.fecha_hora,
            aprobacion: reservaJson.aprobacion,
            estado: reservaJson.estado,
            evento: {
              id: reservaJson.evento?.id,
              nombre: reservaJson.evento?.nombre,
              fecha_hora: reservaJson.evento?.fecha_hora
            }
          };
        });
      } else {
        return res.status(403).json({ mensaje: "No tienes permiso para ver reservas" });
      }

      // Formatear la respuesta para admin y super admin
      if (rolid === 1 || rolid === 2) {
        resultado.rows = resultado.rows.map(reserva => {
          const reservaJson = reserva.get({ plain: true });
          return {
            id: reservaJson.id,
            numero_reserva: reservaJson.numero_reserva,
            fecha_hora: reservaJson.fecha_hora,
            aprobacion: reservaJson.aprobacion,
            estado: reservaJson.estado,
            evento: {
              id: reservaJson.evento?.id,
              nombre: reservaJson.evento?.nombre,
              fecha_hora: reservaJson.evento?.fecha_hora
            },
            usuario: {
              id: reservaJson.usuario?.id,
              nombre: reservaJson.usuario?.nombre,
              correo: reservaJson.usuario?.correo
            }
          };
        });
      }

      res.json({ 
        mensaje: `Reservas obtenidas correctamente por ${rolNombre}`,
        datos: resultado.rows,
        metadata: {
          total: resultado.count,
          pagina: parseInt(page),
          limite: parseInt(limit),
          totalPaginas: Math.ceil(resultado.count / parseInt(limit)),
          rol: rolNombre
        }
      });
    } catch (error) {
      console.error("Error al listar reservas:", error);
      res.status(500).json({ 
        mensaje: "Error en el servicio",
        error: error.message 
      });
    }
  }
  
  
  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      await ReservaService.actualizarEstado(id, estado);
      res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar estado", error });
    }
  }

  async crearReserva(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const { eventoid, fecha_hora } = req.body;
      const aprobacion = "Pendiente";
      const estado = true;

      const usuarioExistente = await ReservaService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      const eventoExistente = await ReservaService.verificarEvento(eventoid);
      if (!eventoExistente) {
        return res
          .status(400)
          .json({ mensaje: "El evento no existe o está inactivo" });
      }

      const nuevaReserva = await ReservaService.crearReserva(
        usuarioid,
        eventoid,
        fecha_hora,
        aprobacion,
        estado
      );

      res.status(201).json(nuevaReserva);
    } catch (error) {
      console.error("Error en crearReserva:", error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async actualizarReserva(req, res) {
    try {
      const { id } = req.params;
      const { usuarioid, eventoid, fecha_hora, aprobacion, estado } = req.body;

      // Verificar si el usuario y el evento existen
      const usuarioExistente = await ReservaService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      const eventoExistente = await ReservaService.verificarEvento(eventoid);
      if (!eventoExistente) {
        return res.status(400).json({ mensaje: "El evento no existe" });
      }

      // Verificar si la reserva existe
      const reservaExistente = await ReservaService.buscarReserva(id);
      console.log("Reserva existente:", reservaExistente); // Log de la reserva existente
      if (!reservaExistente) {
        return res.status(400).json({ mensaje: "La reserva no existe" });
      }

      // Si no se proporciona estado, mantener el estado actual
      const estadoActual =
        estado !== undefined ? estado : reservaExistente.estado;

      const reservaActualizada = await ReservaService.actualizarReserva(
        id,
        usuarioid,
        eventoid,
        fecha_hora,
        aprobacion,
        estadoActual
      );

      res.json({
        mensaje: "Reserva actualizada correctamente",
        reservaActualizada,
      });
    } catch (error) {
      console.error("Error en la actualización:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar reserva", error: error.message });
    }
  }

  async listarRelaciones(req, res) {
    try {
      const reservas = await ReservaService.listarRelaciones();
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al listar reservas", error });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const actualizados = await ReservaService.actualizarEstado(id, estado);
      if (actualizados[0] === 0) {
        const existe = await ReservaService.buscarPorId(id);
        if (!existe) {
          return res.status(404).json({ mensaje: "Reserva no encontrada" });
        }
        return res
          .status(200)
          .json({ mensaje: "El estado ya estaba igual", reserva: existe });
      }
      const reserva = await ReservaService.buscarPorId(id);
      res.json({ mensaje: "Estado actualizado", reserva });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar estado", error });
    }
  }

  async eliminarReserva(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaService.buscarReservaPorId(id);
      if (!reserva) {
        return res.status(404).json({ mensaje: "Reserva no encontrada" });
      }
      await ReservaService.eliminarReserva(id);
      res.json({ mensaje: "Reserva eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async buscarReserva(req, res) {
    try {
      const { id } = req.params;

      const reserva = await ReservaService.buscarReservaPorId(id);

      if (!reserva) {
        return res.status(404).json({ mensaje: "Reserva no encontrada" });
      }

      const reservaResponse = {
        id: reserva.id,
        numero_reserva: reserva.numero_reserva,
        estado: reserva.estado,
        fecha_hora: reserva.fecha_hora,
        usuario: {
          nombre: reserva.usuario.nombre,
          correo: reserva.usuario.correo,
        },
        evento: {
          descripcion: reserva.evento.descripcion,
          fecha_hora: reserva.evento.fecha_hora,
        },
      };

      res.json(reservaResponse);
    } catch (error) {
      console.error("Error al buscar la reserva:", error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async buscarReservaPorNumero(req, res) {
    try {
      const { numero_reserva } = req.params;
  
      const reserva = await ReservaService.buscarReservaPorNumero(numero_reserva);
  
      if (!reserva) {
        return res.status(404).json({ mensaje: "Reserva no encontrada" });
      }
  
      const reservaResponse = {
        numero_reserva: reserva.numero_reserva,
        aprobacion: reserva.aprobacion,
        estado: reserva.estado,
        fecha_hora: reserva.fecha_hora,
        usuario: {
          nombre: reserva.usuario.nombre,
          correo: reserva.usuario.correo,
        },
        evento: {
          nombre: reserva.evento.nombre,
          fecha_hora: reserva.evento.fecha_hora,
        },
      };
  
      console.log(reserva.evento);

      res.json(reservaResponse);
    } catch (error) {
      console.error("Error al buscar la reserva por número:", error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }
  

  async aprobarReserva(req, res) {
    try {
      const { numero_reserva } = req.params;
      const { aprobacion } = req.body;

      if (
        !["aceptado", "rechazado", "pendiente"].includes(
          aprobacion.toLowerCase()
        )
      ) {
        return res.status(400).json({ error: "Valor de aprobación inválido." });
      }

      const reserva = await ReservaService.actualizarAprobacionPorNumero(
        numero_reserva,
        aprobacion
      );

      if (!reserva) {
        return res.status(404).json({ error: "Reserva no encontrada." });
      }

      // Ocultamos el id si quieres
      const { id, ...reservaSinId } = reserva.toJSON();

      res.json({
        mensaje: "Reserva actualizada correctamente",
        reserva: reservaSinId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReservaController();
