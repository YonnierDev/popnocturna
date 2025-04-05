const codigos = {};

module.exports = {
  guardarCodigo: (correo, codigo, expiracion) => {
    codigos[correo] = { codigo, expiracion };
    console.log(`Código guardado para ${correo}: ${codigo}`);
  },

  obtenerCodigo: (correo) => {
    return codigos[correo];
  },

  eliminar: (correo) => {
    delete codigos[correo];
  }
};
