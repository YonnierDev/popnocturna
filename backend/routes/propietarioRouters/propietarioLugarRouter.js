const express = require("express");
const router = express.Router();
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");
const { uploadImages, uploadPDF } = require("../../middlewares/multerMiddleware");
const PropietarioController = require("../../controllers/propietarioControllers/propietarioLugarController");

router.get(
  "/propietario/lugares",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.listarLugaresPropietario
);

// Configuración de Multer para múltiples campos
const upload = uploadImages.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'fotos_lugar', maxCount: 5 },
  { name: 'carta_pdf', maxCount: 1 }
]);

router.post(
  "/propietario/lugar",
  autentiMiddleware,
  validarRol(3),
  upload,
  PropietarioController.crearLugarPropietario
);

//Super admin, administrador y propietario

router.patch(
  "/propietario/aprobar/:id",
  autentiMiddleware,
  validarRol(1,2),
  PropietarioController.aprobarLugarPropietario
);

router.get(
  "/propietario/lugar/:nombre",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.buscarLugarPropietario
);

// Ruta protegida: propietario ve comentarios y calificaciones de su lugar
router.get(
  "/propietario/lugar/:lugarid/comentarios-calificaciones",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.listarComentariosYCalificacionesLugar
);

module.exports = router;
