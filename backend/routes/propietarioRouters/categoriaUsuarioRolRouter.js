const express = require('express');
const router = express.Router();
const CategoriaUsuarioRolController = require('../../controllers/propietarioControllers/categoriaUsuarioRolController');

router.get('/propietario/:usuarioid', CategoriaUsuarioRolController.obtenerCategoriaPorPropietario);

module.exports = router;