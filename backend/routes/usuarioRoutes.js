const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');

// Rutas CRUD para usuarios
router.get('/usuarios', UsuarioController.listarUsuarios);
router.get('/usuario/:id', UsuarioController.buscarUsuario);
router.put('/usuario/:id', UsuarioController.actualizarUsuario);
router.delete('/usuario/:id', UsuarioController.eliminarUsuario);


module.exports = router;
// Este archivo define las rutas para las operaciones CRUD en la entidad "Usuario".
// Cada ruta está asociada a un método específico en el controlador `UsuarioController`.