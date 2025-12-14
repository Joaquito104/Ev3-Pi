import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext, AuthContext } from "../../App";
import ThemeToggle from "../common/ThemeToggle";

export default function Navbar() {
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const dark = theme === "dark";
  const navBg = dark ? "#13202a" : "#f2f2f2";
  const navColor = dark ? "#e6eef8" : "#0b1220";
  const activeBg = dark ? "#1e3a4c" : "#e0e0e0";
  const btnBg = dark ? "#0b1220" : "#111827";
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
        boxShadow: "0 2px 8px rgba(2,6,23,0.08)",
      }}
    >
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>

        {user && (
          <Link to={goDashboard()} style={linkStyle(goDashboard())}>
            📊 Dashboard
          </Link>
        )}

        {user?.rol === "CORREDOR" && (
          <Link to="/certificates-upload" style={linkStyle("/certificates-upload")}>
            Certificados
          </Link>
        )}

        {["ANALISTA", "AUDITOR", "TI"].includes(user?.rol) && (
          <Link to="/tax-management" style={linkStyle("/tax-management")}>
            Gestión Tributaria
          </Link>
        )}

        {["AUDITOR", "TI"].includes(user?.rol) && (
          <Link to="/validacion" style={linkStyle("/validacion")}>
            Validación
          </Link>
        )}

        {["AUDITOR", "TI"].includes(user?.rol) && (
          <Link to="/audit-panel" style={linkStyle("/audit-panel")}>
            Auditoría
          </Link>
        )}

        {user && (
          <Link to="/registros" style={linkStyle("/registros")}>
            Registros
          </Link>
        )}

        {user && (
          <Link to="/perfil" style={linkStyle("/perfil")}>
            Mi Perfil
          </Link>
        )}

        {user && (
          <Link to="/feedback" style={linkStyle("/feedback")}>
            Feedback
          </Link>
        )}

        {user?.is_superuser && (
          <Link to="/system-settings" style={linkStyle("/system-settings")}>
            Administración Nuam
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
          >
            🚨 Admin Global
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle variant="inline" />

        {!user ? (
          <>
            <Link to="/iniciar-sesion">Iniciar sesión</Link>
            <Link to="/registro" style={{ fontWeight: 700 }}>
              Registrarse
            </Link>
          </>
        ) : (
          <>
            <span style={{ fontSize: 13 }}>
              {user.username} — <b>{user.is_superuser ? "SUPER" : user.rol}</b>
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: btnBg,
                color: "#fff",
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
