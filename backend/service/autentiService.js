const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TemporalService = require("./temporalService");
const UsuarioService = require("./usuarioService");
require("dotenv").config();

// Configurar el transportador de nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar la conexión al inicio
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al verificar el transportador:', error);
  }
});

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
  
  
  

  // Función para enviar correo de verificación
  static async enviarCorreoVerificacion(correo, codigo) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Verificación de correo - Popayán Nocturna',
        html: `
          <h2>Bienvenido a Popayán Nocturna</h2>
          <p>Para verificar tu correo electrónico, por favor ingresa el siguiente código:</p>
          <h3 style="font-size: 24px; color: #2196F3; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0;">${codigo}</h3>
          <p>Este código expirará en 15 minutos. Si no solicitaste esta verificación, puedes ignorar este correo.</p>
          <p>Gracias por registrarte en Popayán Nocturna.</p>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar correo de verificación:', error);
      throw new Error('Error al enviar el correo de verificación');
    }
  }

  static async registrarUsuario(datos) {
    await this.validarCamposRegistro(datos);
    const { correo, contrasena } = datos;

    const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
    if (usuarioExistente) {
      throw new Error("Correo ya está en uso");
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const codigo = this.generarCodigo();
    const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await TemporalService.guardarCodigo(correo, codigo, expiracion);

    const usuario = await UsuarioService.crearUsuario({
      ...datos,
      contrasena: contrasenaHash,
      estado: false,
      rolid: 8,
    });

    // Enviar correo de verificación
    await this.enviarCorreoVerificacion(correo, codigo);

    return { 
      mensaje: "Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    };
  }

  static async validarCodigoCorreo(correo, codigo) {
    const codigoGuardado = await TemporalService.obtenerCodigo(correo);
    if (
      !codigoGuardado ||
      String(codigoGuardado.codigo) !== String(codigo) ||
      Date.now() > new Date(codigoGuardado.expiracion).getTime()
    ) {
      throw new Error("Código inválido o expirado");
    }

    await UsuarioService.activarUsuario(correo);
    await TemporalService.eliminarCodigo(correo);
  }

  static async login({ correo, contrasena }) {
    const usuario = await UsuarioService.buscarPorCorreo(correo);
    if (!usuario || !usuario.estado) {
      throw new Error("Usuario no validado o no existe");
    }

    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) {
      throw new Error("Contraseña incorrecta");
    }

    const payload = { 
      id: usuario.id, 
      correo: usuario.correo, 
      rol: usuario.rolid 
    };
    
    const secret = process.env.JWT_SECRET || "secreto";
    
    const token = jwt.sign(
      payload,
      secret,
      { expiresIn: "2h" }
    );

    return { token, usuario };
  }

  static async enviarCodigoRecuperacion(correo) {
    const usuario = await UsuarioService.buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no encontrado");

    const codigo = this.generarCodigo();
    const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
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
    const usuario = await UsuarioService.buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no encontrado");

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET || "secreto",
      { expiresIn: "1h" }
    );

    const urlRecuperacion = `${process.env.FRONTEND_URL}/recuperar-contrasena/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Soporte <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: "Recuperación de contraseña",
      html: `<p>Haz clic en el siguiente enlace para recuperar tu contraseña:</p>
             <a href="${urlRecuperacion}">${urlRecuperacion}</a>
             <p>Este enlace es válido por 1 hora.</p>`,
    });

    return { mensaje: "Correo de recuperación enviado" };
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
}
module.exports = AutentiService;