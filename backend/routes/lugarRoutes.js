const LugarController = require('../controllers/lugarController');
const express = require('express');
const router = express.Router();
const { uploadImages, uploadPDF, handleMulterError } = require("../middlewares/multerMiddleware");
const autentiMiddleware = require("../middlewares/autentiMiddleware");

// Ruta pública para listar lugares aprobados
router.get('/public/lugares', LugarController.listarLugaresPublicos);

// Rutas protegidas
router.get('/lugares', autentiMiddleware, LugarController.listarLugares);
router.get('/lugar/:id', autentiMiddleware, LugarController.buscarLugar);

router.post('/lugar', 
  autentiMiddleware, 
  handleMulterError, // Mover handleMulterError al principio
  uploadImages.fields([ // Usa fields para manejar múltiples campos de archivo
    { name: 'imagen', maxCount: 1 },
    { name: 'fotos_lugar', maxCount: 5 },
    { name: 'carta_pdf', maxCount: 1 }
  ]),
  LugarController.crearLugar
);

router.put('/lugar/:id', 
  autentiMiddleware, 
  uploadImages.array('fotos_lugar', 5),
  uploadPDF.single('carta_pdf'),
  handleMulterError,
  LugarController.actualizarLugar
);
router.delete('/lugar/:id', autentiMiddleware, LugarController.eliminarLugar);
router.patch('/lugar/estado/:id', autentiMiddleware, LugarController.cambiarEstado);

module.exports = router;