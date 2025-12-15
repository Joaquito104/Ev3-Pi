import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { ThemeContext } from '../App'

const Home = () => {
  const { theme } = useContext(ThemeContext)
  const dark = theme === 'dark'

  const bg = dark ? '#0f1720' : '#f8fafc'
  const text = dark ? '#e6eef8' : '#0b1220'
  const card = dark ? '#13202a' : '#ffffff'
  const muted = dark ? '#97a6b2' : '#6b7280'
  const accent = '#3b82f6'

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, transition: 'background 200ms, color 200ms', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ 
        background: dark 
          ? 'linear-gradient(135deg, #0f1720 0%, #1a2634 50%, #0f1720 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
        padding: '100px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elementos decorativos */}
        <div style={{ 
          position: 'absolute', 
          top: '-50%', 
          right: '-10%', 
          width: '500px', 
          height: '500px', 
          background: dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '-50%', 
          left: '-10%', 
          width: '500px', 
          height: '500px', 
          background: dark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 20px', 
            background: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.25)', 
            borderRadius: '30px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '600',
            color: dark ? '#93c5fd' : '#ffffff',
            border: `1px solid ${dark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`
          }}>
            Plataforma de Auditoría y Gestión Tributaria
          </div>
          
          <h1 style={{ 
            margin: '0 0 24px 0', 
            fontSize: '64px', 
            fontWeight: '900',
            lineHeight: 1.1,
            color: dark ? '#ffffff' : '#ffffff',
            textShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            Bienvenido a <span style={{
              color: dark ? '#ffffff' : '#ffffff',
              fontWeight: 900
            }}>Nuam</span>
          </h1>
          
          <p style={{ 
            color: dark ? '#cbd5e1' : '#f3f4f6', 
            margin: '0 0 40px 0', 
            fontSize: '22px',
            lineHeight: 1.6,
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontWeight: '400'
          }}>
            La solución integral para gestión de certificados digitales, control tributario y auditoría automatizada
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/iniciar-sesion" 
              style={{ 
                display: 'inline-block', 
                padding: '16px 40px', 
                background: '#ffffff',
                color: dark ? '#0f1720' : '#667eea',
                borderRadius: '12px', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '700', 
                boxShadow: '0 0 0 3px rgba(255,255,255,0.6), 0 12px 36px rgba(0,0,0,0.35)',
                transition: 'all 300ms',
                border: 'none',
                transform: 'translateY(-1px) scale(1.01)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.7), 0 18px 48px rgba(0,0,0,0.45)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.6), 0 12px 36px rgba(0,0,0,0.35)';
              }}
            >
              Comenzar Ahora
            </Link>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ 
                display: 'inline-block', 
                padding: '16px 40px', 
                background: 'transparent',
                color: '#ffffff',
                borderRadius: '12px', 
                textDecoration: 'none', 
                fontSize: '18px', 
                fontWeight: '700', 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 300ms',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Conocer Más
            </a>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '32px', 
            marginTop: '60px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>99.9%</div>
              <div style={{ fontSize: '14px', color: dark ? '#cbd5e1' : '#f3f4f6' }}>Disponibilidad</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>24/7</div>
              <div style={{ fontSize: '14px', color: dark ? '#cbd5e1' : '#f3f4f6' }}>Soporte</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>100%</div>
              <div style={{ fontSize: '14px', color: dark ? '#cbd5e1' : '#f3f4f6' }}>Seguro</div>
            </div>
          </div>
        </div>
      </section>
      
      <main style={{ flex: 1, padding: '80px 24px', maxWidth: 1200, margin: '0 auto', width: '100%', fontFamily: 'Inter, Arial, sans-serif' }}>
        {/* Sección de Features */}
        <section id="features" style={{ marginBottom: 80 }}>
          <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: 16, fontSize: 36, fontWeight: 'bold' }}>¿Por qué Nuam?</h2>
          <p style={{ textAlign: 'center', color: muted, marginTop: 0, marginBottom: 48, fontSize: 18, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Potencia tu gestión tributaria con tecnología de vanguardia
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>   
            <div 
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ 
                background: card, 
                padding: 32, 
                borderRadius: 16, 
                boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(15,23,42,0.08)', 
                textAlign: 'center',
                border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`,
                transition: 'all 300ms',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = dark ? '0 16px 32px rgba(59, 130, 246, 0.3)' : '0 16px 32px rgba(59, 130, 246, 0.2)';
                e.currentTarget.querySelector('.emoji').style.transform = 'scale(1.2) rotate(5deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = dark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(15,23,42,0.08)';
                e.currentTarget.querySelector('.emoji').style.transform = 'scale(1) rotate(0deg)';
              }}
              >
                <div className="emoji" style={{ marginBottom: '16px', transition: 'all 300ms' }}>
                  <img src="/lupa.webp" alt="Auditoría" style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto' }} />
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: '700' }}>Auditoría Eficiente</h3>
                <p style={{ color: muted, margin: 0, fontSize: 15, lineHeight: 1.6 }}>Monitorea y audita tus certificados y activos digitales con herramientas avanzadas de análisis en tiempo real.</p>
              </div>
            </div>
            
            <div 
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ 
                background: card, 
                padding: 32, 
                borderRadius: 16, 
                boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(15,23,42,0.08)', 
                textAlign: 'center',
                border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`,
                transition: 'all 300ms',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = dark ? '0 16px 32px rgba(16, 185, 129, 0.3)' : '0 16px 32px rgba(16, 185, 129, 0.2)';
                e.currentTarget.querySelector('.emoji').style.transform = 'scale(1.2) rotate(-5deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = dark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(15,23,42,0.08)';
                e.currentTarget.querySelector('.emoji').style.transform = 'scale(1) rotate(0deg)';
              }}
              >
                <div className="emoji" style={{ marginBottom: '16px', transition: 'all 300ms' }}>
                  <img src="/Carpeta.webp" alt="Carpeta" style={{ width: '48px', height: '48px', display: 'block' }} />
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: '700' }}>Gestión de Certificados</h3>
                <p style={{ color: muted, margin: 0, fontSize: 15, lineHeight: 1.6 }}>Carga, organiza y administra tus certificados digitales de manera sencilla, segura y eficiente.</p>
              </div>
            </div>
            
            <div 
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ 
                background: card, 
                padding: 32, 
                borderRadius: 16, 
                boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(15,23,42,0.08)', 
                textAlign: 'center',
                border: `1px solid ${dark ? '#1e3a4c' : '#e5e7eb'}`,
                transition: 'all 300ms',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = dark ? '0 16px 32px rgba(245, 158, 11, 0.3)' : '0 16px 32px rgba(245, 158, 11, 0.2)';
                e.currentTarget.querySelector('.emoji').style.transform = 'scale(1.2) rotate(5deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = dark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(15,23,42,0.08)';
                e.currentTarget.querySelector('.emoji').style.transform = 'scale(1) rotate(0deg)';
              }}
              >
                <div className="emoji" style={{ marginBottom: '16px', transition: 'all 300ms' }}>
                  <img src="/dashboard.webp" alt="Control" style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto' }} />
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: '700' }}>Control Tributario</h3>
                <p style={{ color: muted, margin: 0, fontSize: 15, lineHeight: 1.6 }}>Mantente al día con tus obligaciones tributarias y genera reportes fiscales automáticamente.</p>
              </div>
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

        {/* Sección Guía de Usuario */}
        <section id="guia" style={{ marginTop: 64, marginBottom: 64 }}>
          <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: 32, fontSize: 28, fontWeight: 'bold' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: '999px',
              background: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.10)',
              color: accent,
              border: `2px solid ${accent}`,
              boxShadow: dark ? '0 8px 24px rgba(59,130,246,0.25)' : '0 8px 24px rgba(59,130,246,0.15)'
            }}>Guía de Usuario</span>
          </h2>
          
          {/* ¿Qué es Nuam? */}
          <div style={{ background: card, padding: 32, borderRadius: 8, boxShadow: dark ? 'none' : '0 2px 8px rgba(15,23,42,0.06)', border: `1px solid ${dark ? '#1f2937' : '#e5e7eb'}`, marginBottom: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}></span> ¿Qué es Nuam?
            </h3>
            <p style={{ color: muted, margin: 0, lineHeight: 1.6, fontSize: 15 }}>
              Nuam es una <strong>plataforma integral de auditoría y gestión tributaria</strong> diseñada para facilitar el control, 
              validación y seguimiento de certificados digitales. Permite gestionar de manera eficiente los documentos tributarios, 
              realizar auditorías automáticas y mantener un registro completo de todas las operaciones.
            </p>
          </div>

          {/* Roles y Funcionalidades */}
          <div style={{ background: card, padding: 32, borderRadius: 8, boxShadow: dark ? 'none' : '0 2px 8px rgba(15,23,42,0.06)', border: `1px solid ${dark ? '#1f2937' : '#e5e7eb'}`, marginBottom: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', gap: 8 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 'bold' }}>¿No sabes qué hacer?</div>
                <div style={{ fontSize: 16, color: muted, marginTop: 8 }}>A continuación cliquee su rol correspondiente</div>
              </div>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginTop: 20, maxWidth: 600, margin: '20px auto 0 auto' }}>
              <Link 
                to="/guia-rol/corredor"
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ 
                  padding: 32, 
                  background: card, 
                  borderRadius: 12, 
                  border: `2px solid ${accent}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 300ms',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 150
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                  e.currentTarget.style.boxShadow = dark ? '0 16px 32px rgba(59, 130, 246, 0.3)' : '0 16px 32px rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)';
                }}
                >
                  <div style={{ marginBottom: 12 }}></div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: '700', color: text }}>Corredor</h3>
                </div>
              </Link>

              <Link 
                to="/guia-rol/analista"
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ 
                  padding: 32, 
                  background: card, 
                  borderRadius: 12, 
                  border: `2px solid #10b981`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 300ms',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 150
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                  e.currentTarget.style.boxShadow = dark ? '0 16px 32px rgba(16, 185, 129, 0.3)' : '0 16px 32px rgba(16, 185, 129, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)';
                }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <img src="/dashboard.webp" alt="Analista" style={{ width: 40, height: 40, display: 'block', margin: '0 auto' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: '700', color: text }}>Analista</h3>
                </div>
              </Link>

              <Link 
                to="/guia-rol/auditor"
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ 
                  padding: 32, 
                  background: card, 
                  borderRadius: 12, 
                  border: `2px solid #f59e0b`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 300ms',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 150
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                  e.currentTarget.style.boxShadow = dark ? '0 16px 32px rgba(245, 158, 11, 0.3)' : '0 16px 32px rgba(245, 158, 11, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)';
                }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <img src="/lupa.webp" alt="Auditor" style={{ width: 40, height: 40, display: 'block', margin: '0 auto' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: '700', color: text }}>Auditor</h3>
                </div>
              </Link>

              <Link 
                to="/guia-rol/admin-ti"
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ 
                  padding: 32, 
                  background: card, 
                  borderRadius: 12, 
                  border: `2px solid #ef4444`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 300ms',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 150
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                  e.currentTarget.style.boxShadow = dark ? '0 16px 32px rgba(239, 68, 68, 0.3)' : '0 16px 32px rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)';
                }}
                >
                  <div style={{ marginBottom: 12 }}></div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: '700', color: text }}>Administrador TI</h3>
                </div>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 32, padding: 20, background: dark ? '#1e3a4c' : '#eff6ff', borderRadius: 8, border: `1px solid ${dark ? '#2563eb' : '#bfdbfe'}`, textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px 0', color: dark ? '#93c5fd' : '#1e40af', fontSize: 15 }}>
              ¿Necesitas ayuda o tienes alguna pregunta?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/feedback" style={{ padding: '10px 20px', background: accent, color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: '600' }}>
                Enviar Feedback
              </Link>
              <Link to="/ayuda" style={{ padding: '10px 20px', background: dark ? '#374151' : '#e5e7eb', color: text, borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: '600' }}>
                Crear Caso de Soporte
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home