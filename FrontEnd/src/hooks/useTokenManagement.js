import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Hook para manejo de tokens con refresh automático
 */
export const useTokenManagement = () => {
  const [tokens, setTokens] = useState({
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
  });
  const [refreshTimeout, setRefreshTimeout] = useState(null);

  /**
   * Guardar tokens y configurar auto-refresh
   */
  const setTokens_ = (access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setTokens({ access, refresh });
    scheduleTokenRefresh();
  };

  /**
   * Refrescar token automáticamente
   */
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return false;

      const response = await axios.post("http://localhost:8000/api/token/refresh/", {
        refresh: refreshToken,
      });

      if (response.data.access && response.data.refresh) {
        setTokens_(response.data.access, response.data.refresh);
        return true;
      }
    } catch (error) {
      console.error("Error refrescando token:", error);
      logout();
      return false;
    }
  };

  /**
   * Programar refresco automático (14 minutos para token de 15)
   */
  const scheduleTokenRefresh = () => {
    if (refreshTimeout) clearTimeout(refreshTimeout);

    const timeout = setTimeout(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000); // 14 minutos

    setRefreshTimeout(timeout);
  };

  /**
   * Logout limpio
   */
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const accessToken = localStorage.getItem("access_token");

      if (refreshToken && accessToken) {
        await axios.post(
          "http://localhost:8000/api/logout/",
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Limpiar tokens locales
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setTokens({ access: null, refresh: null });

      if (refreshTimeout) clearTimeout(refreshTimeout);
    }
  };

  // Cancelar timeout al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [refreshTimeout]);

  return {
    tokens,
    setTokens: setTokens_,
    refreshAccessToken,
    logout,
  };
};

/**
 * Interceptor de axios para token automatizado
 */
export const setupAxiosInterceptors = (refreshFn) => {
  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Si es error 401 y no hemos reinentado
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const success = await refreshFn();
          if (success) {
            // Reintentar request original con nuevo token
            const newToken = localStorage.getItem("access_token");
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (err) {
          console.error("Fallo refresh token:", err);
        }
      }

      return Promise.reject(error);
    }
  );

  // Request interceptor - agregar token a todas las requests
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};
