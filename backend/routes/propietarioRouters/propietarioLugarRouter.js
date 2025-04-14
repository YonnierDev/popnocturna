const express = require("express");
const router = express.Router();
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");
const multerMiddleware = require("../../middlewares/multerMiddleware");
const PropietarioController = require("../../controllers/propietarioControllers/propietarioLugarController");

router.get(
  "/propietario/lugares",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.listarLugaresPropietario
);
router.post(
  "/propietario/lugar",
  autentiMiddleware,
  validarRol(3),
  multerMiddleware.single("imagen"),
  PropietarioController.crearLugarPropietario
);
//superadmin

router.patch(
  "/propietario/aprobar/:id",
  autentiMiddleware,
  validarRol(1),
  PropietarioController.aprobarLugarPropietario
);

router.get(
  "/propietario/lugar/:nombre",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.buscarLugarPropietario
);

module.exports = router;
