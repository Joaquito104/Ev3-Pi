import { useContext } from "react";
import { ThemeContext } from "../../App";

export default function Input({ label, error, ...props }) {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';
  
  const labelColor = dark ? '#e6eef8' : '#0b1220';
  const inputBg = dark ? '#0f1720' : '#ffffff';
  const inputColor = dark ? '#e6eef8' : '#0b1220';
  const inputBorder = dark ? '#1e3a4c' : '#d1d5db';
  const inputBorderFocus = error 
    ? '#ef4444' 
    : dark ? '#0b84ff' : '#007bff';
  const errorColor = dark ? '#fca5a5' : '#dc2626';

  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label style={{ 
          color: labelColor, 
          display: 'block', 
          marginBottom: '6px', 
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {label}
        </label>
      )}
      <input 
        {...props} 
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          borderRadius: "6px",
          border: `1px solid ${error ? '#ef4444' : inputBorder}`,
          background: inputBg,
          color: inputColor,
          fontSize: '14px',
          boxSizing: 'border-box',
          transition: 'all 200ms',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = inputBorderFocus;
          e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : dark ? 'rgba(11,132,255,0.1)' : 'rgba(0,123,255,0.1)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : inputBorder;
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && (
        <p style={{
          color: errorColor,
          fontSize: '12px',
          marginTop: '4px',
          marginBottom: 0
        }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
