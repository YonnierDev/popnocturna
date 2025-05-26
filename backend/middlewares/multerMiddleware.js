const multer = require("multer");

// Configuración de almacenamiento en memoria (buffer)
const storage = multer.memoryStorage();

// Middleware para subir imágenes
const uploadImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Limitar a 5MB por imagen
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'carta_pdf') {
      // Si es un PDF, permitirlo
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se pueden subir PDFs para el campo carta_pdf'));
      }
    } else {
      // Para otros campos, solo permitir imágenes
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se pueden subir imágenes para los campos imagen y fotos_lugar'));
      }
    }
  }
});

// Middleware para subir PDFs
const uploadPDF = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Limitar a 10MB para PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error("Solo se pueden subir archivos PDF"));
    }
    cb(null, true);
  },
});

module.exports = { uploadImages, uploadPDF };