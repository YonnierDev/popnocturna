const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const autentiMiddleware = require('../middlewares/autentiMiddleware');
const validarRol = require('../middlewares/validarRol');

router.get('/comentarios/evento/:eventoid', 
  autentiMiddleware,
  comentarioController.listarComentariosPorEvento
);

router.get('/comentarios', 
  autentiMiddleware, 
  comentarioController.listarComentarios
);

router.post('/comentario', 
  autentiMiddleware, 
  validarRol(8), 
  comentarioController.crearComentario
);

router.put('/comentario/:id', 
  autentiMiddleware, 
  validarRol(8), 
  comentarioController.actualizarComentario
);

router.delete('/comentario/:id', 
  autentiMiddleware, 
  validarRol(1, 2), 
  comentarioController.eliminarComentario
);

router.post('/comentario/:id/reportar',
  autentiMiddleware,
  validarRol(3),
  comentarioController.reportarComentario
);

module.exports = router;
