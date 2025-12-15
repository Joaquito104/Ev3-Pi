import { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const GuiaRol = () => {
  const { rol } = useParams();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const dark = theme === 'dark';
  const bg = dark ? '#0f1720' : '#f8fafc';
  const text = dark ? '#e6eef8' : '#0b1220';
  const card = dark ? '#13202a' : '#ffffff';
  const muted = dark ? '#97a6b2' : '#6b7280';
  const accent = '#3b82f6';

  const rolesData = {
    corredor: {
      nombre: 'Corredor',
      emoji: '',
      color: '#3b82f6',
      descripcion: 'Responsable de cargar y gestionar certificados digitales en la plataforma.',
      tareas: [
        'Cargar certificados (AFP, ISAPRE, Salud, etc.)',
        'Crear certificados manualmente o mediante CSV',
        'Revisar estado de certificados',
        'Resolver problemas de validación',
        'Exportar reportes de certificados'
      ],
      flujo: [
        { paso: 1, titulo: 'Accede a Carga de Certificados', desc: 'Desde tu dashboard, dirígete a la sección "Certificados"' },
        { paso: 2, titulo: 'Elige el modo de carga', desc: 'Puedes cargar de forma individual (formulario) o masiva (CSV)' },
        { paso: 3, titulo: 'Completa los datos requeridos', desc: 'Ingresa RUT, tipo de certificado, período y datos del afiliado' },
        { paso: 4, titulo: 'Valida la información', desc: 'El sistema valida formato RUT y campos obligatorios automáticamente' },
        { paso: 5, titulo: 'Guarda el certificado', desc: 'Se crea en estado BORRADOR y pasa a revisión del analista' }
      ],
      requisitos: ['Acceso a la plataforma', 'Certificados digitales válidos', 'Datos completos del afiliado', 'Formato RUT chileno: XX.XXX.XXX-X'],
    },
    analista: {
      nombre: 'Analista',
      emoji: '',
      color: '#10b981',
      descripcion: 'Responsable de revisar y calificar certificados según reglas tributarias.',
      tareas: [
        'Revisar certificados cargados',
        'Asignar calificaciones según reglas',
        'Validar conformidad de documentos',
        'Documentar hallazgos',
        'Comunicar al auditor para aprobación'
      ],
      flujo: [
        { paso: 1, titulo: 'Accede al panel de análisis', desc: 'Ve los certificados pendientes de revisión' },
        { paso: 2, titulo: 'Revisa cada certificado', desc: 'Verifica los datos, anexos y cumplimiento de reglas' },
        { paso: 3, titulo: 'Asigna calificación', desc: 'Selecciona una calificación según la evaluación' },
        { paso: 4, titulo: 'Documenta tu análisis', desc: 'Agrega comentarios y hallazgos relevantes' },
        { paso: 5, titulo: 'Envía para auditoría', desc: 'El auditor revisará tu evaluación' }
      ],
      requisitos: ['Conocimiento de reglas tributarias', 'Certificados para analizar', 'Acceso a documentación', 'Experiencia en validación'],
    },
    auditor: {
      nombre: 'Auditor',
      emoji: '',
      color: '#f59e0b',
      descripcion: 'Supervisa el proceso completo, valida calificaciones y genera reportes de auditoría.',
      tareas: [
        'Supervisar todo el proceso',
        'Validar calificaciones del analista',
        'Aprobar o rechazar evaluaciones',
        'Generar reportes de auditoría',
        'Asegurar cumplimiento normativo'
      ],
      flujo: [
        { paso: 1, titulo: 'Accede al panel de auditoría', desc: 'Ve los certificados en revisión del auditor' },
        { paso: 2, titulo: 'Revisa evaluaciones', desc: 'Verifica la calificación asignada por el analista' },
        { paso: 3, titulo: 'Valida datos', desc: 'Confirma que todo cumpla con regulaciones' },
        { paso: 4, titulo: 'Aprueba o rechaza', desc: 'Finaliza el certificado o devuelve para ajustes' },
        { paso: 5, titulo: 'Genera reportes', desc: 'Crea reportes de auditoría y cumplimiento' }
      ],
      requisitos: ['Experiencia en auditoría', 'Conocimiento de normativas', 'Capacidad de supervisión', 'Acceso completo al sistema'],
    },
    'admin-ti': {
      nombre: 'Administrador TI',
      emoji: '',
      color: '#ef4444',
      descripcion: 'Control total del sistema, gestión de usuarios y configuraciones globales.',
      tareas: [
        'Gestionar usuarios del sistema',
        'Asignar y cambiar roles',
        'Configurar parámetros globales',
        'Mantener seguridad del sistema',
        'Generar reportes técnicos'
      ],
      flujo: [
        { paso: 1, titulo: 'Accede a Administración de Usuarios', desc: 'Ve lista de usuarios del sistema' },
        { paso: 2, titulo: 'Crea nuevos usuarios', desc: 'Registra nuevos administradores, analistas o auditores' },
        { paso: 3, titulo: 'Asigna permisos y roles', desc: 'Define qué accesos tendrá cada usuario' },
        { paso: 4, titulo: 'Configura el sistema', desc: 'Ajusta reglas tributarias, parámetros de validación' },
        { paso: 5, titulo: 'Monitorea actividad', desc: 'Revisa auditoría de todas las operaciones' }
      ],
      requisitos: ['Experiencia en administración de sistemas', 'Conocimiento de seguridad', 'Responsabilidad total', 'Acceso root'],
    }
  };

  const rolData = rolesData[rol];

  if (!rolData) {
    return (
      <div style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '60px 24px', textAlign: 'center' }}>
          <h1>Rol no encontrado</h1>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', background: accent, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Volver al inicio
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '60px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <button 
          onClick={() => navigate('/#guia')}
          style={{ background: 'transparent', border: 'none', color: accent, cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Volver a Roles
        </button>

        {/* Hero del Rol */}
        <div style={{ 
          background: dark ? `linear-gradient(135deg, #1a2634 0%, #0f1720 100%)` : `linear-gradient(135deg, ${rolData.color} 0%, ${rolData.color}dd 100%)`,
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '60px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: 48, fontWeight: 'bold' }}>{rolData.nombre}</h1>
          <p style={{ margin: 0, fontSize: 18, opacity: 0.95 }}>{rolData.descripcion}</p>
        </div>

        {/* Contenido en dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }}>
          {/* Tareas */}
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 28, fontWeight: 'bold' }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '999px',
                background: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.10)',
                color: rolData.color,
                border: `2px solid ${rolData.color}`,
                boxShadow: dark ? '0 6px 18px rgba(59,130,246,0.25)' : '0 6px 18px rgba(59,130,246,0.15)'
              }}>Tareas Principales</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rolData.tareas.map((tarea, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: card,
                  borderLeft: `4px solid ${rolData.color}`,
                  borderRadius: '8px',
                  boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20 }}>✓</span>
                    <span style={{ fontSize: 15 }}>{tarea}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 28, fontWeight: 'bold' }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '999px',
                background: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.10)',
                color: rolData.color,
                border: `2px solid ${rolData.color}`,
                boxShadow: dark ? '0 6px 18px rgba(59,130,246,0.25)' : '0 6px 18px rgba(59,130,246,0.15)'
              }}>Requisitos</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rolData.requisitos.map((req, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: card,
                  borderLeft: `4px solid ${rolData.color}`,
                  borderRadius: '8px',
                  boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20 }}>📌</span>
                    <span style={{ fontSize: 15 }}>{req}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flujo de Trabajo */}
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 40, fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: '999px',
              background: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.10)',
              color: rolData.color,
              border: `2px solid ${rolData.color}`,
              boxShadow: dark ? '0 8px 24px rgba(59,130,246,0.25)' : '0 8px 24px rgba(59,130,246,0.15)'
            }}>Flujo de Trabajo</span>
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 24 
          }}>
            {rolData.flujo.map((item, idx) => (
              <div key={idx} style={{
                padding: '24px',
                background: card,
                borderRadius: '12px',
                border: `2px solid ${rolData.color}`,
                position: 'relative',
                textAlign: 'center',
                boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '40px',
                  background: rolData.color,
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {item.paso}
                </div>
                
                <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 16, fontWeight: '700' }}>
                  {item.titulo}
                </h3>
                <p style={{ color: muted, margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          marginTop: 80,
          padding: '40px',
          background: dark ? '#1e3a4c' : '#eff6ff',
          border: `2px solid ${rolData.color}`,
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0, fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            ¿Listo para comenzar?
          </h3>
          <p style={{ color: muted, marginBottom: 24, fontSize: 16 }}>
            Inicia sesión con tus credenciales para acceder a tu área de trabajo como {rolData.nombre}.
          </p>
          <button 
            onClick={() => navigate('/iniciar-sesion')}
            style={{
              padding: '14px 32px',
              background: rolData.color,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 300ms',
              boxShadow: '0 0 0 3px rgba(255,255,255,0.5), 0 12px 28px rgba(0,0,0,0.25)',
              transform: 'translateY(-1px) scale(1.01)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = `0 0 0 4px rgba(255,255,255,0.6), 0 16px 36px rgba(0,0,0,0.3)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.5), 0 12px 28px rgba(0,0,0,0.25)';
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuiaRol;
