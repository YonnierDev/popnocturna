const express = require("express");
const router = express.Router();
const EventoController = require("../controllers/eventoController");
const autentiMiddleware = require("../middlewares/autentiMiddleware");
const { uploadImages, handleMulterError } = require("../middlewares/multerMiddleware");

// Endpoints públicos (sin autenticación)
router.get("/public/eventos", EventoController.listarEventosPublicos);
router.get("/public/evento/:id", EventoController.verEventoPublico);

// Middleware de autenticación para todas las rutas siguientes
router.use(autentiMiddleware);

// Endpoints protegidos
router.get("/eventos", EventoController.listarEventos);
router.get("/evento/:id", EventoController.verEvento);

// Crear evento (admin y propietario)
router.post("/evento", 
  autentiMiddleware,
  uploadImages.array('portada', 3), // 'portada' es el nombre del campo en el formulario
  EventoController.crearEvento
);

// Actualizar evento (admin y propietario)
router.put("/evento/:id", 
  autentiMiddleware,
  uploadImages.array('portada', 3),
  handleMulterError,
  EventoController.actualizarEvento
);

// Eliminar evento (solo admin)
router.delete("/evento/:id", EventoController.eliminarEvento);

// Aprobar evento (solo admin)
//router.put("/evento/:id/aprobar", EventoController.aprobarEvento);

// Ver comentarios de un evento (todos los roles)
router.get("/evento/:eventoId/comentarios", EventoController.verComentarios);

// Cambiar estado de evento (admin y propietario)
router.patch("/evento/estado/:id", EventoController.cambiarEstadoEvento);

module.exports = router;
