import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const authHeader = () => {
  const token = localStorage.getItem("proyecto-token");

  if (!token) {
    console.warn("❌ No hay token JWT");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const obtenerRegistros = async () => {
  const res = await axios.get(`${API_URL}/registros/`, {
    headers: authHeader(),
  });
  return res.data;
};

export const eliminarRegistro = async (id) => {
  await axios.delete(`${API_URL}/registros/${id}/`, {
    headers: authHeader(),
  });
};

export const editarRegistro = async (id, data) => {
  const res = await axios.patch(
    `${API_URL}/registros/${id}/`,
    data,
    { headers: authHeader() }
  );
  return res.data;
};
