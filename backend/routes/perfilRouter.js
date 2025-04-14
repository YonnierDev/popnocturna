const express = require('express');
const router = express.Router();
const autentiMiddleware = require("../middlewares/autentiMiddleware");
const perfilController = require('../controllers/perfilController');
const multerMiddleware = require("../middlewares/multerMiddleware");
const validarRol = require("../middlewares/validarRol");

// Ruta para obtener el perfil
router.get("/perfil", autentiMiddleware, validarRol(1, 2, 3),perfilController.obtenerPerfil);

// Ruta para actualizar el perfil con imagen
router.put("/perfil", autentiMiddleware, multerMiddleware.single("imagen"), perfilController.actualizarPerfil);

module.exports = router;