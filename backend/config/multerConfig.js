const express = require('express');
const app = express();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');

// Configurar variables de entorno
dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer();

app.post('/lugares', upload.single('foto'), async (req, res) => {
  try {
    const resultado = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
      folder: 'lugares',
    });
    const fotoUrl = resultado.secure_url;

    const lugar = new Lugar({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      foto: fotoUrl,
    });
    await lugar.save();

    res.json({
      mensaje: 'Lugar creado con éxito',
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear lugar',
    });
  }
});