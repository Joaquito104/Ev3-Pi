// src/App.jsx
import { createContext, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";

export const ThemeContext = createContext();
export const AuthContext = createContext();

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("ev3pi-theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("ev3pi-theme", theme);
    // Aplicar clase 'dark' al HTML para Tailwind
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // AUTOLOGIN
  useEffect(() => {
    const token = localStorage.getItem("ev3pi-token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:8000/api/perfil/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
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
        localStorage.removeItem("ev3pi-token");
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
    localStorage.setItem("ev3pi-token", data.access);

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

  const logout = () => {
    localStorage.removeItem("ev3pi-token");
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
