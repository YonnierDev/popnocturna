const express = require("express");
const router = express.Router();
const EventoController = require("../controllers/eventoController");
const autentiMiddleware = require("../middlewares/autentiMiddleware");

// Endpoints públicos (sin autenticación)
router.get("/public/eventos", EventoController.listarEventosPublicos);
router.get("/public/evento/:id", EventoController.verEventoPublico);

// Endpoints protegidos (requieren autenticación)
// Listar eventos (todos los roles)
router.get("/eventos", 
  autentiMiddleware,
  EventoController.listarEventos
);
// Ver evento por ID (todos los roles)
router.get("/evento/:id", 
  autentiMiddleware,
  EventoController.verEvento
);

// Crear evento (admin y propietario)
router.post("/evento", 
  autentiMiddleware,
  EventoController.crearEvento
);

// Actualizar evento (admin y propietario)
router.put("/evento/:id", 
  autentiMiddleware,
  EventoController.actualizarEvento
);

// Eliminar evento (admin y propietario)
router.delete("/evento/:id", 
  autentiMiddleware,
  EventoController.eliminarEvento
);

// Ver comentarios de un evento (todos los roles)
router.get("/evento/:eventoId/comentarios", 
  autentiMiddleware,
  EventoController.verComentarios
);

// Cambiar estado de evento (admin y propietario)
router.patch("/evento/estado/:id", 
  autentiMiddleware,
  EventoController.cambiarEstadoEvento
);

module.exports = router;
