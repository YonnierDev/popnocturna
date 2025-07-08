const express = require("express");
const router = express.Router();
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");
const propietarioEventoReservaController = require("../../controllers/propietarioControllers/propietarioEventoReservaController");

router.get(
  "/propietario/lugares-eventos",
  autentiMiddleware,
  validarRol(3),
  propietarioEventoReservaController.listarLugaresConEventos
);

// Endpoint para obtener eventos activos de un lugar específico
router.get(
  "/propietario/lugares/:lugarId/eventos-activos",
  autentiMiddleware,
  validarRol(3),
  propietarioEventoReservaController.obtenerEventosActivosLugar
);

module.exports = router;
