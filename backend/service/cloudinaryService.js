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

  // Método para subir PDFs de cartas
  async subirPDFCarta(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "cartas",
            public_id: nombre,
            transformation: [
              { quality: "auto:good" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir PDF de carta:", error);
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
      console.error("Error en subirPDFCarta:", error);
      throw error;
    }
  }

  // Método para eliminar una imagen o PDF de Cloudinary
  async eliminarArchivo(url) {
    try {
      // Extraer el public_id de la URL
      const publicId = url.split('/').pop().split('.')[0];
      
      // Determinar si es imagen o PDF basado en la carpeta
      const esPDF = url.includes('/cartas/');
      const resourceType = esPDF ? 'raw' : 'image';
      
      // Eliminar el archivo
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      return result;
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      throw error;
    }
  }

  // Sube una imagen de categoría a Cloudinary
  // @param {Buffer} buffer - Buffer de la imagen a subir
  // @param {string} nombre - Nombre único para la imagen
  // @returns {Promise<Object>} - Resultado de la subida a Cloudinary
  async subirImagenCategoria(buffer, nombre) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "categorias", // Carpeta específica para imágenes de categorías
            public_id: nombre,
            format: "jpg",
            quality: "auto:good",
            transformation: [
              { width: 800, height: 800, crop: "fill" }, // Ajuste cuadrado para categorías
              { quality: "auto:good" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir imagen de categoría:", error);
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
      console.error("Error en subirImagenCategoria:", error);
      throw error;
    }
  }

  /**
   * Elimina una imagen de categoría de Cloudinary
   * @param {string} publicId - ID público de la imagen en Cloudinary
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async eliminarImagenCategoria(publicId) {
    try {
      if (!publicId) return null;
      
      // Extraer solo el public_id de la URL completa si es necesario
      const publicIdToDelete = publicId.includes('/') 
        ? publicId.split('/').slice(-2).join('/').split('.')[0]
        : publicId;
      
      console.log(`Eliminando imagen de categoría: ${publicIdToDelete}`);
      
      const result = await cloudinary.uploader.destroy(publicIdToDelete, {
        resource_type: 'image',
        invalidate: true
      });
      
      console.log('Resultado eliminación:', result);
      return result;
    } catch (error) {
      console.error('Error al eliminar imagen de categoría:', error);
      // No lanzamos el error para no romper el flujo si falla la eliminación
      return { result: 'error', error: error.message };
    }
  }

  // Método para eliminar una imagen por su URL
  async eliminarImagen(url) {
    if (!url) return { result: 'not_found' };
    
    try {
      // Extraer el public_id de la URL (última parte sin extensión)
      const publicId = url.split('/').pop().split('.')[0];
      const folder = 'lugares';
      const fullPublicId = `${folder}/${publicId}`;
      
      console.log(`Eliminando imagen: ${fullPublicId}`);
      const result = await cloudinary.uploader.destroy(fullPublicId, {
        resource_type: 'image',
        invalidate: true
      });
      
      console.log('Resultado eliminación:', result);
      return result;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return { result: 'error', error: error.message };
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