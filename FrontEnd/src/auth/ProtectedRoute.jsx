import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../App";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Mientras carga el usuario
  if (loading) return <p>Cargando...</p>;

  // Si no está logeado → redirigir pero NO si ya está en login
  if (!user) {
    if (location.pathname === "/iniciar-sesion") return children;
    return <Navigate to="/iniciar-sesion" replace />;
  }

  // Verificar roles
  if (user.is_superuser) return children;

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
