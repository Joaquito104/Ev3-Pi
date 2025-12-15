import React, { useContext, useState, useEffect } from "react";
import { ThemeContext, AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

export default function AdminGlobal() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("🚨 AdminGlobal cargado, user:", user);

  const dark = theme === "dark";
  const bg = dark ? "#0f1720" : "#f8fafc";
  const text = dark ? "#e6eef8" : "#0b1220";
  const card = dark ? "#13202a" : "#ffffff";
  const border = dark ? "#374151" : "#d1d5db";
  const muted = dark ? "#97a6b2" : "#6b7280";
  const accent = "#3b82f6";
  const success = "#10b981";
  const warning = "#f59e0b";
  const danger = "#ef4444";

  const [estadoSistema, setEstadoSistema] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | operaciones | auditoria

  const token = localStorage.getItem("proyecto-token");

  // TEMPORAL: Verificación deshabilitada
  // useEffect(() => {
  //   if (!user?.is_superuser) {
  //     navigate("/no-autorizado", { replace: true });
  //   }
  // }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      cargarEstadoSistema();
    } else if (activeTab === "auditoria") {
      cargarAuditoria();
    }
  }, [activeTab]);

  const cargarEstadoSistema = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin-global/estado/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEstadoSistema(data);
      }
    } catch (error) {
      console.error("Error cargando estado:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarAuditoria = async (filtros = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dias: filtros.dias || 7,
        limit: filtros.limit || 100,
        ...(filtros.accion && { accion: filtros.accion }),
        ...(filtros.modelo && { modelo: filtros.modelo }),
      });

      const res = await fetch(
        `http://127.0.0.1:8000/api/admin-global/auditoria/?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setAuditorias(data.auditorias);
      }
    } catch (error) {
      console.error("Error cargando auditoría:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const userId = prompt("ID del usuario:");
    if (!userId) return;

    const newPassword = prompt("Nueva contraseña:");
    if (!newPassword) return;

    const motivo = prompt("Motivo del reset:", "Reset solicitado");

    if (!confirm(`⚠️ ¿Resetear contraseña del usuario ${userId}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin-global/reset-password/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: parseInt(userId), new_password: newPassword, motivo }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.detail);
      } else {
        const error = await res.json();
        alert(error.detail || "Error en la operación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleBloquearUsuario = async (accion) => {
    const userId = prompt("ID del usuario:");
    if (!userId) return;

    const motivo = prompt(`Motivo para ${accion}:`, "");

    if (!confirm(`⚠️ ¿${accion.toUpperCase()} usuario ${userId}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin-global/bloquear-usuario/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: parseInt(userId), accion, motivo }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.detail);
      } else {
        const error = await res.json();
        alert(error.detail || "Error en la operación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        background: bg,
        color: text,
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* ENCABEZADO DE EMERGENCIA */}
        <div
          style={{
            background: danger,
            color: "#fff",
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: "3px solid #991b1b",
          }}
        >
          <h1 style={{ margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>
            🚨 ADMINISTRADOR GLOBAL
          </h1>
          <p style={{ margin: 0, fontSize: 14 }}>
            Acceso de emergencia - Todas las acciones quedan auditadas - Uso exclusivo para contingencias
          </p>
        </div>

        {/* TABS */}
        <div style={{ marginBottom: 24, display: "flex", gap: 8, borderBottom: `2px solid ${border}` }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              background: activeTab === "dashboard" ? accent : "transparent",
              color: activeTab === "dashboard" ? "#fff" : text,
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("operaciones")}
            style={{
              background: activeTab === "operaciones" ? danger : "transparent",
              color: activeTab === "operaciones" ? "#fff" : text,
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            🔧 Operaciones Críticas
          </button>
          <button
            onClick={() => setActiveTab("auditoria")}
            style={{
              background: activeTab === "auditoria" ? accent : "transparent",
              color: activeTab === "auditoria" ? "#fff" : text,
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            📋 Auditoría Global
          </button>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && loading && !estadoSistema && (
          <p style={{ color: muted }}>Cargando estado del sistema...</p>
        )}

        {activeTab === "dashboard" && !loading && !estadoSistema && (
          <p style={{ color: muted }}>No se pudo cargar el estado del sistema.</p>
        )}

        {activeTab === "dashboard" && estadoSistema && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <div style={{ background: card, padding: 24, borderRadius: 8, border: `1px solid ${border}` }}>
              <h3 style={{ marginTop: 0, fontSize: 14, color: muted }}>SISTEMA</h3>
              <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0" }}>
                {estadoSistema.sistema.estado}
              </p>
              <p style={{ fontSize: 12, color: muted, margin: 0 }}>{estadoSistema.sistema.nombre}</p>
            </div>

            <div style={{ background: card, padding: 24, borderRadius: 8, border: `1px solid ${border}` }}>
              <h3 style={{ marginTop: 0, fontSize: 14, color: muted }}>USUARIOS</h3>
              <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0" }}>
                {estadoSistema.usuarios.total}
              </p>
              <p style={{ fontSize: 12, color: muted, margin: 0 }}>
                {estadoSistema.usuarios.activos} activos • {estadoSistema.usuarios.superusuarios} superusers
              </p>
            </div>

            <div style={{ background: card, padding: 24, borderRadius: 8, border: `1px solid ${border}` }}>
              <h3 style={{ marginTop: 0, fontSize: 14, color: muted }}>ACTIVIDAD (24H)</h3>
              <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0" }}>
                {estadoSistema.actividad.ultimas_24h}
              </p>
              <p style={{ fontSize: 12, color: muted, margin: 0 }}>Acciones registradas</p>
            </div>

            <div style={{ background: card, padding: 24, borderRadius: 8, border: `1px solid ${border}` }}>
              <h3 style={{ marginTop: 0, fontSize: 14, color: muted }}>REGLAS DE NEGOCIO</h3>
              <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0" }}>
                {estadoSistema.reglas_negocio.activas} / {estadoSistema.reglas_negocio.total}
              </p>
              <p style={{ fontSize: 12, color: muted, margin: 0 }}>Activas / Total</p>
            </div>

            <div
              style={{
                background: card,
                padding: 24,
                borderRadius: 8,
                border: `1px solid ${border}`,
                gridColumn: "span 2",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Distribución de Roles</h3>
              {Object.entries(estadoSistema.usuarios.por_rol).map(([rol, count]) => (
                <div
                  key={rol}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: `1px solid ${border}`,
                  }}
                >
                  <span>{rol}</span>
                  <span style={{ fontWeight: "bold" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPERACIONES CRÍTICAS */}
        {activeTab === "operaciones" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                background: card,
                padding: 24,
                borderRadius: 8,
                border: `2px solid ${danger}`,
              }}
            >
              <h2 style={{ marginTop: 0, color: danger }}>⚠️ ZONA DE PELIGRO</h2>
              <p style={{ color: muted, marginBottom: 24 }}>
                Estas operaciones son irreversibles y quedan auditadas. Usar solo en emergencias.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  style={{
                    background: warning,
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: 8,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Resetear contraseña de usuario
                </button>

                <button
                  onClick={() => handleBloquearUsuario("bloquear")}
                  disabled={loading}
                  style={{
                    background: danger,
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: 8,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  🚫 Bloquear usuario
                </button>

                <button
                  onClick={() => handleBloquearUsuario("desbloquear")}
                  disabled={loading}
                  style={{
                    background: success,
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: 8,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Desbloquear usuario
                </button>

                <button
                  onClick={() => navigate("/system-settings")}
                  style={{
                    background: accent,
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ⚙️ Gestionar usuarios y reglas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUDITORÍA */}
        {activeTab === "auditoria" && (
          <div>
            <div
              style={{
                background: card,
                padding: 24,
                borderRadius: 8,
                border: `1px solid ${border}`,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => cargarAuditoria({ dias: 1 })}
                  style={{
                    padding: "8px 16px",
                    background: accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Últimas 24h
                </button>
                <button
                  onClick={() => cargarAuditoria({ dias: 7 })}
                  style={{
                    padding: "8px 16px",
                    background: accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Últimos 7 días
                </button>
                <button
                  onClick={() => cargarAuditoria({ dias: 30 })}
                  style={{
                    padding: "8px 16px",
                    background: accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Últimos 30 días
                </button>
              </div>
            </div>

            <div
              style={{
                background: card,
                padding: 24,
                borderRadius: 8,
                border: `1px solid ${border}`,
              }}
            >
              <h2 style={{ marginTop: 0 }}>Registros de Auditoría</h2>

              {loading && <p style={{ color: muted }}>Cargando auditoría...</p>}

              {!loading && auditorias.length === 0 && (
                <p style={{ color: muted }}>No hay registros en el período seleccionado.</p>
              )}

              {!loading && auditorias.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${border}` }}>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>
                          FECHA
                        </th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>
                          USUARIO
                        </th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>
                          ACCIÓN
                        </th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>
                          MODELO
                        </th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>
                          DESCRIPCIÓN
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditorias.map((a) => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "12px 8px", fontSize: 12 }}>{a.fecha}</td>
                          <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 600 }}>
                            {a.usuario} <span style={{ color: muted, fontSize: 11 }}>({a.rol})</span>
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: 12 }}>
                            <span
                              style={{
                                background:
                                  a.accion === "DELETE"
                                    ? danger
                                    : a.accion === "CREATE"
                                    ? success
                                    : accent,
                                color: "#fff",
                                padding: "4px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {a.accion}
                            </span>
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: 12 }}>{a.modelo}</td>
                          <td style={{ padding: "12px 8px", fontSize: 12, color: muted }}>
                            {a.descripcion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
