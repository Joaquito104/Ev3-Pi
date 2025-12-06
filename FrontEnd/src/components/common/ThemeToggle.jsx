import React, { useContext, useRef, useState, useEffect } from 'react'
import { ThemeContext } from '../../App'

export default function ThemeToggle({ variant = 'floating' }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const dark = theme === 'dark';
  const btnBg = dark ? '#13202a' : '#ffffff';
  const btnBgHover = dark ? '#1e3a4c' : '#f0f0f0';
  const popoverBg = dark ? '#13202a' : '#ffffff';
  const popoverColor = dark ? '#e6eef8' : '#0b1220';
  const btnBorder = dark ? '#1e3a4c' : '#e0e0e0';
  const floating = variant === 'floating';

  return (
    <div
      style={
        floating
          ? { position: 'fixed', top: 12, right: 12, zIndex: 100 }
          : { position: 'relative', zIndex: 1 }
      }
      ref={ref}
    >
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={(e) => e.target.style.background = btnBgHover}
        onMouseLeave={(e) => e.target.style.background = btnBg}
        aria-label="Abrir configuración de tema"
        title="Configuración de tema"
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          border: `1px solid ${btnBorder}`,
          background: btnBg,
          color: popoverColor,
          cursor: 'pointer',
          fontSize: 18,
          boxShadow: '0 4px 10px rgba(2,6,23,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms ease-in-out'
        }}
      >
        ⚙️
      </button>

      {open && (
        <div 
          style={{ 
            position: 'absolute', 
            right: 0, 
            top: floating ? 52 : 'calc(100% + 6px)', 
            background: popoverBg, 
            color: popoverColor, 
            padding: '8px 0', 
            borderRadius: 8, 
            boxShadow: '0 6px 16px rgba(2,6,23,0.15)',
            border: `1px solid ${btnBorder}`,
            zIndex: 101,
            animation: 'slideDown 150ms ease-out',
            minWidth: '140px'
          }}
        >
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          <div style={{ display: 'flex', gap: 0, flexDirection: 'column' }}>
            <button 
              onClick={() => { setTheme('light'); setOpen(false); }}
              style={{ 
                padding: '10px 12px', 
                borderRadius: 0,
                border: 'none', 
                cursor: 'pointer', 
                background: theme === 'light' ? '#007bff' : 'transparent',
                color: theme === 'light' ? '#fff' : popoverColor,
                fontSize: '14px',
                fontWeight: theme === 'light' ? '500' : '400',
                transition: 'all 150ms ease-in-out',
                textAlign: 'left',
                marginBottom: '2px'
              }}
              onMouseEnter={(e) => {
                if (theme !== 'light') {
                  e.target.style.background = dark ? '#1e3a4c' : '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== 'light') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              ☀️ Claro
            </button>
            <button 
              onClick={() => { setTheme('dark'); setOpen(false); }}
              style={{ 
                padding: '10px 12px', 
                borderRadius: 0,
                border: 'none', 
                cursor: 'pointer', 
                background: theme === 'dark' ? '#007bff' : 'transparent',
                color: theme === 'dark' ? '#fff' : popoverColor,
                fontSize: '14px',
                fontWeight: theme === 'dark' ? '500' : '400',
                transition: 'all 150ms ease-in-out',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (theme !== 'dark') {
                  e.target.style.background = dark ? '#1e3a4c' : '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== 'dark') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              🌙 Oscuro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

