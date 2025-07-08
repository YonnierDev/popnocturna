const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const auth = require('../middlewares/autentiMiddleware');

router.post('/solicitud', auth, solicitudController.crear);
router.get('/solicitud', auth, solicitudController.listarTodas);
router.get('/solicitud/mias', auth, solicitudController.listarMias);
router.get('/solicitud/:id', auth, solicitudController.obtenerPorId);
router.put('/solicitud/:id', auth, solicitudController.actualizar);
router.patch('/solicitud/:id/estado', auth, solicitudController.actualizarEstado);
router.delete('/solicitud/:id', auth, solicitudController.eliminar);

module.exports = router;
