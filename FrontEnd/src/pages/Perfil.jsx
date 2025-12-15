import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [correos, setCorreos] = useState([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    biografia: '',
    telefono: ''
  });
  const [fotoFile, setFotoFile] = useState(null);
  
  const [mfaQR, setMfaQR] = useState(null);
  const [mfaSecret, setMfaSecret] = useState('');
  const [codigoMFA, setCodigoMFA] = useState('');
  
  const [solicitudRol, setSolicitudRol] = useState(null);
  const [rolSolicitado, setRolSolicitado] = useState('');
  const [justificacion, setJustificacion] = useState('');

  const API_URL = 'http://localhost:8000/api';
  const token = localStorage.getItem('ev3pi-token');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const res = await axios.get(`${API_URL}/perfil-completo/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerfil(res.data);
      setFormData({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        biografia: res.data.biografia,
        telefono: res.data.telefono
      });
      setCorreos(res.data.correos_adicionales || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarPerfil = async () => {
    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('biografia', formData.biografia);
      data.append('telefono', formData.telefono);
      if (fotoFile) data.append('foto_perfil', fotoFile);

      await axios.put(`${API_URL}/perfil-completo/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Perfil actualizado');
      setEditando(false);
      cargarPerfil();
    } catch (error) {
      alert('❌ Error al actualizar');
    }
  };

  const agregarCorreo = async () => {
    if (!nuevoCorreo) return;
    try {
      await axios.post(`${API_URL}/correos-adicionales/`, 
        { email: nuevoCorreo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNuevoCorreo('');
      cargarPerfil();
      alert('Correo agregado');
    } catch (error) {
      alert(error.response?.data?.detail || '❌ Error');
    }
  };

  const eliminarCorreo = async (correoId) => {
    if (!confirm('¿Eliminar?')) return;
    try {
      await axios.delete(`${API_URL}/correos-adicionales/`, {
        data: { correo_id: correoId },
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarPerfil();
    } catch (error) {
      alert(error.response?.data?.detail || '❌ Error');
    }
  };

  const generarMFAQR = async () => {
    try {
      const res = await axios.post(`${API_URL}/mfa-config/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMfaQR(res.data.qr_code);
      setMfaSecret(res.data.secret);
    } catch (error) {
      alert(error.response?.data?.detail || '❌ Error');
    }
  };

  const activarMFA = async () => {
    try {
      await axios.put(`${API_URL}/mfa-config/`, 
        { codigo: codigoMFA },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('MFA activado');
      setMfaQR(null);
      setCodigoMFA('');
      cargarPerfil();
    } catch (error) {
      alert(error.response?.data?.detail || '❌ Código inválido');
    }
  };

  const deshabilitarMFA = async () => {
    if (!confirm('¿Deshabilitar MFA?')) return;
    const codigo = prompt('Código de autenticación:');
    if (!codigo) return;
    
    try {
      await axios.delete(`${API_URL}/mfa-config/`, {
        data: { codigo },
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('MFA deshabilitado');
      cargarPerfil();
    } catch (error) {
      alert(error.response?.data?.detail || '❌ Error');
    }
  };

  const cargarSolicitudRol = async () => {
    try {
      const res = await axios.get(`${API_URL}/solicitud-cambio-rol/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitudRol(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const solicitarCambioRol = async () => {
    if (!rolSolicitado || !justificacion || justificacion.length < 50) {
      alert('❌ Completa todos los campos (justificación mínimo 50 caracteres)');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/solicitud-cambio-rol/`, 
        { rol_solicitado: rolSolicitado, justificacion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Solicitud enviada');
      setRolSolicitado('');
      setJustificacion('');
      cargarSolicitudRol();
      cargarPerfil();
    } catch (error) {
      alert(error.response?.data?.detail || '❌ Error');
    }
  };

  useEffect(() => {
    if (activeTab === 'cambio-rol') cargarSolicitudRol();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con foto */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={perfil?.foto_perfil || `https://ui-avatars.com/api/?name=${perfil?.username}&size=128`}
                alt="Perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              {editando && (
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFotoFile(e.target.files[0])}
                  />
                  📷
                </label>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {perfil?.first_name} {perfil?.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">@{perfil?.username}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                {perfil?.rol_display}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {[
                { id: 'info', label: (
                  <span className="inline-flex items-center gap-2">
                    <img src="/ListadoIcono.webp" alt="Info" className="w-5 h-5" />
                    <span>Info</span>
                  </span>
                ) },
                { id: 'correos', label: '📧 Correos' },
                { id: 'mfa', label: 'MFA' },
                { id: 'cambio-rol', label: '🔄 Rol' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* INFO */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                {!editando ? (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{perfil?.email}</p></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{perfil?.telefono || 'No especificado'}</p></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Biografía</label>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{perfil?.biografia || 'Sin biografía'}</p></div>
                    <button onClick={() => setEditando(true)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">✏️ Editar</button>
                  </>
                ) : (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                    <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Biografía</label>
                    <textarea value={formData.biografia} onChange={(e) => setFormData({...formData, biografia: e.target.value})} rows={4} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/></div>
                    <div className="flex gap-2">
                      <button onClick={actualizarPerfil} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">💾 Guardar</button>
                      <button onClick={() => setEditando(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">❌ Cancelar</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CORREOS */}
            {activeTab === 'correos' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Correos adicionales</h3>
                <div className="flex gap-2">
                  <input type="email" value={nuevoCorreo} onChange={(e) => setNuevoCorreo(e.target.value)} placeholder="nuevo@correo.com" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  <button onClick={agregarCorreo} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center gap-2">
                    <img src="/masIcono.webp" alt="Agregar" className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {correos.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-900 dark:text-white">{c.email}</p>
                        <p className="text-sm text-gray-500">{c.verificado ? 'Verificado' : 'Pendiente'} {c.principal && ''}</p>
                      </div>
                      {!c.principal && <button onClick={() => eliminarCorreo(c.id)} className="text-red-500 hover:text-red-700">🗑️</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MFA */}
            {activeTab === 'mfa' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MFA</h3>
                {perfil?.mfa_habilitado ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-800 dark:text-green-200">MFA habilitado</p>
                    <button onClick={deshabilitarMFA} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Deshabilitar</button>
                  </div>
                ) : (
                  <>
                    {!mfaQR ? (
                      <button onClick={generarMFAQR} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Habilitar MFA</button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300">Escanea con tu app</p>
                        <img src={mfaQR} alt="QR" className="mx-auto"/>
                        <code className="block p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">{mfaSecret}</code>
                        <input type="text" value={codigoMFA} onChange={(e) => setCodigoMFA(e.target.value)} maxLength={6} placeholder="Código 6 dígitos" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                        <button onClick={activarMFA} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Verificar</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* CAMBIO ROL */}
            {activeTab === 'cambio-rol' && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2">
                  <img src="/advertenciaIcono.webp" alt="Advertencia" className="w-5 h-5" />
                  <p className="text-yellow-800 dark:text-yellow-200">Solo 1 solicitud de cambio de rol</p>
                </div>
                {solicitudRol?.tiene_solicitud_pendiente ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200">Pendiente</h4>
                    <p className="text-sm">{solicitudRol.solicitud.rol_actual} → {solicitudRol.solicitud.rol_solicitado}</p>
                    <p className="text-sm mt-2"><strong>Estado:</strong> {solicitudRol.solicitud.estado}</p>
                    {solicitudRol.solicitud.comentario_admin && <p className="text-sm mt-2"><strong>Admin:</strong> {solicitudRol.solicitud.comentario_admin}</p>}
                  </div>
                ) : !solicitudRol?.puede_solicitar ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"><p className="text-red-800 dark:text-red-200">❌ Ya utilizaste tu solicitud</p></div>
                ) : (
                  <div className="space-y-4">
                    <select value={rolSolicitado} onChange={(e) => setRolSolicitado(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Selecciona...</option>
                      <option value="CORREDOR">Corredor</option>
                      <option value="ANALISTA">Analista</option>
                      <option value="AUDITOR">Auditor</option>
                      <option value="TI">TI</option>
                    </select>
                    <textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} rows={5} placeholder="Justificación (mínimo 50 caracteres)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    <p className="text-sm text-gray-500">{justificacion.length}/50</p>
                    <button onClick={solicitarCambioRol} disabled={!rolSolicitado || justificacion.length < 50} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">📤 Enviar</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
