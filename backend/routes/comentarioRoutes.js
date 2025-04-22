const express = require('express');
const router = express.Router();
const ComentarioController = require('../controllers/comentarioController');
const autentiMiddleare = require('../middlewares/autentiMiddleware');
const validarRol = require('../middlewares/validarRol');

router.get('/comentarios', autentiMiddleare, validarRol(1, 2, 3), ComentarioController.listarComentarios);
router.get('/comentario/:id', autentiMiddleare, validarRol(1, 2, 3), ComentarioController.buscarComentario);
router.post('/comentario',  autentiMiddleare, validarRol(8),ComentarioController.crearComentario);
router.put('/comentario/:id',  autentiMiddleare, validarRol(1, 2, 8),ComentarioController.actualizarComentario);
router.delete('/comentario/:id',  autentiMiddleare, validarRol(1, 2, 3),ComentarioController.eliminarComentario);
router.patch("/comentario/estado/:id",  autentiMiddleare, validarRol(1, 2, 3),ComentarioController.cambiarEstadoComentario);

module.exports = router;
