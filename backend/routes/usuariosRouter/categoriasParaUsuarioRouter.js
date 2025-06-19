const express = require('express');
const router = express.Router();
const CategoriaParaUsuarioController = require('../../controllers/usuariosController/categoriasParaUsuarioController');
const usuarioBusquedaEventoController = require('../../controllers/usuariosController/usuarioBusquedaEventoController');
const autentiMiddleware = require('../../middlewares/autentiMiddleware');
const validarRol = require('../../middlewares/validarRol');


router.get('/usuarios/lista-categorias', autentiMiddleware, validarRol(4), CategoriaParaUsuarioController.categoriasParaUsuario);
router.get('/usuarios/lugares-categoria/:categoriaid', autentiMiddleware, validarRol(4), CategoriaParaUsuarioController.lugaresDeCadaCaregoria);

//buscar eventos por nombre
router.get('/eventos/buscar', autentiMiddleware, usuarioBusquedaEventoController.buscarEventosPorNombre);

module.exports = router;
