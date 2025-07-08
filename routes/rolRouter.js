const RolController = require('../controllers/rolController');
const express = require('express');
const router = express.Router();

router.get('/roles', RolController.listarRol);
router.get('/rol/:id', RolController.buscarRol);
router.post('/rol', RolController.crearRol);
router.put('/rol/:id', RolController.actualizarRol);
router.delete('/rol/:id', RolController.eliminarRol);
router.patch('/rol/estado/:id', RolController.actualizarEstado);

module.exports = router;