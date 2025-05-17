const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AutentiService = require("../service/autentiService");
class AutentiController {
  static async registrar(req, res) {
    try {
      const datos = req.body;
  
      const resultado = await AutentiService.registrarUsuario(datos);
      res.status(201).json(resultado);
    } catch (error) {
  
      const mensaje = error.message || "Error desconocido";
      const errores = error.errors || null;
  
      res.status(400).json({
        mensaje,
        errores,
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
      const { token, nuevaContrasena, confirmarContrasena } = req.body;
      if(!nuevaContrasena || !confirmarContrasena) {
        return res.status(400).json({ mensaje: "Ambas contrasenas son obligatorias" });
      }
      if (nuevaContrasena !== confirmarContrasena) {
        return res.status(400).json({ mensaje: "Las contrasenas no coinciden" });
      }
      const contrasenavalida = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
      if (!contrasenavalida.test(nuevaContrasena)) {
        return res.status(400).json({ mensaje: "Contraseña insegura" });
      }

      const secret = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);  
      const id = decoded.id;

      const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);

      const resultado = await AutentiService.actualizarContrasena(id, nuevaHash);
      res.json(resultado);
    } catch (error) {
      console.error("Error al actualizar contraseña",error);
      res.status(400).json({ mensaje: error.message });
    }
  }

  static async reenviarCodigo(req, res) {
    try {
      const { correo } = req.body;
      
      if (!correo) {
        return res.status(400).json({
          mensaje: "El correo es requerido"
        });
      }

      const resultado = await AutentiService.reenviarCodigo(correo);
      res.json(resultado);
    } catch (error) {
      console.error('Error al reenviar código:', error);
      res.status(400).json({
        mensaje: error.message
      });
    }
  }
}

module.exports = AutentiController;