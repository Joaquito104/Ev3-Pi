import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../App";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const DashboardAuditor = () => {
  const { theme } = useContext(ThemeContext);

  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    cargarPendientes();
  }, []);

  // =============================
  // CARGAR PENDIENTES
  // =============================
  const cargarPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("ev3pi-token");

      const res = await axios.get(
        `${API_BASE_URL}/calificaciones-pendientes/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCalificaciones(res.data?.calificaciones || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al cargar calificaciones pendientes");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // RESOLVER CALIFICACIÓN
  // =============================
  const resolver = async (id, estado) => {
    try {
      const token = localStorage.getItem("ev3pi-token");

      await axios.post(
        `${API_BASE_URL}/calificaciones-resolver/${id}/`,
        { estado, comentario },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComentario("");
      cargarPendientes();
    } catch (err) {
      console.error(err);
      alert("Error al resolver calificación");
    }
  };

  const statusBadgeClass = () => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    return theme === "dark"
      ? `${base} bg-amber-900/40 text-amber-200`
      : `${base} bg-yellow-100 text-yellow-800`;
  };

  const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const pageBg =
    "min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-gray-900 dark:text-white";
  const cardBg =
    "bg-white border border-gray-100 dark:bg-gray-900/70 dark:border-gray-800";

  return (
    <div className={pageBg}>
      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className={`mb-8 p-6 rounded-2xl shadow ${cardBg}`}>
          <h1 className="text-3xl font-bold mb-2">
            🕵️ Dashboard - Auditor Interno
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Validación final de calificaciones pendientes
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* TABLA */}
        <div className={`p-6 rounded-2xl shadow ${cardBg}`}>
          <h2 className="text-xl font-bold mb-4">Calificaciones Pendientes</h2>

          {loading ? (
            <p>Cargando...</p>
          ) : calificaciones.length === 0 ? (
            <p>No hay calificaciones pendientes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">RUT</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Período</th>
                    <th className="px-4 py-2 text-left">Monto</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Comentario</th>
                    <th className="px-4 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {calificaciones.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{c.rut}</td>
                      <td className="px-4 py-2">{c.tipo_certificado}</td>
                      <td className="px-4 py-2">{c.periodo}</td>
                      <td className="px-4 py-2">
                        {formatoCLP.format(c.monto || 0)}
                      </td>
                      <td className="px-4 py-2">
                        <span className={statusBadgeClass()}>
                          PENDIENTE
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="Comentario del auditor"
                          className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-2 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => resolver(c._id, "APROBADA")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold"
                        >
                          Aprobar
                        </button>

                        <button
                          onClick={() => resolver(c._id, "OBSERVADA")}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm font-semibold"
                        >
                          Observar
                        </button>

                        <button
                          onClick={() => resolver(c._id, "RECHAZADA")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold"
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
    </div>
  );
};

export default DashboardAuditor;
