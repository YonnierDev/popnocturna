const express = require('express');
const router = express.Router();
const AutentiController = require('../controllers/autentiController');

router.post('/registrar', AutentiController.registrar);
router.post('/login', AutentiController.login);
router.post('/recuperar-contrasena', AutentiController.enviarRecuperacionCorreo);
router.get('/recuperar-contrasena/:token', AutentiController.verificarToken);
router.post('/actualizar-contrasena', AutentiController.actualizarContrasena);
router.post('/validar-codigo', AutentiController.validarCodigo);

module.exports = router;