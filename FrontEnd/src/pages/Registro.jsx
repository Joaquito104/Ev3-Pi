import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Registro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Datos | 2: Verificación
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    pais: 'CHILE',
    telefono: '',
    rol: 'CORREDOR'
  });

  const [verificacion, setVerificacion] = useState({
    token: '',
    email: ''
  });

  const API_URL = 'http://localhost:8000/api';

  const PAISES = [
    { code: 'CHILE', name: 'Chile', prefijo: '+56' },
    { code: 'COLOMBIA', name: 'Colombia', prefijo: '+57' },
    { code: 'PERU', name: 'Perú', prefijo: '+51' }
  ];

  const ROLES = [
    { code: 'CORREDOR', name: 'Corredor de inversión' },
    { code: 'ANALISTA', name: 'Analista tributario' },
    { code: 'AUDITOR', name: 'Auditor interno' },
    { code: 'TI', name: 'Administrador TI' }
  ];

  const paisSeleccionado = PAISES.find(p => p.code === formData.pais);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validarFormulario = () => {
    if (!formData.username || formData.username.length < 4) {
      setError('Usuario debe tener al menos 4 caracteres');
      return false;
    }
    if (!formData.first_name.trim()) {
      setError('Nombre es obligatorio');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Apellido es obligatorio');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Email inválido');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (!formData.telefono.trim()) {
      setError('Teléfono es obligatorio');
      return false;
    }
    return true;
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/registro-completo/`, formData);
      setMensaje('¡Registro exitoso! Revisa tu email para verificar tu cuenta.');
      setVerificacion({ email: formData.email });
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al registrar';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    
    if (!verificacion.token.trim()) {
      setError('Token es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/verificar-email/`, {
        token: verificacion.token
      });
      setMensaje('¡Email verificado! Redirigiendo al login...');
      setTimeout(() => navigate('/iniciar-sesion'), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al verificar';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/reenviar-verificacion/`, {
        email: verificacion.email
      });
      setMensaje('Email de verificación reenviado');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al reenviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          📝 Registro
        </h1>

        {/* STEP 1: Datos */}
        {step === 1 && (
          <form onSubmit={handleRegistro} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="usuario123"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Pérez"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Teléfono con selector de país */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <div className="flex gap-2">
                <select
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium min-w-max"
                >
                  {PAISES.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.prefijo} {p.name.substring(0, 3)}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="912345678"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ingresa sin prefijo</p>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rol Solicitado
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map(r => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mensajes */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}
            {mensaje && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                ✅ {mensaje}
              </div>
            )}

            {/* Botón Registrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              {loading ? '⏳ Registrando...' : '✅ Registrarse'}
            </button>

            {/* Link Login */}
            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">¿Ya tienes cuenta? </span>
              <a href="/iniciar-sesion" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Inicia sesión
              </a>
            </div>
          </form>
        )}

        {/* STEP 2: Verificación */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-900 dark:text-blue-200 text-sm">
                📧 Hemos enviado un email de verificación a <strong>{verificacion.email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerificar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token de Verificación
                </label>
                <input
                  type="text"
                  value={verificacion.token}
                  onChange={(e) => setVerificacion({ ...verificacion, token: e.target.value })}
                  placeholder="Pega el token del email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  ❌ {error}
                </div>
              )}
              {mensaje && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                  ✅ {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
              >
                {loading ? '⏳ Verificando...' : '✅ Verificar Email'}
              </button>
            </form>

            <button
              onClick={handleReenviar}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              📧 Reenviar Email
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              ← Volver a Registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
