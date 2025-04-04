const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/usuarioController");

router.get("/usuarios", UsuarioController.listarUsuarios);
router.get("/usuario/:id", UsuarioController.buscarUsuario);
router.post("/usuario", UsuarioController.crearUsuario);
router.put("/usuario/:id", UsuarioController.actualizarUsuario);
router.delete("/usuario/:id", UsuarioController.eliminarUsuario);
router.get("/usuarios/relaciones", UsuarioController.listarRelacionesUsuarios);
router.get("/usuarios/rol/:rolId", UsuarioController.buscarPorRol);
router.patch("/usuario/:id/estado", UsuarioController.cambiarEstadoUsuario);

module.exports = router;
