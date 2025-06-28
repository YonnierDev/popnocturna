const express = require("express");
const router = express.Router();
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");
const { uploadImages, uploadPDF, handleMulterError } = require("../../middlewares/multerMiddleware");
const PropietarioController = require("../../controllers/propietarioControllers/propietarioLugarController");
const PropietarioGeneralController = require("../../controllers/propietarioController");

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
  handleMulterError,
  PropietarioController.crearLugarPropietario
);

//Super admin, administrador y propietario

router.patch(
  "/propietario/aprobar/:id",
  autentiMiddleware,
  validarRol(1, 2),
  PropietarioController.aprobarLugarPropietario
);

router.patch(
  "/propietario/actualizar/:id",
  autentiMiddleware,
  validarRol(3),
  upload,
  handleMulterError,
  PropietarioController.propietarioActualizarImagenesFotos
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

// Obtener todos los comentarios de un lugar con información del evento
router.get(
  "/propietario/lugar/:lugarid/comentarios",
  autentiMiddleware,
  validarRol(3),
  PropietarioGeneralController.listarComentariosPorLugar
);

// Obtener todas las calificaciones de un lugar con información del evento
router.get(
  "/propietario/lugar/:lugarid/calificaciones",
  autentiMiddleware,
  validarRol(3),
  PropietarioGeneralController.listarCalificacionesPorLugar
);

// Obtener todas las reservas de un lugar con información del evento
router.get(
  "/propietario/lugar/:lugarid/reservas",
  autentiMiddleware,
  validarRol(3),
  PropietarioGeneralController.listarReservasPorLugar
);

module.exports = router;
