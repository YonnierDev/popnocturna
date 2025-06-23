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
  (req, res, next) => {
    uploadImages.fields([
      { name: 'imagen', maxCount: 1 },
      { name: 'fotos_lugar', maxCount: 5 },
      { name: 'carta_pdf', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  LugarController.crearLugar
);

router.put('/lugar/:id', 
  autentiMiddleware,
  (req, res, next) => {
    // Usamos un solo middleware para manejar múltiples archivos
    uploadImages.fields([
      { name: 'imagen', maxCount: 1 },
      { name: 'fotos_lugar', maxCount: 5 },
      { name: 'carta_pdf', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  LugarController.actualizarLugar
);
router.delete('/lugar/:id', autentiMiddleware, LugarController.eliminarLugar);
router.patch('/lugar/estado/:id', autentiMiddleware, LugarController.cambiarEstado);

module.exports = router;