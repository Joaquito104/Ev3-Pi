import { useEffect, useState } from "react";
import { obtenerPerfil, actualizarPerfil } from "../services/perfilService";

export default function Perfil() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    const data = await obtenerPerfil();
    setForm(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await actualizarPerfil(form);
    alert("Perfil actualizado");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="Nombre" value={form.first_name} onChange={handleChange} />
        <input name="last_name" placeholder="Apellido" value={form.last_name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}
