import React, { useMemo, useState, useContext } from 'react';
import { ThemeContext } from '../App';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function generateMockLogs(count = 100) {
  const actions = ['Acceso', 'Actualización', 'Actualización', 'Eliminación', 'Exportación'];
  const statuses = ['Exitoso', 'Consulta', 'Modificación', 'Error'];
  const users = ['admin', 'user01', 'auditor', 'system'];
  const logs = [];
  // Devolver array vacío para no mostrar datos iniciales
  return logs;
}

export default function AuditPanel() {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';
  const bg = dark ? '#0f1720' : '#f8fafc';
  const text = dark ? '#e6eef8' : '#0b1220';
  const card = dark ? '#13202a' : '#ffffff';
  const border = dark ? '#374151' : '#d1d5db';
  const muted = dark ? '#97a6b2' : '#6b7280';
  const inputBg = dark ? '#1f2937' : '#f9fafb';

  const allLogs = useMemo(() => generateMockLogs(150), []);
  const [days, setDays] = useState(7);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filtrado por días
  const filteredByDays = useMemo(() => {
    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    return allLogs.filter(l => new Date(l.date).getTime() > cutoff);
  }, [allLogs, days]);

  // Conteo por acción
  const actionCounts = useMemo(() => {
    const counts = { Acceso: 0, Actualización: 0, Eliminación: 0, Exportación: 0 };
    filteredByDays.forEach(l => { counts[l.action] = (counts[l.action] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredByDays]);

  // Distribución de acciones
  const actionDistribution = useMemo(() => {
    const dist = { 'Operaciones Exitosas': 0, Consultas: 0, Modificaciones: 0, Errores: 0 };
    const statusMap = { Exitoso: 'Operaciones Exitosas', Consulta: 'Consultas', Modificación: 'Modificaciones', Error: 'Errores' };
    filteredByDays.forEach(l => { const key = statusMap[l.status]; if (key) dist[key]++; });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [filteredByDays]);

  // Estadísticas en cajas
  const stats = useMemo(() => [
    { label: 'Total eventos', value: filteredByDays.length },
    { label: 'Exitosos', value: filteredByDays.filter(l => l.status === 'Exitoso').length },
    { label: 'Consultas', value: filteredByDays.filter(l => l.status === 'Consulta').length },
    { label: 'Errores', value: filteredByDays.filter(l => l.status === 'Error').length }
  ], [filteredByDays]);

  // Filtrado por búsqueda
  const filtered = useMemo(() => {
    return filteredByDays.filter(l => {
      if (!query) return true;
      return `${l.user} ${l.action} ${l.details}`.toLowerCase().includes(query.toLowerCase());
    });
  }, [filteredByDays, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div style={{ padding: 24, background: bg, color: text, minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Panel de auditoría</h1>

      {/* DIV 1: Estadísticas y Gráficos */}
      <div style={{ background: card, padding: 20, borderRadius: 8, marginBottom: 24, boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Eventos por tipo</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDays(1)} style={{ padding: '8px 16px', borderRadius: 4, border: days === 1 ? '2px solid #3b82f6' : `1px solid ${border}`, background: days === 1 ? '#eff6ff' : card, color: days === 1 ? '#3b82f6' : muted, cursor: 'pointer', fontWeight: days === 1 ? 'bold' : 'normal' }}>1 día</button>
            <button onClick={() => setDays(7)} style={{ padding: '8px 16px', borderRadius: 4, border: days === 7 ? '2px solid #3b82f6' : `1px solid ${border}`, background: days === 7 ? '#eff6ff' : card, color: days === 7 ? '#3b82f6' : muted, cursor: 'pointer', fontWeight: days === 7 ? 'bold' : 'normal' }}>1 semana</button>
            <button onClick={() => setDays(30)} style={{ padding: '8px 16px', borderRadius: 4, border: days === 30 ? '2px solid #3b82f6' : `1px solid ${border}`, background: days === 30 ? '#eff6ff' : card, color: days === 30 ? '#3b82f6' : muted, cursor: 'pointer', fontWeight: days === 30 ? 'bold' : 'normal' }}>1 mes</button>
          </div>
        </div>
        
        {/* 4 cajas de estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ background: inputBg, padding: 16, borderRadius: 6, textAlign: 'center', border: `1px solid ${border}` }}>
              <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: text }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 2 Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Gráfico de barras: Acciones */}
          <div>
            <h3 style={{ marginTop: 0 }}>Eventos por tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={actionCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de torta: Distribución */}
          <div>
            <h3 style={{ marginTop: 0 }}>Distribución de acciones (Torta)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={actionDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DIV 2: Filtro de búsqueda */}
      <div style={{ background: card, padding: 20, borderRadius: 8, marginBottom: 24, boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${border}` }}>
        <h2 style={{ marginTop: 0, color: text }}>Filtros</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: text }}>Período (días)</label>
            <select value={days} onChange={(e) => { setDays(Number(e.target.value)); setPage(1); }} style={{ padding: 8, borderRadius: 4, border: `1px solid ${border}`, background: inputBg, color: text }}>
              <option value={1}>1 día</option>
              <option value={7}>7 días</option>
              <option value={30}>1 mes</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: text }}>Búsqueda</label>
            <input placeholder="Buscar por usuario, acción o detalle..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} style={{ width: '100%', padding: 8, borderRadius: 4, border: `1px solid ${border}`, background: inputBg, color: text }} />
          </div>
        </div>
      </div>

      {/* DIV 3: Registro de eventos */}
      <div style={{ background: card, padding: 20, borderRadius: 8, boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${border}` }}>
        <h2 style={{ marginTop: 0, color: text }}>Registro de eventos</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: text }}>
            <thead>
              <tr style={{ textAlign: 'left', background: inputBg, borderBottom: `2px solid ${border}` }}>
                <th style={{ padding: 12, color: text }}>Fecha</th>
                <th style={{ padding: 12, color: text }}>Usuario</th>
                <th style={{ padding: 12, color: text }}>Acción</th>
                <th style={{ padding: 12, color: text }}>Estado</th>
                <th style={{ padding: 12, color: text }}>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((l, idx) => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${border}`, background: idx % 2 === 0 ? card : inputBg }}>
                  <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{new Date(l.date).toLocaleString('es-ES')}</td>
                  <td style={{ padding: 12 }}>{l.user}</td>
                  <td style={{ padding: 12 }}>{l.action}</td>
                  <td style={{ padding: 12 }}><span style={{ background: l.status === 'Exitoso' ? '#d1fae5' : l.status === 'Error' ? '#fee2e2' : '#fef3c7', color: l.status === 'Exitoso' ? '#065f46' : l.status === 'Error' ? '#7f1d1d' : '#78350f', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>{l.status}</span></td>
                  <td style={{ padding: 12 }}>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 14, color: muted }}>Mostrando {pageItems.length} de {filtered.length} eventos — página {page} / {pages}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 12px', borderRadius: 4, border: `1px solid ${border}`, background: page === 1 ? inputBg : card, color: text, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Anterior</button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '8px 12px', borderRadius: 4, border: `1px solid ${border}`, background: page === pages ? inputBg : card, color: text, cursor: page === pages ? 'not-allowed' : 'pointer' }}>Siguiente</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
