const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  async subirImagen(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "lugares",
            public_id: nombre,
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir imagen:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });
    } catch (error) {
      console.error("Error en subirImagen:", error);
      throw error;
    }
  }

  async subirPDF(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "documentos",
            public_id: nombre,
            format: "pdf"
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir PDF:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });
    } catch (error) {
      console.error("Error en subirPDF:", error);
      throw error;
    }
  }
}

module.exports = new CloudinaryService();