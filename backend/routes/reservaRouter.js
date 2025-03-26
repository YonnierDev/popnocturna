const ReservaController = require("../controllers/reservaController");
const express = require("express");
const router = express.Router();

router.get("/reservas", ReservaController.listarReservas);
router.get("/reserva/:id", ReservaController.buscarReserva);
router.post("/reserva", ReservaController.crearReserva);
router.put("/reserva/:id", ReservaController.actualizarReserva);
router.delete("/reserva/:id", ReservaController.eliminarReserva);

module.exports = router;