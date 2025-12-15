import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../../App';

export default function Footer() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const dark = theme === 'dark';
  
  const bg = dark ? '#0f1720' : '#f8fafc';
  const text = dark ? '#e6eef8' : '#0b1220';
  const muted = dark ? '#97a6b2' : '#6b7280';
  const accent = dark ? '#0b84ff' : '#3b82f6';
  const accentLight = dark ? '#60a5fa' : '#7c3aed';
  const border = dark ? '#1e3a4c' : '#e5e7eb';
  const cardBg = dark ? '#13202a' : '#ffffff';
  const hoverBg = dark ? '#1a2a38' : '#f0f4f8';
  const buttonBg = dark ? '#1f2937' : '#e5e7eb';
  const buttonHover = dark ? '#2d3748' : '#d1d5db';

  const handleFeedback = () => navigate('/feedback');
  const handleHelp = () => navigate('/ayuda');

  const linkStyle = {
    color: accent,
    textDecoration: 'none',
    transition: 'all 200ms',
    fontWeight: '500'
  };

  return (
    <footer style={{ 
      background: bg, 
      color: muted, 
      borderTop: `1px solid ${border}`, 
      padding: '40px 24px',
      marginTop: 'auto',
      transition: 'all 200ms'
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 40, 
        marginBottom: 40
      }}>
        {/* Información */}
        <div>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontWeight: '700', 
            color: text,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📋 Sobre Nuam
          </h4>
          <p style={{ margin: 0, fontSize: 13, lineHeight: '1.6' }}>
            Nuam © 2025. Plataforma integral de auditoría y gestión tributaria.
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: 13 }}>
            🔒 Licencia: MIT (Open Source)
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, opacity: 0.8 }}>
            Desarrollado para fines educativos y comerciales.
          </p>
        </div>

        {/* Interacción */}
        <div>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontWeight: '700', 
            color: text,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            💬 Tu Voz es Importante
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleFeedback}
              style={{
                padding: '10px 14px',
                background: accent,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = accentLight;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = accent;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              💭 Ayúdanos a Mejorar
            </button>
            <button
              onClick={handleHelp}
              style={{
                padding: '10px 14px',
                background: buttonBg,
                color: text,
                border: `1px solid ${border}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = buttonHover;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = buttonBg;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🆘 Centro de Ayuda
            </button>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontWeight: '700', 
            color: text,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🔗 Enlaces Rápidos
          </h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <Link 
                to="/" 
                style={linkStyle}
                onMouseEnter={(e) => e.target.style.color = accentLight}
                onMouseLeave={(e) => e.target.style.color = accent}
              >
                🏠 Inicio
              </Link>
            </li>
            <li>
              <Link 
                to="/certificates-upload" 
                style={linkStyle}
                onMouseEnter={(e) => e.target.style.color = accentLight}
                onMouseLeave={(e) => e.target.style.color = accent}
              >
                📄 Certificados
              </Link>
            </li>
            <li>
              <Link 
                to="/registros" 
                style={linkStyle}
                onMouseEnter={(e) => e.target.style.color = accentLight}
                onMouseLeave={(e) => e.target.style.color = accent}
              >
                📋 Registros
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Línea divisoria y créditos */}
      <div style={{ 
        borderTop: `1px solid ${border}`, 
        paddingTop: 24, 
        textAlign: 'center', 
        fontSize: 12, 
        color: muted
      }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          ⚖️ Plataforma de Auditoría y Gestión Tributaria
        </p>
        <p style={{ margin: '8px 0 0 0', opacity: 0.6 }}>
          Made with ❤️ for Tax Management Professionals
        </p>
      </div>
    </footer>
  );
}
