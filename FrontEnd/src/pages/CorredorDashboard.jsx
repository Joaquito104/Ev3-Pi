import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../App";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const CorredorDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    estado: "",
    periodo: "",
    tipo_certificado: ""
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("ev3pi-token");
      const headers = { Authorization: `Bearer ${token}` };

      // Cargar estadísticas
      const statsRes = await axios.get(
        `${API_BASE_URL}/calificaciones-corredor/estadisticas/`,
        { headers }
      );
      setEstadisticas(statsRes.data?.estadisticas || {});

      // Cargar calificaciones del corredor
      const calificacionesRes = await axios.get(
        `${API_BASE_URL}/calificaciones-corredor/`,
        { headers }
      );
      setCalificaciones(calificacionesRes.data?.calificaciones || []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.response?.data?.error || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("ev3pi-token");
      const headers = { Authorization: `Bearer ${token}` };

      // Construir query params
      const params = {};
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.periodo) params.periodo = filtros.periodo;
      if (filtros.tipo_certificado) params.tipo_certificado = filtros.tipo_certificado;

      const res = await axios.get(
        `${API_BASE_URL}/calificaciones-corredor/`,
        { headers, params }
      );
      setCalificaciones(res.data?.calificaciones || []);
    } catch (err) {
      console.error("Error al filtrar:", err);
      setError("Error al aplicar filtros");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ estado: "", periodo: "", tipo_certificado: "" });
    cargarDatos();
  };

  const verDetalle = (id) => {
    navigate(`/certificados/${id}`);
  };

  const irASubirCertificado = () => {
    navigate("/certificates-upload");
  };

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

  const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const pageBg = "min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-gray-900 dark:text-white";

  const cardBg = "bg-white border border-gray-100 dark:bg-gray-900/70 dark:border-gray-800";

  if (loading && !estadisticas) {
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
              <h1 className="text-3xl font-bold mb-2">📊 Dashboard - Corredor de Inversión</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualiza y gestiona tus certificados y calificaciones
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={cargarDatos}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition"
              >
                🔄 Refrescar
              </button>
              <button
                onClick={irASubirCertificado}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-lg"
              >
                ➕ Subir Certificado
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl shadow ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Total Certificados
                  </p>
                  <p className="text-3xl font-bold text-blue-500">{estadisticas.total || 0}</p>
                </div>
                <div className="text-4xl">📄</div>
              </div>
            </div>

            <div className={`p-6 rounded-xl shadow ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    En Borrador
                  </p>
                  <p className="text-3xl font-bold text-gray-500">{estadisticas.por_estado?.BORRADOR || 0}</p>
                </div>
                <div className="text-4xl">✏️</div>
              </div>
            </div>

            <div className={`p-6 rounded-xl shadow ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Pendientes
                  </p>
                  <p className="text-3xl font-bold text-yellow-500">{estadisticas.por_estado?.PENDIENTE || 0}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>

            <div className={`p-6 rounded-xl shadow ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Aprobados
                  </p>
                  <p className="text-3xl font-bold text-green-500">{estadisticas.por_estado?.APROBADA || 0}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div className={`p-6 rounded-2xl shadow mb-8 ${cardBg}`}>
          <h2 className="text-xl font-bold mb-4">🔍 Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                className={`w-full p-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="">Todos</option>
                <option value="BORRADOR">Borrador</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="OBSERVADA">Observada</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Período
              </label>
              <input
                type="month"
                placeholder="2024-01"
                value={filtros.periodo}
                onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
                className={`w-full p-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Tipo de Certificado
              </label>
              <select
                value={filtros.tipo_certificado}
                onChange={(e) => setFiltros({ ...filtros, tipo_certificado: e.target.value })}
                className={`w-full p-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="">Todos</option>
                <option value="AFP">AFP</option>
                <option value="APV">APV</option>
                <option value="ISAPRE">ISAPRE</option>
                <option value="FONASA">FONASA</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={aplicarFiltros}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex-1 shadow"
              >
                Aplicar
              </button>
              <button
                onClick={limpiarFiltros}
                className={`px-4 py-2 rounded transition ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* TABLA DE CALIFICACIONES */}
        <div className={`p-6 rounded-2xl shadow ${cardBg}`}>
          <h2 className="text-xl font-bold mb-4">📋 Mis Certificados</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : calificaciones.length === 0 ? (
            <div className="text-center py-8">
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                No hay certificados para mostrar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
                  <tr>
                    <th className="px-4 py-3 text-left">RUT</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Período</th>
                    <th className="px-4 py-3 text-left">Monto</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Fecha Creación</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {calificaciones.map((cal) => (
                    <tr
                      key={cal._id}
                      className={`border-b ${
                        theme === "dark" ? "border-gray-800 hover:bg-gray-800/60" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">{cal.rut}</td>
                      <td className="px-4 py-3">{cal.tipo_certificado}</td>
                      <td className="px-4 py-3">{cal.periodo}</td>
                      <td className="px-4 py-3">{formatoCLP.format(cal.monto || 0)}</td>
                      <td className="px-4 py-3">
                        <span className={statusBadgeClass(cal.estado)}>{cal.estado}</span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(cal.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => verDetalle(cal._id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Ver Detalle
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

export default CorredorDashboard;
