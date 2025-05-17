const { Codigotemporal } = require("../models");
const { Op } = require("sequelize");

class TemporalService {
  static async guardarCodigo(correo, codigo, expiracion) {
    try {
      const [registro, created] = await Codigotemporal.findOrCreate({
        where: { correo },
        defaults: {
          codigo,
          expiracion,
          datos_temporales: null
        }
      });

      if (!created) {
        await registro.update({
          codigo,
          expiracion,
          datos_temporales: null
        });
      }

      return registro;
    } catch (error) {
      console.error("Error al guardar código:", error);
      throw new Error("Error al guardar código de verificación");
    }
  }

  static async obtenerCodigo(correo) {
    try {
      const registro = await Codigotemporal.findOne({
        where: { correo }
      });
      return registro;
    } catch (error) {
      console.error("Error al obtener código:", error);
      throw new Error("Error al obtener código de verificación");
    }
  }

  static async eliminarCodigo(correo) {
    try {
      await Codigotemporal.destroy({
        where: { correo }
      });
    } catch (error) {
      console.error("Error al eliminar código:", error);
      throw new Error("Error al eliminar código de verificación");
    }
  }

  static async guardarDatosTemporales(correo, datos) {
    try {
      const [registro, created] = await Codigotemporal.findOrCreate({
        where: { correo },
        defaults: {
          codigo: null,
          expiracion: null,
          datos_temporales: JSON.stringify(datos)
        }
      });

      if (!created) {
        await registro.update({
          datos_temporales: JSON.stringify(datos)
        });
      }

      return registro;
    } catch (error) {
      console.error("Error al guardar datos temporales:", error);
      throw new Error("Error al guardar datos temporales");
    }
  }

  static async obtenerDatosTemporales(correo) {
    try {
      const registro = await Codigotemporal.findOne({
        where: { correo }
      });

      if (!registro || !registro.datos_temporales) {
        return null;
      }

      return JSON.parse(registro.datos_temporales);
    } catch (error) {
      console.error("Error al obtener datos temporales:", error);
      throw new Error("Error al obtener datos temporales");
    }
  }

  static async eliminarRegistrosExpirados(ahora) {
    try {
      await Codigotemporal.destroy({
        where: {
          expiracion: {
            [Op.lt]: ahora
          }
        }
      });
    } catch (error) {
      console.error("Error al eliminar registros expirados:", error);
      throw new Error("Error al eliminar registros expirados");
    }
  }
}

module.exports = TemporalService;

