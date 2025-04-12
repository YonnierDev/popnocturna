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
      res.status(500).json({ mensaje: "Error al listar usuarios" });
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
      const estado = true;

      const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
      if (usuarioExistente) {
        return res
          .status(400)
          .json({ mensaje: "El correo ya está registrado" });
      }

      const rolExistente = await UsuarioService.verificarRol(rolid);
      if (!rolExistente) {
        return res
          .status(400)
          .json({ mensaje: "El rol seleccionado no existe" });
      }

      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

      const nuevoUsuario = await UsuarioService.crearUsuario({
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        contrasena: contrasenaEncriptada,
        genero,
        estado,
        rolid,
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

      await UsuarioService.eliminarUsuario(id);
      res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
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
