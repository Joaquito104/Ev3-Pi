import { useEffect, useState, useContext } from "react";
import { AuthContext, ThemeContext } from "../App";
import {
  obtenerRegistros,
  eliminarRegistro,
  editarRegistro,
} from "../services/registrosService";
import {
  crearCalificacion,
  enviarValidacion,
} from "../services/calificacionesService";

export default function Registros() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      const data = await obtenerRegistros();
      setRegistros(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      console.error(e);
      setRegistros([]);
      setError("Error al cargar los registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const ultimaCalificacion = (r) =>
    r.calificaciones && r.calificaciones.length > 0
      ? r.calificaciones[r.calificaciones.length - 1]
      : null;

  const handleCrearCalificacion = async (registroId) => {
    try {
      await crearCalificacion(registroId);
      alert("Calificación creada (BORRADOR)");
      cargarRegistros();
    } catch (err) {
      console.error(err);
      alert("Error creando calificación");
    }
  };

  const handleEnviarValidacion = async (calificacionId) => {
    try {
      await enviarValidacion(calificacionId);
      alert("Enviado a validación");
      cargarRegistros();
    } catch (err) {
      console.error(err);
      alert("Error enviando a validación");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await eliminarRegistro(id);
      cargarRegistros();
    } catch (err) {
      console.error(err);
      alert("Error eliminando registro");
    }
  };

  const handleEditar = async (r) => {
    const titulo = prompt("Nuevo título", r.titulo);
    if (!titulo) return;

    try {
      await editarRegistro(r.id, { titulo });
      cargarRegistros();
    } catch (err) {
      console.error(err);
      alert("Error editando registro");
    }
  };

  const pageBg =
    theme === "dark"
      ? "bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 text-white"
      : "bg-gray-50";

  const cardBg = theme === "dark" ? "bg-gray-900/70 border border-gray-800" : "bg-white border border-gray-100";

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
      <div className={`min-h-screen ${pageBg}`}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className={`mb-8 p-6 rounded-2xl shadow-lg ${cardBg}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">📋 Registros del Sistema</h1>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Gestiona los registros base para calificaciones tributarias
              </p>
            </div>
            <button
              onClick={cargarRegistros}
              className={`px-4 py-2 rounded-lg border transition ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              🔄 Refrescar
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            theme === "dark" 
              ? "bg-red-900/20 border-red-800 text-red-200" 
              : "bg-red-100 border-red-400 text-red-700"
          }`}>
            {error}
          </div>
        )}

        {registros.length === 0 ? (
          <div className={`p-12 rounded-2xl shadow text-center ${cardBg}`}>
            <div className="text-6xl mb-4">📭</div>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              No hay registros disponibles
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {registros.map((r) => {
              const cal = ultimaCalificacion(r);

              return (
                <div
                  key={r.id}
                  className={`p-6 rounded-2xl shadow-lg ${cardBg} transition hover:shadow-xl`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{r.titulo}</h3>
                      <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                        {r.descripcion}
                      </p>
                      
                      {cal && (
                        <div className="mt-4 flex items-center gap-2">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                            Estado:
                          </span>
                          <span className={statusBadgeClass(cal.estado)}>
                            {cal.estado}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* BOTONES */}
                    {user?.rol === "ANALISTA" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditar(r)}
                          className={`px-4 py-2 rounded-lg transition font-medium ${
                            theme === "dark"
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                        >
                          ✏️ Editar
                        </button>

                        <button
                          onClick={() => handleEliminar(r.id)}
                          className={`px-4 py-2 rounded-lg transition font-medium ${
                            theme === "dark"
                              ? "bg-red-900/50 hover:bg-red-900/70 text-red-200 border border-red-800"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                        >
                          🗑️ Eliminar
                        </button>

                        {!cal && (
                          <button
                            onClick={() => handleCrearCalificacion(r.id)}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-medium shadow"
                          >
                            ➕ Crear calificación
                          </button>
                        )}

                        {cal?.estado === "BORRADOR" && (
                          <button
                            onClick={() => handleEnviarValidacion(cal.id)}
                            className={`px-4 py-2 rounded-lg transition font-medium ${
                              theme === "dark"
                                ? "bg-orange-900/50 hover:bg-orange-900/70 text-orange-200 border border-orange-800"
                                : "bg-orange-500 hover:bg-orange-600 text-white"
                            }`}
                          >
                            📤 Enviar a validación
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

