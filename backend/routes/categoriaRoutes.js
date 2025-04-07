const CategoriaController = require('../controllers/categoriaController');
const express = require('express');
const router = express.Router();

router.get('/categorias', CategoriaController.listarCategorias);
router.get('/categoria/:id', CategoriaController.buscarCategoria);
router.post('/categoria', CategoriaController.crearCategoria);
router.put('/categoria/:id', CategoriaController.actualizarCategoria);
router.delete('/categoria/:id', CategoriaController.eliminarCategoria);

module.exports = router;
