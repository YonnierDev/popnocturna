const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/usuarioController");
const autentiMiddleware = require("../middlewares/autentiMiddleware");

router.get("/usuarios",UsuarioController.listarUsuarios);
router.get("/usuario/:id", UsuarioController.buscarUsuario);
router.post("/usuario", UsuarioController.crearUsuario);
router.put("/usuario/:id", UsuarioController.actualizarUsuario);
router.delete("/usuario/:id", UsuarioController.eliminarUsuario);
router.get("/usuarios/rol/:rolId", UsuarioController.buscarPorRol);
router.patch("/usuario/estado/:id", UsuarioController.cambiarEstadoUsuario);

module.exports = router;
