const cloudinaryService = require("../service/cloudinaryService");
const LugarService = require("../service/lugarService");

class LugarController {
  async listarLugares(req, res) {
    try {
      const lugares = await LugarService.listarLugares();

      if (!lugares || lugares.length === 0) {
        return res.status(404).json({ mensaje: "No se encontraron lugares registrados" });
      }

      res.status(200).json(lugares);
    } catch (e) {
      res.status(500).json({ mensaje: "Error al listar lugares", error: e.message });
    }
  }

  async buscarLugar(req, res) {
    try {
      const { id } = req.params;
      const lugar = await LugarService.buscarLugar(id, true);

      if (!lugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      res.status(200).json(lugar);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al buscar el lugar", error: error.message });
    }
  }

  async crearLugar(req, res) {
    try {
      const { usuarioid, categoriaid, nombre, descripcion, ubicacion } = req.body;
      let imagenUrl = null;
  
      if (!req.file) {
        return res.status(400).json({ mensaje: "La imagen es requerida" });
      }
    
      // Subir la imagen a Cloudinary
      const uploadResponse = await cloudinaryService.subirImagen(
        req.file.buffer,
        `lugar-${Date.now()}`
      );
  
      if (!uploadResponse) {
        return res.status(500).json({ mensaje: "Error al subir la imagen" });
      }
  
      imagenUrl = uploadResponse.secure_url;
  
      const dataLugar = {
        usuarioid,
        categoriaid,
        nombre,
        descripcion,
        ubicacion,
        estado: false,
        imagen: imagenUrl,
      };
  
      const nuevoLugar = await LugarService.crearLugar(dataLugar);

      res.status(201).json({
        mensaje: "Lugar creado con éxito",
        lugar: nuevoLugar,
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al crear lugar", error: error.message });
    }
  }
  
  async actualizarLugar(req, res) {
    try {
      const { usuarioid, categoriaid, nombre, descripcion, ubicacion } = req.body;
      const lugarid = req.params.id;
      let imagenUrl = null;

      if (req.file) {
        const uploadResponse = await cloudinaryService.subirImagen(
          req.file.buffer,
          `${lugarid}-${Date.now()}`
        );

        if (!uploadResponse) {
          return res.status(500).json({ mensaje: "Error al subir la imagen" });
        }

        imagenUrl = uploadResponse.secure_url;
      }

      const lugarActualizado = await LugarService.actualizarLugar(lugarid, {
        usuarioid, categoriaid, nombre, descripcion, ubicacion,
        imagen: imagenUrl || null,
      });

      res.json({
        mensaje: "Lugar actualizado con éxito",
        lugar: {
          ...lugarActualizado.dataValues,
          imagen: imagenUrl || lugarActualizado.imagen
        },
      });
    } catch (error) {
      // Manejo de errores personalizados
      if (error.name === 'LugarError') {
        switch (error.tipo) {
          case 'NO_ENCONTRADO':
            return res.status(404).json({
              mensaje: "Error al actualizar el lugar",
              error: error.message
            });
          case 'DUPLICADO':
            return res.status(409).json({
              mensaje: "No se puede actualizar el lugar",
              error: "El nombre ya está siendo utilizado por otro lugar",
              tipo: "conflicto",
              detalles: {
                campo: "nombre",
                valor: req.body.nombre,
                sugerencia: "Por favor, elija un nombre diferente o mantenga el nombre actual"
              }
            });
          case 'VALIDACION':
            return res.status(400).json({
              mensaje: "Error de validación",
              error: error.message
            });
          default:
            return res.status(500).json({
              mensaje: "Error al actualizar el lugar",
              error: "Error interno del servidor"
            });
        }
      }

      // Manejo de errores de Sequelize
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Ya existe un lugar con este nombre",
          campo: error.errors[0].path,
          valor: error.errors[0].value
        });
      }

      // Error genérico
      res.status(500).json({
        mensaje: "Error al actualizar el lugar",
        error: "Error interno del servidor"
      });
    }
  }

  async eliminarLugar(req, res) {
    try {
      const { id } = req.params;

      const existeLugar = await LugarService.buscarLugar(id);
      if (!existeLugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      await LugarService.eliminarLugar(id);
      res.json({ mensaje: "Lugar eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al eliminar lugar", error: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const actualizados = await LugarService.actualizarEstado(id, estado);

      if (actualizados[0] === 0) {
        const existe = await LugarService.buscarLugar(id);
        if (!existe) {
          return res.status(404).json({ mensaje: 'Lugar no encontrado' });
        }
        return res.status(200).json({ mensaje: 'El estado ya estaba igual', lugar: existe });
      }

      const lugar = await LugarService.buscarLugar(id, true);
      res.json({ mensaje: 'Estado actualizado', lugar });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
    }
  }
}

module.exports = new LugarController();
