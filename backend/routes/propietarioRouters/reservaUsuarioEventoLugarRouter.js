const express = require('express');
const router = express.Router();
const reservaUsuarioEventoLugarController = require('../../controllers/propietarioControllers/reservaUsuarioEventoLugarController');

router.get('/reservasdetalle', reservaUsuarioEventoLugarController.listarReservas);

module.exports = router;