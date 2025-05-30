const validarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
      const usuario = req.usuario;
      
      // Verificamos si el rol del usuario es el esperado
      if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ mensaje: "Acceso denegado a esta ruta" });
      }
      
      next();
    };
  };
  
  module.exports = validarRol;
  