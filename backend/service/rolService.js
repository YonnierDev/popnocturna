const { Rol, Usuario } = require("../models");
class RolService {
  async listarRol() {
    return await Rol.findAll({
      include: [
        {
          model: Usuario,
          as: "usuarios",
          attributes: ["nombre"],
        },
      ],
    });
  }
  async crearRol(nombre) {
    return await Rol.create({ nombre });
  }

  async actualizarRol(id, datos) {
    return await Rol.update(datos, { where: { id } });
  }

  async buscarRol(id) {
    return await Rol.findByPk(id);
  }

  async eliminarRol(id) {
    return await Rol.destroy({ where: { id } });
  }
  async buscarRolConUsuarios(id) {
    return await Rol.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuarios",
          attributes: ["id", "nombre", "apellido", "correo"],
          include: [
            {
              model: Rol,
              as: "rol",
              attributes: ["nombre"]
            }
          ]
        }
      ]
    });
  }  
}
module.exports = new RolService();
