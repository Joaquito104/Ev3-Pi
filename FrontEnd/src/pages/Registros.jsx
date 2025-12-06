import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../App";

export default function Registros() {
  const { theme } = useContext(ThemeContext);
  const dark = theme === "dark";
  const bg = dark ? "#0f1720" : "#f8fafc";
  const text = dark ? "#e6eef8" : "#0b1220";
  const card = dark ? "#13202a" : "#ffffff";
  const border = dark ? "#374151" : "#d1d5db";
  const muted = dark ? "#97a6b2" : "#6b7280";
  const inputBg = dark ? "#1f2937" : "#fff";

  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("titulo");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("ev3pi-token");

  useEffect(() => {
    cargarRegistros();
  }, []);

  function cargarRegistros() {
    setLoading(true);

    fetch("http://127.0.0.1:8000/api/registros/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRegistros(data))
      .finally(() => setLoading(false));
  }

  // Filtrar registros según búsqueda
  const registrosFiltrados = registros.filter((r) => {
    const valor = busqueda.toLowerCase();
    if (tipoFiltro === "titulo") return r.titulo.toLowerCase().includes(valor);
    if (tipoFiltro === "descripcion") return r.descripcion.toLowerCase().includes(valor);
    if (tipoFiltro === "todos") 
      return r.titulo.toLowerCase().includes(valor) || r.descripcion.toLowerCase().includes(valor);
    return true;
  });

  return (
    <div style={{ padding: 24, background: bg, color: text, minHeight: "calc(100vh - 56px)", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 900, width: "100%", textAlign: "center" }}>
        <h1 style={{ marginTop: 0 }}>Búsqueda de Registros</h1>
        <p style={{ color: muted }}>Busca registros tributarios por RUT, período, tipo de instrumento o estado.</p>

        {/* BARRA DE BÚSQUEDA */}
        <div style={{ background: card, padding: 20, borderRadius: 6, border: `1px solid ${border}`, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, flexDirection: "column", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Ingresa término de búsqueda..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 4, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 14, boxSizing: "border-box" }}
            />
            
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="radio" name="filtro" value="titulo" checked={tipoFiltro === "titulo"} onChange={(e) => setTipoFiltro(e.target.value)} />
                <span style={{ fontSize: 14 }}>Título</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="radio" name="filtro" value="descripcion" checked={tipoFiltro === "descripcion"} onChange={(e) => setTipoFiltro(e.target.value)} />
                <span style={{ fontSize: 14 }}>Descripción</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="radio" name="filtro" value="todos" checked={tipoFiltro === "todos"} onChange={(e) => setTipoFiltro(e.target.value)} />
                <span style={{ fontSize: 14 }}>Todos</span>
              </label>
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div>
          <p style={{ color: muted, marginBottom: 16 }}>
            {loading ? "Cargando..." : `${registrosFiltrados.length} registro(s) encontrado(s)`}
          </p>

          {registrosFiltrados.length === 0 ? (
            <div style={{ background: card, padding: 32, borderRadius: 6, border: `1px solid ${border}` }}>
              <p style={{ color: muted }}>No se encontraron registros que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            registrosFiltrados.map((r) => (
              <div key={r.id} style={{ background: card, padding: 16, borderRadius: 6, border: `1px solid ${border}`, marginBottom: 12, textAlign: "left" }}>
                <h3 style={{ marginTop: 0, marginBottom: 8, color: text }}>{r.titulo}</h3>
                <p style={{ color: muted, margin: 0 }}>{r.descripcion}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}