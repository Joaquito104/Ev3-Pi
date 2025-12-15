import { useEffect, useState } from "react";
import {
  obtenerPendientes,
  validarCalificacion,
} from "../services/validacionService";

export default function BandejaValidacion() {
  const [calificaciones, setCalificaciones] = useState([]);
  const [error, setError] = useState(null);

  const cargarPendientes = async () => {
    try {
      const data = await obtenerPendientes();
      setCalificaciones(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error cargando bandeja de validación");
    }
  };

  useEffect(() => {
    cargarPendientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccion = async (id, estado) => {
    const comentario =
      estado !== "VALIDADA"
        ? prompt("Ingrese comentario (obligatorio):")
        : "";

    if (estado !== "VALIDADA" && !comentario) return;

    try {
      await validarCalificacion(id, estado, comentario);
      cargarPendientes();
    } catch (_err) {
      alert("Error al actualizar la calificación");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bandeja de Validación</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && calificaciones.length === 0 && (
        <p>No hay calificaciones pendientes</p>
      )}

      {calificaciones.map((c) => (
        <div
          key={c.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          <b>{c.registro.titulo}</b>
          <p>Estado: {c.estado}</p>
          <p>Creado por: {c.creado_por}</p>

          <button onClick={() => handleAccion(c.id, "VALIDADA")}>
            Validar
          </button>{" "}
          <button onClick={() => handleAccion(c.id, "OBSERVADA")}>
            Observar
          </button>{" "}
          <button onClick={() => handleAccion(c.id, "RECHAZADA")}>
            Rechazar
          </button>
        </div>
      ))}
    </div>
  );
}
