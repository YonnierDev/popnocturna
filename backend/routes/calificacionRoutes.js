const express = require('express');
const router = express.Router();
const CalificacionController = require('../controllers/calificacionController');
const autentiMiddleware = require('../middlewares/autentiMiddleware');

router.get('/calificaciones', 
  autentiMiddleware,
  CalificacionController.listarCalificaciones
);

router.get('/calificaciones/lugar/:lugarid', 
  autentiMiddleware,
  CalificacionController.listarCalificacionesPorLugar
);

router.get('/calificacion/:id', 
  autentiMiddleware,
  CalificacionController.verCalificacion
);

router.post('/calificacion', 
  autentiMiddleware,
  CalificacionController.crearCalificacion
);

router.put('/calificacion/:id', 
  autentiMiddleware,
  CalificacionController.actualizarCalificacion
);

router.delete('/calificacion/:id', 
  autentiMiddleware,
  CalificacionController.eliminarCalificacion
);

router.patch('/calificacion/estado/:id', 
  autentiMiddleware,
  CalificacionController.cambiarEstadoCalificacion
);

module.exports = router;