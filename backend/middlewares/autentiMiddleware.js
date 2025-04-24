const jwt = require("jsonwebtoken");

const autentiMiddleware = (req, res, next) => {
  console.log('=== Inicio de autenticación ===');
  console.log('Headers recibidos:', req.headers);
  
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  console.log('Token extraído:', token);

  if (!token) {
    console.log('Error: Token no proporcionado');
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  try {
    console.log('Intentando verificar token con secret:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    
    req.usuario = decoded;
    console.log('Usuario asignado a req:', req.usuario);
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

module.exports = autentiMiddleware;
