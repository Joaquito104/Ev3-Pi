import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const Home = () => {
  const [dark, setDark] = useState(() => {
    try {
      return document.documentElement.classList.contains('theme-dark')
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('theme-dark'))
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const bg = dark ? '#0f1720' : '#f8fafc'
  const text = dark ? '#e6eef8' : '#0b1220'
  const card = dark ? '#13202a' : '#ffffff'
  const muted = dark ? '#97a6b2' : '#6b7280'
  const accent = '#3b82f6'

  const features = [
    { icon: '', title: '', desc: '' },
    { icon: '', title: '', desc: '' },
    { icon: '', title: '', desc: '' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, transition: 'background 200ms, color 200ms', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '48px 24px', maxWidth: 1200, margin: '0 auto', width: '100%', fontFamily: 'Inter, Arial, sans-serif' }}>
        {/* Sección de Bienvenida */}
        <section style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: 48, fontWeight: 'bold' }}>Bienvenido a Nuam</h1>
          <p style={{ color: muted, marginTop: 0, marginBottom: 32, fontSize: 18 }}>
            Tu plataforma integral de auditoría, gestión de certificados y control tributario
          </p>
          <Link to="/certificates-upload" style={{ display: 'inline-block', padding: '12px 28px', background: accent, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 16, fontWeight: '600', boxShadow: `0 6px 18px rgba(59, 130, 246, 0.2)`, transition: 'all 200ms' }}>
            Cargar Certificados
          </Link>
        </section>

        {/* Sección de 3 Cajas */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: 32, fontSize: 24 }}>Porque Nuam?</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>   
            <div style={{ background: card, padding: 24, borderRadius: 8, boxShadow: dark ? 'none' : '0 2px 8px rgba(15,23,42,0.06)', textAlign: 'center' }}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Auditoría Eficiente</h3>
              <p style={{ color: muted, margin: 0, fontSize: 14 }}>Monitorea y audita tus certificados y activos digitales con herramientas avanzadas.</p>
            </div>
            <div style={{ background: card, padding: 24, borderRadius: 8, boxShadow: dark ? 'none' : '0 2px 8px rgba(15,23,42,0.06)', textAlign: 'center' }}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Gestión de Certificados</h3>
              <p style={{ color: muted, margin: 0, fontSize: 14 }}>Carga, organiza y administra tus certificados digitales de manera sencilla y segura.</p>
            </div>
            <div style={{ background: card, padding: 24, borderRadius: 8, boxShadow: dark ? 'none' : '0 2px 8px rgba(15,23,42,0.06)', textAlign: 'center' }}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Control Tributario</h3>
              <p style={{ color: muted, margin: 0, fontSize: 14 }}>Mantente al día con tus obligaciones tributarias y genera reportes fiscales automáticamente.</p>
            </div>    
          </div>
        </section>

        {/* Sección Cómo Funciona */}
        <section style={{ background: card, padding: 32, borderRadius: 8, boxShadow: dark ? 'none' : '0 6px 18px rgba(15,23,42,0.06)' }}>
          <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 24 }}>¿Cómo Funciona?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ background: accent, color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: 12 }}>1</div>
              <h3 style={{ margin: '0 0 8px 0' }}>Registra tus datos</h3>
              <p style={{ color: muted, margin: 0, fontSize: 14 }}>Crea tu cuenta y accede a la plataforma con tus credenciales.</p>
            </div>
            <div>
              <div style={{ background: accent, color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: 12 }}>2</div>
              <h3 style={{ margin: '0 0 8px 0' }}>Carga documentos</h3>
              <p style={{ color: muted, margin: 0, fontSize: 14 }}>Sube certificados y activos de forma masiva o individual.</p>
            </div>
            <div>
              <div style={{ background: accent, color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: 12 }}>3</div>
              <h3 style={{ margin: '0 0 8px 0' }}>Monitorea y reporta</h3>
              <p style={{ color: muted, margin: 0, fontSize: 14 }}>Visualiza auditorías, genera reportes y gestiona tributos.</p>
            </div>
          </div>
        </section>

        {/* Sección Comentarios/Retroalimentación */}
        <section style={{ marginTop: 64, marginBottom: 64 }}>
          <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: 32, fontSize: 24 }}>Tu Retroalimentación</h2>
          <div style={{ background: card, padding: 32, borderRadius: 8, boxShadow: dark ? 'none' : '0 2px 8px rgba(15,23,42,0.06)', border: `1px solid ${dark ? '#1f2937' : '#e5e7eb'}` }}>
            <p style={{ color: muted, marginTop: 0, marginBottom: 16, textAlign: 'center' }}>Nos encantaría conocer tu opinión. Comparte tus comentarios y sugerencias para mejorar nuestra plataforma.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <textarea placeholder="Escribe tu comentario aquí..." style={{ padding: 12, borderRadius: 6, border: `1px solid ${dark ? '#374151' : '#d1d5db'}`, background: dark ? '#1f2937' : '#f9fafb', color: text, width: '100%', maxWidth: 500, minHeight: 100, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button style={{ padding: '10px 24px', background: accent, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: '600', fontSize: 14 }} onClick={() => alert('Comentario enviado. ¡Gracias por tu retroalimentación!')}>
                Enviar Comentario
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home