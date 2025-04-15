const listarUsuarioService = require("../../service/usuariosService/listarUsuarioService");
class ListarUsuarioController {
    async listarUsuariosNombre(req, res) {
        try {
            const { termino } = req.query;
            const usuario = await listarUsuarioService.listarUsuariosNombre(termino);
            if (!usuario) {
                return res.status(404).json({ mensaje: "Usuario no encontrado" });
            }
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }
}

module.exports = new ListarUsuarioController();