const ReservaController = require("../controllers/reservaController");
const express = require("express");
const router = express.Router();
const autentiMiddleare = require("../middlewares/autentiMiddleware");
const validarRol = require("../middlewares/validarRol");

router.get(
  "/reservas",
  autentiMiddleare,
  validarRol(1, 2, 3, 4),
  ReservaController.listarReservas
);
router.get(
  "/reserva/:numero_reserva",
  autentiMiddleare,
  validarRol(1, 2, 3),
  ReservaController.buscarReservaPorNumero
);
router.post(
  "/reserva",
  autentiMiddleare,
  validarRol(4),
  ReservaController.crearReserva
);
router.put(
  "/reserva/:id",
  autentiMiddleare,
  validarRol(4),
  ReservaController.actualizarReserva
);
router.delete(
  "/reserva/:id",
  autentiMiddleare,
  validarRol(1, 2),
  ReservaController.eliminarReserva
);
router.patch(
  "/reserva/estado/:id",
  autentiMiddleare,
  validarRol(1, 2, 3),
  ReservaController.actualizarEstado
);

//super Admin, Administrador, propietario
router.patch(
  "/reserva/aprobar/:numero_reserva",
  autentiMiddleare,
  validarRol(1, 2, 3),
  ReservaController.aprobarReserva
);

module.exports = router;
