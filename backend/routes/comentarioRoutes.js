const express = require('express');
const router = express.Router();
const ComentarioController = require('../controllers/comentarioController');

// Rutas CRUD básicas
router.get('/comentarios', ComentarioController.listarComentarios);
router.get('/comentarios/:id', ComentarioController.buscarComentario);
router.post('/comentarios', ComentarioController.crearComentario);
router.put('/comentarios/:id', ComentarioController.actualizarComentario);
router.delete('/comentarios/:id', ComentarioController.eliminarComentario);

// Ruta adicional para buscar comentarios por usuario
router.get('/usuarios/:id_user/comentarios', ComentarioController.buscarComentariosPorUsuario);

module.exports = router; 