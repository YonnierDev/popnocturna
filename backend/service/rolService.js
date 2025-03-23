const {Rol}=require('../models')
class RolService{
    async listarRol() {
        return await Rol.findAll();
    }
    async crearRol(nombre) {
        return await Rol.create({nombre})
    }
    async actualizarRol(id,nombre) {
        const rol = await Rol.findAll({ where: { id } });
        if (rol.length==0) {
            return null
        }
        else {
            await  rol[0].update({nombre})
            return rol[0];
        }
        
    }
    async eliminarRol(id) {
        const rol = await Rol.findAll({ where: { id } });
        if (rol.length==0) {
            return null
        }
        else {
            await rol[0].destroy();
            return rol[0];
        }
    }
    async buscarRol(id) {
        const listaRol = await Rol.findByPk(id);
        return listaRol
    }
}
module.exports = new RolService();