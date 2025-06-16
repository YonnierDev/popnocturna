const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AutentiService = require("../service/autentiService");

class AutentiController {
  static async registrar(req, res) {
    try {
      console.log('Solicitud de registro recibida:', {
        correo: req.body.correo,
        nombre: req.body.nombre,
        timestamp: new Date().toISOString()
      });
      
      const datos = req.body;
      const resultado = await AutentiService.registrarUsuario(datos);
      
      console.log('Registro exitoso para:', datos.correo);
      res.status(201).json(resultado);
      
    } catch (error) {
      console.error('Error en el controlador de registro:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        timestamp: new Date().toISOString()
      });

      if (error.message.includes('foreign key constraint fails')) {
        return res.status(400).json({
          mensaje: "Error al crear el usuario",
          error: "Rol no válido",
          detalles: "El rol especificado no existe en la base de datos",
          rolid: req.body.rolid
        });
      }

      // Manejar errores específicos de nodemailer
      if (error.message.includes('Invalid login') || error.code === 'EAUTH') {
        return res.status(500).json({
          mensaje: "Error de autenticación del servidor de correo",
          detalles: "Por favor, verifica las credenciales del correo electrónico"
        });
      }

      const mensaje = error.message || "Error desconocido al procesar el registro";
      const errores = error.errors || null;
      
      res.status(400).json({ 
        mensaje, 
        errores, 
        detalles: "Error al procesar el registro" 
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
    try {
      const { correo } = req.body;
      if (!correo) {
        return res.status(400).json({ mensaje: "El correo es requerido" });
      }
      const resultado = await AutentiService.reenviarCodigo(correo);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ mensaje: error.message });
    }
  }
}

module.exports = AutentiController;