import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import VerificarEmail from "./pages/VerificarEmail";
import Perfil from "./pages/Perfil";
import Feedback from "./pages/Feedback";
import Ayuda from "./pages/Ayuda";
import GuiaRol from "./pages/GuiaRol";
import NoAutorizado from "./pages/NoAutorizado";

import CertificatesUpload from "./pages/CertificatesUpload";
import TaxManagement from "./pages/TaxManagement";
import AuditPanel from "./pages/AuditPanel";
import AdministracionNuam from "./pages/AdministracionNuam";
import Registros from "./pages/Registros";
import ValidationInbox from "./pages/ValidationInbox";
import AdminGlobal from "./pages/AdminGlobal";

import CorredorDashboard from "./pages/CorredorDashboard";
import DashboardAnalista from "./pages/DashboardAnalista";
import DashboardAuditor from "./pages/DashboardAuditor";
import DashboardAdminTI from "./pages/DashboardAdminTI";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./auth/ProtectedRoute";

import DetalleCalificacion from "./pages/DetalleCalificacion";
import ReportesAuditoria from "./pages/ReportesAuditoria";

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
      {/* ===== PÚBLICAS ===== */}
      <Route path="/" element={<Home />} />
      <Route path="/iniciar-sesion" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/verificar-email" element={<VerificarEmail />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/ayuda" element={<Ayuda />} />
      <Route path="/guia-rol/:rol" element={<GuiaRol />} />

      {/* ===== DASHBOARDS POR ROL ===== */}
      <Route
        path="/dashboard/corredor"
        element={
          <ProtectedRoute roles={["CORREDOR", "TI"]}>
            <LayoutWrapper>
              <CorredorDashboard />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />
           {/* ===== DETALLE DE CALIFICACIÓN ===== */}
       <Route
         path="/certificados/:id"
          element={
          <ProtectedRoute roles={["CORREDOR", "ANALISTA", "AUDITOR", "TI"]}>
            <LayoutWrapper>
             <DetalleCalificacion />
             </LayoutWrapper>
           </ProtectedRoute>
           }
        />

      <Route
        path="/dashboard/analista"
        element={
          <ProtectedRoute roles={["ANALISTA", "TI"]}>
            <LayoutWrapper>
              <DashboardAnalista />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/auditor"
        element={
          <ProtectedRoute roles={["AUDITOR", "TI"]}>
            <LayoutWrapper>
              <DashboardAuditor />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin-ti"
        element={
          <ProtectedRoute roles={["TI"]}>
            <LayoutWrapper>
              <DashboardAdminTI />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ===== FUNCIONALES ===== */}
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
        path="/validacion"
        element={
          <ProtectedRoute roles={["AUDITOR", "TI"]}>
            <LayoutWrapper>
              <ValidationInbox />
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
        path="/perfil"
        element={
          <ProtectedRoute roles={["CORREDOR", "ANALISTA", "AUDITOR", "TI"]}>
            <LayoutWrapper>
              <Perfil />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/feedback"
        element={
          <ProtectedRoute roles={["CORREDOR", "ANALISTA", "AUDITOR", "TI"]}>
            <LayoutWrapper>
              <Feedback />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* ===== ADMIN ===== */}
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

      <Route
        path="/admin-global"
        element={
          <ProtectedRoute roles={["TI"]} requireSuperuser>
            <LayoutWrapper>
              <AdminGlobal />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <ProtectedRoute roles={["AUDITOR", "TI"]}>
            <ReportesAuditoria />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
