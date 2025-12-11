import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext, AuthContext } from "../../App";

export default function Sidebar({ isOpen = true }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // ← rol llega desde el login!!

  const dark = theme === "dark";
  const bg = dark ? "#071422" : "#eaeaea";
  const color = dark ? "#dbeafe" : "#08121a";

  if (!isOpen) return null;

  const rol = user?.rol; // CORREDOR / ANALISTA / AUDITOR / TI

  return (
    <aside
      style={{
        width: "230px",
        padding: "18px",
        background: bg,
        color,
        minHeight: "100vh",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Panel</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        
        <li><Link to="/">Inicio</Link></li>

        {/* CORREDOR puede cargar certificados */}
        {(rol === "CORREDOR" || rol === "TI") && (
          <li><Link to="/certificates-upload">Certificados</Link></li>
        )}

        {/* ANALISTA o AUDITOR o TI */}
        {(rol === "ANALISTA" || rol === "AUDITOR" || rol === "TI") && (
          <li><Link to="/tax-management">Gestión tributaria</Link></li>
        )}

        {/* AUDITOR y TI */}
        {(rol === "AUDITOR" || rol === "TI") && (
          <li><Link to="/audit-panel">Auditoría</Link></li>
        )}

        {/* SOLO TI */}
        {rol === "TI" && (
          <li><Link to="/system-settings">Ajustes</Link></li>
        )}

        {/* Todos pueden ver sus registros */}
        <li><Link to="/registros">Registros</Link></li>

      </ul>
    </aside>
  );
}
