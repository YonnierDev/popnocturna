import { useEffect, useState } from "react";
import { api } from "./api/api";
import "./UserListPage.css"; // Asegúrate de importar los estilos
 
const UserListPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/user")
      .then((res) => {
        setUsuarios(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="user-list-container">
      <h2>Lista de Usuarios</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>{user.correo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserListPage;

