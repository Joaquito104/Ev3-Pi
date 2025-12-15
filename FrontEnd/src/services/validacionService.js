import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// FIX DEFINITIVO: leer token correcto
const authHeader = () => {
  const token = localStorage.getItem("proyecto-token");

  if (!token) {
    console.warn("❌ No hay token JWT en localStorage");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
// ==========================
// OBTENER PENDIENTES
// ==========================
export const obtenerPendientes = async () => {
  const response = await axios.get(`${API_URL}/validacion/`, {
    headers: authHeader(),
  });
  return response.data;
};

// ==========================
// VALIDAR / OBSERVAR / RECHAZAR
// ==========================
export const validarCalificacion = async (id, estado, comentario = "") => {
  const response = await axios.patch(
    `${API_URL}/validacion/${id}/`,
    { estado, comentario },
    { headers: authHeader() }
  );
  return response.data;
};
