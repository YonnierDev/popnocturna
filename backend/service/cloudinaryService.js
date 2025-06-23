// service/cloudinaryService.js
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
  // Método para subir imágenes de eventos
  async subirImagenEvento(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "eventos", // Carpeta específica para imágenes de eventos
            public_id: nombre,
            format: "jpg", // Formato de salida
            quality: "auto:good", // Calidad automática buena
            transformation: [
              { width: 1200, crop: "limit" }, // Redimensionar manteniendo proporciones
              { quality: "auto:good" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir imagen de evento:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Usar el buffer directamente
        const readableStream = require('stream').Readable.from(buffer);
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error("Error en subirImagenEvento:", error);
      throw error;
    }
  }

  // Método para subir PDFs
  async subirPDF(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw", // Para archivos PDF
            folder: "pdfs", // Carpeta específica para PDFs
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
        );

        const readableStream = require('stream').Readable.from(buffer);
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error("Error en subirPDF:", error);
      throw error;
    }
  }

  // Método para subir imágenes de lugares
  async subirImagenLugar(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "lugares", // Carpeta específica para imágenes de lugares
            public_id: nombre,
            format: "jpg",
            quality: "auto:good",
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto:good" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir imagen de lugar:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        const readableStream = require('stream').Readable.from(buffer);
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error("Error en subirImagenLugar:", error);
      throw error;
    }
  }

  // Método para subir imágenes de perfil de usuario
  async subirImagenUsuario(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "usuarios",
            public_id: nombre,
            transformation: [
              { width: 400, height: 400, gravity: "face", crop: "thumb" }, // Recorte cuadrado centrado en la cara
              { quality: "auto:good" },
              { fetch_format: "auto" } // Optimización automática del formato
            ]
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir imagen de usuario:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        const readableStream = require('stream').Readable.from(buffer);
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error("Error en subirImagenUsuario:", error);
      throw error;
    }
  }

  // Método para subir imágenes de lugares (existente)
  async subirImagenLugar(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "lugares",
            public_id: nombre,
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto:good" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir imagen de lugar:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        const readableStream = require('stream').Readable.from(buffer);
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error("Error en subirImagenLugar:", error);
      throw error;
    }
  }

  // Método para subir PDFs (existente)
  async subirPDF(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
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
        );

        const readableStream = require('stream').Readable.from(buffer);
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error("Error en subirPDF:", error);
      throw error;
    }
  }

  // Método para eliminar una imagen
  async eliminarImagen(publicId) {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      throw error;
    }
  }

  // Método para eliminar imágenes de portada de un evento
  async eliminarPortada(evento) {
    try {
      if (!evento || !evento.portada || !Array.isArray(evento.portada)) {
        console.log('No hay imágenes de portada para eliminar');
        return;
      }

      console.log(`Eliminando ${evento.portada.length} imágenes de portada...`);
      
      // Eliminar cada imagen de la portada
      for (const url of evento.portada) {
        if (url) {
          try {
            // Extraer el public_id de la URL (última parte sin extensión)
            const publicId = url.split('/').pop().split('.')[0];
            const folder = 'eventos';
            const fullPublicId = `${folder}/${publicId}`;
            
            console.log(`Eliminando imagen: ${fullPublicId}`);
            await cloudinary.uploader.destroy(fullPublicId);
            console.log(`Imagen eliminada: ${fullPublicId}`);
          } catch (error) {
            console.error(`Error al eliminar imagen ${url}:`, error);
            // Continuar con las demás imágenes aunque falle una
          }
        }
      }
      
      console.log('Eliminación de imágenes completada');
    } catch (error) {
      console.error('Error en eliminarPortada:', error);
      throw error;
    }
  }
}

module.exports = new CloudinaryService();