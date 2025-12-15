import React, { useContext, useState, useEffect, useCallback } from 'react';
import { ThemeContext } from '../App';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { LoadingSpinner, ErrorAlert, useDebouncedValue } from '../hooks/useOptimizations.jsx';
import { useSessionCache } from '../hooks/useCache.jsx';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ReportesAuditoria = () => {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';
  
  const bg = dark ? '#0f1720' : '#f8fafc';
  const text = dark ? '#e6eef8' : '#0b1220';
  const card = dark ? '#13202a' : '#ffffff';
  const muted = dark ? '#97a6b2' : '#6b7280';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reporteAuditoria, setReporteAuditoria] = useState(null);
  const [reporteCalificaciones, setReporteCalificaciones] = useState(null);
  const [dias, setDias] = useState(30);
  const [estadoExport, setEstadoExport] = useState('');
  
  // Cache con sesión (30 minutos)
  const [cachedAuditoria, setCachedAuditoria, clearAuditoria] = useSessionCache('reportes_auditoria', 30 * 60 * 1000);
  const [cachedCalificaciones, setCachedCalificaciones, clearCalificaciones] = useSessionCache('reportes_calificaciones', 30 * 60 * 1000);
  
  // Debounce para cambios de período
  const debouncedDias = useDebouncedValue(dias, 500);

  const cargarReportes = useCallback(async (diasValue) => {
    // Verificar cache
    const cacheKey = `reportes_${diasValue}`;
    if (cachedAuditoria && cachedCalificaciones) {
      setReporteAuditoria(cachedAuditoria);
      setReporteCalificaciones(cachedCalificaciones);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [resAuditoria, resCalificaciones] = await Promise.all([
        axios.get(`${API_BASE_URL}/reportes/auditoria/?dias=${diasValue}`, { headers }),
        axios.get(`${API_BASE_URL}/reportes/calificaciones/?dias=${diasValue}`, { headers })
      ]);

      setReporteAuditoria(resAuditoria.data);
      setReporteCalificaciones(resCalificaciones.data);
      
      // Guardar en cache de sesión
      setCachedAuditoria(resAuditoria.data);
      setCachedCalificaciones(resCalificaciones.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cachedAuditoria, cachedCalificaciones, setCachedAuditoria, setCachedCalificaciones]);

  useEffect(() => {
    cargarReportes(debouncedDias);
  }, [debouncedDias, cargarReportes]);

  const descargarArchivo = async (tipo) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const params = {};
      if (estadoExport) params.estado = estadoExport;
      const url = `${API_BASE_URL}/exportar/${tipo}/`;
      const res = await axios.get(url, { headers, params, responseType: 'blob' });

      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      const filename = `calificaciones-${tipo}-${date}.${tipo === 'excel' ? 'xlsx' : (tipo === 'pdf' ? 'pdf' : 'csv')}`;
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner theme={theme} size="lg" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: 'clamp(16px, 5vw, 40px)', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {error && <ErrorAlert error={error} theme={theme} />}

        {/* Header */}
        <div style={{ marginBottom: 'clamp(24px, 5vw, 40px)' }}>
          <h1 style={{ fontSize: 'clamp(24px, 8vw, 36px)', fontWeight: 'bold', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/dashboard.webp" alt="Reportes" style={{ width: 'clamp(32px, 6vw, 44px)', height: 'clamp(32px, 6vw, 44px)' }} />
            <span>Reportes y Auditorías</span>
          </h1>
          <p style={{ color: muted, margin: 0, fontSize: 'clamp(14px, 3vw, 16px)' }}>
            Dashboard de auditorías y estadísticas del sistema
          </p>
        </div>

        {/* Selector de período */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 'clamp(8px, 2vw, 12px)',
          marginBottom: 'clamp(24px, 5vw, 32px)'
        }}>
          {[7, 30, 60, 90].map((n) => (
            <button
              key={n}
              onClick={() => setDias(n)}
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px)',
                borderRadius: 8,
                border: dias === n ? '2px solid #3b82f6' : `1px solid ${dark ? '#374151' : '#d1d5db'}`,
                background: dias === n ? '#3b82f6' : (dark ? '#1f2937' : '#f3f4f6'),
                color: dias === n ? '#ffffff' : text,
                cursor: 'pointer',
                fontWeight: dias === n ? 'bold' : 'normal',
                transition: 'all 200ms',
                fontSize: 'clamp(12px, 2vw, 14px)'
              }}
            >
              {n}d
            </button>
          ))}
        </div>

        {/* Exportar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(24px, 5vw, 32px)', alignItems: 'center' }}>
          <select
            value={estadoExport}
            onChange={(e) => setEstadoExport(e.target.value)}
            style={{
              padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2vw, 12px)',
              borderRadius: 8,
              border: `1px solid ${dark ? '#374151' : '#d1d5db'}`,
              background: dark ? '#1f2937' : '#f3f4f6',
              color: text,
              fontSize: 'clamp(12px, 2vw, 14px)'
            }}
          >
            <option value="">Todos los estados</option>
            <option value="VALIDADA">VALIDADA</option>
            <option value="RECHAZADA">RECHAZADA</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>

          <button onClick={() => descargarArchivo('csv')} style={{ padding: 'clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px)', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 'clamp(12px, 2vw, 14px)' }}>CSV</button>
          <button onClick={() => descargarArchivo('excel')} style={{ padding: 'clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px)', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 'clamp(12px, 2vw, 14px)' }}>Excel</button>
          <button onClick={() => descargarArchivo('pdf')} style={{ padding: 'clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px)', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 'clamp(12px, 2vw, 14px)' }}>PDF</button>
        </div>

        {/* Grid de tarjetas resumen */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(160px, 100%, 250px), 1fr))',
          gap: 'clamp(12px, 3vw, 20px)',
          marginBottom: 'clamp(24px, 5vw, 40px)'
        }}>
          {/* Total de Auditorías */}
          <div style={{
            background: card,
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 12,
            border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
          }}>
            <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: 8 }}>
              <img src="/Documentos.webp" alt="Documentos" style={{width: 'clamp(32px, 5vw, 48px)', height: 'clamp(32px, 5vw, 48px)', margin: '0 auto'}} />
            </div>
            <div style={{ color: muted, fontSize: 'clamp(12px, 2vw, 14px)', marginBottom: 8 }}>Total de Auditorías</div>
            <div style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 'bold' }}>
              {reporteAuditoria?.resumen?.total_auditorias || 0}
            </div>
          </div>

          {/* Solicitudes de Auditoría */}
          <div style={{
            background: card,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>
              <img src="/lupa.webp" alt="Solicitudes" style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto' }} />
            </div>
            <div style={{ color: muted, fontSize: 14, marginBottom: 8 }}>Solicitudes Pendientes</div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {reporteAuditoria?.resumen?.solicitudes_auditoria_pendientes || 0}
            </div>
          </div>

          {/* Total de Calificaciones */}
          <div style={{
            background: card,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
          }}>
            <div style={{ color: muted, fontSize: 14, marginBottom: 8 }}>Total Calificaciones</div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {reporteCalificaciones?.resumen?.total_calificaciones || 0}
            </div>
          </div>

          {/* Tasa de Validación */}
          <div style={{
            background: card,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>
              <img src="/icono correcto.webp" alt="Validados" style={{width: '48px', height: '48px', margin: '0 auto'}} />
            </div>
            <div style={{ color: muted, fontSize: 14, marginBottom: 8 }}>Tasa Validación</div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {reporteCalificaciones?.metricas?.tasa_validacion || 0}%
            </div>
          </div>
        </div>

        {/* Sección de Gráficos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 24,
          marginBottom: 40
        }}>
          {/* Auditorías por Acción */}
          <div style={{
            background: card,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold' }}>
              Auditorías por Acción
            </h3>
            {reporteAuditoria?.por_accion && Object.entries(reporteAuditoria.por_accion).map(([accion, count]) => (
              <div key={accion} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{accion}</span>
                  <span style={{ fontWeight: 'bold' }}>{count}</span>
                </div>
                <div style={{
                  height: 8,
                  background: dark ? '#1e3a4c' : '#e5e7eb',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / (reporteAuditoria?.resumen?.total_auditorias || 1)) * 100}%`,
                    background: '#3b82f6',
                    transition: 'width 300ms'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Calificaciones por Estado */}
          <div style={{
            background: card,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold' }}>
              Calificaciones por Estado
            </h3>
            {reporteCalificaciones?.distribucion_porcentaje && 
              Object.entries(reporteCalificaciones.distribucion_porcentaje).map(([estado, porcentaje]) => (
              <div key={estado} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{estado}</span>
                  <span style={{ fontWeight: 'bold' }}>{porcentaje}%</span>
                </div>
                <div style={{
                  height: 8,
                  background: dark ? '#1e3a4c' : '#e5e7eb',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${porcentaje}%`,
                    background: estado === 'VALIDADA' ? '#10b981' : estado === 'OBSERVADA' ? '#f59e0b' : '#ef4444',
                    transition: 'width 300ms'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencia */}
        <div style={{
          background: card,
          padding: 24,
          borderRadius: 12,
          border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`,
          marginBottom: 40
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/IconoTendencia.webp" alt="Tendencia" style={{ width: 20, height: 20 }} />
            <span>Tendencia Últimos 7 Días</span>
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: 200,
            gap: 8,
            padding: '20px 0'
          }}>
            {reporteAuditoria?.tendencia_7dias?.map((dia, idx) => (
              <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  height: `${Math.max(10, (dia.total / 10) * 150)}px`,
                  background: '#3b82f6',
                  borderRadius: 4,
                  marginBottom: 8,
                  transition: 'height 300ms'
                }} />
                <div style={{ fontSize: 12, color: muted }}>{dia.fecha}</div>
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{dia.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Creadores */}
        <div style={{
          background: card,
          padding: 24,
          borderRadius: 12,
          border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold' }}>
            👥 Top Corredores
          </h3>
          {reporteCalificaciones?.top_creadores && reporteCalificaciones.top_creadores.length > 0 ? (
            <div>
              {reporteCalificaciones.top_creadores.map((creador, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  borderBottom: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#3b82f6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <span>{creador.creado_por__first_name}</span>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{creador.count} calificaciones</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: muted }}>Sin datos disponibles</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportesAuditoria;
