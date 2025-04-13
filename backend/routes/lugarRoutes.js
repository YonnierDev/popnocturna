const LugarController = require('../controllers/lugarController');
const express = require('express');
const router = express.Router();
const multerMiddleware = require("../middlewares/multerMiddleware");

router.get('/lugares', LugarController.listarLugares);
router.get('/lugar/:id', LugarController.buscarLugar);
router.post('/lugar', LugarController.crearLugar);
router.put('/lugar/:id', multerMiddleware.single("imagen"),LugarController.actualizarLugar);
router.delete('/lugar/:id', LugarController.eliminarLugar);
router.patch('/lugar/estado/:id', LugarController.cambiarEstado);

module.exports = router;