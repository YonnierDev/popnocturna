const RolController = require('../controllers/rolController');
const express = require('express');
const router = express.Router();

router.get('/rol', RolController.listarRol);
router.get('/rol/:id', RolController.buscarRol);
router.post('/rol', RolController.crearRol);
router.put('/rol/:id', RolController.actualizarRol);
router.delete('/rol/:id', RolController.eliminarRol);
module.exports = router;
// Este archivo define las rutas para las operaciones CRUD en la entidad "Rol". Cada ruta está asociada a un método específico en el controlador `RolController`.