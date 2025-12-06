import React, { useState } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../App';

export default function SystemSettings() {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';
  const bg = dark ? '#0f1720' : '#f8fafc';
  const text = dark ? '#e6eef8' : '#0b1220';
  const card = dark ? '#13202a' : '#ffffff';
  const border = dark ? '#374151' : '#d1d5db';
  const muted = dark ? '#97a6b2' : '#6b7280';

  const [siteName, setSiteName] = useState('EV3-Pi');
  const [maintenance, setMaintenance] = useState(false);

  function handleSave() {
    // placeholder: persist settings via API
    alert('Configuración guardada (simulada)');
  }

  return (
    <div style={{ padding: 24, background: bg, color: text, minHeight: 'calc(100vh - 56px)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <h1 style={{ marginTop: 0 }}>Configuración del sistema</h1>
        <p style={{ color: muted }}>Ajustes generales y de mantenimiento.</p>
      </div>
    </div>
  );
}
