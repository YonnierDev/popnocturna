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
router.get('/comentario/reportes/notificaciones',
    autentiMiddleware,
    verificarRol([1, 2]),
    reporteController.obtenerNotificacionesReportes
);

router.get('/lugares/creacion/notificaciones',
    autentiMiddleware,
    verificarRol([1, 2]),
    reporteController.obtenerNotificacionesLugares
);

module.exports = router; 