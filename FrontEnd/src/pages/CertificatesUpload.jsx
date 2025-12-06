import React, { useState } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../App';

export default function CertificatesUpload() {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';
  const bg = dark ? '#0f1720' : '#f8fafc';
  const text = dark ? '#e6eef8' : '#0b1220';
  const card = dark ? '#13202a' : '#ffffff';
  const border = dark ? '#374151' : '#e5e7eb';
  const muted = dark ? '#97a6b2' : '#6b7280';

  const [files, setFiles] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);

  function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  }

  async function handleParseFirstFile() {
    if (!files[0]) return;
    const text = await files[0].text();
    const rows = text
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(0, 10)
      .map((r) => r.split(','));
    setPreviewRows(rows);
  }

  return (
    <div style={{ padding: 24, background: bg, color: text, minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginTop: 0 }}>Carga masiva de certificados</h1>
        <p style={{ color: muted }}>Sube archivos CSV o ZIP con certificados.</p>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <input type="file" multiple onChange={handleFiles} accept=".csv,.zip" style={{ color: text }} />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 16, background: card, padding: 12, borderRadius: 6, border: `1px solid ${border}` }}>
          <strong>Archivos seleccionados:</strong>
          <ul style={{ color: text }}>
            {files.map((f, i) => (
              <li key={i}>{f.name} — {Math.round(f.size/1024)} KB</li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
}
