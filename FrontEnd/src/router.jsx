import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CertificatesUpload from "./pages/CertificatesUpload";
import TaxManagement from "./pages/TaxManagement";
import AuditPanel from "./pages/AuditPanel";
import SystemSettings from "./pages/SystemSettings";
import Registros from "./pages/Registros";
import NoAutorizado from "./pages/NoAutorizado";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthContext } from "./App";

const LayoutWrapper = ({ children }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Navbar />
    <div style={{ flex: 1 }}>{children}</div>
    <Footer />
  </div>
);

export default function Router() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/iniciar-sesion" element={<Login />} />

      {/* PÚBLICA */}
      <Route path="/" element={<Home />} />

      {/* PRIVADAS (todas requieren login) */}

      <Route
        path="/registros"
        element={
          <ProtectedRoute roles={["CORREDOR", "ANALISTA", "AUDITOR", "TI"]}>
            <LayoutWrapper>
              <Registros />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/certificates-upload"
        element={
          <ProtectedRoute roles={["CORREDOR", "TI"]}>
            <LayoutWrapper>
              <CertificatesUpload />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tax-management"
        element={
          <ProtectedRoute roles={["ANALISTA", "AUDITOR", "TI"]}>
            <LayoutWrapper>
              <TaxManagement />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit-panel"
        element={
          <ProtectedRoute roles={["AUDITOR", "TI"]}>
            <LayoutWrapper>
              <AuditPanel />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/system-settings"
        element={
          <ProtectedRoute roles={["TI"]}>
            <LayoutWrapper>
              <SystemSettings />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* NO AUTORIZADO */}
      <Route path="/no-autorizado" element={<NoAutorizado />} />
    </Routes>
  );
}
