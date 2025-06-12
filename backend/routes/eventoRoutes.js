const express = require("express");
const router = express.Router();
const EventoController = require("../controllers/eventoController");
const autentiMiddleware = require("../middlewares/autentiMiddleware");
const validarRol = require("../middlewares/validarRol");
const { uploadImages, handleMulterError } = require("../middlewares/multerMiddleware");

router.get("/public/eventos", EventoController.listarEventosPublicos);
router.get("/public/evento/:id", EventoController.verEventoPublico);

router.use(autentiMiddleware);

router.get("/eventos", EventoController.listarEventos);
router.get("/evento/:id", EventoController.verEvento);

router.post("/evento", 
  autentiMiddleware,
  uploadImages.array('portada', 3), 
  EventoController.crearEvento
);

router.put("/evento/:id", 
  autentiMiddleware,
  uploadImages.array('portada', 3),
  handleMulterError,
  EventoController.actualizarEvento
);

// 
router.get("/evento/:eventoId/reservas",
  EventoController.listarReservasEvento
);

router.delete("/evento/:id", validarRol(1, 2), EventoController.eliminarEvento);

// Aprobar evento (solo admin)
//router.put("/evento/:id/aprobar", EventoController.aprobarEvento);

router.get("/evento/:eventoId/comentarios", validarRol(1, 2,), EventoController.verComentarios);

router.patch("/evento/estado/:id", validarRol(1, 2), EventoController.cambiarEstadoEvento);

module.exports = router;
