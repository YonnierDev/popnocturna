const express = require('express');
const router = express.Router();
const CategoriaParaUsuarioController = require('../../controllers/usuariosController/categoriasParaUsuarioController');

// Ruta para obtener solo los tipos de categorías
router.get('/lista-categorias', CategoriaParaUsuarioController.categoriasParaUsuario);

module.exports = router;
