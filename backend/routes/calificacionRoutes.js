const express = require('express');
const router = express.Router();
const CalificacionController = require('../controllers/calificacionController');
const autentiMiddleware = require('../middlewares/autentiMiddleware');

// Endpoints protegidos (requieren autenticación)
// Listar calificaciones (todos los roles)
router.get('/calificaciones', 
  autentiMiddleware,
  CalificacionController.listarCalificaciones
);

// Ver calificación por ID (todos los roles)
router.get('/calificacion/:id', 
  autentiMiddleware,
  CalificacionController.verCalificacion
);

// Crear calificación (todos los roles excepto propietario)
router.post('/calificacion', 
  autentiMiddleware,
  CalificacionController.crearCalificacion
);

// Actualizar calificación (todos los roles excepto propietario)
router.put('/calificacion/:id', 
  autentiMiddleware,
  CalificacionController.actualizarCalificacion
);

// Eliminar calificación (admin, super admin y usuario que la creó)
router.delete('/calificacion/:id', 
  autentiMiddleware,
  CalificacionController.eliminarCalificacion
);

// Cambiar estado de calificación (solo admin y super admin)
router.patch('/calificacion/estado/:id', 
  autentiMiddleware,
  CalificacionController.cambiarEstadoCalificacion
);

module.exports = router;