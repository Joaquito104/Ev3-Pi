import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext, AuthContext } from "../App";
import axios from "axios";

export default function Feedback() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const dark = theme === "dark";
  const bg = dark ? "#0f1720" : "#f8fafc";
  const text = dark ? "#e6eef8" : "#0b1220";
  const cardBg = dark ? "#13202a" : "#ffffff";
  const mutedText = dark ? "#97a6b2" : "#6b7280";
  const borderColor = dark ? "#1e3a4c" : "#e2e8f0";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setLoading(true);

    try {
      if (!user) {
        setError("Debes iniciar sesión para enviar feedback");
        return;
      }

      if (!mensaje.trim() || mensaje.length < 10) {
        setError("El mensaje debe tener al menos 10 caracteres");
        return;
      }

      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        "http://localhost:8000/api/feedback/",
        { mensaje: mensaje.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResponse({
        type: "success",
        message: res.data.message,
        id: res.data.id,
      });

      setMensaje("");
      
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al enviar feedback");
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
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 10px 0" }}>
            💭 Ayúdanos a Mejorar
          </h1>
          <p style={{ color: mutedText, margin: 0 }}>
            Tu feedback es valioso para nosotros
          </p>
        </div>

        {/* Success Response */}
        {response?.type === "success" && (
          <div
            style={{
              background: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
              color: "#155724",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{response.message}</p>
            <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
              ID del feedback: <strong>#{response.id}</strong>
            </p>
            <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
              Redireccionando en 3 segundos...
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
              ℹ️ <strong>¿Qué tipo de feedback buscamos?</strong>
              <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px" }}>
                <li>Problemas o errores que encontraste</li>
                <li>Sugerencias para mejorar la interfaz</li>
                <li>Funcionalidades que te gustaría tener</li>
                <li>Experiencia general del sistema</li>
              </ul>
            </div>

            {/* Textarea */}
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
                Tu Feedback
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Cuéntanos qué piensas, qué podemos mejorar, o qué te gustaría que tuviera el sistema..."
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `2px solid ${error ? "#ef4444" : borderColor}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  background: dark ? "#1a2634" : "#f9fafb",
                  color: text,
                  resize: "vertical",
                  transition: "border-color 0.2s",
                }}
                disabled={loading || response?.type === "success"}
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
                <span>Mínimo 10 caracteres</span>
                <span>{mensaje.length} / 500</span>
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
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                disabled={loading || response?.type === "success" || !mensaje.trim() || mensaje.length < 10}
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
                {loading ? "Enviando..." : "✉️ Enviar Feedback"}
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
            <p style={{ margin: 0 }}>
              Todos los feedbacks son revisados por nuestro equipo de desarrollo.
            </p>
            <p style={{ margin: "5px 0 0 0" }}>
              Gracias por ayudarnos a crear un mejor sistema 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
