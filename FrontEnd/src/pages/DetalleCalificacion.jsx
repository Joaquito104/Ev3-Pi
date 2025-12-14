import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext, AuthContext } from "../App";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function DetalleCalificacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [calificacion, setCalificacion] = useState(null);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("ev3pi-token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line
  }, []);

  const cargarDetalle = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/calificaciones-corredor/${id}/`,
        { headers }
      );
      setCalificacion(res.data);
      setComentario(res.data.comentario || "");
    } catch {
      setError("No se pudo cargar la calificación");
    } finally {
      setLoading(false);
    }
  };

  const corregirYReenviar = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/calificaciones-corredor/${id}/`,
        { comentario },
        { headers }
      );

      alert("Corrección enviada. Vuelve a BORRADOR");
      navigate("/dashboard/corredor");
    } catch {
      alert("Error al enviar corrección");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const puedeCorregir =
    user?.rol === "CORREDOR" && calificacion?.estado === "OBSERVADA";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📄 Detalle de Calificación</h1>

      <div className="space-y-2 mb-6">
        <p><b>RUT:</b> {calificacion.rut}</p>
        <p><b>Tipo:</b> {calificacion.tipo_certificado}</p>
        <p><b>Período:</b> {calificacion.periodo}</p>
        <p><b>Monto:</b> ${calificacion.monto}</p>
        <p><b>Estado:</b> {calificacion.estado}</p>
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        disabled={!puedeCorregir}
        className="w-full p-3 border rounded mb-4"
        rows={4}
      />

      {puedeCorregir && (
        <button
          onClick={corregirYReenviar}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          🔁 Corregir y reenviar
        </button>
      )}

      <button
        onClick={() => navigate(-1)}
        className="ml-3 px-4 py-2 border rounded"
      >
        Volver
      </button>
    </div>
  );
}
