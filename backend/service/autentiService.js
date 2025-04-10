const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const TemporalService = require("./temporalService");
const UsuarioService = require("./usuarioService");
require("dotenv").config();

class AutentiService {
  static generarCodigo() {
    return crypto.randomInt(100000, 999999).toString();
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

    const contrasenavalida = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!contrasenavalida.test(contrasena)) {
      throw new Error("Contraseña insegura");
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

    if (edadExacta < 16) {
      throw new Error("Edad mínima de registro: 16 años");
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
    const expiracion = new Date(Date.now() + 5 * 60 * 1000);

    await TemporalService.guardarCodigo(correo, codigo, expiracion);

    const usuario = await UsuarioService.crearUsuario({
      ...datos,
      contrasena: contrasenaHash,
      estado: false,
    });

    return { usuario, codigo };
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

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rolid },
      process.env.JWT_SECRET || "secreto",
      { expiresIn: "2h" }
    );

    return { token, usuario };
  }

  static async enviarCodigoRecuperacion(correo) {
    const usuario = await UsuarioService.buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no encontrado");

    const codigo = this.generarCodigo();
    const expiracion = new Date(Date.now() + 5 * 60 * 1000);

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

    const contrasenavalida = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    if (!contrasenavalida.test(nuevaContrasena)) {
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

    const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);
    await UsuarioService.actualizarContrasena(correo, nuevaHash);
  }
}

module.exports = AutentiService;
