const LugarController = require('../controllers/lugarController');
const express = require('express');
const router = express.Router();
const { uploadImages, handleMulterError } = require("../middlewares/multerMiddleware");
const { handleFileUploads } = require("../middlewares/uploadMiddleware");
const autentiMiddleware = require("../middlewares/autentiMiddleware");

// Ruta pública para listar lugares aprobados
router.get('/public/lugares', LugarController.listarLugaresPublicos);

// Rutas protegidas
router.get('/lugares', autentiMiddleware, LugarController.listarLugares);
router.get('/lugar/:id', autentiMiddleware, LugarController.buscarLugar);

router.post('/lugar', 
  autentiMiddleware,
  handleFileUploads,
  LugarController.crearLugar
);

router.put('/lugar/:id', 
  autentiMiddleware,
  handleFileUploads,
  LugarController.actualizarLugar
);
router.delete('/lugar/:id', autentiMiddleware, LugarController.eliminarLugar);
router.patch('/lugar/estado/:id', autentiMiddleware, LugarController.cambiarEstado);

module.exports = router;