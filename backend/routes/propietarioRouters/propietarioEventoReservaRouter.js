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

module.exports = router;
