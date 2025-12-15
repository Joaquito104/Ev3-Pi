import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../App";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const DashboardAnalista = () => {
  const { theme } = useContext(ThemeContext);

  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    estado: "",
  });

  useEffect(() => {
    cargarCalificaciones();
  }, []);

  // =============================
  // CARGAR CALIFICACIONES
  // =============================
  const cargarCalificaciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("ev3pi-token");

      const res = await axios.get(
        `${API_BASE_URL}/calificaciones-analista/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCalificaciones(res.data?.calificaciones || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al cargar calificaciones");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // ENVIAR A VALIDACIÓN
  // =============================
  const enviarAValidacion = async (id) => {
    try {
      const token = localStorage.getItem("ev3pi-token");

      await axios.post(
        `${API_BASE_URL}/calificaciones-analista/${id}/enviar/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      cargarCalificaciones(); // refrescar lista
    } catch (err) {
      console.error(err);
      alert("Error al enviar a validación");
    }
  };

  // =============================
  // FILTROS
  // =============================
  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("ev3pi-token");

      const params = {};
      if (filtros.estado) params.estado = filtros.estado;

      const res = await axios.get(
        `${API_BASE_URL}/calificaciones-analista/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      setCalificaciones(res.data?.calificaciones || []);
    } catch (err) {
      setError("Error al aplicar filtros");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ estado: "" });
    cargarCalificaciones();
  };

  // =============================
  // HELPERS UI
  // =============================
  const statusBadgeClass = (estado) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    if (theme === "dark") {
      if (estado === "APROBADA") return `${base} bg-green-900/40 text-green-200`;
      if (estado === "RECHAZADA") return `${base} bg-red-900/40 text-red-200`;
      if (estado === "PENDIENTE") return `${base} bg-amber-900/40 text-amber-200`;
      if (estado === "OBSERVADA") return `${base} bg-orange-900/40 text-orange-200`;
      return `${base} bg-gray-800 text-gray-200`;
    }
    if (estado === "APROBADA") return `${base} bg-green-100 text-green-800`;
    if (estado === "RECHAZADA") return `${base} bg-red-100 text-red-800`;
    if (estado === "PENDIENTE") return `${base} bg-yellow-100 text-yellow-800`;
    if (estado === "OBSERVADA") return `${base} bg-orange-100 text-orange-800`;
    return `${base} bg-gray-100 text-gray-800`;
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

  // =============================
  // RENDER
  // =============================
  return (
    <div className={pageBg}>
      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className={`mb-8 p-6 rounded-2xl shadow ${cardBg}`}>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <img src="/dashboard.webp" alt="Dashboard" className="w-9 h-9" />
            <span>Dashboard - Analista Tributario</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Revisión y envío de calificaciones a validación
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* FILTROS */}
        <div className={`p-6 rounded-2xl shadow mb-8 ${cardBg}`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <img src="/lupa.webp" alt="Filtros" className="w-6 h-6" />
            <span>Filtros</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="OBSERVADA">Observada</option>
              <option value="APROBADA">Aprobada</option>
              <option value="RECHAZADA">Rechazada</option>
            </select>

            <button
              onClick={aplicarFiltros}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Aplicar
            </button>

            <button
              onClick={limpiarFiltros}
              className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className={`p-6 rounded-2xl shadow ${cardBg}`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <img src="/ListadoIcono.webp" alt="Calificaciones" className="w-6 h-6" />
            <span>Calificaciones</span>
          </h2>

          {loading ? (
            <p>Cargando...</p>
          ) : calificaciones.length === 0 ? (
            <p>No hay calificaciones</p>
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
                    <th className="px-4 py-2 text-left">Fecha</th>
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
                        <span className={statusBadgeClass(c.estado)}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(c.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {c.estado === "BORRADOR" && (
                          <button
                            onClick={() => enviarAValidacion(c._id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm font-semibold"
                          >
                            Enviar a Validación
                          </button>
                        )}
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

export default DashboardAnalista;
