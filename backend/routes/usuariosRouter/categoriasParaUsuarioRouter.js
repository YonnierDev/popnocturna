const express = require('express');
const router = express.Router();
const CategoriaParaUsuarioController = require('../../controllers/usuariosController/categoriasParaUsuarioController');
const usuarioBusquedaEventoController = require('../../controllers/usuariosController/usuarioBusquedaEventoController');
const autentiMiddleware = require('../../middlewares/autentiMiddleware');
const validarRol = require('../../middlewares/validarRol');


router.get('/usuarios/lista-categorias', CategoriaParaUsuarioController.categoriasParaUsuario);
router.get('/usuarios/lugares-categoria/:categoriaid', CategoriaParaUsuarioController.lugaresDeCadaCaregoria);

//buscar eventos por nombre
router.get('/eventos/buscar', autentiMiddleware, validarRol(4), usuarioBusquedaEventoController.buscarEventosPorNombre);

module.exports = router;
