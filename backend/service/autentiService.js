const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TemporalService = require("./temporalService");
const UsuarioService = require("./usuarioService");
require("dotenv").config();

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

    if (!datos.rolid) {
      datos.rolid = 4;
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
          <p>Este código expirará en 5 minutos. Si no solicitaste esta verificación, puedes ignorar este correo.</p>
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
    try {
      await this.validarCamposRegistro(datos);
      const { correo, contrasena, rolid } = datos;
  
      const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
      if (usuarioExistente) {
        throw new Error("Correo ya está en uso");
      }
  
      const codigoExistente = await TemporalService.obtenerCodigo(correo);
      if (codigoExistente) {
        const tiempoRestante = new Date(codigoExistente.expiracion) - new Date();
        if (tiempoRestante > 0) {
          throw new Error(`Ya existe un código de verificación activo. Por favor, espera ${Math.ceil(tiempoRestante / 60000)} minutos o verifica tu correo.`);
        }
      }
  
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      const codigo = this.generarCodigo();
      
      const ahora = new Date();
      const expiracion = new Date(ahora.getTime() + 5 * 60 * 1000);
      expiracion.setHours(expiracion.getHours() - 5);
  
      try {
        await this.enviarCorreoVerificacion(correo, codigo);
        await TemporalService.guardarCodigo(correo, codigo, expiracion);
        await TemporalService.guardarDatosTemporales(correo, {
          ...datos,
          contrasena: contrasenaHash,
          estado: false,
          rolid: rolid,
          fecha_creacion: ahora,
          fecha_expiracion: expiracion
        });
  
        setTimeout(async () => {
          try {
            await TemporalService.eliminarCodigo(correo);
          } catch (error) {
            console.error('Error al eliminar código expirado:', error);
          }
        }, 5 * 60 * 1000);
  
        return { 
          mensaje: "Registro iniciado. Por favor, verifica tu correo electrónico.",
          correo: correo
        };
      } catch (error) {
        throw new Error("Error al enviar el correo de verificación. Por favor, intente nuevamente.");
      }
    } catch (error) {
      throw error;
    }
  }

  static async reenviarCodigo(correo) {
    const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
    if (usuarioExistente) {
      throw new Error("Este correo ya está registrado");
    }

    const codigoExistente = await TemporalService.obtenerCodigo(correo);
    if (!codigoExistente) {
      throw new Error("No hay un registro pendiente para este correo");
    }

    const tiempoRestante = new Date(codigoExistente.expiracion) - new Date();
    if (tiempoRestante > 0) {
      throw new Error(`Debes esperar ${Math.ceil(tiempoRestante / 60000)} minutos antes de solicitar un nuevo código`);
    }

    const datosTemporales = await TemporalService.obtenerDatosTemporales(correo);
    if (!datosTemporales) {
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Datos de registro no encontrados");
    }

    await TemporalService.eliminarCodigo(correo);

    const codigo = this.generarCodigo();
    const ahora = new Date();
    const expiracion = new Date(ahora.getTime() + 5 * 60 * 1000);
    expiracion.setHours(expiracion.getHours() - 5);

    try {
      await this.enviarCorreoVerificacion(correo, codigo);
      await TemporalService.guardarCodigo(correo, codigo, expiracion);
      await TemporalService.guardarDatosTemporales(correo, {
        ...datosTemporales,
        fecha_expiracion: expiracion
      });

      setTimeout(async () => {
        try {
          await TemporalService.eliminarCodigo(correo);
        } catch (error) {
          console.error('Error al eliminar código expirado:', error);
        }
      }, 5 * 60 * 1000);

      return {
        mensaje: "Nuevo código de verificación enviado",
        correo: correo
      };
    } catch (error) {
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Error al enviar el nuevo código de verificación");
    }
  }

  static async validarCodigoCorreo(correo, codigo) {
    const codigoGuardado = await TemporalService.obtenerCodigo(correo);
    if (!codigoGuardado) {
      throw new Error("Código no encontrado o expirado");
    }

    const ahora = new Date();
    const expiracion = new Date(codigoGuardado.expiracion);
    expiracion.setHours(expiracion.getHours() + 5);

    if (String(codigoGuardado.codigo) !== String(codigo) || ahora > expiracion) {
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Código inválido o expirado");
    }

    const datosTemporales = await TemporalService.obtenerDatosTemporales(correo);
    if (!datosTemporales) {
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Datos de registro no encontrados");
    }

    try {
      const usuario = await UsuarioService.crearUsuario({
        ...datosTemporales,
        estado: true
      });

      await TemporalService.eliminarCodigo(correo);
      
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
        mensaje: "Usuario validado correctamente",
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol: usuario.rolid,
          estado: usuario.estado
        },
        token
      };
    } catch (error) {
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Error al crear el usuario: " + error.message);
    }
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

      const urlRecuperacion = `${process.env.FRONTEND_URL}/recuperar-contrasena/${token}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Recuperación de contraseña - Popayán Nocturna',
        html: `
          <h2>Recuperación de Contraseña</h2>
          <p>Hola ${usuario.nombre},</p>
          <p>Hemos recibido una solicitud para recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
          <a href="${urlRecuperacion}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Recuperar Contraseña</a>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Este enlace es válido por 1 hora.</p>
          <p>Saludos,<br>Equipo de Popayán Nocturna</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return { mensaje: "Correo de recuperación enviado" };
    } catch (error) {
      throw new Error("Error al enviar el correo de recuperación: " + error.message);
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