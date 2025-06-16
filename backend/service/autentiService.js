const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TemporalService = require("./temporalService");
const UsuarioService = require("./usuarioService");
require("dotenv").config();

// Configuración mejorada del transporte de correo con manejo de errores y reintentos
const createTransporter = () => {
  try {
    console.log('\n=== Iniciando configuración del transporte de correo ===');
    
    // Verificar variables de entorno
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const nodeEnv = process.env.NODE_ENV || 'development';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    console.log(`🔧 Entorno: ${nodeEnv}`);
    console.log(`📧 Correo configurado: ${emailUser ? 'Sí' : 'No'}`);
    console.log(`🌐 URL del frontend: ${frontendUrl}`);
    
    if (!emailUser || !emailPass) {
      const errorMsg = '❌ Error: Las variables de entorno EMAIL_USER y EMAIL_PASS son requeridas';
      console.error(errorMsg);
      console.error(`📧 EMAIL_USER: ${emailUser ? 'Configurado' : 'Falta'}`);
      console.error(`🔑 EMAIL_PASS: ${emailPass ? 'Configurado' : 'Falta'}`);
      throw new Error('Error de configuración del servidor de correo: Faltan credenciales');
    }

        // Configuración base del transporte
    const smtpConfig = {
      // Configuración para Gmail (puede sobrescribirse con variables de entorno)
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // Convertir a booleano
      auth: {
        user: emailUser,
        pass: emailPass
      },
      // Configuración de TLS/SSL
      tls: {
        // En producción, verificar el certificado. En desarrollo, podemos deshabilitar la verificación
        rejectUnauthorized: nodeEnv === 'production',
        // Versión mínima de TLS (1.2 es seguro y ampliamente compatible)
        minVersion: 'TLSv1.2',
        // Cifrados permitidos (seguros y compatibles)
        ciphers: 'TLS_AES_256_GCM_SHA384:ECDHE-ECDSA-AES128-GCM-SHA256'
      },
      // Configuración de pool para manejar múltiples mensajes
      pool: true,
      maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS) || 5,
      maxMessages: 100, // Máximo de mensajes por conexión
      // Rate limiting
      rateDelta: 1000, // 1 segundo entre lotes
      rateLimit: 10,   // 10 mensajes por lote
      // Timeouts (en milisegundos)
      connectionTimeout: 15000,  // 15 segundos para conectar
      greetingTimeout: 10000,    // 10 segundos para el saludo SMTP
      socketTimeout: 30000,      // 30 segundos de inactividad
      // Reintentos
      retries: 3,               // Número de reintentos por mensaje
      // Configuración de depuración
      debug: nodeEnv === 'development',
      logger: nodeEnv === 'development',
      // Seguridad adicional
      disableFileAccess: true,   // Prevenir acceso a archivos locales
      disableUrlAccess: true,    // Prevenir acceso a URLs
      // Configuración específica para Gmail
      ...(process.env.EMAIL_SERVICE === 'gmail' && {
        // Configuraciones específicas para Gmail
        authMethod: 'LOGIN',
        // Para Gmail, asegurarse de que el correo tenga habilitado el acceso de aplicaciones menos seguras
        // o mejor, usar OAuth2 (recomendado para producción)
      })
    };
    
    // Si estamos en producción, forzar configuraciones seguras
    if (nodeEnv === 'production') {
      console.log('🔒 Aplicando configuraciones de seguridad para producción');
      smtpConfig.secure = true; // Forzar SSL/TLS en producción
      smtpConfig.requireTLS = true; // Requerir TLS
      smtpConfig.tls.rejectUnauthorized = true; // Verificar certificados
      
      // Configuración específica para producción
      smtpConfig.connectionTimeout = 10000; // 10 segundos
      smtpConfig.greetingTimeout = 10000;  // 10 segundos
      smtpConfig.socketTimeout = 60000;    // 1 minuto
    }
    
    console.log('✅ Configuración SMTP cargada correctamente');
    
    // Crear el transporte
    const transporter = nodemailer.createTransport(smtpConfig);
    
    // Verificar la conexión
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Error al verificar la conexión SMTP:', error);
      } else {
        console.log('✅ Servidor SMTP listo para enviar mensajes');
      }
    });
    
    return transporter;
    
  } catch (error) {
    console.error('❌ Error crítico al configurar el transporte de correo:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      syscall: error.syscall,
      address: error.address,
      port: error.port
    });
    
    // En producción, podrías querer notificar a los administradores
    if (process.env.NODE_ENV === 'production') {
      // Aquí podrías enviar una notificación a tu sistema de monitoreo
      console.error('🚨 Se requiere atención: El servicio de correo no está disponible');
    }
    
    throw error; // Relanzar para que el manejador de errores global lo capture
  }
};

// Crear el transporte de correo
let transporter;
let isTransporterInitialized = false;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos

/**
 * Función para inicializar el transporte de correo con reintentos
 * @param {number} retryCount - Número de intentos realizados
 * @returns {Promise<nodemailer.Transporter>} - Transporte de correo configurado
 */
const inicializarTransporter = async (retryCount = 0) => {
  try {
    console.log(`\n🔧 [${new Date().toISOString()}] Inicializando transporte de correo... (Intento ${retryCount + 1}/${MAX_RETRIES})`);
    
    const t = createTransporter();
    
    // Verificar la conexión
    await new Promise((resolve, reject) => {
      t.verify((error, success) => {
        if (error) {
          console.error(`❌ Error en la verificación SMTP (Intento ${retryCount + 1}):`, error.message);
          return reject(error);
        }
        console.log(`✅ [${new Date().toISOString()}] Verificación SMTP exitosa`);
        resolve(success);
      });
    });
    
    isTransporterInitialized = true;
    console.log(`✅ [${new Date().toISOString()}] Transporte de correo inicializado correctamente`);
    return t;
    
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error al inicializar el transporte de correo (Intento ${retryCount + 1}):`, {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Reintentar si no hemos alcanzado el número máximo de reintentos
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`🔄 [${new Date().toISOString()}] Reintentando en ${RETRY_DELAY/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return inicializarTransporter(retryCount + 1);
    }
    
    // Si llegamos aquí, todos los reintentos fallaron
    console.error(`❌ [${new Date().toISOString()}] Se agotaron los ${MAX_RETRIES} intentos de inicializar el transporte de correo`);
    isTransporterInitialized = false;
    return null;
  }
};

// Objeto para manejar el transporte de correo de forma segura
const mailer = {
  isReady: () => isTransporterInitialized,
  
  sendMail: async (mailOptions) => {
    if (!transporter || !isTransporterInitialized) {
      console.error('❌ Intento de enviar correo sin transporte inicializado');
      throw new Error('El servicio de correo no está disponible en este momento. Por favor, intente más tarde.');
    }
    
    try {
      // Agregar información de seguimiento
      const mailId = `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`📤 [${new Date().toISOString()}] Enviando correo [${mailId}] a: ${mailOptions.to}`);
      
      // Configurar opciones de correo
      const mailWithDefaults = {
        from: `"Popayán Nocturna" <${process.env.EMAIL_USER}>`,
        ...mailOptions,
        headers: {
          'X-Mailer': 'Popayán Nocturna Mailer',
          'X-Mail-ID': mailId,
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          ...(mailOptions.headers || {})
        }
      };
      
      // Enviar el correo con timeout
      const sendMailPromise = transporter.sendMail(mailWithDefaults);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado al enviar el correo')), 30000)
      );
      
      const info = await Promise.race([sendMailPromise, timeoutPromise]);
      
      console.log(`✅ [${new Date().toISOString()}] Correo [${mailId}] enviado exitosamente a: ${mailOptions.to}`);
      return info;
      
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error al enviar correo a ${mailOptions.to}:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      throw new Error(`Error al enviar el correo: ${error.message}`);
    }
  },
  
  verify: async () => {
    if (!transporter || !isTransporterInitialized) {
      return false;
    }
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('Error al verificar la conexión SMTP:', error);
      return false;
    }
  }
};

// Inicializar el transporte al arrancar
inicializarTransporter()
  .then(t => { 
    if (t) {
      transporter = t;
      console.log('✅ [INICIO] Transporte de correo listo para usar');
    } else {
      console.error('❌ [INICIO] No se pudo inicializar el transporte de correo');
    }
  })
  .catch(err => {
    console.error('❌ [INICIO] Error no manejado al inicializar el transporte de correo:', {
      message: err.message,
      stack: err.stack
    });
    transporter = null;
    isTransporterInitialized = false;
  });

// Función para verificar el estado del transporte
const checkTransporterStatus = () => ({
  isInitialized: isTransporterInitialized,
  lastCheck: new Date().toISOString(),
  service: 'smtp.gmail.com',
  status: isTransporterInitialized ? 'active' : 'inactive'
});

// Exportar la función de verificación de estado
mailer.getStatus = checkTransporterStatus;

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
    const logContext = { 
      correo, 
      codigo, 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    };
    
    try {
      console.log('\n=== Inicio envío de correo de verificación ===');
      console.log('Contexto:', JSON.stringify(logContext, null, 2));
      
      // Verificar que el servicio de correo esté listo
      if (!mailer.isReady()) {
        const status = mailer.getStatus ? mailer.getStatus() : { status: 'not_initialized' };
        console.error('❌ Error: El servicio de correo no está disponible', status);
        throw new Error('El servicio de correo no está disponible en este momento. Por favor, intente más tarde.');
      }
      
      // Validar parámetros
      if (!correo || !codigo) {
        const errorMsg = 'Correo y código son requeridos';
        console.error('❌ Error de validación:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        const errorMsg = 'El formato del correo electrónico no es válido';
        console.error('❌ Error de validación:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Plantilla de correo mejorada
      const emailTemplate = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2c3e50; margin: 0 0 10px 0;">¡Bienvenido a Popayán Nocturna!</h1>
              <p style="color: #6c757d; margin: 0; font-size: 16px;">Tu código de verificación está listo</p>
            </div>
            
            <div style="background-color: #e9f7fe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px dashed #4dabf7;">
              <p style="margin: 0 0 15px 0; color: #1864ab; font-weight: 500;">Utiliza el siguiente código para verificar tu correo:</p>
              <div style="display: inline-block; background: white; padding: 10px 25px; border-radius: 6px; border: 1px solid #dee2e6;">
                <span style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #228be6;">${codigo}</span>
              </div>
              <p style="margin: 15px 0 0 0; color: #495057; font-size: 14px;">Este código expirará en 5 minutos</p>
            </div>
            
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e9ecef; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Si no has solicitado este código, puedes ignorar este mensaje.</p>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">© ${new Date().getFullYear()} Popayán Nocturna. Todos los derechos reservados.</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #adb5bd;">
            <p style="margin: 5px 0;">Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p style="margin: 5px 0;">Para cualquier consulta, contáctanos a soporte@popayannocturna.com</p>
          </div>
        </div>
      `;
      
      // Configurar opciones del correo
      const mailOptions = {
        to: correo,
        subject: 'Verificación de correo - Popayán Nocturna',
        html: emailTemplate,
        headers: {
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'X-Mailer': 'Popayán Nocturna Mailer',
          'X-Application': 'Popayán Nocturna API',
          'X-Environment': process.env.NODE_ENV || 'development'
        }
      };
      
      console.log('📤 Enviando correo de verificación...');
      
      // Usar el mailer para enviar el correo
      const info = await mailer.sendMail(mailOptions);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Correo enviado exitosamente en ${duration}ms`);
      console.log(`- ID del mensaje: ${info.messageId}`);
      console.log(`- Destinatario: ${correo}`);
      
      return info;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const errorInfo = {
        name: error.name,
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };
      
      console.error('❌ Error al enviar correo de verificación:', JSON.stringify(errorInfo, null, 2));
      
      // Mapear errores conocidos a mensajes más amigables
      if (error.code === 'EAUTH' || error.command === 'AUTH') {
        throw new Error('Error de autenticación con el servidor de correo. Por favor, verifica las credenciales.');
      }
      
      if (error.code === 'ECONNECTION' || error.message.includes('ECONNREFUSED')) {
        throw new Error('No se pudo conectar al servidor de correo. Por favor, verifica tu conexión a internet.');
      }
      
      if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
        throw new Error('El servidor de correo no respondió a tiempo. Por favor, inténtalo de nuevo más tarde.');
      }
      
      if (error.message.includes('No recipients defined')) {
        throw new Error('No se especificó un destinatario para el correo.');
      }
      
      // Si es un error de rate limiting de Gmail
      if (error.responseCode === 550 && error.response?.includes('Daily user sending quota exceeded')) {
        throw new Error('Se ha excedido el límite de envíos diarios. Por favor, inténtalo de nuevo mañana.');
      }
      
      // Si el error es de autenticación pero no se capturó antes
      if (error.message.toLowerCase().includes('invalid login') || 
          error.message.toLowerCase().includes('authentication failed')) {
        throw new Error('Error de autenticación con el servidor de correo. Verifica las credenciales.');
      }
      
      // Para otros errores, devolver un mensaje genérico
      throw new Error('Error al enviar el correo de verificación. Por favor, inténtalo de nuevo más tarde.');
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