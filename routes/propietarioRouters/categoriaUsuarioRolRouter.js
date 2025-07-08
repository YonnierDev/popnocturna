const express = require('express');
const router = express.Router();
const CategoriaUsuarioRolController = require('../../controllers/propietarioControllers/categoriaUsuarioRolController');
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");

router.get('/propietario/categorias', autentiMiddleware, validarRol(3), CategoriaUsuarioRolController.obtenerCategoriaPorPropietario);

module.exports = router;
