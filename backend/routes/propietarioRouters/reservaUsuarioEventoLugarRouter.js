const express = require('express');
const router = express.Router();
const reservaUsuarioEventoLugarController = require('../../controllers/propietarioControllers/reservaUsuarioEventoLugarController');
const autentiMiddleware = require("../../middlewares/autentiMiddleware"); 
const validarRol = require("../../middlewares/validarRol");

// Middleware de depuración
router.use((req, res, next) => {
  console.log('=== Ruta accedida ===');
  console.log('URL:', req.originalUrl);
  console.log('Método:', req.method);
  console.log('Headers:', req.headers);
  next();
});

// Obtener reservas con detalles para el propietario actual
// Ruta: GET /api/propietario/reservasdetalle
router.get('/reservasdetalle', autentiMiddleware, validarRol(3), reservaUsuarioEventoLugarController.listarReservas);

module.exports = router;
