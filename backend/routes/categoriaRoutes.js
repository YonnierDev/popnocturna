const CategoriaController = require('../controllers/categoriaController');
const express = require('express');
const router = express.Router();

router.get('/categorias', CategoriaController.listarCategorias);
router.get('/categorias/:id', CategoriaController.buscarCategoria);
router.post('/categorias', CategoriaController.crearCategoria);
router.put('/categorias/:id', CategoriaController.actualizarCategoria);
router.delete('/categorias/:id', CategoriaController.eliminarCategoria);

module.exports = router;
