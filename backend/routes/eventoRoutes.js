const EventoController = require('../controllers/eventoController');
const express = require('express');
const router = express.Router();

router.get('/eventos', EventoController.listarEventos);
router.get('/evento/:id', EventoController.buscarEvento);
router.post('/evento', EventoController.crearEvento);
router.put('/evento/:id', EventoController.actualizarEvento);
router.delete('/evento/:id', EventoController.eliminarEvento);
router.patch("/eventos/estado/:id", EventoController.actualizarEstado);

module.exports = router;
