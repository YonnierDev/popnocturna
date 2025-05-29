const express = require('express');
const router = express.Router();
const autentiMiddleware = require('../../middlewares/autentiMiddleware');
const validarRol = require('../../middlewares/validarRol');
const propietarioReservaEventoLugarController = require('../../controllers/propietarioControllers/propietarioReservaEventoLugarController');

//reservas en pendiente
router.get(
  '/propietario/reservas/pendientes',
  autentiMiddleware,
  validarRol(3), 
  propietarioReservaEventoLugarController.obtenerReservasPendientes
);

module.exports = router;
