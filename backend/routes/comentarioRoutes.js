const express = require('express');
const router = express.Router();
const ComentarioController = require('../controllers/comentarioController');

router.get('/comentarios', ComentarioController.listarComentarios);
router.get('/comentario/:id', ComentarioController.buscarComentario);
router.post('/comentario', ComentarioController.crearComentario);
router.put('/comentario/:id', ComentarioController.actualizarComentario);
router.delete('/comentario/:id', ComentarioController.eliminarComentario);
router.patch("/comentario/estado/:id", ComentarioController.cambiarEstadoComentario);

module.exports = router;
