const { Lugar, Usuario, Categoria, Comentario, Calificacion, Evento } = require("../../models");

class PropietarioLugarService {
  async listarLugaresPropietario(usuarioid) {
    console.log("LUGARES USUARIOID:", usuarioid);
    const lugares = await Lugar.findAll({
      where: { usuarioid },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["tipo"],
        },
      ],
    });
    return lugares;
  }

  async crearLugarPropietario(dataLugar) {
    try {
      console.log("Creando lugar:", dataLugar);
      const nuevoLugar = await Lugar.create(dataLugar);
      console.log("Lugar creado:", nuevoLugar);
      return nuevoLugar;
    } catch (error) {
      console.error("Error al crear lugar:", error);
    }
  }

  async aprobarLugarPropietario(id) {
    try {
      const lugar = await Lugar.findByPk(id);
      if (!lugar) {
        throw new Error("Lugar no encontrado");
      }
      lugar.aprobacion = true;
      await lugar.save();
      return lugar;
    } catch (error) {
      console.error("Error al aprobar el lugar:", error);
      throw error;
    }
  }

  async buacarLugarPropietarioDetallado(nombre, usuarioid) {
    try {
      const lugar = await Lugar.findAll({
        where: { nombre: { [require("sequelize").Op.like]: `%${nombre}%` }, usuarioid },
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
      return lugar;
    } catch (error) {
      console.error("Error al buscar el lugar:", error);
      throw error;
    }
  }

  async listarComentariosYCalificacionesLugar(lugarid, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
  
      // Comentarios del lugar paginados
      const { count: totalComentarios, rows: comentarios } = await Comentario.findAndCountAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid },
            attributes: ['id'],
            include: [
              {
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'nombre', 'correo']
              },
              {
                model: Lugar,
                as: 'lugar',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
  
      // Calificaciones del lugar
      const { count: totalCalificaciones, rows: calificaciones } = await Calificacion.findAndCountAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid },
            attributes: ['id'],
            include: [
              {
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'nombre', 'correo']
              },
              {
                model: Lugar,
                as: 'lugar',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
  
      // Promedio de calificaciones
      const sumaPuntuaciones = calificaciones.reduce((acc, calif) => acc + calif.puntuacion, 0);
      const promedioCalificaciones = totalCalificaciones > 0
        ? (sumaPuntuaciones / totalCalificaciones).toFixed(1)
        : 0;
  
      // Resultado estructurado
      return {
        comentarios: {
          data: comentarios,
          total: totalComentarios,
          totalPages: Math.ceil(totalComentarios / limit),
          currentPage: Number(page),
          hasMore: Number(page) < Math.ceil(totalComentarios / limit),
          limit: Number(limit)
        },
        calificaciones: {
          data: calificaciones,
          total: totalCalificaciones,
          promedio: promedioCalificaciones
        }
      };
    } catch (error) {
      console.error("Error al listar comentarios y calificaciones:", error);
      throw error;
    }
  }
  

  async obtenerLugarPorIdConUsuario(lugarid) {
    return await Lugar.findOne({
      where: { id: lugarid },
      include: {
        model: Usuario,
        as: "usuario",
        attributes: ["id", "nombre", "apellido", "rolid"]
      }
    });
  }


}

module.exports = new PropietarioLugarService();
