import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
     <nav className="navbar">
      <div className="nav-container">
        <h1 className="logo"></h1>
            <ul className="nav-links">
                    <li><Link to="/usuarios">Usuarios</Link></li>
            </ul>
        </div>      
    </nav>
  );
};


 
export default Navbar;
