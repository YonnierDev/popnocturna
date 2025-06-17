const express = require('express');
const router = express.Router();
const AutentiController = require('../controllers/autentiController');

/**
 * Rutas públicas de autenticación
 * Estas rutas son accesibles sin token porque son parte del proceso de registro y autenticación
 */
// Rutas de autenticación (públicas)
router.post('/login', AutentiController.login);
router.post('/registrar', AutentiController.registrar);
router.post('/registrar-usuario', AutentiController.registrarUsuario);
router.post('/recuperar-contrasena', AutentiController.enviarRecuperacionCorreo);

router.patch('/actualizar-contrasena', AutentiController.actualizarContrasena);

module.exports = router;