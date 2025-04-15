const express = require('express');
const router = express.Router();
const ListarUsuarioController = require('../../controllers/usuariosController/listarUsuarioController');

router.get('/usuarios/nombre/buscar', ListarUsuarioController.listarUsuariosNombre);

module.exports = router;