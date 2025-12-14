import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CertificatesUpload from "./pages/CertificatesUpload";
import TaxManagement from "./pages/TaxManagement";
import AuditPanel from "./pages/AuditPanel";
import AdministracionNuam from "./pages/AdministracionNuam";
import Registros from "./pages/Registros";
import ValidationInbox from "./pages/ValidationInbox";
import CorredorDashboard from "./pages/CorredorDashboard";
import AdminGlobal from "./pages/AdminGlobal";
import NoAutorizado from "./pages/NoAutorizado";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./auth/ProtectedRoute";

const LayoutWrapper = ({ children }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Navbar />
    <div style={{ flex: 1 }}>{children}</div>
    <Footer />
  </div>
);

export default function Router() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/iniciar-sesion" element={<Login />} />

      {/* PÚBLICA */}
      <Route path="/" element={<Home />} />

      {/* REGISTROS */}
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

      {/* CERTIFICADOS */}
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

      {/* CORREDOR DASHBOARD */}
      <Route
        path="/corredor-dashboard"
        element={
          <ProtectedRoute roles={["CORREDOR", "TI"]}>
            <LayoutWrapper>
              <CorredorDashboard />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* GESTIÓN TRIBUTARIA */}
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

      {/* VALIDACIÓN — SOLO AUDITOR / TI */}
      <Route
        path="/validacion"
        element={
          <ProtectedRoute roles={["AUDITOR", "TI"]}>
            <LayoutWrapper>
              <ValidationInbox />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* AUDITORÍA */}
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

      {/* ADMIN TI */}
      <Route
        path="/system-settings"
        element={
          <ProtectedRoute roles={["TI"]}>
            <LayoutWrapper>
              <AdministracionNuam />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ADMIN GLOBAL — SOLO SUPERUSUARIOS */}
      <Route
        path="/admin-global"
        element={
          <ProtectedRoute roles={["TI"]} requireSuperuser={true}>
            <LayoutWrapper>
              <AdminGlobal />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* NO AUTORIZADO */}
      <Route path="/no-autorizado" element={<NoAutorizado />} />
    </Routes>
  );
}
