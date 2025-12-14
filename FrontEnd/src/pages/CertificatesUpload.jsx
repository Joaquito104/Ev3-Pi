import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../App";
import CertificateDragDrop from "../components/CertificateDragDrop";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function CertificatesUpload() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [modo, setModo] = useState("dragdrop"); // dragdrop | manual
  const [formData, setFormData] = useState({
    registro_id: "",
    rut: "",
    tipo_certificado: "AFP",
    periodo: "",
    monto: "",
    detalles: {
      institucion: "",
      observaciones: ""
    }
  });
  const [archivoPdf, setArchivoPdf] = useState(null);
  const [archivoCsv, setArchivoCsv] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("detalles.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        detalles: {
          ...formData.detalles,
          [field]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Modo manual - crear certificado con datos
      let documentos = [];
      if (archivoPdf) {
        const fd = new FormData();
        fd.append("archivo", archivoPdf);
        fd.append("registro_id", formData.registro_id);
        fd.append("tipo", "CERTIFICADO");

        const docRes = await axios.post(`${API_BASE_URL}/certificados-upload/`, fd, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
        documentos.push(docRes.data.id);
      }

      const payload = {
        ...formData,
        monto: parseFloat(formData.monto) || 0,
        documentos,
      };

      await axios.post(
        `${API_BASE_URL}/calificaciones-corredor/`,
        payload,
        { headers }
      );

      setMessage({ type: "success", text: "✅ Certificado creado como BORRADOR" });
      setFormData({
        registro_id: "",
        rut: "",
        tipo_certificado: "AFP",
        periodo: "",
        monto: "",
        detalles: {
          institucion: "",
          observaciones: ""
        }
      });
      setArchivoPdf(null);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error al crear certificado:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "❌ Error al crear el certificado"
      });
    } finally {
      setUploading(false);
    }
  };

  const validarRUT = (rut) => {
    // Validación básica de formato RUT chileno (XX.XXX.XXX-X)
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    return rutRegex.test(rut);
  };

  const formatearRUT = (valor) => {
    // Remover puntos y guiones
    let rut = valor.replace(/\./g, "").replace(/-/g, "");
    
    // Separar dígito verificador
    if (rut.length > 1) {
      const cuerpo = rut.slice(0, -1);
      const dv = rut.slice(-1);
      
      // Formatear cuerpo con puntos
      let cuerpoFormateado = "";
      for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
        if (j > 0 && j % 3 === 0) cuerpoFormateado = "." + cuerpoFormateado;
        cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
      }
      
      return `${cuerpoFormateado}-${dv}`;
    }
    return rut;
  };

  const handleRUTChange = (e) => {
    const rutFormateado = formatearRUT(e.target.value);
    setFormData({ ...formData, rut: rutFormateado });
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📝 Crear Nuevo Certificado</h1>

        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { key: "dragdrop", label: "📂 Arrastra & Suelta" },
            { key: "manual", label: "✏️ Ingreso Manual" },
          ].map((op) => (
            <button
              key={op.key}
              type="button"
              onClick={() => setModo(op.key)}
              className={`px-4 py-2 rounded border transition ${
                modo === op.key
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        <div className={`p-6 rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          {modo === "dragdrop" ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Subida rápida de Certificados</h2>
              <CertificateDragDrop onUploadComplete={() => {
                setTimeout(() => navigate("/dashboard"), 2000);
              }} />
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Registro */}
            <div>
              <label
                htmlFor="registro_id"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                ID Registro base (PostgreSQL) *
              </label>
              <input
                type="number"
                id="registro_id"
                name="registro_id"
                value={formData.registro_id}
                onChange={handleInputChange}
                placeholder="Ej: 12"
                required
                className={`w-full p-3 border rounded ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

              {modo === "manual" && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="archivoPdf"
                      className={`block text-sm font-medium mb-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Certificado PDF {modo === "pdf" ? "(obligatorio)" : "(opcional)"}
                    </label>
                    <input
                      type="file"
                      id="archivoPdf"
                      accept="application/pdf"
                      required={modo === "pdf"}
                      onChange={(e) => setArchivoPdf(e.target.files?.[0] || null)}
                      className={`w-full p-2 border rounded ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              )}

            {(modo === "csv" || modo === "excel") && (
              <div>
                <label
                  htmlFor="archivoCsv"
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Archivo {modo === "excel" ? "Excel (.xlsx/.xls)" : "CSV"} (registros masivos)
                </label>
                <input
                  type="file"
                  id="archivoCsv"
                  accept={modo === "excel" ? ".xlsx,.xls" : ".csv"}
                  onChange={(e) => setArchivoCsv(e.target.files?.[0] || null)}
                  className={`w-full p-2 border rounded ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                />
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Columnas requeridas: registro_id, rut, tipo_certificado, periodo, monto
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="rut"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                RUT del Titular *
              </label>
              <input
                type="text"
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleRUTChange}
                placeholder="12.345.678-9"
                required
                className={`w-full p-3 border rounded ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
              {formData.rut && !validarRUT(formData.rut) && (
                <p className="text-red-500 text-sm mt-1">Formato RUT inválido</p>
              )}
            </div>

            {/* Tipo de Certificado */}
            <div>
              <label
                htmlFor="tipo_certificado"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tipo de Certificado *
              </label>
              <select
                id="tipo_certificado"
                name="tipo_certificado"
                value={formData.tipo_certificado}
                onChange={handleInputChange}
                required
                className={`w-full p-3 border rounded ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="AFP">AFP (Administradora de Fondos de Pensiones)</option>
                <option value="APV">APV (Ahorro Previsional Voluntario)</option>
                <option value="ISAPRE">ISAPRE</option>
                <option value="FONASA">FONASA</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            {/* Período */}
            <div>
              <label
                htmlFor="periodo"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Período (YYYY-MM) *
              </label>
              <input
                type="month"
                id="periodo"
                name="periodo"
                value={formData.periodo}
                onChange={handleInputChange}
                required
                className={`w-full p-3 border rounded ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            {/* Monto */}
            <div>
              <label
                htmlFor="monto"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Monto (CLP) *
              </label>
              <input
                type="number"
                id="monto"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1"
                required
                className={`w-full p-3 border rounded ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            {/* Detalles - Institución */}
            <div>
              <label
                htmlFor="detalles.institucion"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Institución
              </label>
              <input
                type="text"
                id="detalles.institucion"
                name="detalles.institucion"
                value={formData.detalles.institucion}
                onChange={handleInputChange}
                placeholder="Ej: Habitat, Cuprum, Provida..."
                className={`w-full p-3 border rounded ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            {/* Observaciones */}
            <div>
              <label
                htmlFor="detalles.observaciones"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Observaciones
              </label>
              <textarea
                id="detalles.observaciones"
                name="detalles.observaciones"
                value={formData.detalles.observaciones}
                onChange={handleInputChange}
                rows="4"
                placeholder="Información adicional sobre el certificado..."
                className={`w-full p-3 border rounded ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded border ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : "bg-red-100 text-red-800 border-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading || (modo === "manual" && !validarRUT(formData.rut)) || (modo === "csv" && !archivoCsv)}
                className={`flex-1 py-3 rounded font-semibold transition ${
                  uploading || (modo === "manual" && !validarRUT(formData.rut)) || (modo === "csv" && !archivoCsv)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {uploading ? "Procesando..." : modo === "csv" ? "📤 Subir CSV" : "📤 Crear Certificado"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/corredor-dashboard")}
                className={`px-6 py-3 rounded font-semibold transition ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancelar
              </button>
            </div>
            </form>

            {/* Información */}
            <div className={`mt-6 p-4 rounded border ${
              theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-200"
            }`}>
              <h3 className="font-semibold mb-2">ℹ️ Información:</h3>
              <ul className={`list-disc list-inside text-sm space-y-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                <li>El certificado se creará en estado BORRADOR</li>
                <li>Los campos marcados con * son obligatorios</li>
                <li>El RUT debe tener formato chileno válido: XX.XXX.XXX-X</li>
                <li>El período debe ser del formato YYYY-MM (ej: 2024-01)</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
