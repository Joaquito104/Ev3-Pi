import { useState, useContext } from "react";
import { ThemeContext } from "../../App";
import axios from "axios";

/**
 * Modal para editar estado de calificación
 * Transición: OBSERVADA → BORRADOR
 */
export default function CalificacionEditModal({ calificacion, isOpen, onClose, onSuccess }) {
  const { theme } = useContext(ThemeContext);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dark = theme === "dark";
  const bgModal = dark ? "bg-gray-800" : "bg-white";
  const textColor = dark ? "text-gray-300" : "text-gray-700";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await axios.put(
        `http://localhost:8000/api/calificaciones-corredor/${calificacion._id}/actualizar/`,
        {
          estado: "BORRADOR",
          motivo: motivo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (onSuccess) {
        onSuccess(response.data.calificacion);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`
          rounded-lg shadow-xl p-6 max-w-md w-full mx-4
          ${bgModal}
        `}
      >
        <h3 className={`text-lg font-semibold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
          Cambiar a Borrador
        </h3>

        <p className={`mb-4 ${textColor}`}>
          Cambiarás esta calificación de <strong>OBSERVADA</strong> a <strong>BORRADOR</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${textColor}`}>
              Motivo del cambio (opcional)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="¿Por qué vuelves a borrador?"
              rows="4"
              className={`w-full p-3 border rounded ${
                dark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300"
              }`}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded border border-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: dark ? "#374151" : "#e5e7eb" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 py-2 rounded font-medium transition ${
                dark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Procesando..." : "Cambiar a Borrador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
