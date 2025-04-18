const express = require('express');
const router = express.Router();
const CategoriaParaUsuarioController = require('../../controllers/usuariosController/categoriasParaUsuarioController');


router.get('/usuarios/lista-categorias', CategoriaParaUsuarioController.categoriasParaUsuario);
router.get('/usuarios/lugares-categoria/:categoriaid', CategoriaParaUsuarioController.lugaresDeCadaCaregoria);


module.exports = router;
