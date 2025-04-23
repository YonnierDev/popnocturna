const express = require("express");
const router = express.Router();
const EventoController = require("../controllers/eventoController");
const autentiMiddleware = require("../middlewares/autentiMiddleware");

// Listar eventos activos
router.get("/eventos", autentiMiddleware, EventoController.listarEventos);

// Ver evento por ID
router.get("/evento/:id", autentiMiddleware, EventoController.verEvento);

// Crear evento
router.post("/evento", autentiMiddleware, EventoController.crearEvento);

// Actualizar evento
router.put("/evento/:id", autentiMiddleware, EventoController.actualizarEvento);

// Eliminar evento
router.delete(
  "/evento/:id",
  autentiMiddleware,
  EventoController.eliminarEvento
);

// Ver comentarios de un evento
router.get(
  "/evento/:eventoId/comentarios",
  autentiMiddleware,
  EventoController.verComentarios
);

// estado de evento (booleano)
router.patch(
  "/evento/estado/:id",
  autentiMiddleware,
  EventoController.cambiarEstadoEvento
);

module.exports = router;
