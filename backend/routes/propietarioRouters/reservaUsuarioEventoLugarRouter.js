const express = require('express');
const router = express.Router();
const reservaUsuarioEventoLugarController = require('../../controllers/propietarioControllers/reservaUsuarioEventoLugarController');
const autentiMiddleware = require("../../middlewares/autentiMiddleware"); 
const validarRol = require("../../middlewares/validarRol"); 

router.get('/reservasdetalle', autentiMiddleware, validarRol(3), reservaUsuarioEventoLugarController.listarReservas);

module.exports = router;
