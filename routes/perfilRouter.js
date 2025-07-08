const express = require("express");
const router = express.Router();
const autentiMiddleware = require("../middlewares/autentiMiddleware");
const perfilController = require('../controllers/perfilController');
const { uploadImages } = require("../middlewares/multerMiddleware");

// Ruta para obtener el perfil
router.get("/perfil", autentiMiddleware, perfilController.obtenerPerfil);

// Ruta para actualizar el perfil con imagen
router.put("/perfil", autentiMiddleware, uploadImages.single("imagen"), perfilController.actualizarPerfil);

module.exports = router;