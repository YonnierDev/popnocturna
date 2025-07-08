const jwt = require("jsonwebtoken");

const autentiMiddleware = (req, res, next) => {
  console.log('\n=== Inicio de autenticación ===');
  console.log('Headers recibidos:', req.headers);
  console.log('Authorization header:', req.headers.authorization);
  
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  console.log('Token extraído:', token);

  if (!token) {
    console.log('Error: Token no proporcionado');
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    
    // Asegurarse de que el ID del usuario esté disponible como usuarioid para consistencia
    req.usuario = {
      ...decoded,
      usuarioid: decoded.id || decoded.usuarioid
    };
    console.log('Usuario asignado a req:', req.usuario);
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

module.exports = autentiMiddleware;
