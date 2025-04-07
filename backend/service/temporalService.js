const { Codigotemporal } = require("../models");

class TemporalService {
  async guardarCodigo(correo, codigo, expiracion) {
    const existente = await Codigotemporal.findOne({ where: { correo } });

    if (existente) {
      return await Codigotemporal.update(
        { codigo, expiracion },
        { where: { correo } }
      );
    } else {
      return await Codigotemporal.create({ correo, codigo, expiracion });
    }
  }

  async obtenerCodigo(correo) {
    return await Codigotemporal.findOne({ where: { correo } });
  }

  async eliminarCodigo(correo) {
    return await Codigotemporal.destroy({ where: { correo } });
  }
}

module.exports = new TemporalService();
