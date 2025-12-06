import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../App";
import ThemeToggle from "../common/ThemeToggle";

export default function Navbar({ onToggleSidebar }) {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const dark = theme === "dark";

  const navBg = dark ? "#13202a" : "#f2f2f2";
  const navColor = dark ? "#e6eef8" : "#0b1220";
  const activeBg = dark ? "#1e3a4c" : "#e0e0e0";

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: navColor,
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 4,
    background: isActive(path) ? activeBg : "transparent",
    fontWeight: isActive(path) ? 600 : 400,
    transition: "all 200ms ease-in-out",
  });

  return (
    <nav
      style={{
        padding: "12px 20px",
        background: navBg,
        color: navColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        boxShadow: "0 2px 8px rgba(2,6,23,0.08)",
        gap: "12px",
      }}
    >
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          style={{
            position: "absolute",
            left: 12,
            width: 40,
            height: 40,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 20,
          }}
        >
          ☰
        </button>
      )}

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Link to="/" style={linkStyle("/")}>
          Home
        </Link>
        <Link
          to="/certificates-upload"
          style={linkStyle("/certificates-upload")}
        >
          Certificados
        </Link>
        <Link
          to="/tax-management"
          style={linkStyle("/tax-management")}
        >
          Gestión tributaria
        </Link>
        <Link
          to="/audit-panel"
          style={linkStyle("/audit-panel")}
        >
          Auditoría
        </Link>
        <Link
          to="/registros"
          style={linkStyle("/registros")}
        >
          Registros
        </Link>
                <Link
          to="/system-settings"
          style={linkStyle("/system-settings")}
        >
          Ajustes
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
        <Link to="/iniciar-sesion" style={{ color: navColor, textDecoration: "none", fontWeight: 600 }}>
          Iniciar sesión
        </Link>
        <ThemeToggle variant="inline" />
      </div>
    </nav>
  );
}
