
const { CodigoTemporal } = require("../models");

class TemporalService {
  async guardarCodigo(correo, codigo, expiracion) {
    return await CodigoTemporal.create({ correo, codigo, expiracion });
  }

  async obtenerCodigo(correo) {
    return await CodigoTemporal.findOne({ where: { correo } });
  }

  async eliminarCodigo(correo) {
    return await CodigoTemporal.destroy({ where: { correo } });
  }

  async actualizarCodigo(correo, codigo, expiracion) {
    return await CodigoTemporal.update(
      { codigo, expiracion },
      { where: { correo } }
    );
  }
}

module.exports = new TemporalService();