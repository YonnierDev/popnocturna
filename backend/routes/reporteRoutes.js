const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const autentiMiddleware = require('../middlewares/autentiMiddleware');
const { verificarRol } = require('../middlewares/rolMiddleware');

// Ruta para administradores (roles 1 y 2)

router.put('/reporte/comentario/:id/estado',
    autentiMiddleware,
    verificarRol([1, 2]),
    reporteController.actualizarEstadoReporteComentario
);

// Ruta para propietarios (rol 3) y usuarios normales (rol 8)
router.post('/comentario/:id/reportar',
    autentiMiddleware,
    verificarRol([3, 8]),
    reporteController.reportarComentario
);

// Rutas para lugares pendientes (roles 1 y 2)
router.get('/lugares/pendientes',
    autentiMiddleware,
    verificarRol([1, 2]),
    reporteController.listarLugaresPendientes
);

router.put('/lugar/:id/estado',
    autentiMiddleware,
    verificarRol([1, 2]),
    reporteController.actualizarEstadoLugar
);

// Rutas para notificaciones (roles 1 y 2)
router.get('/reportes/notificaciones',
    autentiMiddleware,
    verificarRol([1, 2]),
    reporteController.obtenerNotificacionesReportes
);

router.get('/lugares/notificaciones',
    autentiMiddleware,
    verificarRol([1, 2]),
    reporteController.obtenerNotificacionesLugares
);

module.exports = router; 