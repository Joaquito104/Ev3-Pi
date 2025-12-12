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

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: navColor,
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 6,
    background: isActive(path) ? activeBg : "transparent",
    fontWeight: isActive(path) ? 700 : 500,
    transition: "all 200ms ease-in-out",
  });

  // ✅ Mostrar links SOLO si el rol tiene permiso (para que “se note” el RBAC)
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
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
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

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>

        {canSee(["CORREDOR", "TI"]) && (
          <Link to="/certificates-upload" style={linkStyle("/certificates-upload")}>
            Certificados
          </Link>
        )}

        {canSee(["ANALISTA", "AUDITOR", "TI"]) && (
          <Link to="/tax-management" style={linkStyle("/tax-management")}>
            Gestión tributaria
          </Link>
        )}

        {canSee(["AUDITOR", "TI"]) && (
          <Link to="/audit-panel" style={linkStyle("/audit-panel")}>
            Auditoría
          </Link>
        )}

        {canSee(["CORREDOR", "ANALISTA", "AUDITOR", "TI"]) && (
          <Link to="/registros" style={linkStyle("/registros")}>
            Registros
          </Link>
        )}

        {canSee(["TI"]) && (
          <Link to="/system-settings" style={linkStyle("/system-settings")}>
            Ajustes
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle variant="inline" />

        {!user ? (
          <Link
            to="/iniciar-sesion"
            style={{ color: navColor, textDecoration: "none", fontWeight: 700 }}
          >
            Iniciar sesión
          </Link>
        ) : (
          <>
            <span style={{ fontSize: 13, opacity: 0.9 }}>
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
              title="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
