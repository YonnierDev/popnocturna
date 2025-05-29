const { Codigotemporal } = require("../models");
const { Op } = require("sequelize");

class TemporalService {
  static async guardarCodigo(correo, codigo, expiracion) {
    console.log('\n[guardarCodigo] Iniciando guardado de código');
    console.log('[guardarCodigo] Datos recibidos:', { correo, codigo, expiracion });
    
    try {
      const [registro, created] = await Codigotemporal.findOrCreate({
        where: { correo },
        defaults: {
          codigo,
          expiracion,
          datos_temporales: null
        }
      });

      console.log('[guardarCodigo] Resultado de la operación:', created ? 'Nuevo registro creado' : 'Registro actualizado');
      console.log('[guardarCodigo] Detalles del registro:', {
        id: registro.id,
        correo: registro.correo,
        expiracion: registro.expiracion
      });

      if (!created) {
        await registro.update({
          codigo,
          expiracion,
          datos_temporales: null
        });
        console.log('[guardarCodigo] Registro actualizado exitosamente');
      }

      return registro;
    } catch (error) {
      console.error('[guardarCodigo] Error al guardar código:', error);
      throw new Error("Error al guardar código de verificación");
    }
  }

  static async obtenerCodigo(correo) {
    console.log('\n[obtenerCodigo] Iniciando búsqueda de código');
    console.log('[obtenerCodigo] Correo a buscar:', correo);
    
    try {
      const registro = await Codigotemporal.findOne({
        where: { correo }
      });
      
      console.log('[obtenerCodigo] Resultado de la búsqueda:', registro ? 'Código encontrado' : 'Código no encontrado');
      if (registro) {
        console.log('[obtenerCodigo] Detalles del código:', {
          id: registro.id,
          correo: registro.correo,
          expiracion: registro.expiracion
        });
      }
      
      return registro;
    } catch (error) {
      console.error('[obtenerCodigo] Error al obtener código:', error);
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
    console.log('\n[guardarDatosTemporales] Iniciando guardado de datos temporales');
    console.log('[guardarDatosTemporales] Correo:', correo);
    console.log('[guardarDatosTemporales] Datos a guardar:', {
      ...datos,
      contrasena: '[PROTEGIDO]' // No mostramos la contraseña en los logs
    });
    
    try {
      const [registro, created] = await Codigotemporal.findOrCreate({
        where: { correo },
        defaults: {
          codigo: null,
          expiracion: null,
          datos_temporales: JSON.stringify(datos)
        }
      });

      console.log('[guardarDatosTemporales] Resultado de la operación:', created ? 'Nuevo registro creado' : 'Registro actualizado');

      if (!created) {
        await registro.update({
          datos_temporales: JSON.stringify(datos)
        });
        console.log('[guardarDatosTemporales] Registro actualizado exitosamente');
      }

      return registro;
    } catch (error) {
      console.error('[guardarDatosTemporales] Error al guardar datos:', error);
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

