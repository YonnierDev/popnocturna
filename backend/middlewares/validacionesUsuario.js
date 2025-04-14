const { body, validationResult } = require("express-validator");
const UsuarioService = require("../service/usuarioService"); // Asegúrate que exista y tenga buscarPorCorreo / buscarPorNombre

const validarUsuario = [
  body("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .custom(async (nombre) => {
      const existe = await UsuarioService.buscarPorNombre(nombre);
      if (existe) throw new Error("El nombre ya existe");
      return true;
    }),

  body("apellido").notEmpty().withMessage("El apellido es obligatorio"),

  body("correo")
    .notEmpty()
    .withMessage("El correo es obligatorio")
    .isEmail()
    .withMessage("Correo no válido")
    .custom(async (correo) => {
      const existe = await UsuarioService.buscarPorCorreo(correo);
      if (existe) throw new Error("El correo ya existe");
      return true;
    }),

  body("fecha_nacimiento")
    .notEmpty()
    .withMessage("La fecha de nacimiento es obligatoria")
    .isISO8601()
    .withMessage("Formato de fecha inválido")
    .custom((fecha) => {
      const fechaNacimiento = new Date(fecha);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      const dia = hoy.getDate() - fechaNacimiento.getDate();
      const edadExacta = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;
      if (edadExacta < 16) throw new Error("Edad mínima: 16 años");
      return true;
    }),

  body("genero")
    .notEmpty()
    .withMessage("El género es obligatorio")
    .isIn(["Masculino", "Femenino", "Otro"])
    .withMessage("Género no válido. Escoja uno"),

  body("contrasena")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8, max: 20 })
    .withMessage("Debe tener entre 8 y 20 caracteres")
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/)
    .withMessage(
      "Debe incluir al menos una mayúscula, un número y un símbolo (!@#$%^&*()_-)"
    ),

  body("rolid")
    .notEmpty()
    .withMessage("El rol es obligatorio")
    .isInt({ min: 1 })
    .withMessage("ID de rol inválido"),

  body("estado")
    .optional()
    .isBoolean()
    .withMessage("El estado debe ser verdadero o falso"),

  body("imagen")
    .optional()
    .isURL()
    .withMessage("La imagen debe ser una URL válida"),

  // Validar errores
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  },
];

module.exports = validarUsuario;
