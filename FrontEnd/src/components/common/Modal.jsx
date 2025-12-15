import { useContext } from "react";
import { ThemeContext } from "../../App";

export default function Modal({ title, children, onClose }) {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';
  
  const modalBg = dark ? '#13202a' : '#ffffff';
  const modalText = dark ? '#e6eef8' : '#0b1220';
  const modalBorder = dark ? '1px solid #1e3a4c' : 'none';

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: modalBg,
          color: modalText,
          padding: "20px",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "480px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          border: modalBorder,
        }}
      >
        {title && (
          <h2 style={{ marginBottom: "12px", fontWeight: 600, color: modalText }}>{title}</h2>
        )}

        {children}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "12px",
            padding: "8px 14px",
            background: "#ef4444",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
            transition: "all 200ms",
            hover: "0.2"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#dc2626";
            e.target.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#ef4444";
            e.target.style.transform = "scale(1)";
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
