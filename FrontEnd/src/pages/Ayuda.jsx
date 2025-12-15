import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext, AuthContext } from "../App";
import axios from "axios";

const TIPOS_CASO = [
  { value: "CONSULTA", label: "Consulta" },
  { value: "PROBLEMA", label: "🚨 Problema" },
  { value: "MOLESTIA", label: "😞 Molestia" },
  { value: "SUGERENCIA", label: "💡 Sugerencia" },
];

const PRIORIDADES = [
  { value: "BAJA", label: "🟢 Baja" },
  { value: "MEDIA", label: "🟡 Media" },
  { value: "ALTA", label: "🔴 Alta" },
  { value: "CRÍTICA", label: "🔥 Crítica" },
];

export default function Ayuda() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: user?.username || "",
    email: "",
    titulo: "",
    descripcion: "",
    tipo: "CONSULTA",
    prioridad: "MEDIA",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const dark = theme === "dark";
  const bg = dark ? "#0f1720" : "#f8fafc";
  const text = dark ? "#e6eef8" : "#0b1220";
  const cardBg = dark ? "#13202a" : "#ffffff";
  const mutedText = dark ? "#97a6b2" : "#6b7280";
  const borderColor = dark ? "#1e3a4c" : "#e2e8f0";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setLoading(true);

    try {
      // Validar campos
      if (!formData.nombre.trim() || !formData.email.trim()) {
        setError("Nombre y email son requeridos");
        return;
      }

      if (!formData.titulo.trim() || formData.titulo.length < 5) {
        setError("El título debe tener al menos 5 caracteres");
        return;
      }

      if (!formData.descripcion.trim() || formData.descripcion.length < 20) {
        setError("La descripción debe tener al menos 20 caracteres");
        return;
      }

      const res = await axios.post(
        "http://localhost:8000/api/casos-soporte/",
        {
          nombre: formData.nombre,
          email: formData.email,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          prioridad: formData.prioridad,
        }
      );

      setResponse({
        type: "success",
        id_caso: res.data.id_caso,
        mensaje: res.data.mensaje,
        detalles: res.data.detalles,
      });

      setFormData({
        nombre: user?.username || "",
        email: "",
        titulo: "",
        descripcion: "",
        tipo: "CONSULTA",
        prioridad: "MEDIA",
      });

      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al crear caso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: bg,
        color: text,
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            🤝 Centro de Ayuda y Soporte
          </h1>
          <p style={{ color: mutedText, margin: 0 }}>
            ¿Tienes un problema o consulta? Estamos aquí para ayudarte
          </p>
        </div>

        {/* Success Response */}
        {response?.type === "success" && (
          <div
            style={{
              background: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "20px",
              color: "#155724",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: "18px" }}>
              {response.mensaje}
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.3)",
                borderRadius: "8px",
                padding: "15px",
                marginTop: "15px",
              }}
            >
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                <strong>ID del Caso:</strong> {response.id_caso}
              </p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                {response.detalles}
              </p>
            </div>
            <p style={{ margin: "15px 0 0 0", fontSize: "12px" }}>
              Redireccionando en 5 segundos...
            </p>
          </div>
        )}

        {/* Form Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: "12px",
            padding: "30px",
            boxShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Info Box */}
            <div
              style={{
                background: dark ? "rgba(0,132,255,0.1)" : "#eff6ff",
                border: `1px solid ${dark ? "rgba(0,132,255,0.3)" : "#bfdbfe"}`,
                borderRadius: "8px",
                padding: "15px",
                fontSize: "14px",
                color: dark ? "#93c5fd" : "#1e40af",
              }}
            >
              📧 <strong>¿Qué pasará?</strong>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px" }}>
                <li>Tu caso será asignado un ID único (CASE-XXXXX)</li>
                <li>Recibirás un email de confirmación</li>
                <li>Nuestro equipo te contactará en breve</li>
                <li>Puedes hacer seguimiento con tu ID de caso</li>
              </ul>
            </div>

            {/* Nombre */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: text,
                }}
              >
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  background: dark ? "#1a2634" : "#f9fafb",
                  color: text,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: text,
                }}
              >
                Email de Contacto *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu.email@ejemplo.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  background: dark ? "#1a2634" : "#f9fafb",
                  color: text,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Tipo y Prioridad */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: text,
                  }}
                >
                  Tipo de Caso *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `2px solid ${borderColor}`,
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    background: dark ? "#1a2634" : "#f9fafb",
                    color: text,
                    boxSizing: "border-box",
                  }}
                >
                  {TIPOS_CASO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: text,
                  }}
                >
                  Prioridad
                </label>
                <select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `2px solid ${borderColor}`,
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    background: dark ? "#1a2634" : "#f9fafb",
                    color: text,
                    boxSizing: "border-box",
                  }}
                >
                  {PRIORIDADES.map((prio) => (
                    <option key={prio.value} value={prio.value}>
                      {prio.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Título */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: text,
                }}
              >
                Asunto *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Resumen del problema o consulta"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  background: dark ? "#1a2634" : "#f9fafb",
                  color: text,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Descripción */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: text,
                }}
              >
                Descripción Detallada *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Cuéntanos con detalle qué problema tienes, qué error recibiste, o cuál es tu consulta..."
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  background: dark ? "#1a2634" : "#f9fafb",
                  color: text,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: mutedText,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Mínimo 20 caracteres</span>
                <span>{formData.descripcion.length} / 2000</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#991b1b",
                  fontSize: "14px",
                }}
              >
                ❌ {error}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", paddingTop: "10px" }}>
              <button
                type="submit"
                disabled={loading || response?.type === "success"}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: loading || response?.type === "success" ? "#d1d5db" : "#0084ff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: loading || response?.type === "success" ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                {loading ? "Creando caso..." : "🎫 Crear Caso de Soporte"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  padding: "12px 24px",
                  background: dark ? "#1e3a4c" : "#e5e7eb",
                  color: text,
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: `1px solid ${borderColor}`,
              fontSize: "12px",
              color: mutedText,
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 5px 0" }}>
              ⏰ Tiempo de respuesta: 24 - 48 horas hábiles
            </p>
            <p style={{ margin: "0 0 5px 0" }}>
              📧 Te mantendremos informado por email del estado de tu caso
            </p>
            <p style={{ margin: 0 }}>
              💬 Para consultas urgentes contacta a soporte@empresa.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
