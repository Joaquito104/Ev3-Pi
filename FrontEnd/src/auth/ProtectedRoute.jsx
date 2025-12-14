// src/auth/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../App";

export default function ProtectedRoute({ children, roles, requireSuperuser = false }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <p>Cargando...</p>;

  // No logeado
  if (!user) {
    if (location.pathname === "/iniciar-sesion") return children;
    return <Navigate to="/iniciar-sesion" replace />;
  }

  // Si requiere superusuario explícitamente
  if (requireSuperuser && !user.is_superuser) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Superusuario ve todo
  if (user.is_superuser) return children;

  // Aquí se aplican los roles de verdad
  if (roles?.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
