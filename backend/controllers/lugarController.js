const LugarService = require("../service/lugarService");

class LugarController {
  async listarLugares(req, res) {
    try {
      const listarLugares = await LugarService.listarLugares();
      res.json(listarLugares);
    } catch (e) {
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: e.message });
    }
  }

  async listarRelaciones(req, res) {
    try {
      const lugares = await LugarService.listarRelaciones();
      res.json(lugares);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al listar lugares', error });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const actualizados = await LugarService.actualizarEstado(id, estado);

      if (actualizados[0] === 0) {
        const existe = await LugarService.buscarPorId(id);
        if (!existe) {
          return res.status(404).json({ mensaje: 'Lugar no encontrado' });
        }
        return res.status(200).json({ mensaje: 'El estado ya estaba igual', lugar: existe });
      }

      const lugar = await LugarService.buscarLugar(parseInt(id));
      res.json({ mensaje: 'Estado actualizado', lugar });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al actualizar estado', error });
    }
  }

  async crearLugar(req, res) {
    try {
      const { usuarioid, categoriaid, nombre, descripcion, ubicacion } =
        req.body;
      const estado = true;

      const usuarioExistente = await LugarService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      const categoriaExistente =
        await LugarService.verificarCategoria(categoriaid);
      if (!categoriaExistente) {
        return res.status(400).json({ mensaje: "La categoria no existe" });
      }

      const nuevoLugar = await LugarService.crearLugar(
        usuarioid,
        categoriaid,
        nombre,
        descripcion,
        ubicacion,
        estado
      );

      res.status(201).json(nuevoLugar);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async actualizarLugar(req, res) {
    try {
      const { id } = req.params;
      const { categoriaid, usuarioid, nombre, descripcion, ubicacion, estado } =
        req.body;

      // Verificar si la categoría existe
      const categoriaExistente =
        await LugarService.verificarCategoria(categoriaid);
      if (!categoriaExistente) {
        return res.status(400).json({ mensaje: "La categoría no existe" });
      }

      // Verificar si el usuario existe
      const usuarioExistente = await LugarService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      // Actualizar datos del lugar
      const datosActualizados = {
        categoriaid,
        usuarioid,
        nombre,
        descripcion,
        ubicacion,
        estado,
      };

      const lugarActualizado = await LugarService.actualizarLugar(
        id,
        datosActualizados
      );
      res.json(lugarActualizado);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async eliminarLugar(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el lugar existe
      const existeLugar = await LugarService.buscarLugar(id);
      if (!existeLugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      await LugarService.eliminarLugar(id);
      res.json({ mensaje: "Lugar eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async buscarLugar(req, res) {
    try {
      const { id } = req.params;
      const lugar = await LugarService.buscarLugar(id);

      if (!lugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      res.json(lugar);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }
}

module.exports = new LugarController();
