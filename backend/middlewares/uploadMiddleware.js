const { uploadImages, handleMulterError } = require('./multerMiddleware');

// Middleware para manejar subida de archivos en lugares
const handleFileUploads = (req, res, next) => {
  uploadImages.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'fotos_lugar', maxCount: 5 },
    { name: 'carta_pdf', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    // Si no hay archivos, inicializamos req.files como un objeto vacío
    if (!req.files) req.files = {};
    next();
  });
};

module.exports = { handleFileUploads };
