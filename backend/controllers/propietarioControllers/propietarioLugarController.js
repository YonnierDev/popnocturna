const cloudinaryService = require("../../service/cloudinaryService");
const PropietarioLugarService = require("../../service/propietarioService/propietarioLugarService");

class PropietarioLugarController {
  async listarLugaresPropietario(req, res) {
    try {
      const usuarioid = req.usuario.id;
      console.log("TOKEN:", usuarioid);
      const lugares =
        await PropietarioLugarService.listarLugaresPropietario(usuarioid);
      console.log("LUGARES ENCONTRADOS:", lugares);
      res.json(lugares);
    } catch (error) {
      console.error("Error al listar lugares:", error);
      res
        .status(500)
        .json({ error: "Error al listar lugares", detalles: error.message });
    }
  }

  async aprobarLugarPropietario(req, res) {
    try {
      const { id } = req.params;
      const lugarAprobado =
        await PropietarioLugarService.aprobarLugarPropietario(id);
      res.json(lugarAprobado);
    } catch (error) {
      console.error("Error al aprobar el lugar:", error);
      res.status(500).json({ error: "Error al aprobar el lugar" });
    }
  }

  async crearLugarPropietario(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const { categoriaid, nombre, descripcion, ubicacion } = req.body;
      let imagenUrl = null;

      if (!req.file) {
        console.log("No se recibió imagen");
        return res.status(400).json({ mensaje: "La imagen es requerida" });
      }

      console.log("Imagen recibida:", req.file);

      // Subir la imagen a Cloudinary
      const uploadResponse = await cloudinaryService.subirImagen(
        req.file.buffer,
        `lugar-${Date.now()}`
      );

      if (!uploadResponse) {
        console.log("Error al subir la imagen");
        return res.status(500).json({ mensaje: "Error al subir la imagen" });
      }

      imagenUrl = uploadResponse.secure_url;
      console.log("Imagen subida:", imagenUrl);

      const dataLugar = {
        usuarioid,
        categoriaid,
        nombre,
        descripcion,
        ubicacion,
        estado: true,
        imagen: imagenUrl,
        aprobacion: false,
      };

      const nuevoLugar =
        await PropietarioLugarService.crearLugarPropietario(dataLugar);
      console.log("Lugar creado:", nuevoLugar);

      res.status(201).json({
        mensaje: "Lugar creado con éxito",
        lugar: nuevoLugar,
      });
    } catch (error) {
      console.error("Error al crear lugar:", error);
      res
        .status(500)
        .json({ mensaje: "Error al crear lugar", error: error.message });
    }
  }
}

module.exports = new PropietarioLugarController();
