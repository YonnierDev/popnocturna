const {Rol}=require('../models')
class RolService{
    async listarRol() {
        return await Rol.findAll();
    }
    async crearRol(nombre) {
        return await Rol.create({nombre})
    }
    async actualizarRol(id,nombre) {
        return await Rol.update({nombre}, { where: { id } });      
    }
    async eliminarRol(id) {
        return await Rol.destroy({ where: { id } });
    }
    async buscarRol(id) {
        return await Rol.findByPk(id);
    }
}
module.exports = new RolService();