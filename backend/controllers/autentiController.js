const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AutentiService = require("../service/autentiService");

class AutentiController {
  static async registrar(req, res) {
    const startTime = Date.now();
    const logContext = {
      correo: req.body.correo,
      nombre: req.body.nombre,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      body: JSON.stringify(req.body),
      headers: JSON.stringify(req.headers)
    };

    try {
      console.log('\n=== Inicio de registro ===');
      console.log('Contexto:', JSON.stringify(logContext, null, 2));
      
      // Validar que el body tenga datos
      if (!req.body || Object.keys(req.body).length === 0) {
        console.error('❌ Error: Cuerpo de la solicitud vacío');
        return res.status(400).json({
          codigo: 'CUERPO_VACIO',
          mensaje: 'El cuerpo de la solicitud está vacío'
        });
      }

      // Validar datos básicos
      if (!req.body.correo || !req.body.contrasena) {
        return res.status(400).json({
          codigo: 'DATOS_INCOMPLETOS',
          mensaje: 'Correo y contraseña son obligatorios',
          detalles: 'Faltan campos requeridos en la solicitud'
        });
      }

      console.log('📥 Datos recibidos:', JSON.stringify(req.body, null, 2));
      
      const resultado = await AutentiService.registrarUsuario(req.body);
      
      // Si el registro fue exitoso pero el correo no se pudo enviar
      if (resultado.requiereReenvio) {
        console.warn('⚠️ Registro exitoso pero requiere reenvío de código para:', req.body.correo);
        return res.status(202).json({
          codigo: 'REQUIERE_REENVIO',
          mensaje: 'Registro exitoso, pero no se pudo enviar el correo de verificación',
          correo: req.body.correo,
          requiereReenvio: true
        });
      }
      
      console.log('✅ Registro exitoso para:', req.body.correo);
      return res.status(201).json({
        codigo: 'REGISTRO_EXITOSO',
        mensaje: 'Registro exitoso. Por favor, verifica tu correo electrónico.',
        correo: req.body.correo,
        registroExitoso: true
      });
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const errorInfo = {
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
        },
        context: logContext,
        duration: `${duration}ms`,
        body: req.body
      };
      
      console.error('❌ Error en el controlador de registro:', JSON.stringify(errorInfo, null, 2));

      // Manejar errores específicos
      if (error.message.includes('foreign key constraint fails')) {
        return res.status(400).json({
          codigo: 'ROL_INVALIDO',
          mensaje: 'Error al crear el usuario: Rol no válido',
          detalles: 'El rol especificado no existe en la base de datos',
          rolid: req.body.rolid
        });
      }
      
      // Manejar errores de validación
      if (error.message.includes('validación') || error.message.includes('obligatorios')) {
        return res.status(422).json({
          codigo: 'VALIDACION_FALLIDA',
          mensaje: error.message,
          detalles: "Error de validación en los datos del formulario"
        });
      }
      
      // Manejar errores de correo duplicado
      if (error.message.includes('ya está en uso')) {
        return res.status(409).json({
          codigo: 'CORREO_DUPLICADO',
          mensaje: error.message,
          detalles: "El correo electrónico ya está registrado"
        });
      }
      
      // Manejar errores de nodemailer
      if (error.message.includes('Error al enviar correo') || error.code === 'EAUTH') {
        return res.status(502).json({
          codigo: 'ERROR_CORREO',
          mensaje: "Error de autenticación del servidor de correo",
          detalles: "No se pudo autenticar con el servidor de correo. Por favor, intente más tarde.",
          error: error.message
        });
      }
      
      // Manejar errores de tiempo de espera
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
        return res.status(504).json({
          codigo: 'TIEMPO_AGOTADO',
          mensaje: "Tiempo de espera agotado",
          detalles: "El servidor de correo no respondió a tiempo. Por favor, intente nuevamente."
        });
      }
      
      // Error genérico
      console.error('❌ Error no manejado:', error);
      return res.status(500).json({
        codigo: 'ERROR_INTERNO',
        mensaje: 'Error interno del servidor',
        detalles: error.message || 'Ocurrió un error inesperado al procesar la solicitud',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });

      // Manejar errores de validación
      if (error.message.includes('validación') || error.message.includes('obligatorios')) {
        return res.status(422).json({
          codigo: 'VALIDACION_FALLIDA',
          mensaje: error.message,
          detalles: "Error de validación en los datos del formulario"
        });
      }

      // Manejar errores de correo duplicado
      if (error.message.includes('ya está en uso')) {
        return res.status(409).json({
          codigo: 'CORREO_DUPLICADO',
          mensaje: error.message,
          detalles: "El correo electrónico ya está registrado"
        });
      }

      // Manejar errores de nodemailer
      if (error.message.includes('Invalid login') || error.code === 'EAUTH') {
        return res.status(502).json({
          codigo: 'ERROR_CORREO',
          mensaje: "Error de autenticación del servidor de correo",
          detalles: "No se pudo autenticar con el servidor de correo. Por favor, intente más tarde.",
          error: error.message
        });
      }

      // Manejar errores de tiempo de espera
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
        return res.status(504).json({
          codigo: 'TIEMPO_AGOTADO',
          mensaje: "Tiempo de espera agotado",
          detalles: "El servidor de correo no respondió a tiempo. Por favor, intente nuevamente."
        });
      }

      // Error genérico
      res.status(500).json({
        codigo: 'ERROR_INTERNO',
        mensaje: error.message || "Error interno del servidor",
        detalles: "Ocurrió un error inesperado al procesar la solicitud"
      });
    }
  }
  
  static async validarCodigo(req, res) {
    try {
      const { correo, codigo } = req.body;
      await AutentiService.validarCodigoCorreo(correo, codigo);
      res.json({ mensaje: "Usuario validado correctamente" });
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async login(req, res) {
    try {
      const datos = req.body;
      const resultado = await AutentiService.login(datos);
      res.json(resultado);
    } catch (error) {
      res.status(401).json({ mensaje: error.message });
    }
  }

  static async enviarCodigo(req, res) {
    try {
      const { correo } = req.body;
      const resultado = await AutentiService.enviarCodigoRecuperacion(correo);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async cambiarContrasenaConCodigo(req, res) {
    try {
      const { correo, codigo, nuevaContrasena } = req.body;
      await AutentiService.cambiarContrasenaConCodigo(correo, codigo, nuevaContrasena);
      res.json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async enviarRecuperacionCorreo(req, res) {
    try {
      const { correo } = req.body;
      const resultado = await AutentiService.enviarRecuperacionCorreo(correo);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async verificarToken(req, res) {
    try {
      const { token } = req.params;
      const decoded = await AutentiService.verificarTokenRecuperacion(token);
      res.json(decoded);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async actualizarContrasena(req, res) {
    try {
      const { nuevaContrasena, confirmarContrasena } = req.body;
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: "Token de autorización no proporcionado" });
      }
      const token = authHeader.split(' ')[1];
      
      if (!nuevaContrasena || !confirmarContrasena) {
        return res.status(400).json({ mensaje: "Ambos campos de contraseña son obligatorios" });
      }

      if (nuevaContrasena !== confirmarContrasena) {
        return res.status(400).json({ mensaje: "Las contraseñas no coinciden" });
      }

      const validacionContrasena = AutentiService.validarContrasena(nuevaContrasena);
      if (validacionContrasena !== true) {
        return res.status(400).json({ mensaje: validacionContrasena });
      }

      const secret = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);  
      const id = decoded.id;

      const usuario = await AutentiService.buscarUsuarioPorId(id);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      if (!usuario.contrasena) {
        return res.status(400).json({ mensaje: "No se encontró la contraseña actual del usuario" });
      }

      const esMismaContrasena = await bcrypt.compare(nuevaContrasena, usuario.contrasena);
      if (esMismaContrasena) {
        return res.status(400).json({ mensaje: "La nueva contraseña no puede ser igual a la actual" });
      }

      const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);
      const resultado = await AutentiService.actualizarContrasena(id, nuevaHash);
      res.json(resultado);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ mensaje: "Token inválido" });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ mensaje: "El enlace de recuperación ha expirado" });
      }
      if (error.message.includes('data and hash arguments required')) {
        return res.status(400).json({ mensaje: "Error al verificar la contraseña actual" });
      }
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async reenviarCodigo(req, res) {
    const startTime = Date.now();
    const logContext = {
      correo: req.body.correo,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };

    try {
      console.log('\n=== Inicio de reenvío de código ===');
      console.log('Contexto:', JSON.stringify(logContext, null, 2));
      
      const { correo } = req.body;
      
      // Validar correo
      if (!correo) {
        return res.status(400).json({
          codigo: 'CORREO_REQUERIDO',
          mensaje: 'El correo electrónico es requerido',
          detalles: 'No se proporcionó un correo electrónico para reenviar el código'
        });
      }
      
      console.log('🔁 Solicitando reenvío de código para:', correo);
      const resultado = await AutentiService.reenviarCodigo(correo);
      
      console.log('✅ Código reenviado exitosamente a:', correo);
      res.status(200).json({
        codigo: 'CODIGO_REENVIADO',
        mensaje: 'Se ha enviado un nuevo código de verificación a tu correo electrónico.',
        correo: correo,
        exito: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const errorInfo = {
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        context: logContext,
        duration: `${duration}ms`,
        body: req.body
      };
      
      console.error('❌ Error al reenviar código:', JSON.stringify(errorInfo, null, 2));
      
      // Manejar errores específicos
      if (error.message.includes('ya está registrado')) {
        return res.status(409).json({
          codigo: 'USUARIO_YA_REGISTRADO',
          mensaje: error.message,
          detalles: 'Este correo ya está registrado. Por favor, inicia sesión.',
          correo: req.body.correo
        });
      }
      
      if (error.message.includes('No hay un registro pendiente')) {
        return res.status(404).json({
          codigo: 'REGISTRO_NO_ENCONTRADO',
          mensaje: error.message,
          detalles: 'No se encontró un registro pendiente para este correo. Por favor, regístrate de nuevo.',
          correo: req.body.correo
        });
      }
      
      if (error.message.includes('código de verificación activo')) {
        return res.status(429).json({
          codigo: 'CODIGO_ACTIVO',
          mensaje: error.message,
          detalles: 'Ya hay un código de verificación activo para este correo.',
          correo: req.body.correo,
          reintentarEn: '2 minutos'
        });
      }
      
      // Manejar errores de nodemailer
      if (error.message.includes('Error al enviar correo') || error.code === 'EAUTH') {
        return res.status(502).json({
          codigo: 'ERROR_CORREO',
          mensaje: 'No se pudo enviar el correo de verificación',
          detalles: 'Error de autenticación con el servidor de correo. Por favor, intente más tarde.',
          correo: req.body.correo,
          requiereReenvio: true
        });
      }
      
      // Error genérico
      res.status(500).json({
        codigo: 'ERROR_REENVIO',
        mensaje: 'Error al reenviar el código de verificación',
        detalles: 'Ocurrió un error inesperado. Por favor, intente nuevamente.',
        correo: req.body.correo,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AutentiController;