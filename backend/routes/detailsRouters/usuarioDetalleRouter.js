const express = require('express');
const router = express.Router();
const usuarioDetalleController = require('../../controllers/detailsControllers/usuarioDetalleController');


router.get('/usuarios/:id/lugares', usuarioDetalleController.obtenerLugaresDelPropietario)

module.exports = router;
