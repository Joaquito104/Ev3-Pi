import { Link } from "react-router-dom";

export default function NoAutorizado() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "10px" }}>
        Acceso no autorizado
      </h1>

      <p style={{ maxWidth: "500px", fontSize: "16px", opacity: 0.8 }}>
        No tienes permisos para acceder a esta sección del sistema.
        Si crees que es un error, contacta al administrador del sistema.
      </p>

      {/*  BOTÓN VOLVER */}
      <Link
        to="/"
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
