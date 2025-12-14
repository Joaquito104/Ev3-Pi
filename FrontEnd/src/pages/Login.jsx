// src/pages/Login.jsx
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useForm from "../hooks/useForm";
import { ThemeContext, AuthContext } from "../App";
import axios from "axios";

const Login = () => {
  const { form, handleChange } = useForm({ username: "", password: "" });
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [codigoMfa, setCodigoMfa] = useState("");
  const [loading, setLoading] = useState(false);

  const dark = theme === "dark";
  const bg = dark ? "#0f1720" : "#f8fafc";
  const text = dark ? "#e6eef8" : "#0b1220";
  const cardBg = dark ? "#13202a" : "#ffffff";
  const mutedText = dark ? "#97a6b2" : "#6b7280";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Enviar credenciales
      const response = await axios.post(
        "http://localhost:8000/api/login-mfa/",
        {
          step: 1,
          username: form.username,
          password: form.password,
        }
      );

      if (response.data.mfa_requerido) {
        // MFA habilitado, mostrar formulario para código
        setMfaRequired(true);
        setSessionId(response.data.session_id);
      } else {
        // Sin MFA, login directo
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);

        // Redirección por rol
        const rol = response.data.usuario.rol;
        switch (rol) {
          case "TI":
            navigate("/system-settings");
            break;
          case "AUDITOR":
            navigate("/audit-panel");
            break;
          case "ANALISTA":
            navigate("/tax-management");
            break;
          case "CORREDOR":
            navigate("/registros");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Credenciales incorrectas");
      } else {
        setError(err.response?.data?.detail || "Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 2: Enviar código MFA
      const response = await axios.post(
        "http://localhost:8000/api/login-mfa/",
        {
          step: 2,
          session_id: sessionId,
          codigo: codigoMfa,
        }
      );

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // Redirección por rol
      const rol = response.data.usuario.rol;
      switch (rol) {
        case "TI":
          navigate("/system-settings");
          break;
        case "AUDITOR":
          navigate("/audit-panel");
          break;
        case "ANALISTA":
          navigate("/tax-management");
          break;
        case "CORREDOR":
          navigate("/registros");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Código de autenticación inválido");
      } else {
        setError(err.response?.data?.detail || "Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: bg,
        color: text,
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={mfaRequired ? handleMfaSubmit : handleSubmit}
        style={{
          maxWidth: "400px",
          width: "100%",
          background: cardBg,
          padding: "30px",
          borderRadius: "8px",
          boxShadow: dark ? "none" : "0 6px 18px rgba(15,23,42,0.06)",
        }}
      >
        <h2 style={{ marginTop: 0, textAlign: "center" }}>
          {mfaRequired ? "Verificación de Identidad" : "Iniciar sesión"}
        </h2>

        {error && (
          <div
            style={{
              background: "#ffdddd",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "12px",
              color: "#a00",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {!mfaRequired ? (
          <>
            <Input
              label="Usuario"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </>
        ) : (
          <div>
            <p style={{ textAlign: "center", color: mutedText, marginBottom: "20px" }}>
              Ingresa el código de autenticación de tu aplicación
            </p>
            <Input
              label="Código de autenticación (6 dígitos)"
              value={codigoMfa}
              onChange={(e) => setCodigoMfa(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              disabled={loading}
              style={{ textAlign: "center", letterSpacing: "8px", fontSize: "18px" }}
            />
          </div>
        )}

        <Button
          label={loading ? "Procesando..." : mfaRequired ? "Verificar" : "Ingresar"}
          style={{ width: "100%", marginTop: "16px" }}
          type="submit"
          disabled={loading}
        />

        {mfaRequired && (
          <button
            type="button"
            onClick={() => {
              setMfaRequired(false);
              setCodigoMfa("");
              setError(null);
            }}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "8px",
              background: "transparent",
              border: "none",
              color: mutedText,
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline",
            }}
          >
            Volver al login
          </button>
        )}

        {!mfaRequired && (
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link to="/" style={{ color: mutedText, textDecoration: "none" }}>
              Volver al inicio
            </Link>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
