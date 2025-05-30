const LugarController = require('../controllers/lugarController');
const express = require('express');
const router = express.Router();
const { uploadImages, uploadPDF } = require("../middlewares/multerMiddleware");
const autentiMiddleware = require("../middlewares/autentiMiddleware");

// Ruta pública para listar lugares aprobados
router.get('/public/lugares', LugarController.listarLugaresPublicos);

// Rutas protegidas
router.get('/lugares', autentiMiddleware, LugarController.listarLugares);
router.get('/lugar/:id', autentiMiddleware, LugarController.buscarLugar);
router.post('/lugar', 
  autentiMiddleware, 
  uploadImages.array('fotos_lugar', 5),
  uploadPDF.single('carta_pdf'),
  LugarController.crearLugar
);
router.put('/lugar/:id', 
  autentiMiddleware, 
  uploadImages.array('fotos_lugar', 5),
  uploadPDF.single('carta_pdf'),
  LugarController.actualizarLugar
);
router.delete('/lugar/:id', autentiMiddleware, LugarController.eliminarLugar);
router.patch('/lugar/estado/:id', autentiMiddleware, LugarController.cambiarEstado);

module.exports = router;