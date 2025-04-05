const TemporalService = require('../service/temporalService'); 
const UsuarioService = require('../service/usuarioService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

class AutentiController {

    static generarCodigo() {
        return crypto.randomInt(100000, 999999).toString();
    }

    static async registrar(req, res) {
        try {
            const { nombre, apellido, correo, fecha_nacimiento, contrasena, genero } = req.body;

            if (!nombre || !apellido || !correo || !fecha_nacimiento || !contrasena || !genero) {
                return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                return res.status(400).json({ mensaje: "Correo no válido" });
            }

            const contrasenavalida = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
            if (!contrasenavalida.test(contrasena)) {
                return res.status(400).json({
                    mensaje: "La contraseña debe tener entre 8 y 20 caracteres, incluir una mayúscula, un número y un simbolo"
                });
            }

            const generosPermitidos = ["Masculino", "Femenino", "Otro"];
            if (!generosPermitidos.includes(genero)) {
                return res.status(400).json({ mensaje: "Género no válido. Escoja uno" });
            }

            const fechaNacimientoDate = new Date(fecha_nacimiento);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
            const mes = hoy.getMonth() - fechaNacimientoDate.getMonth();
            const dia = hoy.getDate() - fechaNacimientoDate.getDate();
            const edadExacta = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;

            if (edadExacta < 16) {
                return res.status(400).json({ mensaje: "Edad minima de registro: 16 años" });
            }

            const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
            if (usuarioExistente) {
                return res.status(400).json({ mensaje: "Correo Existente" });
            }

            const contrasenaHash = await bcrypt.hash(contrasena, 10);
            const codigoVerificacion = AutentiController.generarCodigo();
            const expiracion = Date.now() + 5 * 60 * 1000; 

            const codtemp =TemporalService.guardarCodigo(correo, codigoVerificacion, new Date (expiracion)); 
            console.log(codtemp);
            const usuario = await UsuarioService.crearUsuario({
                nombre,
                apellido,
                correo,
                fecha_nacimiento,
                contrasena: contrasenaHash,
                genero,
                estado: false
            });

            await transporter.sendMail({
                from: `Popayán Nocturna <${process.env.EMAIL_USER}>`,
                to: correo,
                subject: 'Código de verificación',
                html: `<p>Tu código de verificación es: <strong>${codigoVerificacion}</strong></p>`
            });

            res.status(201).json({ mensaje: "Usuario registrado. Verifica tu correo.", usuario });

        } catch (error) {
            console.error("Error al registrar usuario:", error);
            res.status(500).json({ mensaje: "Error en el registro", error: error.message });
        }
    }

    static async validarCorreo(req, res) {
        try {
            const { correo, codigo } = req.body;
            const codigoGuardado = await TemporalService.obtenerCodigo(correo);

            if (!codigoGuardado) {
                return res.status(400).json({ mensaje: "Código inválido o expirado" });
            }

            const ahora = Date.now();

            if (codigoGuardado.codigo !== codigo || ahora > codigoGuardado.expiracion) {
                return res.status(400).json({ mensaje: "Código inválido o expirado" });
            }

            await UsuarioService.activarUsuario(correo);
            await TemporalService.eliminar(correo);

            res.json({
              mensaje: "VALIDACION EXITOSA. BIENVENIDO A POPAYAN NOCTURNA",
            });

        } catch (error) {
            res.status(400).json({ mensaje: "Error en la validación", error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { correo, contrasena } = req.body;
            const usuario = await UsuarioService.buscarPorCorreo(correo);

            if (!usuario || !usuario.estado) {
                return res.status(401).json({ mensaje: "Usuario no validado o no existe" });
            }

            const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
            if (!esValido) {
                return res.status(401).json({ mensaje: "Contraseña incorrecta" });
            }

            const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET || 'secreto', {
                expiresIn: "2h"
            });

            res.json({ mensaje: "Login exitoso", token });

        } catch (error) {
            res.status(401).json({ mensaje: "Error en el login", error: error.message });
        }
    }

    static async recuperarContrasena(req, res) {
        try {
            const { correo } = req.body;
            const usuario = await UsuarioService.buscarPorCorreo(correo);

            if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

            const codigoRecuperacion = AutentiController.generarCodigo();
            const expiracion = Date.now() + 5 * 60 * 1000;

            await TemporalService.guardarCodigo(correo, codigoRecuperacion, new Date (expiracion));

            await transporter.sendMail({
                from: `"Popayán Nocturna" <${process.env.EMAIL_USER}>`,
                to: correo,
                subject: 'Código de recuperación de contraseña',
                html: `<p>Tu código para recuperar la contraseña es: <strong>${codigoRecuperacion}</strong></p>`
            });
            console.log(codigoRecuperacion);
            console.log(expiracion);
            res.json({ mensaje: "Código de recuperación enviado" });

        } catch (error) {
            res.status(500).json({ mensaje: "Error en la recuperación", error: error.message });
        }
    }

    static async cambiarContrasena(req, res) {
        try {
            const { correo, codigo, nuevaContrasena } = req.body;
            const codigoGuardado = await TemporalService.obtenerCodigo(correo);

            if (!codigoGuardado || codigoGuardado.codigo !== codigo || Date.now() > codigoGuardado.expiracion) {
                return res.status(400).json({ mensaje: "Código inválido o expirado" });
            }

            const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, 10);
            await UsuarioService.actualizarContrasena(correo, nuevaContrasenaHash);

            await TemporalService.eliminar(correo);

            res.json({ mensaje: "Contraseña cambiada correctamente" });

        } catch (error) {
            res.status(400).json({ mensaje: "Error al cambiar contraseña", error: error.message });
        }
    }
}

module.exports = AutentiController;
