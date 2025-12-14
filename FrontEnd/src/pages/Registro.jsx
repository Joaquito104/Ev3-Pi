import { useState } from "react";
import { registrarUsuario } from "../services/registroService";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    rol: "ANALISTA",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registrarUsuario(form);
      alert("Usuario creado correctamente");
      navigate("/iniciar-sesion");
    } catch (err) {
      setError("Error al registrar usuario");
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 420, margin: "auto" }}>
      <h2>Crear cuenta</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Usuario" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />

        <select name="rol" onChange={handleChange}>
          <option value="CORREDOR">Corredor</option>
          <option value="ANALISTA">Analista</option>
          <option value="AUDITOR">Auditor</option>
        </select>

        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}
