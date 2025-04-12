const express = require('express');
const router = express.Router();
const usuarioDetalleController = require('../../controllers/detailsControllers/usuarioDetalleController');


router.get('/propietarios/:id/lugares', usuarioDetalleController.obtenerLugaresDelPropietario)

module.exports = router;
