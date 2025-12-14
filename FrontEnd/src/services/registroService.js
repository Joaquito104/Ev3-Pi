import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const registrarUsuario = async (data) => {
  const res = await axios.post(`${API_URL}/registro/`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};
