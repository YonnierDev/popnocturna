import { useState } from "react";
import { api } from "./api/api";
import { useNavigate,Link } from "react-router-dom"
import "./AuthForm.css"; // Asegúrate de importar el CSS
import logo from "./logos.png"; // Ruta de la imagen
const Register = () => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate(); 
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/user", { nombre, correo, contrasena });
      console.log("✅ Usuario registrado:", response.data);
      navigate("/usuarios");
    } catch (error) {
      alert("Error en la petición, revisa la consola.");
      console.error("ERROR AL REGISTRAR:", error);
    }
  };

  return (
    <div className="auth-container">
           
          <div className="auth-box">
            <div className="title">
              <h2>Registro de Usuario</h2>
            </div>
              <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre"
          onChange={(e) => setNombre(e.target.value)}
          required
        />
          <input
            type="text"
          placeholder="Correo"
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
          <input
            type="text"
          placeholder="Contraseña"
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
      </form>
             <div className="separator">
          <span>----------------------------- o ----------------------------</span>
        </div>
       
        {/* 🔹 Íconos de redes sociales */}
        <div className="social-icons">
          <div className="social-circle">F</div>
          <div className="social-circle">G</div>
          <div className="social-circle">ln</div>
        </div>

        <div  className="title">
        <p className="register-text">
          ¿Tienes cuenta? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
       <div className="logo">
            <img src={logo} alt="Photobella Logo" className="logo-img" />
            <div className="logo-text">
            </div>
        </div>
    </div>

  );
};

export default Register;

