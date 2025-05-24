const LugarController = require('../controllers/lugarController');
const express = require('express');
const router = express.Router();
const multerMiddleware = require("../middlewares/multerMiddleware");
const autentiMiddleware = require("../middlewares/autentiMiddleware");

// Quitamos el middleware global
// router.use(autentiMiddleware);

// Aplicamos el middleware ruta por ruta
router.get('/lugares', autentiMiddleware, LugarController.listarLugares);
router.get('/lugar/:id', autentiMiddleware, LugarController.buscarLugar);
router.post('/lugar', autentiMiddleware, multerMiddleware.single("imagen"), LugarController.crearLugar);
router.put('/lugar/:id', autentiMiddleware, multerMiddleware.single("imagen"), LugarController.actualizarLugar);
router.delete('/lugar/:id', autentiMiddleware, LugarController.eliminarLugar);
router.patch('/lugar/estado/:id', autentiMiddleware, LugarController.cambiarEstado);

module.exports = router;