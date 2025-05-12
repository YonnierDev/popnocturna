const express = require('express');
const router = express.Router();
const SolicitudOcultarComentarioController = require('../controllers/propietarioControllers/solicitudOcultarComentarioController');
const autentiMiddleware = require("../middlewares/autentiMiddleware");
const validarRol = require("../middlewares/validarRol");

// Rutas para propietarios (rol 3)
router.post(
    '/propietario/comentario/:comentarioid/reporte', 
    [autentiMiddleware, validarRol(3)], 
    SolicitudOcultarComentarioController.solicitarOcultar
);

// Rutas para administradores (roles 1 y 2)
router.get(
    '/administracion/pendientes', 
    [autentiMiddleware, validarRol(1, 2)], 
    SolicitudOcultarComentarioController.listarPendientes
);

router.get(
    '/administracion/detalle/:comentarioid', 
    [autentiMiddleware, validarRol(1, 2)], 
    SolicitudOcultarComentarioController.obtenerDetalle
);

router.put(
    '/administracion/procesar/:comentarioid', 
    [autentiMiddleware, validarRol(1, 2)], 
    SolicitudOcultarComentarioController.procesarSolicitud
);



module.exports = router;
