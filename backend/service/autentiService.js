const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UsuarioService = require("./usuarioService");
const { enviarNotificacion } = require("./fcmFirebase/fcmFirebaseService");
require("dotenv").config();

class AutentiService {
  static generarCodigo() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static validarContrasena(contrasena) {
    if (contrasena.length < 8 || contrasena.length > 20) {
      return "La contraseña debe tener entre 8 y 20 caracteres.";
    }
    if (!/[A-Z]/.test(contrasena)) {
      return "La contraseña debe incluir al menos una letra mayúscula.";
    }
    if (!/[a-z]/.test(contrasena)) {
      return "La contraseña debe incluir al menos una letra minúscula.";
    }
    if (!/\d/.test(contrasena)) {
      return "La contraseña debe incluir al menos un número.";
    }
    if (!/[\W_]/.test(contrasena)) {
      return "La contraseña debe incluir al menos un símbolo.";
    }
    return true;
  }

  static async validarCamposRegistro(datos) {
    const { nombre, apellido, correo, fecha_nacimiento, contrasena, genero } = datos;

    if (!nombre || !apellido || !correo || !fecha_nacimiento || !contrasena || !genero) {
      throw new Error("Todos los campos son obligatorios");
    }

    if (!datos.rolid) {
      datos.rolid = 3; // Establecer rol propietario (3) por defecto
    }

    const rolExistente = await UsuarioService.verificarRol(datos.rolid);
    if (!rolExistente) {
      throw new Error(`El rol con ID ${datos.rolid} no existe`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      throw new Error("Correo no válido");
    }

    const validacionContrasena = this.validarContrasena(contrasena);
    if (validacionContrasena !== true) {
      throw new Error(validacionContrasena);
    }

    const generosPermitidos = ["Masculino", "Femenino", "Otro"];
    if (!generosPermitidos.includes(genero)) {
      throw new Error("Género no válido");
    }

    const fechaNacimiento = new Date(fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    const dia = hoy.getDate() - fechaNacimiento.getDate();
    const edadExacta = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;

    if (edadExacta < 18) {
      throw new Error("Edad mínima de registro: 18 años");
    }
  }

  static async registrarUsuario(datos) {
    try {
      // Validar campos del formulario
      await this.validarCamposRegistro(datos);
      const { correo, contrasena, rolid } = datos;

      // Verificar si el correo ya está registrado
      const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
      if (usuarioExistente) {
        throw new Error("Correo ya está en uso");
      }

      // Hashear la contraseña
      const contrasenaHash = await bcrypt.hash(contrasena, 10);

      // Crear usuario directamente
      const usuario = await UsuarioService.crearUsuario({
        ...datos,
        contrasena: contrasenaHash,
        estado: true,
        rolid: rolid
      });

      // Generar token
      const payload = {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rolid
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "secreto",
        { expiresIn: "2h" }
      );

      return {
        mensaje: "Registro exitoso",
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol: usuario.rolid,
          estado: usuario.estado
        }
      };
    } catch (error) {
      console.error('Error en registrarUsuario:', error);
      throw error;
    }
  }

  static async  login({ correo, contrasena, device_token }) {
    const usuario = await UsuarioService.buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no existe");
    if (!usuario.estado) throw new Error("Usuario bloqueado");

    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) throw new Error("Contraseña incorrecta");


    if (device_token) {
      usuario.device_token = device_token;
      await usuario.save();
    }

    const payload = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rolid,
    };

    const secret = process.env.JWT_SECRET || "secreto";

    const token = jwt.sign(payload, secret, { expiresIn: "2h" });

    if (usuario.device_token) {
    await enviarNotificacion({
      token: usuario.device_token,
      titulo: '¡Bienvenido!',
      cuerpo: `Hola ${usuario.nombre}, has iniciado sesión exitosamente.`,
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShabro8p3uSGKKI2WHauC3RHRla7VnpVFTpw&s' 
    });
  }

    return { token, usuario };
  }



  

  static async enviarCodigoRecuperacion(correo) {
    const usuario = await UsuarioService.buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no encontrado");

    const codigo = this.generarCodigo();
    const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await TemporalService.guardarCodigo(correo, codigo, expiracion);
    return { codigo, expiracion };
  }

  static async cambiarContrasenaConCodigo(correo, codigo, nuevaContrasena) {
    const codigoGuardado = await TemporalService.obtenerCodigo(correo);
    if (
      !codigoGuardado ||
      String(codigoGuardado.codigo) !== String(codigo) ||
      Date.now() > new Date(codigoGuardado.expiracion).getTime()
    ) {
      throw new Error("Código inválido o expirado");
    }

    if (!this.validarContrasena(nuevaContrasena)) {
      throw new Error("Contraseña insegura");
    }

    const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);
    await UsuarioService.actualizarContrasena(correo, nuevaHash);
    await TemporalService.eliminarCodigo(correo);
  }

  static async actualizarContrasenaConActual(correo, contrasenaActual, nuevaContrasena) {
    const usuario = await UsuarioService.buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no encontrado");

    const esValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    if (!esValida) throw new Error("Contraseña actual incorrecta");

    if (!this.validarContrasena(nuevaContrasena)) {
      throw new Error("Nueva contraseña insegura");
    }

    const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);
    await UsuarioService.actualizarContrasena(correo, nuevaHash);
  }

  static async cerrarSesion(token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return { mensaje: "Sesión cerrada exitosamente" };
    } catch (error) {
      throw new Error("Token inválido o ya expirado");
    }
  }

  static async enviarRecuperacionCorreo(correo) {
    try {
      const usuario = await UsuarioService.buscarPorCorreo(correo);
      if (!usuario) throw new Error("Usuario no encontrado");

      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        process.env.JWT_SECRET || "secreto",
        { expiresIn: "1h" }
      );

      return {
        token,
        mensaje: "Token generado para recuperación de contraseña"
      };
    } catch (error) {
      throw new Error("Error al generar el token de recuperación: " + error.message);
    }
  }

  static async verificarTokenRecuperacion(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }
  }

  static async actualizarContrasena(id, nuevaContrasenaHash) {
    await UsuarioService.actualizarContrasenaPorId(id, nuevaContrasenaHash);
    return { mensaje: "Contraseña actualizada correctamente" };
  }

  static async buscarUsuarioPorId(id) {
    try {
      const usuario = await UsuarioService.buscarUsuario(id);
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }
      if (!usuario.contrasena) {
        throw new Error("El usuario no tiene una contraseña registrada");
      }
      return usuario;
    } catch (error) {
      throw new Error("Error al buscar usuario: " + error.message);
    }
  }
}

module.exports = AutentiService;