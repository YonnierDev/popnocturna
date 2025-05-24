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
    console.log('\n=== Validando campos de registro ===');
    console.log('Datos a validar:', datos);

    const { nombre, apellido, correo, fecha_nacimiento, contrasena, genero } = datos;
  
    if (!nombre || !apellido || !correo || !fecha_nacimiento || !contrasena || !genero) {
      console.log('Error: Campos faltantes');
      throw new Error("Todos los campos son obligatorios");
    }

    // Asignar automáticamente el rol 4 (usuario regular) si no se proporciona
    if (!datos.rolid) {
      console.log('Asignando rol 4 por defecto');
      datos.rolid = 4;
    }

    // Validar que el rol exista
    console.log('Verificando rol:', datos.rolid);
    const rolExistente = await UsuarioService.verificarRol(datos.rolid);
    if (!rolExistente) {
      console.log('Error: Rol no encontrado');
      throw new Error(`El rol con ID ${datos.rolid} no existe`);
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      console.log('Error: Correo inválido');
      throw new Error("Correo no válido");
    }
  
    const validacionContrasena = this.validarContrasena(contrasena);
    if (validacionContrasena !== true) {
      console.log('Error: Contraseña inválida');
      throw new Error(validacionContrasena); 
    }
  
    const generosPermitidos = ["Masculino", "Femenino", "Otro"];
    if (!generosPermitidos.includes(genero)) {
      console.log('Error: Género inválido');
      throw new Error("Género no válido");
    }
  
    const fechaNacimiento = new Date(fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    const dia = hoy.getDate() - fechaNacimiento.getDate();
    const edadExacta = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;
  
    if (edadExacta < 18) {
      console.log('Error: Edad insuficiente');
      throw new Error("Edad mínima de registro: 18 años");
    }

    console.log('Validación de campos exitosa');
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
    console.log('\n=== Iniciando registro de usuario ===');
    console.log('Datos recibidos:', datos);

    try {
      await this.validarCamposRegistro(datos);
      const { correo, contrasena, rolid } = datos;
  
      console.log('Verificando si el correo ya existe');
      const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
      if (usuarioExistente) {
        console.log('Error: Correo ya registrado');
        throw new Error("Correo ya está en uso");
      }
  
      console.log('Verificando código temporal existente');
      const codigoExistente = await TemporalService.obtenerCodigo(correo);
      if (codigoExistente) {
        const tiempoRestante = new Date(codigoExistente.expiracion) - new Date();
        if (tiempoRestante > 0) {
          console.log('Error: Código temporal activo');
          throw new Error(`Ya existe un código de verificación activo. Por favor, espera ${Math.ceil(tiempoRestante / 60000)} minutos o verifica tu correo.`);
        }
      }
  
      console.log('Generando hash de contraseña');
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      const codigo = this.generarCodigo();
      
      console.log('Configurando fechas de expiración');
      const ahora = new Date();
      const expiracion = new Date(ahora.getTime() + 5 * 60 * 1000); // 5 minutos
      expiracion.setHours(expiracion.getHours() - 5);
  
      console.log('Intentando enviar correo de verificación');
      try {
        await this.enviarCorreoVerificacion(correo, codigo);
        
        console.log('Guardando datos temporales');
        await TemporalService.guardarCodigo(correo, codigo, expiracion);
        
        await TemporalService.guardarDatosTemporales(correo, {
          ...datos,
          contrasena: contrasenaHash,
          estado: false,
          rolid: rolid,
          fecha_creacion: ahora,
          fecha_expiracion: expiracion
        });
  
        console.log('Programando limpieza de código');
        setTimeout(async () => {
          try {
            await TemporalService.eliminarCodigo(correo);
            console.log(`Código expirado eliminado para: ${correo}`);
          } catch (error) {
            console.error('Error al eliminar código expirado:', error);
          }
        }, 5 * 60 * 1000);
  
        console.log('Registro completado exitosamente');
        return { 
          mensaje: "Registro iniciado. Por favor, verifica tu correo electrónico.",
          correo: correo
        };
      } catch (error) {
        console.error('Error en el proceso de registro:', error);
        throw new Error("Error al enviar el correo de verificación. Por favor, intente nuevamente.");
      }
    } catch (error) {
      console.error('Error en registrarUsuario:', error);
      throw error;
    }
  }

  static async reenviarCodigo(correo) {
    // Verificar si el usuario ya existe
    const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
    if (usuarioExistente) {
      throw new Error("Este correo ya está registrado");
    }

    // Verificar si existe un código temporal
    const codigoExistente = await TemporalService.obtenerCodigo(correo);
    if (!codigoExistente) {
      throw new Error("No hay un registro pendiente para este correo");
    }

    // Verificar si el código anterior ha expirado
    const tiempoRestante = new Date(codigoExistente.expiracion) - new Date();
    if (tiempoRestante > 0) {
      throw new Error(`Debes esperar ${Math.ceil(tiempoRestante / 60000)} minutos antes de solicitar un nuevo código`);
    }

    // Obtener los datos temporales antes de eliminar el código
    const datosTemporales = await TemporalService.obtenerDatosTemporales(correo);
    if (!datosTemporales) {
      // Si no hay datos temporales, eliminamos el código y lanzamos error
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Datos de registro no encontrados");
    }

    // Eliminar el código anterior
    await TemporalService.eliminarCodigo(correo);

    // Generar nuevo código
    const codigo = this.generarCodigo();
    const ahora = new Date();
    const expiracion = new Date(ahora.getTime() + 5 * 60 * 1000); // 5 minutos
    expiracion.setHours(expiracion.getHours() - 5); // Ajustar a zona horaria de Bogotá (UTC-5)

    try {
      // Enviar nuevo correo
      await this.enviarCorreoVerificacion(correo, codigo);
      
      // Guardar nuevo código y actualizar datos temporales
      await TemporalService.guardarCodigo(correo, codigo, expiracion);
      await TemporalService.guardarDatosTemporales(correo, {
        ...datosTemporales,
        fecha_expiracion: expiracion
      });

      // Programar limpieza
      setTimeout(async () => {
        try {
          await TemporalService.eliminarCodigo(correo);
          console.log(`Código expirado eliminado para: ${correo}`);
        } catch (error) {
          console.error('Error al eliminar código expirado:', error);
        }
      }, 5 * 60 * 1000);

      return {
        mensaje: "Nuevo código de verificación enviado",
        correo: correo
      };
    } catch (error) {
      // Si hay error al enviar el correo, limpiamos los datos temporales
      await TemporalService.eliminarCodigo(correo);
      console.error('Error al reenviar código:', error);
      throw new Error("Error al enviar el nuevo código de verificación");
    }
  }

  static async validarCodigoCorreo(correo, codigo) {
    const codigoGuardado = await TemporalService.obtenerCodigo(correo);
    if (!codigoGuardado) {
      throw new Error("Código no encontrado o expirado");
    }

    // Verificar expiración considerando zona horaria de Bogotá
    const ahora = new Date();
    const expiracion = new Date(codigoGuardado.expiracion);
    expiracion.setHours(expiracion.getHours() + 5); // Ajustar a UTC para comparación

    if (String(codigoGuardado.codigo) !== String(codigo) || ahora > expiracion) {
      // Si el código es inválido o expirado, eliminamos el registro temporal
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Código inválido o expirado");
    }

    // Obtener datos temporales del usuario
    const datosTemporales = await TemporalService.obtenerDatosTemporales(correo);
    if (!datosTemporales) {
      // Si no hay datos temporales, eliminamos el código
      await TemporalService.eliminarCodigo(correo);
      throw new Error("Datos de registro no encontrados");
    }

    try {
      // Crear el usuario en la base de datos
      const usuario = await UsuarioService.crearUsuario({
        ...datosTemporales,
        estado: true
      });

      // Limpiar datos temporales
      await TemporalService.eliminarCodigo(correo);
      
      // Generar token JWT
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
      // Si hay error al crear el usuario, limpiamos los datos temporales
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