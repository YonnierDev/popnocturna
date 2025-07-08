const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/notificacionController');
const auth = require('../middlewares/autentiMiddleware');

router.get('/notificacion', auth, NotificacionController.listar);
router.delete('/notificacion/:id', auth, NotificacionController.eliminar);

module.exports = router;
