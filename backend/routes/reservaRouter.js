const ReservaController = require("../controllers/reservaController");
const express = require("express");
const router = express.Router();
const autentiMiddleare = require("../middlewares/autentiMiddleware");
const validarRol = require("../middlewares/validarRol");

router.get(
  "/reservas",
  autentiMiddleare,
  ReservaController.listarReservas
);

// Rutas que usan ID numérico
router.put(
  "/reserva/:id(\\d+)",
  autentiMiddleare,
  validarRol(4),
  ReservaController.actualizarReserva
);

router.delete(
  "/reserva/:id(\\d+)",
  autentiMiddleare,
  validarRol(1),
  ReservaController.eliminarReserva
);

router.patch(
  "/reserva/estado/:id(\\d+)",
  autentiMiddleare,
  validarRol(1, 2, 3),
  ReservaController.actualizarEstado
);

// Rutas que usan número de reserva (puede tener o no el prefijo 'res-')
router.get(
  "/reserva/:numero_reserva",
  autentiMiddleare,
  ReservaController.buscarReservaPorNumero
);

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({ message: 'La API está funcionando correctamente' });
});

// Aprobar/Rechazar reserva
// Ejemplo: PATCH /api/reserva/aprobar/RES-008
router.patch(
  "/reserva/aprobar/:numero_reserva",
  autentiMiddleare,
  validarRol(1, 2, 3),  // Solo admin (1,2) o dueño (3)
  ReservaController.aprobarReserva
);

// Ruta para crear reserva
router.post(
  "/reserva",
  autentiMiddleare,
  validarRol(4),
  ReservaController.crearReserva
);

module.exports = router;
