const { Codigotemporal } = require("../models");

class TemporalService {
  async guardarCodigo(correo, codigo, expiracion) {
    return await Codigotemporal.create({ correo, codigo, expiracion });
  }

  async obtenerCodigo(correo) {
    return await Codigotemporal.findOne({ where: { correo } });
  }

  async eliminarCodigo(correo) {
    return await Codigotemporal.destroy({ where: { correo } });
  }

  async actualizarCodigo(correo, codigo, expiracion) {
    return await Codigotemporal.update(
      { codigo, expiracion },
      { where: { correo } }
    );
  }
}

module.exports = new TemporalService();
