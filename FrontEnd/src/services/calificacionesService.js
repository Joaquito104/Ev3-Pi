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

// Crear calificación (BORRADOR)
export const crearCalificacion = async (registroId) => {
  const res = await axios.post(
    `${API_URL}/calificaciones/`,
    { registro_id: registroId },
    { headers: authHeader() }
  );
  return res.data;
};

// Enviar a validación (BORRADOR -> PENDIENTE)
export const enviarValidacion = async (calificacionId) => {
  const res = await axios.patch(
    `${API_URL}/calificaciones/${calificacionId}/enviar/`,
    {},
    { headers: authHeader() }
  );
  return res.data;
};
