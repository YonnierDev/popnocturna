import axios from "axios";

export const api = axios.create({
  baseURL: "", // Asegúrate de que el backend usa HTTPS
  headers: {
    "Content-Type": "application/json",
  },
});
