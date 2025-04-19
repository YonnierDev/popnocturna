const express = require('express');
const router = express.Router();
const multerMiddleware = require('../middlewares/multerMiddleware');
const validarRol = require('../middlewares/validarRol');
const autentiMiddleware = require('../middlewares/autentiMiddleware');
const CategoriaController = require('../controllers/categoriaController');

router.get('/categorias', CategoriaController.listarCategorias);
router.get('/categoria/:id', CategoriaController.buscarCategoria);
router.get('/categoria/:id/lugares', CategoriaController.obtenerLugaresPorCategoria);

router.post(
    '/categoria',
    autentiMiddleware,  
    multerMiddleware.single("imagen"),
    validarRol(1, 2),  
    CategoriaController.crearCategoria
  );

router.put(
  '/categoria/:id', autentiMiddleware,
  multerMiddleware.single("imagen"), 
  validarRol(1, 2), 
  CategoriaController.actualizarCategoria
);
router.delete(
  '/categoria/:id', 
  validarRol(1, 2), 
  CategoriaController.eliminarCategoria
);
router.patch(
  '/categoria/estado/:id', 
  validarRol(1, 2), 
  CategoriaController.actualizarEstado
);

module.exports = router;
