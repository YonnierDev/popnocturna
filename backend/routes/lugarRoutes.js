const LugarController = require('../controllers/lugarController');
const express = require('express');
const router = express.Router();

router.get('/lugares', LugarController.listarLugares);
router.get('/lugar/:id', LugarController.buscarLugar);
router.post('/lugar', LugarController.crearLugar);
router.put('/lugar/:id', LugarController.actualizarLugar);
router.delete('/lugar/:id', LugarController.eliminarLugar);
router.get('/lugares/relaciones', LugarController.listarRelacionesLugares);
module.exports = router;