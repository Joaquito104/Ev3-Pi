import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const enviarFeedback = async (mensaje) => {
  const res = await axios.post(
    `${API_URL}/feedback/`,
    { mensaje },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("proyecto-token")}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};
