const express = require('express');
const router = express.Router();
const CalificacionController = require('../controllers/calificacionController');

router.get('/calificaciones', CalificacionController.listarCalificaciones);
router.get('/calificacion/:id', CalificacionController.buscarCalificacion);
router.post('/calificacion', CalificacionController.crearCalificacion);
router.put('/calificacion/:id', CalificacionController.actualizarCalificacion);
router.delete('/calificacion/:id', CalificacionController.eliminarCalificacion);
router.patch("/calificacion/estado/:id", CalificacionController.cambiarEstado);


module.exports = router;