const express = require('express');
const router = express.Router();
const { obtenerPropietarios } = require('../controllers/usuarioController');

router.get('/propietarios', obtenerPropietarios);

module.exports = router;