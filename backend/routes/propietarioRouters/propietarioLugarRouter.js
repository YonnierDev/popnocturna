const express = require("express");
const router = express.Router();
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");
const { uploadImages, uploadPDF, handleMulterError } = require("../../middlewares/multerMiddleware");
const PropietarioLugarController = require("../../controllers/propietarioControllers/propietarioLugarController");
const PropietarioController = require("../../controllers/propietarioController");

router.get(
  "/propietario/lugares",
  autentiMiddleware,
  validarRol(3),
  PropietarioLugarController.listarLugaresPropietario
);

// Configuración de Multer para múltiples campos
const uploadConfig = {
  imagen: { name: 'imagen', maxCount: 1 },
  fotos_lugar: { name: 'fotos_lugar', maxCount: 5 },
  carta_pdf: { name: 'carta_pdf', maxCount: 1 }
};

const upload = uploadImages.fields(Object.values(uploadConfig));

router.post(
  "/propietario/lugar",
  autentiMiddleware,
  validarRol(3),
  upload,
  handleMulterError,
  PropietarioLugarController.crearLugarPropietario
);

// Actualizar lugar (solo propietario dueño del lugar)
router.put(
  '/propietario/lugar/:id',
  autentiMiddleware,
  validarRol(3),
  upload,
  handleMulterError,
  PropietarioLugarController.actualizarLugarPropietario
);

// Ruta para aprobación de lugares (solo admin y superadmin)
router.patch(
  "/propietario/aprobar/:id",
  autentiMiddleware,
  validarRol(1, 2),
  PropietarioLugarController.aprobarLugarPropietario
);

router.get(
  "/propietario/lugar/:nombre",
  autentiMiddleware,
  validarRol(3),
  PropietarioLugarController.buscarLugarPropietario
);

// Ruta protegida: propietario ve comentarios y calificaciones de su lugar
router.get(
  "/propietario/lugar/:lugarid/comentarios-calificaciones",
  autentiMiddleware,
  validarRol(3),
  PropietarioLugarController.listarComentariosYCalificacionesLugar
);

// Obtener todos los comentarios de un lugar con información del evento
router.get(
  "/propietario/lugar/:lugarid/comentarios",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.listarComentariosPorLugar
);

// Obtener todas las calificaciones de un lugar con información del evento
router.get(
  "/propietario/lugar/:lugarid/calificaciones",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.listarCalificacionesPorLugar
);

// Obtener todas las reservas de un lugar con información del evento
router.get(
  "/propietario/lugar/:lugarid/reservas",
  autentiMiddleware,
  validarRol(3),
  PropietarioController.listarReservasPorLugar
);

module.exports = router;
