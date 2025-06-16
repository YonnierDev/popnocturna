const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TemporalService = require("./temporalService");
const UsuarioService = require("./usuarioService");
require("dotenv").config();

// Configuración mejorada del transporte de correo con más detalles de depuración
const createTransporter = () => {
  console.log('\n=== Iniciando configuración del transporte de correo ===');
  
  // Verificar variables de entorno
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  console.log(`Entorno: ${nodeEnv}`);
  console.log(`Correo configurado: ${emailUser ? 'Sí' : 'No'}`);
  
  if (!emailUser || !emailPass) {
    const errorMsg = 'Error: Las variables de entorno EMAIL_USER y EMAIL_PASS son requeridas';
    console.error('❌ ' + errorMsg);
    console.error(`EMAIL_USER: ${emailUser ? 'Configurado' : 'Falta'}`);
    console.error(`EMAIL_PASS: ${emailPass ? 'Configurado' : 'Falta'}`);
    throw new Error('Error de configuración del servidor de correo');
  }

  // Configuración del transporte
  const smtpConfig = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: emailUser,
      pass: emailPass
    },
    // Solo deshabilitar la verificación del certificado en desarrollo
    tls: {
      rejectUnauthorized: nodeEnv !== 'production'
    },
    // Configuración de reintentos
    pool: true,
    maxConnections: 1,
    maxMessages: 5,
    // Debugging
    debug: nodeEnv === 'development',
    logger: nodeEnv === 'development'
  };

  console.log('\nConfiguración SMTP:');
  console.log(`- Servidor: ${smtpConfig.host}:${smtpConfig.port}`);
  console.log(`- Seguridad: ${smtpConfig.secure ? 'SSL/TLS' : 'STARTTLS'}`);
  console.log(`- Autenticación: ${smtpConfig.auth.user}`);
  
  console.log('\nCreando transporte de correo...');
  const transporter = nodemailer.createTransport(smtpConfig);

  // Manejador de eventos para depuración
  transporter.on('log', (log) => {
    if (typeof log === 'object') {
      log = JSON.stringify(log);
    }
    console.log(`[SMTP] ${log}`);
  });

  // Verificar la conexión
  console.log('\nVerificando conexión con el servidor SMTP...');
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Error al verificar la conexión SMTP:', {
          code: error.code,
          command: error.command,
          message: error.message,
          stack: nodeEnv === 'development' ? error.stack : undefined
        });
        
        // Mensajes de error comunes
        if (error.code === 'EAUTH') {
          console.error('\n⚠️ Error de autenticación:');
          console.error('- Verifica que el correo y la contraseña sean correctos');
          console.error('- Asegúrate de haber habilitado "Acceso de aplicaciones menos seguras"');
          console.error('- O genera una "Contraseña de aplicación" en la configuración de tu cuenta de Google');
        } else if (error.code === 'ECONNECTION') {
          console.error('\n⚠️ Error de conexión:');
          console.error('- Verifica tu conexión a Internet');
          console.error('- El servidor SMTP podría estar caído');
          console.error('- Verifica si hay restricciones de firewall');
        }
        
        reject(new Error('No se pudo conectar al servidor de correo'));
      } else {
        console.log('✅ Conexión SMTP verificada correctamente');
        console.log('=== Configuración de correo completada ===\n');
        resolve(transporter);
      }
    });
  });
};

// Crear el transporte de correo
let transporter;

// Función para inicializar el transporte de correo
const inicializarTransporter = async () => {
  try {
    console.log('Inicializando transporte de correo...');
    return await createTransporter();
  } catch (error) {
    console.error('❌ Error crítico al configurar el transporte de correo:', error.message);
    console.error('El servidor continuará ejecutándose, pero el envío de correos no funcionará');
    
    // Devolver un transporte simulado que falla cuando se usa
    return {
      sendMail: async () => {
        throw new Error('El transporte de correo no se configuró correctamente: ' + error.message);
      },
      verify: async () => {
        throw new Error('El transporte de correo no se configuró correctamente: ' + error.message);
      }
    };
  }
};

// Inicializar el transporte de inmediato y manejar cualquier error
inicializarTransporter()
  .then(t => { transporter = t; })
  .catch(err => {
    console.error('Error al inicializar el transporte de correo:', err);
    transporter = {
      sendMail: async () => {
        throw new Error('Error al inicializar el transporte de correo: ' + err.message);
      },
      verify: async () => {
        throw new Error('Error al inicializar el transporte de correo: ' + err.message);
      }
    };
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
    const startTime = Date.now();
    const logContext = { correo, codigo, timestamp: new Date().toISOString() };
    
    try {
      console.log('\n=== Inicio envío de correo de verificación ===');
      console.log('Contexto:', JSON.stringify(logContext, null, 2));
      
      // Verificar que el transporte esté configurado
      if (!transporter) {
        const errorMsg = 'El servicio de correo no está configurado correctamente';
        console.error('❌ ' + errorMsg);
        throw new Error(errorMsg);
      }

      // Verificar parámetros de entrada
      if (!correo || !codigo) {
        const errorMsg = 'Correo y código son requeridos';
        console.error('❌ ' + errorMsg);
        throw new Error(errorMsg);
      }

      // Configurar opciones del correo
      const mailOptions = {
        from: `"Popayán Nocturna" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Verificación de correo - Popayán Nocturna',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4a4a4a;">Bienvenido a Popayán Nocturna</h2>
            <p>Para verificar tu correo electrónico, por favor ingresa el siguiente código en la aplicación:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h3 style="font-size: 24px; color: #2196F3; margin: 0; letter-spacing: 2px;">${codigo}</h3>
            </div>
            <p>Este código expirará en 5 minutos. Si no solicitaste esta verificación, puedes ignorar este correo.</p>
            <p>Gracias por registrarte en Popayán Nocturna.</p>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
        // Añadir encabezados para seguimiento
        headers: {
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'X-Mailer': 'Popayán Nocturna Mailer'
        }
      };

      console.log(`\n📤 Enviando correo de verificación a: ${correo}`);
      console.log('Opciones de correo:', JSON.stringify({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      }, null, 2));

      // Enviar el correo con timeout
      const sendMailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado al enviar el correo')), 30000)
      );

      const info = await Promise.race([sendMailPromise, timeoutPromise]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ Correo enviado exitosamente');
      console.log('- ID del mensaje:', info.messageId);
      console.log('- Destinatario:', info.envelope.to);
      console.log('- Tiempo de envío:', duration + 'ms');
      console.log('=== Fin envío de correo de verificación ===\n');
      
      return info;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const errorInfo = {
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          command: error.command,
          responseCode: error.responseCode,
          response: error.response,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        context: logContext,
        duration: duration + 'ms'
      };
      
      console.error('❌ Error al enviar correo de verificación:', JSON.stringify(errorInfo, null, 2));
      
      // Mensajes de error más amigables
      let mensajeError = 'Error al enviar el correo de verificación. Por favor, intente nuevamente.';
      
      if (error.code === 'EAUTH') {
        mensajeError = 'Error de autenticación con el servidor de correo. Por favor, contacta al soporte.';
      } else if (error.code === 'ECONNECTION') {
        mensajeError = 'No se pudo conectar al servidor de correo. Verifica tu conexión a internet.';
      } else if (error.message.includes('Tiempo de espera agotado')) {
        mensajeError = 'El servidor de correo no respondió a tiempo. Por favor, inténtalo de nuevo.';
      } else if (error.responseCode === 550) {
        mensajeError = 'No se pudo entregar el correo. Verifica que la dirección de correo sea correcta.';
      }
      
      const errorParaLanzar = new Error(mensajeError);
      errorParaLanzar.originalError = error;
      errorParaLanzar.code = error.code || 'EMAIL_SEND_ERROR';
      
      throw errorParaLanzar;
    }
  }

  static async registrarUsuario(datos) {
    try {
      console.log('Iniciando registro para:', datos.correo);
      
      // Validar campos del formulario
      await this.validarCamposRegistro(datos);
      const { correo, contrasena, rolid } = datos;
  
      // Verificar si el correo ya está registrado
      const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
      if (usuarioExistente) {
        throw new Error("Correo ya está en uso");
      }
  
      // Verificar si ya hay un código activo para este correo
      const codigoExistente = await TemporalService.obtenerCodigo(correo);
      if (codigoExistente) {
        const tiempoRestante = new Date(codigoExistente.expiracion) - new Date();
        if (tiempoRestante > 0) {
          throw new Error(`Ya existe un código de verificación activo. Por favor, espera ${Math.ceil(tiempoRestante / 60000)} minutos o verifica tu correo.`);
        }
      }
  
      // Hashear la contraseña
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      const codigo = this.generarCodigo();
      
      // Configurar fechas
      const ahora = new Date();
      const expiracion = new Date(ahora.getTime() + 5 * 60 * 1000);
      expiracion.setHours(expiracion.getHours() - 5);

      console.log('Guardando datos temporales para:', correo);
  
      try {
        // Guardar el código y los datos temporales primero
        await TemporalService.guardarCodigo(correo, codigo, expiracion);
        await TemporalService.guardarDatosTemporales(correo, {
          ...datos,
          contrasena: contrasenaHash,
          estado: false,
          rolid: rolid,
          fecha_creacion: ahora,
          fecha_expiracion: expiracion
        });

        console.log('Datos temporales guardados, enviando correo...');
        
        // Enviar el correo de verificación
        await this.enviarCorreoVerificacion(correo, codigo);
  
        // Configurar eliminación automática del código después de 5 minutos
        setTimeout(async () => {
          try {
            console.log('Eliminando código expirado para:', correo);
            await TemporalService.eliminarCodigo(correo);
          } catch (error) {
            console.error('Error al eliminar código expirado:', error);
          }
        }, 5 * 60 * 1000);
  
        console.log('Registro exitoso para:', correo);
        return { 
          mensaje: "Registro iniciado. Por favor, verifica tu correo electrónico.",
          correo: correo
        };
      } catch (emailError) {
        console.error('Error durante el registro:', emailError);
        // Limpiar datos temporales si hay un error
        try {
          await TemporalService.eliminarCodigo(correo);
          await TemporalService.eliminarDatosTemporales(correo);
        } catch (cleanupError) {
          console.error('Error al limpiar datos temporales:', cleanupError);
        }
        
        throw new Error("Error al enviar el correo de verificación. Por favor, intente nuevamente.");
      }
    } catch (error) {
      console.error('Error en registrarUsuario:', error);
      throw error;
    }
  }

  static async reenviarCodigo(correo) {
    console.log(`Solicitando reenvío de código para: ${correo}`);
    
    try {
      // Verificar si el correo ya está registrado como usuario activo
      const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
      if (usuarioExistente) {
        console.log('Intento de reenvío para correo ya registrado:', correo);
        throw new Error("Este correo electrónico ya está registrado. Por favor, inicia sesión o utiliza la opción de recuperación de contraseña si lo necesitas.");
      }

      // Verificar si hay un código existente
      const codigoExistente = await TemporalService.obtenerCodigo(correo);
      
      // Verificar si hay datos temporales
      const datosTemporales = await TemporalService.obtenerDatosTemporales(correo);
      if (!datosTemporales) {
        console.log('No se encontraron datos temporales para el correo:', correo);
        throw new Error("No hay un registro pendiente para este correo. Por favor, completa el formulario de registro nuevamente.");
      }

      // Si hay un código existente, verificar si aún es válido
      if (codigoExistente) {
        const tiempoRestante = new Date(codigoExistente.expiracion) - new Date();
        if (tiempoRestante > 0) {
          const minutosRestantes = Math.ceil(tiempoRestante / 60000);
          console.log(`Código aún válido por ${minutosRestantes} minutos para: ${correo}`);
          throw new Error(`Ya hay un código de verificación activo. Por favor, revisa tu correo o espera ${minutosRestantes} minutos para solicitar uno nuevo.`);
        }
        // Si el código expiró, continuar para generar uno nuevo
        console.log('Código anterior expirado, generando uno nuevo para:', correo);
      }

      // Generar nuevo código y configurar expiración
      const codigo = this.generarCodigo();
      const ahora = new Date();
      const nuevaExpiracion = new Date(ahora.getTime() + 5 * 60 * 1000);
      nuevaExpiracion.setHours(nuevaExpiracion.getHours() - 5);

      console.log('Enviando nuevo código a:', correo);
      
      // Enviar el correo con el nuevo código
      await this.enviarCorreoVerificacion(correo, codigo);
      
      // Actualizar el código y los datos temporales
      await TemporalService.guardarCodigo(correo, codigo, nuevaExpiracion);
      await TemporalService.guardarDatosTemporales(correo, {
        ...datosTemporales,
        fecha_expiracion: nuevaExpiracion
      });

      // Configurar eliminación automática del código después de 5 minutos
      setTimeout(async () => {
        try {
          console.log('Eliminando código expirado para:', correo);
          await TemporalService.eliminarCodigo(correo);
        } catch (error) {
          console.error('Error al eliminar código expirado:', error);
        }
      }, 5 * 60 * 1000);

      console.log('Nuevo código enviado exitosamente a:', correo);
      return {
        mensaje: "Se ha enviado un nuevo código de verificación a tu correo electrónico. Por favor, revísalo y sigue las instrucciones.",
        correo: correo,
        expiracion: nuevaExpiracion.toISOString()
      };
      
    } catch (error) {
      console.error('Error en reenviarCodigo:', {
        correo: correo,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Proporcionar mensajes más descriptivos según el tipo de error
      if (error.message.includes('No hay un registro pendiente') || 
          error.message.includes('ya está registrado')) {
        throw error; // Mantener los mensajes específicos
      }
      
      throw new Error("No se pudo enviar el nuevo código de verificación. Por favor, verifica tu conexión e inténtalo de nuevo.");
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