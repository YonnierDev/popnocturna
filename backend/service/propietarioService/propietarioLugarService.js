const { Lugar, Usuario, Categoria } = require("../../models");

class PropietarioLugarService {
  async listarLugaresPropietario(usuarioid) {
    console.log("LUGARES USUARIOID:", usuarioid);
    const lugares = await Lugar.findAll({
      where: { usuarioid },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre"],
        },
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
      const lugar = await Lugar.findAll( {
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
}

module.exports = new PropietarioLugarService();
