const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const { rol, id } = req.usuario;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ 
        mensaje: "No tienes permiso para realizar esta acción",
        rolesPermitidos,
        rolActual: rol
      });
    }

    // Filtro para propietarios (rol 3)
    if (rol === 3) {
      req.filtroRol = { usuarioid: id }; // para lugares o eventos del propietario
    }

    // Filtro para usuarios normales (rol 4)
    if (rol === 4) {
      req.filtroRol = { idUsuario: id }; // para reservas o datos personales
    }

    // Super admin (1) y admin (2) no tienen restricciones

    next();
  };
};

module.exports = { verificarRol };
