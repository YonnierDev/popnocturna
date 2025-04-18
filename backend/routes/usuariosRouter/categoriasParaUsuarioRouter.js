const express = require('express');
const router = express.Router();
const CategoriaParaUsuarioController = require('../../controllers/usuariosController/categoriasParaUsuarioController');

// Ruta para obtener solo los tipos de categorías
router.get('/usuarios/lista-categorias', CategoriaParaUsuarioController.categoriasParaUsuario);
router.get('/usuarios/lugares-categoria', CategoriaParaUsuarioController.lugaresDeCadaCaregoria);

module.exports = router;
