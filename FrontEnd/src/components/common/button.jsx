import { useContext } from "react";
import { ThemeContext } from "../../App";

export default function Button({ label, onClick, style = {}, variant = 'primary', disabled = false }) {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';

  const variants = {
    primary: {
      light: {
        background: '#007bff',
        color: 'white',
        border: 'none',
        boxShadow: '0 2px 6px rgba(0,123,255,0.2)',
        hover: '#0056b3',
      },
      dark: {
        background: '#0056b3',
        color: '#e6eef8',
        border: '1px solid #0b84ff',
        boxShadow: '0 2px 6px rgba(11, 132, 255, 0.3)',
        hover: '#004085',
      }
    },
    danger: {
      light: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        boxShadow: '0 2px 6px rgba(239,68,68,0.2)',
        hover: '#dc2626',
      },
      dark: {
        background: '#7f1d1d',
        color: '#fecaca',
        border: '1px solid #dc2626',
        boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
        hover: '#991b1b',
      }
    },
    secondary: {
      light: {
        background: '#e5e7eb',
        color: '#111827',
        border: 'none',
        boxShadow: 'none',
        hover: '#d1d5db',
      },
      dark: {
        background: '#1e3a4c',
        color: '#e6eef8',
        border: '1px solid #374151',
        boxShadow: 'none',
        hover: '#2b5a74',
      }
    }
  };

  const currentVariant = variants[variant] || variants.primary;
  const scheme = dark ? currentVariant.dark : currentVariant.light;

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 15px",
        borderRadius: "6px",
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 200ms',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...scheme,
        ...style
      }}
      onMouseEnter={(e) => !disabled && (e.target.style.background = scheme.hover)}
      onMouseLeave={(e) => !disabled && (e.target.style.background = scheme.light ? currentVariant.light.background : currentVariant.dark.background)}
    >
      {label}
    </button>
  );
}
