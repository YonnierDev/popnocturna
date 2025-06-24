const express = require('express');
const router = express.Router();
const autentiMiddleware = require('../../middlewares/autentiMiddleware');
const validarRol = require('../../middlewares/validarRol');
const propietarioReservaEventoLugarController = require('../../controllers/propietarioControllers/propietarioReservaEventoLugarController');

//reservas en pendiente
router.get(
  '/propietario/reservas/pendientes',
  autentiMiddleware,
  validarRol(1, 2, 3),
  propietarioReservaEventoLugarController.obtenerReservasPendientes
);

// Obtener reservas de un evento específico
router.get(
  '/propietario/eventos/:eventoid/reservas',
  autentiMiddleware,
  validarRol(3),
  propietarioReservaEventoLugarController.obtenerReservasPorEvento
);

// Ruta de compatibilidad (mantener si es necesario para otros usos)
router.get(
  '/propietario/reservas/activas',
  autentiMiddleware,
  validarRol(1, 2, 3),
  propietarioReservaEventoLugarController.obtenerReservasActivas
);

module.exports = router;
