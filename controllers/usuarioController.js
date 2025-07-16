const cloudinaryService = require("../service/cloudinaryService");
const UsuarioService = require("../service/usuarioService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Usuario,
  Rol,
  Evento,
  Reserva,
  Comentario,
  Lugar,
  Calificacion,
} = require("../models");

class UsuarioController {
  async listarUsuarios(req, res) {
    try {
      const listaUsuarios = await UsuarioService.listarUsuarios();
      res.status(200).json(listaUsuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false,
        message: "Error al listar usuarios",
        error: error.message
      });
    }
  }

  async obtenerUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.obtenerUsuario(id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false,
        message: "Error al obtener usuario",
        error: error.message
      });
    }
  }

  async crearUsuario(req, res) {
    try {
      const {
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        contrasena,
        genero,
        rolid,
      } = req.body;
      
      // Validar campos requeridos
      if (!nombre || !apellido || !correo || !fecha_nacimiento || !contrasena || !genero) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({ mensaje: "Formato de correo no válido" });
      }

      // Verificar si el correo ya existe
      console.log(`Verificando si el correo ${correo} ya existe...`);
      const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
      if (usuarioExistente) {
        console.log(`El correo ${correo} ya está registrado`);
        return res.status(400).json({ mensaje: `El correo ${correo} ya está registrado` });
      }

      // Verificar si el rol existe
      const rolId = rolid || 2; // Rol 2 por defecto
      console.log(`Verificando rol con ID: ${rolId}`);
      const rolExistente = await UsuarioService.verificarRol(rolId);
      if (!rolExistente) {
        console.log(`El rol con ID ${rolId} no existe`);
        return res.status(400).json({ mensaje: "El rol seleccionado no existe" });
      }

      // Manejo de imagen (opcional)
      let imagenUrl = null;
      
      if (req.file) {
        console.log("Subiendo imagen a Cloudinary...");
        try {
          const uploadResponse = await cloudinaryService.subirImagenUsuario(
            req.file.buffer,
            `perfil-${Date.now()}-${nombre.toLowerCase().replace(/\s+/g, '-')}`
          );
          
          if (uploadResponse?.secure_url) {
            console.log("Imagen subida exitosamente:", uploadResponse.secure_url);
            imagenUrl = uploadResponse.secure_url;
          } else {
            console.log("No se pudo obtener la URL de la imagen subida");
          }
        } catch (uploadError) {
          console.error("Error al subir la imagen:", uploadError);
          // Continuamos sin la imagen en caso de error
        }
      } else {
        console.log("No se proporcionó imagen, continuando sin ella");
      }
      
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

      const nuevoUsuario = await UsuarioService.crearUsuario({
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        contrasena: contrasenaEncriptada,
        genero,
        estado: true, // Usuario activo por defecto
        rolid: rolid || 3, // Rol por defecto 3 (propietario) si no se especifica
        imagen: imagenUrl, // Puede ser null si no se subió imagen
      });
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        contrasena,
        genero,
        estado,
        rolid,
      } = req.body;
      const usuario = await UsuarioService.buscarUsuario(id);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }
      const rolExistente = await UsuarioService.verificarRol(rolid);
      if (!rolExistente) {
        return res
          .status(400)
          .json({ mensaje: "El rol seleccionado no existe" });
      }

      const datosActualizados = {
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        genero,
        estado,
        rolid,
      };

      // Si se proporciona una nueva contraseña, encriptarla
      if (contrasena) {
        const salt = await bcrypt.genSalt(10);
        datosActualizados.contrasena = await bcrypt.hash(contrasena, salt);
      }

      const usuarioActualizado = await UsuarioService.actualizarUsuario(
        id,
        datosActualizados
      );
      res.json(usuarioActualizado);
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.buscarUsuario(id);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }
      const resultado = await UsuarioService.eliminarUsuario(id);
      res.json({ mensaje: "Usuario eliminado correctamente", resultado });
    } catch (error) {
      res.status(500).json({ 
        mensaje: "Error en el servicio",
        error: error.message
      });
    }
  }

  async buscarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.buscarUsuario(id);

      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async obtenerPropietarios(req, res) {
    try {
      const propietarios = await UsuarioService.buscarPorRol(2);
      res.json(propietarios);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener propietarios" });
    }
  }

  async buscarPorRol(req, res) {
    try {
      const { rolId } = req.params;
      const usuarios = await UsuarioService.buscarPorRol(rolId);

      if (!usuarios || usuarios.length === 0) {
        return res.status(404).json({ message: "No hay usuarios con ese rol" });
      }

      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async cambiarEstadoUsuario(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const usuario = await UsuarioService.buscarUsuario(id);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      const usuarioActualizado = await UsuarioService.actualizarUsuario(id, {
        estado,
      });
      res.json(usuarioActualizado);
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}
module.exports = new UsuarioController();
