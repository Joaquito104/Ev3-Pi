import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Hook para polling de notificaciones
 * Verifica cambios en auditorías y calificaciones cada X segundos
 */
export const useNotifications = (enabled = true, interval = 10000) => {
  const [notifications, setNotifications] = useState([]);
  const [isPolling, setIsPolling] = useState(enabled);

  const checkNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // Verificar auditorías solicitadas recientemente
      const audRes = await axios.get(`${API_BASE_URL}/auditoria/?limit=5`, { headers });
      const auditorias = audRes.data?.results || [];

      // Verificar calificaciones resueltas
      const calRes = await axios.get(`${API_BASE_URL}/reportes/calificaciones/?dias=1`, { headers });
      const calificaciones = calRes.data?.por_estado || {};

      // Generar notificaciones basadas en cambios
      const newNotifications = [];

      // Notificación si hay auditorías pendientes
      if (auditorias.some(a => a.accion === 'AUDIT_REQUESTED')) {
        newNotifications.push({
          id: 'audit-' + Date.now(),
          type: 'audit',
          title: 'Auditoría Solicitada',
          message: `Se han solicitado ${auditorias.filter(a => a.accion === 'AUDIT_REQUESTED').length} auditorías`,
          timestamp: new Date(),
          dismissed: false
        });
      }

      // Notificación si hay calificaciones validadas
      if (calificaciones.VALIDADA && calificaciones.VALIDADA > 0) {
        newNotifications.push({
          id: 'validated-' + Date.now(),
          type: 'success',
          title: 'Calificaciones Validadas',
          message: `${calificaciones.VALIDADA} calificación(es) validada(s) hoy`,
          timestamp: new Date(),
          dismissed: false
        });
      }

      setNotifications((prev) => {
        // Evitar duplicados en los últimos 30 segundos
        const recent = prev.filter(n => Date.now() - n.timestamp < 30000);
        return [...recent, ...newNotifications];
      });
    } catch (err) {
      console.error('Error checking notifications:', err);
    }
  }, []);

  useEffect(() => {
    if (!isPolling) return;

    checkNotifications(); // Verificar inmediatamente
    const timer = setInterval(checkNotifications, interval);

    return () => clearInterval(timer);
  }, [isPolling, interval, checkNotifications]);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    dismissNotification,
    clearAll,
    isPolling,
    setIsPolling
  };
};

/**
 * Componente de Notification Toast
 */
export const NotificationToast = ({ notification, onDismiss }) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  if (!visible) return null;

  const bgColor = {
    audit: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  }[notification.type] || 'bg-gray-500';

  const icon = {
    audit: <img src="/Documentos.webp" alt="Auditoría" style={{width: '24px', height: '24px'}} />,
    success: <img src="/icono correcto.webp" alt="Éxito" style={{width: '24px', height: '24px'}} />,
    error: <img src="/Icono incorrecto.webp" alt="Error" style={{width: '24px', height: '24px'}} />,
    warning: '⚠️'
  }[notification.type] || '🔔';

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-slide-in`}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{notification.title}</p>
        <p className="text-sm opacity-90">{notification.message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          onDismiss?.(notification.id);
        }}
        className="hover:opacity-80 transition-opacity flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Contenedor de Notificaciones
 */
export const NotificationContainer = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-md">
      {notifications.map((notif) => (
        <NotificationToast
          key={notif.id}
          notification={notif}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};
