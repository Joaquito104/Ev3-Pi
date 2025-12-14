import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext, AuthContext } from "../../App";
import ThemeToggle from "../common/ThemeToggle";

export default function Navbar({ onToggleSidebar }) {
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const dark = theme === "dark";
  const navBg = dark ? "#13202a" : "#f2f2f2";
  const navColor = dark ? "#e6eef8" : "#0b1220";
  const activeBg = dark ? "#1e3a4c" : "#e0e0e0";
  const btnBg = dark ? "#0b1220" : "#111827";
  const btnColor = "#ffffff";
  const danger = "#ef4444";

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: navColor,
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 6,
    background: isActive(path) ? activeBg : "transparent",
    fontWeight: isActive(path) ? 700 : 500,
  });

  // RBAC visual
  const canSee = (allowedRoles = []) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return allowedRoles.includes(user.rol);
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
        gap: "12px",
        boxShadow: "0 2px 8px rgba(2,6,23,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 20,
            color: navColor,
          }}
        >
          ☰
        </button>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>

        {user && canSee(["CORREDOR", "TI"]) && (
          <Link to="/corredor-dashboard" style={linkStyle("/corredor-dashboard")}>
            📊 Dashboard
          </Link>
        )}

        {user && canSee(["CORREDOR", "TI"]) && (
          <Link to="/certificates-upload" style={linkStyle("/certificates-upload")}>
            Certificados
          </Link>
        )}

        {user && canSee(["ANALISTA", "AUDITOR", "TI"]) && (
          <Link to="/tax-management" style={linkStyle("/tax-management")}>
            Gestión tributaria
          </Link>
        )}

        {user && canSee(["AUDITOR", "TI"]) && (
          <Link to="/validacion" style={linkStyle("/validacion")}>
            Validación
          </Link>
        )}

        {/* ✅ AUDITORÍA */}
        {user && canSee(["AUDITOR", "TI"]) && (
          <Link to="/audit-panel" style={linkStyle("/audit-panel")}>
            Auditoría
          </Link>
        )}

        {user && canSee(["CORREDOR", "ANALISTA", "AUDITOR", "TI"]) && (
          <Link to="/registros" style={linkStyle("/registros")}>
            Registros
          </Link>
        )}

        {user?.is_superuser && (
          <Link to="/system-settings" style={linkStyle("/system-settings")}>
            Administración Nuam
          </Link>
        )}

        {user?.is_superuser && (
          <Link to="/admin-global" style={{
            ...linkStyle("/admin-global"),
            background: isActive("/admin-global") ? "#991b1b" : danger,
            color: "#fff",
            fontWeight: 700,
          }}>
            🚨 Admin Global
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle variant="inline" />

        {!user ? (
          <Link to="/iniciar-sesion" style={{ color: navColor }}>
            Iniciar sesión
          </Link>
        ) : (
          <>
            <span style={{ fontSize: 13 }}>
              {user.username} — <b>{user.is_superuser ? "SUPER" : user.rol}</b>
            </span>

            <button
              onClick={handleLogout}
              style={{
                background: btnBg,
                color: btnColor,
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
