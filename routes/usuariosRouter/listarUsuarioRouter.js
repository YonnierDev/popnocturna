const express = require('express');
const router = express.Router();
const ListarUsuarioController = require('../../controllers/usuariosController/listarUsuarioController');
const autenriMiddleware = require('../../middlewares/autentiMiddleware')

router.get('/usuarios/nombre/buscar', autenriMiddleware, ListarUsuarioController.listarUsuariosNombre);

module.exports = router;
