const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/usuarioController");
const autentiMiddleware = require("../middlewares/autentiMiddleware");
const validarUsuario = require("../middlewares/validacionesUsuario");
const { uploadImages } = require("../middlewares/multerMiddleware");

router.get("/usuarios", UsuarioController.listarUsuarios);
router.get("/usuario/:id", UsuarioController.buscarUsuario);
router.post("/usuario",
  uploadImages.single("imagen"),
  validarUsuario,
  UsuarioController.crearUsuario
);
router.put("/usuario/:id", UsuarioController.actualizarUsuario);
router.delete("/usuario/:id", UsuarioController.eliminarUsuario);
router.get("/usuarios/rol/:rolId", UsuarioController.buscarPorRol);
router.patch("/usuario/estado/:id", UsuarioController.cambiarEstadoUsuario);

module.exports = router;
