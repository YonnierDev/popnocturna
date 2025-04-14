const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir una imagen a Cloudinary
const subirImagen = async (imagenBuffer, publicId) => {
  try {
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.log("Error al subir imagen a Cloudinary:", error);
            reject(error);
          }
          resolve(result); // Resolvemos con el resultado
        }
      ).end(imagenBuffer); // Enviamos el buffer de la imagen
    });

    console.log("Imagen subida correctamente a Cloudinary:", uploadResponse);
    return uploadResponse; // Retorna la respuesta con la URL de la imagen subida
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    return null;
  }
};

module.exports = { subirImagen };