const express = require('express');
const router = express.Router();
const { uploadImages } = require('../middlewares/multerMiddleware');
const CategoriaController = require('../controllers/categoriaController');
const autentiMiddleware = require('../middlewares/autentiMiddleware');
const validarRol = require('../middlewares/validarRol');

// Rutas públicas
router.get('/categorias', CategoriaController.listarCategorias);
router.get('/categoria/:id', CategoriaController.buscarCategoria);
router.get('/categoria/:id/lugares', CategoriaController.obtenerLugaresPorCategoria);

// Rutas protegidas (solo admin)
router.post('/categoria', 
  autentiMiddleware, 
  validarRol(1), 
  uploadImages.single("imagen"),
  CategoriaController.crearCategoria
);

router.put('/categoria/:id', 
  autentiMiddleware, 
  validarRol(1), 
  uploadImages.single("imagen"),
  CategoriaController.actualizarCategoria
);

router.delete('/categoria/:id', 
  autentiMiddleware, 
  validarRol(1), 
  CategoriaController.eliminarCategoria
);

router.patch(
  '/categoria/estado/:id', 
  autentiMiddleware,
  validarRol(1, 2), 
  CategoriaController.actualizarEstado
);

module.exports = router;
