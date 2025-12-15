import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../App";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "../hooks/useOptimizations.jsx";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const ValidationInbox = () => {
  const { theme } = useContext(ThemeContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accionMsg, setAccionMsg] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("proyecto-token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/calificaciones-pendientes/`, { headers });
      setItems(res.data?.calificaciones || []);
      setError(null);
    } catch (err) {
      setError("Nada hasta ahora");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resolver = async (id, estado) => {
    try {
      setAccionMsg(null);
      const token = localStorage.getItem("proyecto-token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API_BASE_URL}/calificaciones-pendientes/${id}/resolver/`,
        { estado },
        { headers }
      );
      setAccionMsg(`Calificación ${id} marcada como ${estado}`);
      loadData();
    } catch (err) {
      setAccionMsg(err.response?.data?.detail || "Error al resolver");
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">📥 Bandeja de Validación</h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Revisa calificaciones en estado PENDIENTE y resuélvelas
            </p>
          </div>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Refrescar
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorAlert 
              error={new Error(error)} 
              theme={theme} 
              onClose={() => setError(null)}
            />
          </div>
        )}

        {accionMsg && (
          <div className="mb-4">
            <SuccessAlert 
              message={accionMsg}
              theme={theme}
              onClose={() => setAccionMsg(null)}
              duration={4000}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner theme={theme} size="lg" />
          </div>
        ) : items.length === 0 ? (
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>No hay validaciones pendientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">RUT</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Periodo</th>
                  <th className="px-4 py-3 text-left">Documentos</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((cal) => (
                  <tr key={cal._id} className={theme === "dark" ? "border-b border-gray-700" : "border-b border-gray-200"}>
                    <td className="px-4 py-3">{cal._id}</td>
                    <td className="px-4 py-3">{cal.rut}</td>
                    <td className="px-4 py-3">{cal.tipo_certificado}</td>
                    <td className="px-4 py-3">{cal.periodo}</td>
                    <td className="px-4 py-3">
                      {cal.documentos?.length ? (
                        <ul className="list-disc list-inside text-sm">
                          {cal.documentos.map((d) => (
                            <li key={d._id}>{d.metadata?.filename || d._id}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin documentos</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => resolver(cal._id, "APROBADA")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => resolver(cal._id, "OBSERVADA")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Observar
                      </button>
                      <button
                        onClick={() => resolver(cal._id, "RECHAZADA")}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationInbox;
