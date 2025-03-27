// service/usuarioService.js
const { Usuario, Rol } = require('../models');

class UsuarioService {
    async listarUsuarios() {
        return await Usuario.findAll();
    }

    async buscarUsuario(id) {
        return await Usuario.findByPk(id);
    }

    // Añadimos este método que falta
    async buscarPorCorreo(correo) {
        return await Usuario.findOne({ where: { correo } });
    }

    async crearUsuario(datos) {
        return await Usuario.create(datos);
    }

    async actualizarUsuario(id, datos) {
        await Usuario.update(datos, { where: { id } });
        return await this.buscarUsuario(id);
    }

    async eliminarUsuario(id) {
        return await Usuario.destroy({ where: { id } });
    }
    async verificarRol(rolid) {
        return await Rol.findByPk(rolid);
    }
    
}

module.exports = new UsuarioService();
