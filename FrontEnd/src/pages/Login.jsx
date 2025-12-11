// src/pages/Login.jsx
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useForm from "../hooks/useForm";
import { ThemeContext, AuthContext } from "../App";

const Login = () => {
  const { form, handleChange } = useForm({ username: "", password: "" });
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const dark = theme === "dark";
  const bg = dark ? "#0f1720" : "#f8fafc";
  const text = dark ? "#e6eef8" : "#0b1220";
  const cardBg = dark ? "#13202a" : "#ffffff";
  const mutedText = dark ? "#97a6b2" : "#6b7280";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const perfil = await login(form.username, form.password);

      // Redirección por rol
      switch (perfil.rol) {
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
      if (err.message === "CREDENCIALES") {
        setError("Credenciales incorrectas");
      } else {
        setError("Error de conexión con el servidor");
      }
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
        onSubmit={handleSubmit}
        style={{
          maxWidth: "400px",
          width: "100%",
          background: cardBg,
          padding: "30px",
          borderRadius: "8px",
          boxShadow: dark ? "none" : "0 6px 18px rgba(15,23,42,0.06)",
        }}
      >
        <h2 style={{ marginTop: 0, textAlign: "center" }}>Iniciar sesión</h2>

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

        <Input
          label="Usuario"
          name="username"
          value={form.username}
          onChange={handleChange}
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        <Button
          label="Ingresar"
          style={{ width: "100%", marginTop: "16px" }}
          type="submit"
        />

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/" style={{ color: mutedText, textDecoration: "none" }}>
            Volver al inicio
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
