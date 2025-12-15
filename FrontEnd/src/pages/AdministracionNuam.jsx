import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../App";

export default function AdministracionNuam() {
  const { theme } = useContext(ThemeContext);
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

  const [activeTab, setActiveTab] = useState("reglas"); // reglas | usuarios | historial
  const [reglas, setReglas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [reglaSeleccionada, setReglaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffData, setDiffData] = useState(null);
  const [editingRegla, setEditingRegla] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    condicion: "",
    accion: "",
    estado: "REVISION",
  });
  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    rol: "",
  });

  const token = localStorage.getItem("proyecto-token");

  useEffect(() => {
    if (activeTab === "reglas") {
      cargarReglas();
    } else if (activeTab === "usuarios") {
      cargarUsuarios();
    } else if (activeTab === "historial" && reglaSeleccionada) {
      cargarHistorial(reglaSeleccionada.id);
    }
  }, [activeTab, reglaSeleccionada]);

  const cargarReglas = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/reglas-negocio/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReglas(data);
      }
    } catch (error) {
      console.error("Error cargando reglas:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/usuarios/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRegla
        ? `http://127.0.0.1:8000/api/reglas-negocio/${editingRegla.id}/`
        : "http://127.0.0.1:8000/api/reglas-negocio/";
      
      const method = editingRegla ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editingRegla ? "Regla actualizada exitosamente" : "Regla creada exitosamente");
        setShowForm(false);
        setEditingRegla(null);
        setFormData({
          nombre: "",
          descripcion: "",
          condicion: "",
          accion: "",
          estado: "REVISION",
        });
        cargarReglas();
      } else {
        const error = await res.json();
        alert(error.detail || "Error al procesar regla");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRegla = (regla) => {
    setEditingRegla(regla);
    setFormData({
      nombre: regla.nombre,
      descripcion: regla.descripcion,
      condicion: regla.condicion,
      accion: regla.accion,
      estado: regla.estado,
    });
    setShowForm(true);
  };

  const handleDeleteRegla = async (reglaId, nombre) => {
    if (!confirm(`¿Eliminar regla "${nombre}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reglas-negocio/${reglaId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Regla eliminada exitosamente");
        cargarReglas();
      } else {
        const error = await res.json();
        alert(error.detail || "Error al eliminar regla");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserChange = (e) => {
    setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingUser
        ? `http://127.0.0.1:8000/api/usuarios/${editingUser.id}/`
        : "http://127.0.0.1:8000/api/usuarios/";
      
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser ? { ...userFormData } : userFormData;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert(editingUser ? "Usuario actualizado" : "Usuario creado exitosamente");
        setShowUserForm(false);
        setEditingUser(null);
        setUserFormData({
          username: "",
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          rol: "",
        });
        cargarUsuarios();
      } else {
        const error = await res.json();
        alert(error.detail || "Error al procesar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email || "",
      password: "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      rol: user.rol || "",
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`¿Eliminar usuario ${username}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Usuario eliminado exitosamente");
        cargarUsuarios();
      } else {
        const error = await res.json();
        alert(error.detail || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // =================== FUNCIONES DE HISTORIAL ===================
  
  const cargarHistorial = async (reglaId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reglas-negocio/${reglaId}/historial/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistorial(data.historial || []);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerHistorial = (regla) => {
    setReglaSeleccionada(regla);
    setActiveTab("historial");
  };

  const handleRollback = async (reglaId, version) => {
    const comentario = prompt(`¿Razón del rollback a versión ${version}?`, "Rollback manual");
    if (!comentario) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reglas-negocio/${reglaId}/rollback/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version, comentario }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Rollback exitoso. Nueva versión: ${data.nueva_version}`);
        cargarHistorial(reglaId);
        cargarReglas();
      } else {
        const error = await res.json();
        alert(error.detail || "Error en rollback");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleCompararVersiones = async (reglaId, v1, v2) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/reglas-negocio/${reglaId}/comparar/?v1=${v1}&v2=${v2}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        setDiffData(data);
        setShowDiff(true);
      } else {
        alert("Error comparando versiones");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "ACTIVA":
        return success;
      case "INACTIVA":
        return muted;
      case "REVISION":
        return warning;
      case "DEPRECADA":
        return danger;
      default:
        return muted;
    }
  };

  const getEstadoBadge = (estado) => ({
    background: getEstadoColor(estado),
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  });

  return (
    <div
      style={{
        padding: 24,
        background: bg,
        color: text,
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* ENCABEZADO */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 8px 0" }}>Administración Nuam</h1>
          <p style={{ color: muted, margin: 0 }}>
            Gestión de reglas de negocio y usuarios • Solo Administrador TI
          </p>
        </div>

        {/* TABS */}
        <div style={{ marginBottom: 24, display: "flex", gap: 8, borderBottom: `2px solid ${border}` }}>
          <button
            onClick={() => setActiveTab("reglas")}
            style={{
              background: activeTab === "reglas" ? accent : "transparent",
              color: activeTab === "reglas" ? "#fff" : text,
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Reglas de Negocio
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            style={{
              background: activeTab === "usuarios" ? accent : "transparent",
              color: activeTab === "usuarios" ? "#fff" : text,
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Gestión de Usuarios
          </button>
          <button
            onClick={() => {
              if (!reglaSeleccionada) {
                alert("Selecciona una regla primero desde 'Reglas de Negocio'");
                return;
              }
              setActiveTab("historial");
            }}
            style={{
              background: activeTab === "historial" ? accent : "transparent",
              color: activeTab === "historial" ? "#fff" : text,
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Historial {reglaSeleccionada && `(${reglaSeleccionada.nombre})`}
          </button>
        </div>

        {/* CONTENIDO DE REGLAS */}
        {activeTab === "reglas" && (
          <div>

        {/* BOTÓN CREAR REGLA */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingRegla(null);
              setFormData({
                nombre: "",
                descripcion: "",
                condicion: "",
                accion: "",
                estado: "REVISION",
              });
            }}
            style={{
              background: accent,
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {showForm ? "Cancelar" : "+ Nueva regla de negocio"}
          </button>
        </div>

        {/* FORMULARIO DE CREACIÓN */}
        {showForm && (
          <div
            style={{
              background: card,
              padding: 24,
              borderRadius: 8,
              border: `1px solid ${border}`,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingRegla ? "Editar regla de negocio" : "Crear nueva regla"}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Nombre de la regla *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Validación monto mínimo inversión"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${border}`,
                    background: dark ? "#1f2937" : "#fff",
                    color: text,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  placeholder="Describe el propósito de esta regla de negocio"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${border}`,
                    background: dark ? "#1f2937" : "#fff",
                    color: text,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Condición (IF) *
                </label>
                <textarea
                  name="condicion"
                  value={formData.condicion}
                  onChange={handleChange}
                  required
                  placeholder="Ej: monto > 1000000 AND periodo == '2025'"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${border}`,
                    background: dark ? "#1f2937" : "#fff",
                    color: text,
                    fontSize: 13,
                    fontFamily: "monospace",
                    resize: "vertical",
                  }}
                />
                <small style={{ color: muted, fontSize: 12 }}>
                  Define la condición lógica que activa esta regla
                </small>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Acción (THEN) *
                </label>
                <textarea
                  name="accion"
                  value={formData.accion}
                  onChange={handleChange}
                  required
                  placeholder="Ej: asignar_estado('REVISION_MANUAL')"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${border}`,
                    background: dark ? "#1f2937" : "#fff",
                    color: text,
                    fontSize: 13,
                    fontFamily: "monospace",
                    resize: "vertical",
                  }}
                />
                <small style={{ color: muted, fontSize: 12 }}>
                  Define la acción a ejecutar cuando se cumple la condición
                </small>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Estado inicial
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${border}`,
                    background: dark ? "#1f2937" : "#fff",
                    color: text,
                    fontSize: 14,
                  }}
                >
                  <option value="REVISION">En revisión</option>
                  <option value="ACTIVA">Activa</option>
                  <option value="INACTIVA">Inactiva</option>
                </select>
                <small style={{ color: muted, fontSize: 12 }}>
                  Se recomienda crear en estado "En revisión" y activar tras validación
                </small>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: success,
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (editingRegla ? "Actualizando..." : "Creando...") : (editingRegla ? "Actualizar regla" : "Crear regla")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRegla(null);
                  }}
                  style={{
                    background: "transparent",
                    color: text,
                    border: `1px solid ${border}`,
                    padding: "12px 24px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTADO DE REGLAS */}
        <div
          style={{
            background: card,
            padding: 24,
            borderRadius: 8,
            border: `1px solid ${border}`,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Reglas de negocio activas</h2>

          {loading && <p style={{ color: muted }}>Cargando reglas...</p>}

          {!loading && reglas.length === 0 && (
            <p style={{ color: muted }}>No hay reglas creadas. Crea la primera regla de negocio.</p>
          )}

          {!loading && reglas.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reglas.map((regla) => (
                <div
                  key={regla.id}
                  style={{
                    background: dark ? "#1f2937" : "#f9fafb",
                    padding: 16,
                    borderRadius: 8,
                    border: `1px solid ${border}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: 16 }}>
                        {regla.nombre} <span style={{ color: muted, fontSize: 14, fontWeight: 400 }}>v{regla.version}</span>
                      </h3>
                      <span style={getEstadoBadge(regla.estado)}>{regla.estado}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                      <button
                        onClick={() => handleVerHistorial(regla)}
                        style={{
                          background: accent,
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Ver historial
                      </button>
                      <button
                        onClick={() => handleEditRegla(regla)}
                        style={{
                          background: warning,
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRegla(regla.id, regla.nombre)}
                        style={{
                          background: danger,
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "8px 0", color: muted, fontSize: 14 }}>{regla.descripcion}</p>
                  <div style={{ fontSize: 12, color: muted, marginTop: 8 }}>
                    Creado por: <strong>{regla.creado_por}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        )}

        {/* CONTENIDO DE USUARIOS */}
        {activeTab === "usuarios" && (
          <div>
            {/* BOTÓN CREAR USUARIO */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => {
                  setShowUserForm(!showUserForm);
                  setEditingUser(null);
                  setUserFormData({
                    username: "",
                    email: "",
                    password: "",
                    first_name: "",
                    last_name: "",
                    rol: "",
                  });
                }}
                style={{
                  background: success,
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {showUserForm ? "Cancelar" : "+ Nuevo usuario"}
              </button>
            </div>

            {/* FORMULARIO DE USUARIO */}
            {showUserForm && (
              <div
                style={{
                  background: card,
                  padding: 24,
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  marginBottom: 24,
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  {editingUser ? "Editar usuario" : "Crear nuevo usuario"}
                </h2>
                <form onSubmit={handleUserSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Username * {editingUser && <small style={{ color: muted }}>(no editable)</small>}
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={userFormData.username}
                      onChange={handleUserChange}
                      required
                      disabled={!!editingUser}
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 6,
                        border: `1px solid ${border}`,
                        background: editingUser ? (dark ? "#0f1720" : "#f0f0f0") : (dark ? "#1f2937" : "#fff"),
                        color: text,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleUserChange}
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 6,
                        border: `1px solid ${border}`,
                        background: dark ? "#1f2937" : "#fff",
                        color: text,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Contraseña {editingUser && <small style={{ color: muted }}>(dejar vacío para no cambiar)</small>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={userFormData.password}
                      onChange={handleUserChange}
                      required={!editingUser}
                      placeholder={editingUser ? "Nueva contraseña (opcional)" : ""}
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 6,
                        border: `1px solid ${border}`,
                        background: dark ? "#1f2937" : "#fff",
                        color: text,
                        fontSize: 14,
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={userFormData.first_name}
                        onChange={handleUserChange}
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 6,
                          border: `1px solid ${border}`,
                          background: dark ? "#1f2937" : "#fff",
                          color: text,
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                        Apellido
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={userFormData.last_name}
                        onChange={handleUserChange}
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 6,
                          border: `1px solid ${border}`,
                          background: dark ? "#1f2937" : "#fff",
                          color: text,
                          fontSize: 14,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Rol *
                    </label>
                    <select
                      name="rol"
                      value={userFormData.rol}
                      onChange={handleUserChange}
                      required
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 6,
                        border: `1px solid ${border}`,
                        background: dark ? "#1f2937" : "#fff",
                        color: text,
                        fontSize: 14,
                      }}
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="CORREDOR">Corredor de inversión</option>
                      <option value="ANALISTA">Analista tributario</option>
                      <option value="AUDITOR">Auditor interno</option>
                      <option value="TI">Administrador TI</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: accent,
                        color: "#fff",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 8,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? "Guardando..." : editingUser ? "Actualizar usuario" : "Crear usuario"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserForm(false);
                        setEditingUser(null);
                      }}
                      style={{
                        background: "transparent",
                        color: text,
                        border: `1px solid ${border}`,
                        padding: "12px 24px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LISTADO DE USUARIOS */}
            <div
              style={{
                background: card,
                padding: 24,
                borderRadius: 8,
                border: `1px solid ${border}`,
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>Usuarios del sistema</h2>

              {loading && <p style={{ color: muted }}>Cargando usuarios...</p>}

              {!loading && usuarios.length === 0 && (
                <p style={{ color: muted }}>No hay usuarios registrados.</p>
              )}

              {!loading && usuarios.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${border}` }}>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>ID</th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>USERNAME</th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>EMAIL</th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>NOMBRE</th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>ROL</th>
                        <th style={{ padding: "12px 8px", textAlign: "left", color: muted, fontSize: 12 }}>SUPER</th>
                        <th style={{ padding: "12px 8px", textAlign: "right", color: muted, fontSize: 12 }}>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((user) => (
                        <tr key={user.id} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "12px 8px", fontSize: 14 }}>{user.id}</td>
                          <td style={{ padding: "12px 8px", fontSize: 14, fontWeight: 600 }}>{user.username}</td>
                          <td style={{ padding: "12px 8px", fontSize: 14, color: muted }}>{user.email || "—"}</td>
                          <td style={{ padding: "12px 8px", fontSize: 14 }}>
                            {user.first_name || user.last_name
                              ? `${user.first_name} ${user.last_name}`.trim()
                              : "—"}
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: 14 }}>
                            {user.rol ? (
                              <span
                                style={{
                                  background: accent,
                                  color: "#fff",
                                  padding: "4px 10px",
                                  borderRadius: 12,
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {user.rol}
                              </span>
                            ) : (
                              <span style={{ color: muted }}>Sin rol</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: 14 }}>
                            {user.is_superuser ? "✓" : "—"}
                          </td>
                          <td style={{ padding: "12px 8px", textAlign: "right" }}>
                            <button
                              onClick={() => handleEditUser(user)}
                              style={{
                                background: warning,
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                                marginRight: 8,
                              }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              style={{
                                background: danger,
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Eliminar
                            </button>
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

        {/* CONTENIDO DE HISTORIAL */}
        {activeTab === "historial" && reglaSeleccionada && (
          <div>
            <div style={{ marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => setActiveTab("reglas")}
                style={{
                  background: "transparent",
                  border: `1px solid ${border}`,
                  color: text,
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ← Volver a reglas
              </button>
              <h2 style={{ margin: 0 }}>
                Historial de {reglaSeleccionada.nombre} (v{reglaSeleccionada.version})
              </h2>
            </div>

            {/* LISTADO DE VERSIONES */}
            <div
              style={{
                background: card,
                padding: 24,
                borderRadius: 8,
                border: `1px solid ${border}`,
              }}
            >
              {loading && <p style={{ color: muted }}>Cargando historial...</p>}

              {!loading && historial.length === 0 && (
                <p style={{ color: muted }}>No hay historial disponible.</p>
              )}

              {!loading && historial.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {historial.map((snapshot, idx) => (
                    <div
                      key={snapshot.id}
                      style={{
                        background: dark ? "#1f2937" : "#f9fafb",
                        padding: 16,
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div>
                          <h3 style={{ margin: "0 0 4px 0", fontSize: 16 }}>
                            Versión {snapshot.version}
                            {snapshot.version === reglaSeleccionada.version && (
                              <span style={{ color: success, marginLeft: 8, fontSize: 12 }}>
                                (Actual)
                              </span>
                            )}
                          </h3>
                          <p style={{ margin: "4px 0", fontSize: 12, color: muted }}>
                            {snapshot.fecha_snapshot} • Por {snapshot.modificado_por}
                          </p>
                          {snapshot.comentario && (
                            <p style={{ margin: "4px 0", fontSize: 12, fontStyle: "italic", color: muted }}>
                              "{snapshot.comentario}"
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          {idx < historial.length - 1 && (
                            <button
                              onClick={() => handleCompararVersiones(
                                reglaSeleccionada.id,
                                snapshot.version,
                                historial[idx + 1].version
                              )}
                              style={{
                                background: accent,
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Comparar ↓
                            </button>
                          )}

                          {snapshot.version !== reglaSeleccionada.version && (
                            <button
                              onClick={() => handleRollback(reglaSeleccionada.id, snapshot.version)}
                              style={{
                                background: warning,
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Restaurar
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: 13, color: muted }}>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Estado:</strong>{" "}
                          <span style={getEstadoBadge(snapshot.estado)}>{snapshot.estado}</span>
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Condición:</strong> {snapshot.condicion.substring(0, 60)}...
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Acción:</strong> {snapshot.accion.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODAL DE DIFF */}
            {showDiff && diffData && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
                onClick={() => setShowDiff(false)}
              >
                <div
                  style={{
                    background: card,
                    padding: 32,
                    borderRadius: 12,
                    maxWidth: 900,
                    maxHeight: "80vh",
                    overflow: "auto",
                    color: text,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 style={{ marginTop: 0 }}>
                    Comparación v{diffData.version_1.version} vs v{diffData.version_2.version}
                  </h2>

                  {["nombre", "descripcion", "condicion", "accion", "estado"].map((campo) => (
                    <div key={campo} style={{ marginBottom: 24 }}>
                      <h3 style={{ textTransform: "capitalize", fontSize: 14, marginBottom: 8 }}>
                        {campo}{" "}
                        {diffData.cambios[campo] && (
                          <span style={{ color: warning, fontSize: 12 }}>● Cambió</span>
                        )}
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div
                          style={{
                            background: dark ? "#1f2937" : "#f3f4f6",
                            padding: 12,
                            borderRadius: 6,
                            fontSize: 13,
                            fontFamily: campo === "condicion" || campo === "accion" ? "monospace" : "inherit",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: 4, color: muted }}>
                            v{diffData.version_1.version}
                          </div>
                          {diffData.version_1[campo]}
                        </div>
                        <div
                          style={{
                            background: dark ? "#1f2937" : "#f3f4f6",
                            padding: 12,
                            borderRadius: 6,
                            fontSize: 13,
                            fontFamily: campo === "condicion" || campo === "accion" ? "monospace" : "inherit",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: 4, color: muted }}>
                            v{diffData.version_2.version}
                          </div>
                          {diffData.version_2[campo]}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowDiff(false)}
                    style={{
                      background: accent,
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      marginTop: 16,
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
