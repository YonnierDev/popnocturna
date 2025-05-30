const multer = require("multer");

// Configuración de almacenamiento en memoria (buffer)
const storage = multer.memoryStorage();

// Función para manejar errores de Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        mensaje: "Error al subir archivo",
        error: "El archivo es demasiado grande",
        detalles: `El tamaño máximo permitido es ${10}MB`,
        codigo: error.code
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        mensaje: "Error al subir archivos",
        error: "Demasiados archivos",
        detalles: "El máximo de archivos permitidos es 5",
        codigo: error.code
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        mensaje: "Error al subir archivo",
        error: "Campo de archivo inesperado",
        detalles: "Verifica los nombres de los campos en tu solicitud",
        codigo: error.code
      });
    }
    return res.status(400).json({
      mensaje: "Error al subir archivo",
      error: error.message,
      codigo: error.code
    });
  }
  next(error);
};

// Middleware para subir imágenes
const uploadImages = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Máximo 5 archivos
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'carta_pdf') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se pueden subir PDFs para el campo carta_pdf'));
      }
    } else {
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
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB para PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error("Solo se pueden subir archivos PDF"));
    }
    cb(null, true);
  },
});

module.exports = { uploadImages, uploadPDF, handleMulterError };