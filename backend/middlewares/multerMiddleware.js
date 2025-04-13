const multer = require("multer");

// Configuración de almacenamiento en memoria (buffer)
const storage = multer.memoryStorage();

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Limitar a 5MB por imagen
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes PNG, JPG y JPEG
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se pueden subir imágenes"));
    }
    cb(null, true);
  },
});

module.exports = upload;