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
        detalles: `El tamaño máximo permitido es 10MB`,
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

// Configuración común para subir archivos
const uploadConfig = {
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 6 // Máximo 6 archivos (1 imagen principal + 5 fotos)
  },
  fileFilter: (req, file, cb) => {
    console.log('\n=== FILTRANDO ARCHIVO ===');
    console.log('Campo:', file.fieldname);
    console.log('Tipo MIME:', file.mimetype);
    
    if (!file) {
      console.log('Archivo no encontrado');
      cb(new Error('Archivo no encontrado'));
      return;
    }

    if (file.fieldname === 'imagen' || file.fieldname === 'fotos_lugar') {
      if (file.mimetype.startsWith('image/')) {
        console.log('Archivo de imagen válido');
        cb(null, true);
      } else {
        console.log('Error: Tipo de archivo no válido para imagen');
        cb(new Error('Solo se permiten archivos de imagen'));
      }
    } else if (file.fieldname === 'carta_pdf') {
      if (file.mimetype === 'application/pdf') {
        console.log('Archivo PDF válido');
        cb(null, true);
      } else {
        console.log('Error: Tipo de archivo no válido para PDF');
        cb(new Error('Solo se permiten archivos PDF'));
      }
    } else {
      console.log('Error: Campo no permitido');
      cb(new Error('Campo de archivo no permitido'));
    }
  }
};

// Middleware para subir imágenes
const uploadImages = multer({
  ...uploadConfig,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'carta_pdf') {
      return cb(new Error('No se permiten archivos PDF en este campo'));
    }
    return uploadConfig.fileFilter(req, file, cb);
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