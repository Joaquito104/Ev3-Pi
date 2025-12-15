// src/App.jsx
import { createContext, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import { useTokenManagement, setupAxiosInterceptors } from "./hooks/useTokenManagement";
import { useNotifications, NotificationContainer } from "./hooks/useNotifications";
import axios from "axios";

export const ThemeContext = createContext();
export const AuthContext = createContext();

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("proyecto-theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("proyecto-theme", theme);
    // Aplicar clase 'dark' al HTML para Tailwind
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenMgmt = useTokenManagement();
  const { notifications, dismissNotification } = useNotifications(true, 10000);

  // Setup de interceptors de axios
  useEffect(() => {
    setupAxiosInterceptors(tokenMgmt.refreshAccessToken);
  }, [tokenMgmt]);

  // AUTOLOGIN con nuevo sistema de tokens
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:8000/api/perfil/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        // Si 401, intentar refresh
        if (res.status === 401) {
          return tokenMgmt.refreshAccessToken().then(() => {
            const newToken = localStorage.getItem("access_token");
            return fetch("http://127.0.0.1:8000/api/perfil/", {
              headers: { Authorization: `Bearer ${newToken}` },
            }).then(r => r.json());
          });
        }
        return Promise.reject();
      })
      .then((perfil) => {
        const userData = {
          id: perfil.id,
          username: perfil.username,
          rol: perfil.rol,
          is_superuser: perfil.is_superuser,
        };
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // LOGIN OFICIAL
  const login = async (username, password) => {
    const resp = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!resp.ok) throw new Error("CREDENCIALES");

    const data = await resp.json();
    tokenMgmt.setTokens(data.access, data.refresh);

    const perfilResp = await fetch("http://127.0.0.1:8000/api/perfil/", {
      headers: { Authorization: `Bearer ${data.access}` },
    });

    const perfil = await perfilResp.json();

    const userData = {
      id: perfil.id,
      username: perfil.username,
      rol: perfil.rol,
      is_superuser: perfil.is_superuser,
    };

    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await tokenMgmt.logout();
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        <BrowserRouter>
          <NotificationContainer 
            notifications={notifications} 
            onDismiss={dismissNotification}
          />
          <Router />
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
