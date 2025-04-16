const express = require('express');
const router = express.Router();
const autentiMiddleware = require('../../middlewares/autentiMiddleware');
const validarRol = require('../../middlewares/validarRol');
const propietarioReservaEventoLugarController = require('../../controllers/propietarioControllers/propietarioReservaEventoLugarController');

router.get(
  '/propietario/reservas-evento-lugar',
  autentiMiddleware,
  validarRol(3),
  propietarioReservaEventoLugarController.obtenerReservasEventoLugar
);

module.exports = router;
