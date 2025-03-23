const RolService = require('../service/rolService')
class RolController{
        async listarRol(req,res) {
            try {
                const listaRol = await RolService.listarRol();
                res.json(listaRol);
            } catch(e) {
                res.json({ mensaje: "error en el servicio" });
            }
        }
    async crearRol(req, res) {
        try {
            const { nombre } = req.body;
            const respuesta=await RolService.crearRol(nombre);
            res.json(respuesta);
            } catch(e) {
                 res.json({ mensaje: "error en el servicio" });
            }
        }
        async actualizarRol(req,res) {
             try {
                 const { nombre } = req.body;
                 const { id } = req.params;
                 const resp=await RolService.actualizarRol(id, nombre);
                 res.json(resp);
            } catch(e) {
                 res.json({ mensaje: "error en el servicio" });
            }
        }
        async eliminarRol(req,res) {
            try {
                const { id } = req.params;
                const r = await RolService.eliminarRol(id);
                console.log(r);
                res.json({ mensaje: "rol eliminado" });
            } catch(e) {
                 res.json({ mensaje: "error en el servicio" });
            }
        }
        async buscarRol(req,res) {
            try {
               const { id } = req.params;
                const buscarR = await RolService.buscarRol(id);
                res.json(buscarR);
            } catch(e) {
                 res.json({ mensaje: "error en el servicio" });
            }
        }
    
}

module.exports = new RolController();