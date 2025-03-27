import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import "./AuthForm.css"; // Asegúrate de importar el CSS
import logo from "./logos.png"; // Ruta de la imagen
import { api } from "./api/api";

const Login = ({ setIsAuthenticated }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/user", { correo, contrasena });
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      alert("Login exitoso!");
      navigate("/usuarios"); // Redirige a la tabla de usuarios
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="auth-container">
       <div className="logo">
        <img src={logo} alt="Photobella Logo" className="logo-img" />
        <div className="logo-text">
        </div>
      </div>
      <div className="auth-box">
        <div className="title">
          <h2>LOGIN</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              placeholder="Ingresa tu correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              placeholder="********"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
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
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
