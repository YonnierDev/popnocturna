const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const autentiMiddleware = require('../middlewares/autentiMiddleware');
const validarRol = require('../middlewares/validarRol');

// Rutas públicas (requieren autenticación pero cualquier rol puede acceder)
router.get('/comentarios/evento/:eventoid', 
  autentiMiddleware,
  comentarioController.listarComentariosPorEvento
);

// Listar comentarios (filtrado por rol automáticamente)
router.get('/comentarios', 
  autentiMiddleware, 
  comentarioController.listarComentarios
);

// Solo usuarios pueden crear comentarios
router.post('/comentario', 
  autentiMiddleware, 
  validarRol(8), 
  comentarioController.crearComentario
);

// Solo usuarios pueden actualizar sus propios comentarios
router.put('/comentario/:id', 
  autentiMiddleware, 
  validarRol(8), // Solo rol 8 (usuarios)
  comentarioController.actualizarComentario
);

// Solo Super Admin y Admin pueden eliminar
router.delete('/comentario/:id', 
  autentiMiddleware, 
  validarRol(1, 2), 
  comentarioController.eliminarComentario
);

// Solo propietarios pueden reportar
router.post('/comentario/:id/reportar',
  autentiMiddleware,
  validarRol(3),
  comentarioController.reportarComentario
);

module.exports = router;
