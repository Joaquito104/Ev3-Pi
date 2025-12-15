import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("proyecto-token")}`,
  "Content-Type": "application/json",
});

export const obtenerPerfil = async () => {
  const res = await axios.get(`${API_URL}/perfil/editar/`, {
    headers: authHeader(),
  });
  return res.data;
};

export const actualizarPerfil = async (data) => {
  const res = await axios.put(`${API_URL}/perfil/editar/`, data, {
    headers: authHeader(),
  });
  return res.data;
};
