const { Usuario, Evento, Lugar, Reserva, sequelize } = require("../models");
const { Op } = require('sequelize');
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

      if (rolid === 1 || rolid === 2) {
        rolNombre = rolid === 1 ? "Super Administrador" : "Administrador";
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
              fecha_hora: reservaJson.evento?.fecha_hora,
              portada: reservaJson.evento?.portada || [] // Asegurar que siempre sea un array
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
      const { eventoid, cantidad_entradas = 1 } = req.body;
      const aprobacion = "Pendiente";
      const estado = true;

      // Validar cantidad de entradas
      if (!cantidad_entradas || cantidad_entradas < 1) {
        return res.status(400).json({ 
          success: false,
          mensaje: "La cantidad de entradas debe ser al menos 1" 
        });
      }

      // Verificar si el usuario existe
      const usuarioExistente = await ReservaService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ 
          success: false,
          mensaje: "El usuario no existe" 
        });
      }

      // Verificar evento, capacidad y permisos
      try {
        const { tienePermiso, mensaje, capacidadDisponible } = await ReservaService.verificarDisponibilidad(
          eventoid, 
          cantidad_entradas,
          usuarioid
        );

        if (!tienePermiso) {
          return res.status(403).json({ 
            success: false,
            mensaje: mensaje || "No tienes permiso para realizar esta acción" 
          });
        }

        if (capacidadDisponible < cantidad_entradas) {
          return res.status(400).json({
            success: false,
            mensaje: `No hay suficiente capacidad disponible. Quedan ${capacidadDisponible} entradas.`,
            capacidadDisponible
          });
        }
      } catch (error) {
        return res.status(400).json({ 
          success: false,
          mensaje: error.message 
        });
      }

      try {
        // Crear la reserva
        const nuevaReserva = await ReservaService.crearReserva(
          usuarioid,
          eventoid,
          aprobacion,
          estado,
          cantidad_entradas
        );

        // Obtener información actualizada del evento para la respuesta
        const eventoActualizado = await ReservaService.obtenerEventoConCapacidad(eventoid);
        
        // Construir la respuesta con los datos formateados
        const respuesta = {
          success: true,
          mensaje: "Reserva creada exitosamente",
          data: {
            id: nuevaReserva.id,
            numero_reserva: nuevaReserva.numero_reserva,
            fecha_hora: nuevaReserva.fecha_hora,
            aprobacion: nuevaReserva.aprobacion,
            estado: nuevaReserva.estado,
            cantidad_entradas: nuevaReserva.cantidad_entradas,
            evento: {
              id: nuevaReserva.evento?.id,
              nombre: nuevaReserva.evento?.nombre,
              fecha_hora: nuevaReserva.evento?.fecha_hora,
              lugar: nuevaReserva.evento?.lugar
            }
          },
          capacidadActual: eventoActualizado.capacidad - (eventoActualizado.entradasReservadas || 0),
          capacidadTotal: eventoActualizado.capacidad
        };
        
        return res.status(201).json(respuesta);
      } catch (error) {
        console.error("Error al crear reserva:", error);
        if (error.message.includes("Ya tienes reserva")) {
          return res.status(400).json({
            success: false,
            mensaje: error.message // Este mensaje ya está formateado en el servicio
          });
        }
        throw error; // Re-lanzar otros errores para que los maneje el catch externo
      }
    } catch (error) {
      console.error("Error en crearReserva:", error);
      res.status(500).json({ 
        success: false,
        mensaje: "Error en el servicio", 
        error: error.message 
      });
    }
  }

  async actualizarReserva(req, res) {
    try {
      const { id } = req.params;
      const { eventoid, fecha_hora, aprobacion, estado, cantidad_entradas } = req.body;
      const { id: usuarioId, rol: rolUsuario, rolid } = req.usuario;
      
      // Asegurarse de que tengamos el rol del usuario
      const rol = rolUsuario || rolid;
      
      console.log('Datos del usuario:', { usuarioId, rol, rolUsuario, rolid });

      // Validar que se proporcione al menos un campo para actualizar
      if (!eventoid && !fecha_hora && aprobacion === undefined && 
          estado === undefined && cantidad_entradas === undefined) {
        return res.status(400).json({
          success: false,
          mensaje: "Debe proporcionar al menos un campo para actualizar"
        });
      }

      console.log('Buscando reserva con ID:', id, 'para usuario ID:', usuarioId);
      
      // Obtener la reserva existente con información del evento
      const reservaExistente = await Reserva.findByPk(id, {
        include: [
          {
            model: Evento,
            as: 'evento',
            include: [{ 
              model: Lugar, 
              as: 'lugar',
              attributes: ['id', 'nombre', 'usuarioid']
            }],
            attributes: ['id', 'nombre', 'lugarid', 'fecha_hora', 'capacidad']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'correo']
          }
        ]
      });

      // Si no existe la reserva, retornar error
      if (!reservaExistente) {
        console.log('Reserva no encontrada con ID:', id);
        return res.status(404).json({ 
          success: false,
          mensaje: "La reserva no existe" 
        });
      }
      
      console.log('Reserva encontrada:', {
        id: reservaExistente.id,
        usuarioid: reservaExistente.usuarioid,
        usuarioActual: usuarioId,
        esDueno: reservaExistente.usuarioid === usuarioId,
        rolUsuario: rol
      });

      // Verificar permisos según el rol
      let tienePermiso = false;
      let mensajeError = "No tienes permiso para realizar esta acción";
      
      // Verificar si el usuario es el dueño de la reserva
      const esDuenoReserva = reservaExistente.usuarioid === usuarioId;
      console.log('Es dueño de la reserva:', esDuenoReserva, {
        idReserva: reservaExistente.id,
        usuarioReserva: reservaExistente.usuarioid,
        usuarioActual: usuarioId
      });
      
      // Verificar si el usuario es propietario del lugar del evento
      const esPropietarioLugar = rol === 3 && 
                              reservaExistente.evento?.lugar?.usuarioid === usuarioId;

      // Validaciones por rol
      switch(rol) {
        case 1: // Super Admin - Puede hacer cualquier cosa
          tienePermiso = true;
          break;
          
        case 2: // Admin - Puede cambiar estado (activo/inactivo)
          if (estado !== undefined) {
            tienePermiso = true;
          } else if (aprobacion !== undefined) {
            mensajeError = "Los administradores no pueden aprobar/rechazar reservas";
          } else if (esDuenoReserva) {
            // Si es el dueño, puede actualizar sus propios datos
            tienePermiso = true;
          }
          break;
          
        case 3: // Propietario - Solo puede aprobar/rechazar reservas de su lugar
          if (aprobacion !== undefined && 
              (aprobacion === 'Aprobado' || aprobacion === 'Rechazado')) {
            tienePermiso = esPropietarioLugar;
            mensajeError = "Solo puedes aprobar/rechazar reservas de tu lugar";
          } else if (esDuenoReserva) {
            // Si es el dueño, puede actualizar sus propios datos
            tienePermiso = true;
          }
          break;
          
        case 4: // Usuario - Solo puede actualizar sus propias reservas (evento y fecha)
          if (esDuenoReserva) {
            // Validar que solo intente actualizar eventoid o fecha_hora
            const camposPermitidos = ['eventoid', 'fecha_hora'];
            const camposSolicitados = Object.keys(req.body).filter(key => req.body[key] !== undefined);
            const camposNoPermitidos = camposSolicitados.filter(campo => !camposPermitidos.includes(campo));
            
            if (camposNoPermitidos.length > 0) {
              return res.status(403).json({
                success: false,
                mensaje: `Solo puedes actualizar los siguientes campos: ${camposPermitidos.join(', ')}`
              });
            }
            
            // Si no hay campos para actualizar, retornar error
            if (camposSolicitados.length === 0) {
              return res.status(400).json({
                success: false,
                mensaje: `Debes proporcionar al menos uno de los siguientes campos: ${camposPermitidos.join(', ')}`
              });
            }
            
            tienePermiso = true;
          } else {
            mensajeError = "Solo puedes actualizar tus propias reservas";
          }
          break;
      }

      if (!tienePermiso) {
        return res.status(403).json({ success: false, mensaje: mensajeError });
      }

      // Validar disponibilidad si se está cambiando el evento o la cantidad de entradas
      if ((eventoid && eventoid !== reservaExistente.eventoid) || 
          (cantidad_entradas !== undefined && cantidad_entradas !== reservaExistente.cantidad_entradas)) {
            
        const eventoId = eventoid || reservaExistente.eventoid;
        const cantidad = cantidad_entradas || reservaExistente.cantidad_entradas;
        
        const { tienePermiso: permisoDisponibilidad, 
                mensaje: mensajeDisponibilidad, 
                capacidadDisponible } = await ReservaService.verificarDisponibilidad(
          eventoId, 
          cantidad,
          usuarioId
        );

        if (!permisoDisponibilidad) {
          return res.status(403).json({ 
            success: false,
            mensaje: mensajeDisponibilidad || "No hay disponibilidad para la cantidad solicitada"
          });
        }

        // Ajustar la capacidad disponible sumando las entradas de la reserva actual
        const capacidadTotalDisponible = capacidadDisponible + 
          (eventoid === reservaExistente.eventoid ? reservaExistente.cantidad_entradas : 0);
        
        if (cantidad > capacidadTotalDisponible) {
          return res.status(400).json({
            success: false,
            mensaje: `No hay suficiente capacidad disponible. Quedan ${capacidadDisponible} entradas.`,
            capacidadDisponible
          });
        }
      }

      // Preparar datos para actualizar
      const datosActualizar = {};
      
      // Solo incluir los campos que se van a actualizar
      if (eventoid !== undefined) datosActualizar.eventoid = eventoid;
      if (fecha_hora !== undefined) datosActualizar.fecha_hora = fecha_hora;
      if (aprobacion !== undefined) datosActualizar.aprobacion = aprobacion;
      if (estado !== undefined) datosActualizar.estado = estado;
      if (cantidad_entradas !== undefined) {
        if (cantidad_entradas < 1) {
          return res.status(400).json({
            success: false,
            mensaje: "La cantidad de entradas debe ser al menos 1"
          });
        }
        datosActualizar.cantidad_entradas = cantidad_entradas;
      }

      // Actualizar la reserva
      const reservaActualizada = await ReservaService.actualizarReserva(id, datosActualizar);
      
      // Obtener información actualizada del evento para la respuesta
      const eventoIdActual = eventoid || reservaExistente.eventoid;
      const eventoActualizado = await ReservaService.obtenerEventoConCapacidad(eventoIdActual);

      res.json({
        success: true,
        mensaje: "Reserva actualizada correctamente",
        data: reservaActualizada,
        capacidadActual: eventoActualizado.capacidadDisponible,
        capacidadTotal: eventoActualizado.capacidad
      });
    } catch (error) {
      console.error("Error en la actualización de reserva:", error);
      res.status(500).json({ 
        success: false,
        mensaje: "Error al actualizar la reserva",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
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
      let { numero_reserva } = req.params;
      console.log('Buscando reserva con número (original):', numero_reserva);
  
      // Verificar que el número de reserva no esté vacío
      if (!numero_reserva || typeof numero_reserva !== 'string') {
        return res.status(400).json({ 
          success: false,
          mensaje: "Número de reserva no proporcionado o inválido" 
        });
      }

      // Normalizar el número de reserva
      let numeroReal = numero_reserva.trim().toUpperCase();
      console.log('Número de reserva normalizado:', numeroReal);
  
      // Buscar la reserva
      const reserva = await ReservaService.buscarReservaPorNumero(numeroReal);
  
      // Verificar si la reserva existe
      if (!reserva) {
        return res.status(404).json({ 
          success: false,
          mensaje: `No se encontró ninguna reserva con el número: ${numeroReal}` 
        });
      }

      // Verificar que los datos necesarios estén presentes
      if (!reserva.usuario || !reserva.evento) {
        console.error('Datos incompletos en la reserva encontrada:', JSON.stringify(reserva, null, 2));
        return res.status(500).json({
          success: false,
          mensaje: 'Datos de la reserva incompletos',
          error: process.env.NODE_ENV === 'development' ? 'Los datos de la reserva están incompletos' : undefined
        });
      }

      // Verificar permisos
      const { id: usuarioId, rol } = req.usuario;
      const esDuenoReserva = reserva.usuarioid === usuarioId;
      const esAdmin = [1, 2].includes(rol);
      const esPropietarioLugar = rol === 3 && reserva.evento?.lugar?.usuarioid === usuarioId;

      if (!esDuenoReserva && !esAdmin && !esPropietarioLugar) {
        return res.status(403).json({
          success: false,
          mensaje: "No tienes permiso para ver esta reserva"
        });
      }

      try {
        // Construir la respuesta de manera segura
        const respuesta = {
          success: true,
          data: {
            id: reserva.id,
            numero_reserva: reserva.numero_reserva,
            aprobacion: reserva.aprobacion,
            estado: reserva.estado,
            fecha_hora: reserva.fecha_hora,
            cantidad_entradas: reserva.cantidad_entradas,
            usuario: {
              id: reserva.usuario?.id,
              nombre: reserva.usuario?.nombre || 'Usuario no disponible',
              correo: reserva.usuario?.correo
            },
            evento: {
              id: reserva.evento?.id,
              nombre: reserva.evento?.nombre || 'Evento sin nombre',
              fecha_hora: reserva.evento?.fecha_hora,
              lugar: reserva.evento?.lugar ? {
                id: reserva.evento.lugar.id,
                nombre: reserva.evento.lugar.nombre
              } : null
            }
          }
        };
        
        return res.json(respuesta);
        
      } catch (construccionError) {
        console.error('Error al construir la respuesta:', construccionError);
        return res.status(500).json({
          success: false,
          mensaje: 'Error al procesar los datos de la reserva',
          error: process.env.NODE_ENV === 'development' ? construccionError.message : undefined
        });
      }
      
    } catch (error) {
      console.error("Error al buscar la reserva por número:", error);
      res.status(500).json({ 
        success: false,
        mensaje: "Error al procesar la solicitud",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  }

// ...
  async aprobarReserva(req, res) {
    try {
      console.log('=== Inicio de aprobación de reserva ===');
      console.log('Params:', req.params);
      console.log('Body recibido:', req.body);
      
      const { numero_reserva } = req.params;
      
      // Obtener aprobación sin importar mayúsculas/minúsculas
      const aprobacion = req.body.aprobacion || req.body.Aprobacion;
      
      const { id: usuarioId, rol } = req.usuario || {};
      
      console.log('Aprobación procesada:', aprobacion);
      
      // Validar datos básicos
      if (!numero_reserva) {
        return res.status(400).json({ 
          success: false,
          mensaje: 'El número de reserva es requerido' 
        });
      }

      if (!aprobacion || typeof aprobacion !== 'string') {
        return res.status(400).json({ 
          success: false,
          mensaje: 'El estado de aprobación es requerido' 
        });
      }

      // Validar valor de aprobación
      const aprobacionNormalizada = aprobacion.toLowerCase();
      if (!['aceptado', 'rechazado', 'pendiente'].includes(aprobacionNormalizada)) {
        return res.status(400).json({ 
          success: false,
          mensaje: 'Valor de aprobación inválido. Debe ser: aceptado, rechazado o pendiente' 
        });
      }

      // Usar el servicio para actualizar la aprobación
      const resultado = await ReservaService.actualizarAprobacionReserva(
        numero_reserva,
        aprobacionNormalizada,
        usuarioId,
        rol
      );

      // Manejar respuesta del servicio
      if (!resultado.success) {
        return res.status(resultado.status || 400).json({
          success: false,
          mensaje: resultado.mensaje,
          error: resultado.error
        });
      }

      console.log('Respuesta exitosa');
      return res.json({
        success: true,
        mensaje: resultado.mensaje,
        data: resultado.data
      });
      
    } catch (error) {
      console.error('Error en aprobarReserva:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener información detallada de una reserva
  async obtenerReservaDetallada(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          mensaje: 'Se requiere el ID de la reserva' 
        });
      }

      const resultado = await ReservaService.obtenerReservaDetallada(id);
      
      if (!resultado.success) {
        return res.status(resultado.status || 500).json({
          success: false,
          mensaje: resultado.mensaje,
          error: resultado.error
        });
      }

      // Formatear la respuesta para incluir solo los datos necesarios
      const reserva = resultado.data.get({ plain: true });
      
      const respuesta = {
        id: reserva.id,
        numero_reserva: reserva.numero_reserva,
        fecha_hora: reserva.fecha_hora,
        aprobacion: reserva.aprobacion,
        estado: reserva.estado,
        cantidad_entradas: reserva.cantidad_entradas,
        fecha_creacion: reserva.createdAt,
        evento: {
          nombre: reserva.evento?.nombre,
          fecha_hora: reserva.evento?.fecha_hora,
          lugar: {
            nombre: reserva.evento?.lugar?.nombre || 'Sin lugar asignado'
          }
        },
        usuario: {
          nombre: reserva.usuario?.nombre || 'Usuario desconocido'
        }
      };

      res.status(200).json({
        success: true,
        data: respuesta
      });

    } catch (error) {
      console.error('Error en obtenerReservaDetallada (controller):', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error al obtener la información de la reserva',
        error: error.message
      });
    }
  }

  /**
   * Obtiene las reservas pendientes del usuario autenticado
   */
  async obtenerReservasPendientesUsuario(req, res) {
    try {
      const { id: usuarioid } = req.usuario;
      
      // Validar que el usuario existe
      const usuario = await Usuario.findByPk(usuarioid);
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado',
        });
      }

      const reservas = await ReservaService.obtenerReservasPendientesPorUsuario(usuarioid);
      
      return res.json({
        ok: true,
        total: reservas.length,
        reservas,
      });
    } catch (error) {
      console.error('Error en obtenerReservasPendientesUsuario:', error);
      return res.status(500).json({
        ok: false,
        msg: 'Error al obtener las reservas pendientes',
        error: error.message,
      });
    }
  }
}

module.exports = new ReservaController();
