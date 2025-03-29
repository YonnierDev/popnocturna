const UsuarioService = require('../service/usuarioService');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
class UsuarioController {
    async listarUsuarios(req, res) {
        try {
            const listaUsuarios = await UsuarioService.listarUsuarios();
            res.json(listaUsuarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }

    async crearUsuario(req, res) {
        try {
            console.log("Datos recibidos en el en backend", req.body);
            const { nombre, apellido, correo, fecha_nacimiento, contrasena, genero } = req.body;
            const estado = "activo";
            const rolid = 13; 
            
            const usuarioExistente = await UsuarioService.buscarPorCorreo(correo);
            if (usuarioExistente) {
                return res.status(400).json({ mensaje: "El correo ya está registrado" });
            }

            const rolExistente = await UsuarioService.verificarRol(rolid);
            if (!rolExistente) {
                return res.status(400).json({ mensaje: "El rol seleccionado no existe" });
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
                rolid
            });
    
            res.status(201).json(nuevoUsuario);
        } catch (error) {
            console.error("Error detallado:", error);
            res.status(500).json({ 
                mensaje: "Error en el servicio", 
                error: error.message,
                stack: error.stack 
            });
        }
    }
    

    async actualizarUsuario(req, res) {
        try {
            const { id } = req.params;
            const { nombre, apellido, correo, fecha_nacimiento, contrasena, genero, estado, rolid } = req.body;
            
            // Verificar si el usuario existe
            const usuario = await UsuarioService.buscarUsuario(id);
            if (!usuario) {
                return res.status(404).json({ mensaje: "Usuario no encontrado" });
                
            }
            const rolExistente = await UsuarioService.verificarRol(rolid);
            if (!rolExistente) {
                return res.status(400).json({ mensaje: "El rol seleccionado no existe" });
            }

            // Preparar datos para actualizar
            const datosActualizados = {
                nombre,
                apellido,
                correo,
                fecha_nacimiento,
                genero,
                estado,
                rolid
            };

            // Si se proporciona una nueva contraseña, encriptarla
            if (contrasena) {
                const salt = await bcrypt.genSalt(10);
                datosActualizados.contrasena = await bcrypt.hash(contrasena, salt);
            }

            const usuarioActualizado = await UsuarioService.actualizarUsuario(id, datosActualizados);
            res.json(usuarioActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }

    async eliminarUsuario(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar si el usuario existe
            const usuario = await UsuarioService.buscarUsuario(id);
            if (!usuario) {
                return res.status(404).json({ mensaje: "Usuario no encontrado" });
            }

            await UsuarioService.eliminarUsuario(id);
            res.json({ mensaje: "Usuario eliminado correctamente" });
        } catch (error) {
            console.error(error);
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
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }
    async login(req, res) {
        try {
            const { correo, contrasena } = req.body;

            if (!correo || !contrasena) {
                return res.status(400).json({ mensaje: "Correo y contraseña son obligatorios" });
            }

            const usuario = await UsuarioService.buscarPorCorreo(correo);
            if (!usuario) {
                return res.status(401).json({ mensaje: "Coredenciales inválidas" });
            }

          
            const desenCrypt=await bcrypt.compare(contrasena,usuario.contrasena)
            if(desenCrypt) {	
                console.log(desenCrypt);
            }
            else{

            }
            
            const token = jwt.sign(
                { id: usuario.id, correo: usuario.correo, rolid: usuario.rolid },
                "secreto_super_seguro",
                { expiresIn: "2h" }
            );

            res.json({ mensaje: "Login exitoso", token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }
    
    async obtenerPropietarios(req, res) {
        try {
            const propietarios = await UsuarioService.buscarPorRol(6);
            res.json(propietarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error al obtener propietarios" });
        }
    
    }

}
module.exports = new UsuarioController();

