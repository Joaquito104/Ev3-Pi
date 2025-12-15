import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('verificando'); // verificando | exito | error
  const [mensaje, setMensaje] = useState('');

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setEstado('error');
      setMensaje('Token no proporcionado');
      return;
    }

    const verificar = async (token) => {
      try {
        const res = await axios.post(`${API_URL}/verificar-email/`, { token });
        setEstado('exito');
        setMensaje(res.data.detail);
        setTimeout(() => navigate('/iniciar-sesion'), 3000);
      } catch (err) {
        setEstado('error');
        setMensaje(err.response?.data?.detail || 'Error al verificar');
      }
    };

    verificar(token);
  }, [searchParams, navigate]);

  const verificarEmail = async (token) => {
    try {
      const res = await axios.post(`${API_URL}/verificar-email/`, { token });
      setEstado('exito');
      setMensaje(res.data.detail);
      setTimeout(() => navigate('/iniciar-sesion'), 3000);
    } catch (err) {
      setEstado('error');
      setMensaje(err.response?.data?.detail || 'Error al verificar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        {estado === 'verificando' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verificando email...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Por favor espera</p>
          </>
        )}

        {estado === 'exito' && (
          <>
            <div className="mb-4">
              <img src="/icono correcto.webp" alt="Éxito" style={{width: '80px', height: '80px', margin: '0 auto'}} />
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              ¡Email Verificado!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{mensaje}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Redirigiendo a login...</p>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="mb-4">
              <img src="/Icono incorrecto.webp" alt="Error" style={{width: '80px', height: '80px', margin: '0 auto'}} />
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Error de Verificación
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{mensaje}</p>
            <a
              href="/registro"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Volver al Registro
            </a>
          </>
        )}
      </div>
    </div>
  );
}
