import { useEffect, useState } from "react";
import { api } from "./api/api";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/usuarios");
        setUsers(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios", error);
      }
    };
    fetchUsers();
  }, []);
 
  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.nombre} - {user.correo}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
