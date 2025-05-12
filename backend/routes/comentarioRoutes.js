const express = require('express');
const router = express.Router();
const comentarioController = require("../controllers/comentarioController");
const autentiMiddleware = require("../middlewares/autentiMiddleware");
const { verificarRol } = require("../middlewares/rolMiddleware");

// Ruta para obtener comentarios según el rol del usuario
router.get('/comentarios',
  autentiMiddleware,
  comentarioController.obtenerComentarios
);

// Ruta para listar comentarios por evento
router.get('/comentarios/evento/:eventoid', 
  autentiMiddleware,
  comentarioController.obtenerPorEvento
);

// Ruta para crear un nuevo comentario (solo usuarios con rol 8)
router.post('/comentario', 
  autentiMiddleware,
  verificarRol([8]),
  comentarioController.crear
);

// Ruta para actualizar un comentario (solo el usuario dueño del comentario o admin)
router.put('/comentario/:id', 
  autentiMiddleware, verificarRol([1,2 ,8]),
  comentarioController.actualizar
);

// Ruta para eliminar un comentario (admin/superadmin pueden eliminar cualquier comentario,
// usuarios pueden eliminar sus propios comentarios)
router.delete('/comentario/:id', 
  autentiMiddleware,
  verificarRol([1, 2, 8]),
  comentarioController.eliminar
);

// Ruta para listar comentarios reportados (solo admin y superadmin)
router.get('/comentario/reportados',
  autentiMiddleware,
  verificarRol([1, 2]),
  comentarioController.listarReportados
);

// Ruta para actualizar estado de comentario reportado (solo admin y superadmin)
router.put('/comentario/:id/estado',
  autentiMiddleware,
  verificarRol([1, 2]),
  comentarioController.actualizarEstado
);

module.exports = router;
