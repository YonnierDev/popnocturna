const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const { rol } = req.usuario;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ 
        mensaje: "No tienes permiso para realizar esta acción",
        rolesPermitidos,
        rolActual: rol
      });
    }

    next();
  };
};

module.exports = { verificarRol }; 