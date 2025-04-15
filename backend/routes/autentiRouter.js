const express = require('express');
const router = express.Router();
const AutentiController = require('../controllers/autentiController');

router.post('/registrar', AutentiController.registrar);
router.post('/validar/correo', AutentiController.validarCorreo);
router.post('/login', AutentiController.login);
router.post('/recuperar/contrasena', AutentiController.recuperarContrasena);
router.post('/cambiar/contrasena', AutentiController.cambiarContrasena);
router.patch('/actualizar/contrasena', AutentiController.actualizarContrasena);

module.exports = router;
