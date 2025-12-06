import React, { useState } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../App';

export default function TaxManagement() {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';
  const bg = dark ? '#0f1720' : '#f8fafc';
  const text = dark ? '#e6eef8' : '#0b1220';
  const card = dark ? '#13202a' : '#ffffff';
  const border = dark ? '#374151' : '#d1d5db';
  const muted = dark ? '#97a6b2' : '#6b7280';

  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({ assets: 0, taxes: 0 });

  function computeSummary() {
    // placeholder: in a real app se consultaría una API
    const assets = Math.round(Math.random() * 100000) / 100;
    const taxes = Math.round(assets * 0.15 * 100) / 100;
    setSummary({ assets, taxes });
  }

  return (
    <div style={{ padding: 24, background: bg, color: text, minHeight: 'calc(100vh - 56px)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 600, textAlign: 'center' }}>
        <h1 style={{ marginTop: 0 }}>Panel de gestión tributaria</h1>
        <p style={{ color: muted }}>Consulta y gestiona obligaciones fiscales por año.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, background: card, padding: 16, borderRadius: 6, border: `1px solid ${border}`, justifyContent: 'center', margin: '12px auto 0' }}>
        <label style={{ color: text }}>Año:</label>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ Swidth: 120, padding: 8, borderRadius: 4, border: `1px solid ${border}`, background: dark ? '#1f2937' : '#fff', color: text }} />
        <button onClick={computeSummary} style={{ padding: '8px 16px', borderRadius: 4, border: `1px solid ${border}`, background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Calcular resumen</button>
      </div>

      <div style={{ marginTop: 16, background: card, padding: 16, borderRadius: 6, border: `1px solid ${border}`, textAlign: 'center' }}>
        <h3 style={{ marginTop: 0 }}>Resumen {year}</h3>
        <p style={{ color: muted }}>Activos reportados: <strong style={{ color: text }}>$\{summary.assets}</strong></p>
        <p style={{ color: muted }}>Impuesto estimado: <strong style={{ color: text }}>$\{summary.taxes}</strong></p>
      </div>
      </div>
    </div>
  );
}
