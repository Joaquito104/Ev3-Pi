import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { ThemeContext, AuthContext } from "../../App";
import ThemeToggle from "../common/ThemeToggle";

export default function Navbar() {
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const dark = theme === "dark";
  const navBg = dark ? "#0f1720" : "#ffffff";
  const navColor = dark ? "#e6eef8" : "#0b1220";
  const navBorder = dark ? "#1e3a4c" : "#e5e7eb";
  const activeBg = dark ? "#1e3a4c" : "#f0f4f8";
  const activeColor = dark ? "#93c5fd" : "#4f46e5";
  const hoverBg = dark ? "#1a2a38" : "#f8fafc";
  const btnBg = dark ? "#0b1720" : "#111827";
  const btnHover = dark ? "#1a2834" : "#1f2937";
  const danger = "#ef4444";
  const dangerHover = "#dc2626";
  const shadow = dark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)";

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path) ? activeColor : navColor,
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: 6,
    background: isActive(path) ? activeBg : "transparent",
    fontWeight: isActive(path) ? 700 : 500,
    transition: "all 200ms",
    fontSize: "14px"
  });

  const goDashboard = () => {
    if (!user) return "/";
    if (user.rol === "CORREDOR") return "/dashboard/corredor";
    if (user.rol === "ANALISTA") return "/dashboard/analista";
    if (user.rol === "AUDITOR") return "/dashboard/auditor";
    if (user.rol === "TI") return "/dashboard/admin-ti";
    return "/";
  };

  const handleLogout = () => {
    logout();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <nav
      style={{
        padding: "12px 20px",
        background: navBg,
        color: navColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: shadow,
        borderBottom: `1px solid ${navBorder}`,
        transition: "all 200ms"
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flex: 1 }}>
        <Link 
          to="/" 
          style={{...linkStyle("/"), fontWeight: 700, fontSize: "16px", display: 'inline-flex', alignItems: 'center', gap: 8}}
          onMouseEnter={(e) => !isActive("/") && (e.target.style.background = hoverBg)}
          onMouseLeave={(e) => !isActive("/") && (e.target.style.background = "transparent")}
        >
          <img src="/icononuam.webp" alt="Nuam" style={{ width: 20, height: 20 }} />
          <span>Nuam</span>
        </Link>

        {/* Separador visual */}
        <div style={{width: "1px", height: "24px", background: navBorder, margin: "0 4px"}} />

        {user && (
          <Link 
            to={goDashboard()} 
            style={linkStyle(goDashboard())}
            onMouseEnter={(e) => !isActive(goDashboard()) && (e.target.style.background = hoverBg)}
            onMouseLeave={(e) => !isActive(goDashboard()) && (e.target.style.background = "transparent")}
          >
            Dashboard
          </Link>
        )}

        {user?.rol === "CORREDOR" && (
          <Link 
            to="/certificates-upload" 
            style={linkStyle("/certificates-upload")}
            onMouseEnter={(e) => !isActive("/certificates-upload") && (e.target.style.background = hoverBg)}
            onMouseLeave={(e) => !isActive("/certificates-upload") && (e.target.style.background = "transparent")}
          >
            Certificados
          </Link>
        )}

        {["ANALISTA", "AUDITOR", "TI"].includes(user?.rol) && (
          <Link 
            to="/tax-management" 
            style={linkStyle("/tax-management")}
            onMouseEnter={(e) => !isActive("/tax-management") && (e.target.style.background = hoverBg)}
            onMouseLeave={(e) => !isActive("/tax-management") && (e.target.style.background = "transparent")}
          >
            Tributaria
          </Link>
        )}

        {["AUDITOR", "TI"].includes(user?.rol) && (
          <Link 
            to="/validacion" 
            style={linkStyle("/validacion")}
            onMouseEnter={(e) => !isActive("/validacion") && (e.target.style.background = hoverBg)}
            onMouseLeave={(e) => !isActive("/validacion") && (e.target.style.background = "transparent")}
          >
            Validación
          </Link>
        )}

        {["AUDITOR", "TI"].includes(user?.rol) && (
          <Link 
            to="/audit-panel" 
            style={linkStyle("/audit-panel")}
            onMouseEnter={(e) => !isActive("/audit-panel") && (e.target.style.background = hoverBg)}
            onMouseLeave={(e) => !isActive("/audit-panel") && (e.target.style.background = "transparent")}
          >
            Auditoría
          </Link>
        )}

        {user && (
          <Link 
            to="/registros" 
            style={linkStyle("/registros")}
            onMouseEnter={(e) => !isActive("/registros") && (e.target.style.background = hoverBg)}
            onMouseLeave={(e) => !isActive("/registros") && (e.target.style.background = "transparent")}
          >
            Registros
          </Link>
        )}

        {user?.is_superuser && (
          <Link 
            to="/system-settings" 
            style={linkStyle("/system-settings")}
            onMouseEnter={(e) => !isActive("/system-settings") && (e.target.style.background = hoverBg)}
            onMouseLeave={(e) => !isActive("/system-settings") && (e.target.style.background = "transparent")}
          >
            Admin
          </Link>
        )}

        {user?.is_superuser && (
          <Link
            to="/admin-global"
            style={{
              ...linkStyle("/admin-global"),
              background: danger,
              color: "#fff",
              fontWeight: 700,
            }}
            onMouseEnter={(e) => (e.target.style.background = dangerHover)}
            onMouseLeave={(e) => (e.target.style.background = danger)}
          >
            Global
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
        <ThemeToggle variant="inline" />

        {!user ? (
          <Link 
            to="/iniciar-sesion" 
            style={{ 
              fontWeight: 800,
              color: activeColor,
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              transition: "all 200ms",
              border: `2px solid ${activeColor}`,
              boxShadow: dark ? '0 6px 18px rgba(59,130,246,0.25)' : '0 6px 18px rgba(59,130,246,0.15)',
              background: dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = dark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)';
              e.target.style.boxShadow = dark ? '0 10px 24px rgba(59,130,246,0.35)' : '0 10px 24px rgba(59,130,246,0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)';
              e.target.style.boxShadow = dark ? '0 6px 18px rgba(59,130,246,0.25)' : '0 6px 18px rgba(59,130,246,0.15)';
            }}
          >
            Iniciar Sesión
          </Link>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMostrarDropdown(!mostrarDropdown)}
              style={{
                background: btnBg,
                color: "white",
                border: `1px solid ${navBorder}`,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "14px",
                transition: "all 200ms"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = btnHover;
                e.target.style.borderColor = activeColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = btnBg;
                e.target.style.borderColor = navBorder;
              }}
            >
              👤 {user.username} {mostrarDropdown ? "▲" : "▼"}
            </button>

            {mostrarDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: navBg,
                  border: `1px solid ${navBorder}`,
                  borderRadius: 8,
                  minWidth: 220,
                  marginTop: 8,
                  zIndex: 1000,
                  boxShadow: shadow,
                  overflow: "hidden",
                  animation: "fadeIn 200ms ease-out"
                }}
              >
                <Link
                  to="/perfil"
                  onClick={() => setMostrarDropdown(false)}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: navColor,
                    textDecoration: "none",
                    borderBottom: `1px solid ${navBorder}`,
                    transition: "background 0.2s",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                  onMouseEnter={(e) => (e.target.style.background = hoverBg)}
                  onMouseLeave={(e) => (e.target.style.background = "transparent")}
                >
                  ⚙️ Configurar Perfil
                </Link>
                <Link
                  to="/perfil"
                  onClick={() => setMostrarDropdown(false)}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: navColor,
                    textDecoration: "none",
                    borderBottom: `1px solid ${navBorder}`,
                    transition: "background 0.2s",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                  onMouseEnter={(e) => (e.target.style.background = hoverBg)}
                  onMouseLeave={(e) => (e.target.style.background = "transparent")}
                >
                  👤 Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    setMostrarDropdown(false);
                    handleLogout();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 16px",
                    color: danger,
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "background 0.2s",
                    fontSize: "14px"
                  }}
                  onMouseEnter={(e) => (e.target.style.background = dark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)")}
                  onMouseLeave={(e) => (e.target.style.background = "transparent")}
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
