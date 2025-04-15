const { Op } = require("sequelize");
const { Usuario } = require("../../models");

class ListarUsuarioService {
  static async listarUsuariosNombre(termino) {
    try {
      const usuario = await Usuario.findAll({ where: { [Op.or]: [{ nombre: { [Op.like]: `%${termino}%` } }, { correo: { [Op.like]: `%${termino}%` } }, { apellido: { [Op.like]: `%${termino}%` } }] } });
      return usuario;
    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      throw error;
    }
  }
}

module.exports = ListarUsuarioService;
