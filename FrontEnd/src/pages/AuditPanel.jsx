import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../App";
import { obtenerPendientes } from "../services/validacionService";

export default function AuditPanel() {
  const { theme } = useContext(ThemeContext);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await obtenerPendientes();
      setItems(data);
      setError("");
    } catch (err) {
      console.error("ERROR REAL:", err);
      setError("Error cargando bandeja de validación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const pageBg = "min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-gray-900 dark:text-white";
  const cardBg = "bg-white border border-gray-100 dark:bg-gray-900/70 dark:border-gray-800";

  const statusBadgeClass = (estado) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    if (theme === "dark") {
      if (estado === "APROBADA") return `${base} bg-green-900/40 text-green-200 border border-green-800/60`;
      if (estado === "RECHAZADA") return `${base} bg-red-900/40 text-red-200 border border-red-800/60`;
      if (estado === "PENDIENTE") return `${base} bg-amber-900/40 text-amber-200 border border-amber-800/60`;
      if (estado === "OBSERVADA") return `${base} bg-orange-900/40 text-orange-200 border border-orange-800/60`;
      return `${base} bg-gray-800 text-gray-200 border border-gray-700`;
    }
    if (estado === "APROBADA") return `${base} bg-green-100 text-green-800`;
    if (estado === "RECHAZADA") return `${base} bg-red-100 text-red-800`;
    if (estado === "PENDIENTE") return `${base} bg-yellow-100 text-yellow-800`;
    if (estado === "OBSERVADA") return `${base} bg-orange-100 text-orange-800`;
    return `${base} bg-gray-100 text-gray-800`;
  };

  if (loading) {
    return (
      <div className={pageBg}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageBg}>
      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className={`mb-8 p-6 rounded-2xl shadow-lg ${cardBg}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔍 Bandeja de Validación</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Revisa y valida las calificaciones pendientes
              </p>
            </div>
            <button
              onClick={cargar}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition"
            >
              🔄 Refrescar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className={`p-12 rounded-2xl shadow text-center ${cardBg}`}>
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No hay calificaciones pendientes de validación
            </p>
          </div>
        ) : (
          <div className={`p-6 rounded-2xl shadow ${cardBg}`}>
            <h2 className="text-xl font-bold mb-4">📋 Calificaciones Pendientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Registro</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Creado por</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="px-4 py-3">{c.id}</td>
                      <td className="px-4 py-3">{c.registro?.titulo || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span className={statusBadgeClass(c.estado)}>{c.estado}</span>
                      </td>
                      <td className="px-4 py-3">{c.creado_por || "N/A"}</td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
