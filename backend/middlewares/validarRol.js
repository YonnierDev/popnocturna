const validarRol = (rolRequerido) => {
    return (req, res, next) => {
      const usuario = req.usuario;
      
      // Verificamos si el rol del usuario es el esperado
      if (!usuario || usuario.rol !== rolRequerido) {
        return res.status(403).json({ mensaje: "No tienes permisos suficientes para acceder a esta ruta" });
      }
      
      next();
    };
  };
  
  module.exports = validarRol;
  