const {
  Lugar,
  Usuario,
  Categoria,
  Evento,
  Notificacion,
} = require("../models");
const { Op } = require("sequelize");
const { enviarNotificacion } = require("./fcmFirebase/fcmFirebaseService");

class LugarError extends Error {
  constructor(mensaje, tipo = "VALIDACION") {
    super(mensaje);
    this.name = "LugarError";
    this.tipo = tipo;
  }
}

class LugarService {
  async buscarLugar(id) {
    return await Lugar.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "correo"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "tipo"],
        },
      ],
    });
  }
  async listarLugaresAdmin() {
    return await Lugar.findAll({
      // Eliminamos el where para traer todos los registros sin filtrar
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
        {
          model: Evento,
          as: "eventos",
          attributes: ["nombre", "portada", "fecha_hora", "descripcion"],
        },
      ],
      order: [['createdAt', 'DESC']]  // Ordenamos por fecha de creación descendente
    });
  }

  async listarLugaresPropietario(usuarioid) {
    return await Lugar.findAll({
      where: {
        usuarioid,
        estado: true,
        aprobacion: true,
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
        {
          model: Evento,
          as: "eventos",
          attributes: ["nombre", "portada", "fecha_hora", "descripcion"],
        },
      ],
    });
  }

  async buscarLugarAdmin(id) {
    return await Lugar.findOne({
      where: { id },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"],
        },
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
        {
          model: Evento,
          as: "eventos",
          attributes: ["nombre", "portada", "fecha_hora", "descripcion"],
        },
      ],
    });
  }

  async buscarLugarPropietario(id, usuarioid) {
    const lugar = await Lugar.findOne({
      where: {
        id,
        usuarioid,
      },
      include: [
        {
          model: Evento,
          as: "eventos",
          attributes: [
            "id",
            "portada",
            "nombre",
            "fecha_hora",
            "descripcion",
            "precio",
            "capacidad",
          ],
          where: { estado: true }, // Asumiendo que solo quieres eventos activos
          required: false, // Para que devuelva el lugar aunque no tenga eventos
          order: [["fecha_hora", "DESC"]],
        },
      ],
    });

    if (!lugar) {
      throw new Error("Lugar no encontrado o no tienes permiso para verlo");
    }

    if (!lugar.estado) {
      throw new Error("Este lugar está actualmente inactivo");
    }

    if (!lugar.aprobacion) {
      throw new Error("Este lugar está pendiente de aprobación");
    }

    return lugar;
  }

  async buscarLugarUsuario(id) {
    const lugar = await Lugar.findOne({
      where: { id },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre"],
        },
      ],
    });

    if (!lugar) {
      throw new Error("Lugar no encontrado");
    }

    if (!lugar.estado) {
      throw new Error("Este lugar está actualmente inactivo");
    }

    if (!lugar.aprobacion) {
      throw new Error("Este lugar está pendiente de aprobación");
    }

    return lugar;
  }
  /*async crearLugar(dataLugar) {
  try {
    const nuevoLugar = await Lugar.create(dataLugar);
    
    try {
      const usuarios = await Usuario.findAll({
        where: {
          device_token: {
            [Op.ne]: null 
          }
        },
        attributes: ['id', 'device_token', 'nombre'] 
      });

      const resultadosNotificaciones = await Promise.all(
        usuarios.map(usuario => 
          enviarNotificacion({
            token: usuario.device_token,
            titulo: `¡Hola ${usuario.nombre}! Nuevo Lugar Creado`, 
            cuerpo: `Se ha creado un nuevo lugar: "${nuevoLugar.nombre}". ¡Échale un vistazo!`,
          })
          .then(result => ({ success: true, token: usuario.device_token, result }))
          .catch(error => ({ success: false, token: usuario.device_token, error }))
        )
      );

      const exitosas = resultadosNotificaciones.filter(r => r.success);
      const fallidas = resultadosNotificaciones.filter(r => !r.success);

      
      if (fallidas.length > 0) {
        console.error('Errores en notificaciones fallidas:', fallidas);
      }

    } catch (errorNotificacion) {
      console.error('Error en el proceso de notificación:', errorNotificacion);
    }
    
    return nuevoLugar;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errores = error.errors.map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      
      throw {
        mensaje: "Error al crear lugar - Validación fallida",
        error: "Los datos proporcionados violan restricciones de unicidad",
        tipo: "ValidationError",
        detalles: errores,
        status: 400 
      };
    } else {
      throw {
        mensaje: "Error al crear lugar",
        error: error.message,
        tipo: error.name,
        detalles: "Error interno del servidor al procesar la solicitud",
        status: 500 
      };
    }
  }
}*/

  async crearLugar(dataLugar) {
    try {
      const nuevoLugar = await Lugar.create(dataLugar);

      try {
        const usuarios = await Usuario.findAll({
          where: {
            device_token: {
              [Op.ne]: null,
            },
          },
          attributes: ["id", "device_token", "nombre"],
        });

        const resultadosNotificaciones = await Promise.all(
          usuarios.map(async (usuario) => {
            try {
              const result = await enviarNotificacion({
                token: usuario.device_token,
                titulo: `¡Hola ${usuario.nombre}! Nuevo Lugar Creado`,
                cuerpo: `Se ha creado un nuevo lugar: "${nuevoLugar.nombre}". ¡Échale un vistazo!`,
              });

              try {
                const notificacion = await Notificacion.create({
                  remitente_id: parseInt(dataLugar.usuarioid), 
                  receptor_id: usuario.id,
                  titulo: `¡Hola ${usuario.nombre}! Nuevo Lugar`,
                  cuerpo: `Se ha creado un nuevo lugar: "${nuevoLugar.nombre}"`,
                  imagen: nuevoLugar.imagen,
                  tipo: "nuevo_lugar",
                  leida: false,
                });

                console.log("✅ Notificación guardada:", notificacion.toJSON());
              } catch (error) {
                console.error(
                  "❌ Error guardando notificación:",
                  error.message
                );
                if (error.errors) {
                  error.errors.forEach((err) => {
                    console.error(
                      `Campo: ${err.path}, Mensaje: ${err.message}`
                    );
                  });
                }
              }

              return { success: true, token: usuario.device_token, result };
            } catch (error) {
              return { success: false, token: usuario.device_token, error };
            }
          })
        );

        const exitosas = resultadosNotificaciones.filter((r) => r.success);
        const fallidas = resultadosNotificaciones.filter((r) => !r.success);

        if (fallidas.length > 0) {
          console.error("Errores en notificaciones fallidas:", fallidas);
        }
      } catch (errorNotificacion) {
        console.error(
          "Error en el proceso de notificación:",
          errorNotificacion
        );
      }

      return nuevoLugar;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        const errores = error.errors.map((err) => ({
          campo: err.path,
          mensaje: err.message,
        }));

        throw {
          mensaje: "Error al crear lugar - Validación fallida",
          error: "Los datos proporcionados violan restricciones de unicidad",
          tipo: "ValidationError",
          detalles: errores,
          status: 400,
        };
      } else {
        throw {
          mensaje: "Error al crear lugar",
          error: error.message,
          tipo: error.name,
          detalles: "Error interno del servidor al procesar la solicitud",
          status: 500,
        };
      }
    }
  }

  async actualizarLugar(id, dataLugar) {
    console.log("=== Inicio actualizarLugar ===");
    console.log("ID del lugar a actualizar:", id);
    console.log("Datos recibidos:", JSON.stringify(dataLugar, null, 2));

    // Iniciar transacción para asegurar la integridad de los datos
    const transaction = await Lugar.sequelize.transaction();

    try {
      // Asegurarse de que fotos_lugar sea un array
      if (dataLugar.fotos_lugar) {
        try {
          // Si es string, intentar parsear como JSON
          if (typeof dataLugar.fotos_lugar === "string") {
            try {
              dataLugar.fotos_lugar = JSON.parse(dataLugar.fotos_lugar);
            } catch (e) {
              // Si no es JSON válido, convertirlo a array
              dataLugar.fotos_lugar = [dataLugar.fotos_lugar];
            }
          }
          // Asegurarse de que sea un array
          if (!Array.isArray(dataLugar.fotos_lugar)) {
            dataLugar.fotos_lugar = [String(dataLugar.fotos_lugar)];
          }
        } catch (e) {
          console.error("Error al procesar fotos_lugar:", e);
          dataLugar.fotos_lugar = [];
        }
      } else {
        dataLugar.fotos_lugar = [];
      }
      // Obtener el lugar actual dentro de la transacción
      const lugar = await Lugar.findByPk(id, { transaction });
      if (!lugar) {
        console.error("Lugar no encontrado con ID:", id);
        throw new LugarError("Lugar no encontrado", "NO_ENCONTRADO");
      }

      console.log("Lugar actual:", JSON.stringify(lugar.toJSON(), null, 2));

      // Filtrar campos vacíos o nulos para no sobrescribir los existentes
      const camposActualizables = {};
      Object.entries(dataLugar).forEach(([key, value]) => {
        // Solo incluir campos que existen en el modelo
        if (
          key in Lugar.rawAttributes &&
          value !== undefined &&
          value !== null
        ) {
          // Si es un string vacío, lo convertimos a null para campos que lo permitan
          if (value === "" && Lugar.rawAttributes[key].allowNull) {
            camposActualizables[key] = null;
          } else {
            camposActualizables[key] = value;
          }
        }
      });

      console.log(
        "Campos a actualizar después de filtrar:",
        camposActualizables
      );

      // Si no hay campos para actualizar, devolver el lugar actual
      if (Object.keys(camposActualizables).length === 0) {
        console.log("No hay campos para actualizar, devolviendo lugar actual");
        await transaction.rollback();
        return lugar;
      }

      try {
        console.log("Iniciando actualización en la base de datos...");

        // 1. Primero, si se está actualizando el nombre, verificamos si ya existe
        if (camposActualizables.nombre) {
          const lugarExistente = await Lugar.findOne({
            where: {
              nombre: camposActualizables.nombre,
              id: { [Op.ne]: id },
            },
            transaction,
          });

          // Si existe un lugar con el mismo nombre, le cambiamos temporalmente el nombre
          if (lugarExistente) {
            console.log(
              "Se encontró un lugar con el mismo nombre, realizando actualización segura..."
            );

            // Generar un nombre temporal único
            const tempNombre = `temp_${Date.now()}_${lugarExistente.id}`;

            // Actualizar temporalmente el otro lugar
            await Lugar.update(
              { nombre: tempNombre },
              {
                where: { id: lugarExistente.id },
                transaction,
              }
            );

            console.log(
              `Nombre temporal asignado al lugar ${lugarExistente.id}: ${tempNombre}`
            );
          }
        }

        // 2. Ahora actualizamos el lugar actual
        const [updated] = await Lugar.update(camposActualizables, {
          where: { id },
          transaction,
          individualHooks: false,
          validate: false,
        });

        if (!updated) {
          throw new LugarError(
            "No se pudo actualizar el lugar",
            "ACTUALIZACION"
          );
        }

        // Si todo salió bien, hacemos commit de la transacción
        await transaction.commit();

        console.log("Actualización exitosa, obteniendo datos actualizados...");
        const lugarActualizado = await Lugar.findByPk(id);
        console.log("Lugar actualizado con éxito");

        return lugarActualizado;
      } catch (updateError) {
        // Si hay algún error, hacemos rollback de la transacción
        await transaction.rollback();
        console.error("Error en la actualización:", updateError);

        // Manejar específicamente el error de restricción única
        if (updateError.name === "SequelizeUniqueConstraintError") {
          console.error("Error de restricción única:", updateError.fields);
          throw new LugarError(
            "Error al actualizar el lugar: el nombre ya está en uso",
            "DUPLICADO"
          );
        }

        // Manejar error de clave foránea
        if (updateError.name === "SequelizeForeignKeyConstraintError") {
          console.error("Error de clave foránea:", updateError.fields);
          throw new LugarError(
            "Error al actualizar: referencia a registro no encontrada",
            "REFERENCIA"
          );
        }

        // Para cualquier otro error
        console.error("Error desconocido al actualizar:", updateError);
        throw new LugarError(
          `Error al actualizar el lugar: ${updateError.message}`,
          "ERROR_DB"
        );
      }
    } catch (error) {
      // Asegurarse de que la transacción se cierre en caso de error
      if (
        transaction.finished !== "commit" &&
        transaction.finished !== "rollback"
      ) {
        await transaction.rollback();
      }

      console.error("Error en actualizarLugar:", error);

      // Si el error ya es un LugarError, lo relanzamos
      if (error instanceof LugarError) {
        throw error;
      }

      // Para cualquier otro error, lanzamos un error genérico
      throw new LugarError(
        `Error al actualizar el lugar: ${error.message}`,
        "ERROR_DB"
      );
    }
  }

  async eliminarLugar(id) {
    return await Lugar.destroy({ where: { id } });
  }

  async actualizarEstado(id, estado) {
    try {
      console.log("=== Inicio actualizarEstado ===");
      console.log("ID del lugar:", id);
      console.log("Estado a actualizar:", estado);

      const lugarAntes = await Lugar.findByPk(id);
      console.log(
        "Lugar antes de actualizar:",
        lugarAntes ? lugarAntes.toJSON() : "No encontrado"
      );

      const actualizados = await Lugar.update(
        {
          aprobacion: estado,
          estado: estado,
        },
        { where: { id } }
      );
      console.log("Resultado de actualización:", actualizados);

      const lugarDespues = await Lugar.findByPk(id);
      console.log(
        "Lugar después de actualizar:",
        lugarDespues ? lugarDespues.toJSON() : "No encontrado"
      );

      return actualizados;
    } catch (error) {
      console.error("Error en actualizarEstado:", error);
      throw error;
    }
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarCategoria(categoriaid) {
    return await Categoria.findByPk(categoriaid);
  }

  async listarLugaresUsuario() {
    return await Lugar.findAll({
      where: {
        estado: true,
        aprobacion: true,
      },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
      ],
      attributes: [
        "id",
        "nombre",
        "descripcion",
        "ubicacion",
        "imagen",
        "fotos_lugar",
        "categoriaid",
        "createdAt",
        "updatedAt",
      ],
    });
  }
  async listarLugaresPorCategoria(categoriaid) {
    return await Lugar.findAll({
      where: {
        categoriaid,
        estado: true,
        aprobacion: true,
      },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
      ],
      attributes: [
        "id",
        "nombre",
        "descripcion",
        "ubicacion",
        "imagen",
        "fotos_lugar",
        "categoriaid",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  async obtenerEventosDeLugar(lugarid) {
    try {
      const lugar = await Lugar.findByPk(lugarid, {
        attributes: ["id", "nombre"],
        include: [
          {
            model: Evento,
            as: "eventos",
            where: { estado: true },
            attributes: [
              "id",
              "nombre",
              "portada",
              "capacidad",
              "precio",
              "descripcion",
              "fecha_hora",
              "estado",
              "usuarioid",
              "createdAt",
              "updatedAt",
            ],
            required: false,
            order: [["fecha_hora", "ASC"]], // Ordenar por fecha más cercana
          },
        ],
      });

      if (!lugar) {
        throw new Error("Lugar no encontrado");
      }

      // Formatear el array de portadas si es necesario
      const eventosFormateados = lugar.eventos.map((evento) => {
        return {
          ...evento.toJSON(),
          portada: Array.isArray(evento.portada)
            ? evento.portada
            : [evento.portada].filter(Boolean),
        };
      });

      return {
        lugar: {
          id: lugar.id,
          nombre: lugar.nombre,
        },
        eventos: eventosFormateados,
      };
    } catch (error) {
      console.error("Error en obtenerEventosDeLugar:", error);
      throw error;
    }
  }
}

module.exports = new LugarService();
