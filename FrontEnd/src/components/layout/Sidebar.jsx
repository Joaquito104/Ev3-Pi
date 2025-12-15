import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext, AuthContext } from "../../App";

export default function Sidebar({ isOpen = true }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!isOpen) return null;

  const dark = theme === "dark";
  const bg = dark ? "#0f1720" : "#f8fafc";
  const color = dark ? "#e6eef8" : "#0b1220";
  const mutedColor = dark ? "#97a6b2" : "#6b7280";
  const border = dark ? "#1e3a4c" : "#e5e7eb";
  const activeBg = dark ? "#1e3a4c" : "#e0e7ff";
  const activeColor = dark ? "#93c5fd" : "#4f46e5";
  const hoverBg = dark ? "#1a2a38" : "#f0f4f8";

  const rol = user?.rol;

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    textDecoration: "none",
    color: isActive(path) ? activeColor : color,
    fontWeight: isActive(path) ? 600 : 500,
    display: "block",
    padding: "10px 12px",
    borderRadius: "6px",
    background: isActive(path) ? activeBg : "transparent",
    transition: "all 200ms",
    fontSize: "14px"
  });

  return (
    <aside
      style={{
        width: 240,
        padding: "20px 12px",
        background: bg,
        color,
        minHeight: "100vh",
        boxShadow: dark 
          ? "2px 0 8px rgba(0,0,0,0.3)" 
          : "2px 0 6px rgba(0,0,0,0.08)",
        borderRight: `1px solid ${border}`,
        overflowY: "auto",
      }}
    >
      <h3 style={{
        margin: "0 0 24px 0",
        fontSize: "16px",
        fontWeight: "700",
        color: activeColor,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        📌 Panel
      </h3>

      <nav>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
          <li>
            <Link 
              to="/" 
              style={linkStyle("/")}
              onMouseEnter={(e) => !isActive("/") && (e.target.style.background = hoverBg)}
              onMouseLeave={(e) => !isActive("/") && (e.target.style.background = "transparent")}
            >
              🏠 Inicio
            </Link>
          </li>

          {(rol === "CORREDOR" || rol === "TI") && (
            <li>
              <Link 
                to="/certificates-upload" 
                style={linkStyle("/certificates-upload")}
                onMouseEnter={(e) => !isActive("/certificates-upload") && (e.target.style.background = hoverBg)}
                onMouseLeave={(e) => !isActive("/certificates-upload") && (e.target.style.background = "transparent")}
              >
                📄 Certificados
              </Link>
            </li>
          )}

          {(rol === "ANALISTA" || rol === "AUDITOR" || rol === "TI") && (
            <li>
              <Link 
                to="/tax-management" 
                style={linkStyle("/tax-management")}
                onMouseEnter={(e) => !isActive("/tax-management") && (e.target.style.background = hoverBg)}
                onMouseLeave={(e) => !isActive("/tax-management") && (e.target.style.background = "transparent")}
              >
                💼 Gestión Tributaria
              </Link>
            </li>
          )}

          {(rol === "ANALISTA" || rol === "TI") && (
            <li>
              <Link 
                to="/validacion" 
                style={linkStyle("/validacion")}
                onMouseEnter={(e) => !isActive("/validacion") && (e.target.style.background = hoverBg)}
                onMouseLeave={(e) => !isActive("/validacion") && (e.target.style.background = "transparent")}
              >
                Validación
              </Link>
            </li>
          )}

          {(rol === "AUDITOR" || rol === "TI") && (
            <li>
              <Link 
                to="/audit-panel" 
                style={linkStyle("/audit-panel")}
                onMouseEnter={(e) => !isActive("/audit-panel") && (e.target.style.background = hoverBg)}
                onMouseLeave={(e) => !isActive("/audit-panel") && (e.target.style.background = "transparent")}
              >
                Auditoría
              </Link>
            </li>
          )}

          {rol === "TI" && (
            <li>
              <Link 
                to="/system-settings" 
                style={linkStyle("/system-settings")}
                onMouseEnter={(e) => !isActive("/system-settings") && (e.target.style.background = hoverBg)}
                onMouseLeave={(e) => !isActive("/system-settings") && (e.target.style.background = "transparent")}
              >
                ⚙️ Administración
              </Link>
            </li>
          )}

          <li>
            <Link 
              to="/registros" 
              style={linkStyle("/registros")}
              onMouseEnter={(e) => !isActive("/registros") && (e.target.style.background = hoverBg)}
              onMouseLeave={(e) => !isActive("/registros") && (e.target.style.background = "transparent")}
            >
              📋 Registros
            </Link>
          </li>
        </ul>
      </nav>

      {/* Separador */}
      <div style={{
        marginTop: "24px",
        paddingTop: "16px",
        borderTop: `1px solid ${border}`
      }}>
        <p style={{
          margin: 0,
          fontSize: "11px",
          textTransform: "uppercase",
          color: mutedColor,
          letterSpacing: "0.5px",
          fontWeight: "600"
        }}>
          {user?.nombre || "Usuario"}
        </p>
        <p style={{
          margin: "4px 0 0 0",
          fontSize: "12px",
          color: mutedColor
        }}>
          {user?.rol === "TI" && "👨‍💻 Administrador"}
          {user?.rol === "AUDITOR" && "🔎 Auditor"}
          {user?.rol === "ANALISTA" && "Analista"}
          {user?.rol === "CORREDOR" && "🚗 Corredor"}
        </p>
      </div>
    </aside>
  );
}
