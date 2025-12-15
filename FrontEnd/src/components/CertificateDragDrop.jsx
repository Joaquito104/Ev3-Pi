import { useState, useContext, useRef } from "react";
import { ThemeContext } from "../App";
import axios from "axios";

/**
 * Componente de Drag & Drop para certificados
 * Soporta PDF, Excel, CSV
 */
export default function CertificateDragDrop({ onUploadComplete }) {
  const { theme } = useContext(ThemeContext);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const fileInputRef = useRef(null);

  const dark = theme === "dark";
  const borderColor = dark ? "border-gray-600" : "border-gray-300";
  const bgHover = dark ? "bg-gray-700" : "bg-blue-50";
  const textColor = dark ? "text-gray-300" : "text-gray-600";

  const ALLOWED_TYPES = {
    "application/pdf": { label: "PDF", icon: <img src="/Documentos.webp" alt="PDF" style={{width: '24px', height: '24px', display: 'inline-block'}} /> },
    "application/vnd.ms-excel": { label: "Excel", icon: "" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      label: "Excel",
      icon: "",
    },
    "text/csv": { label: "CSV", icon: <img src="/Documentos.webp" alt="CSV" style={{width: '24px', height: '24px', display: 'inline-block'}} /> },
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      if (ALLOWED_TYPES[file.type]) {
        return true;
      }
      alert(`Archivo no permitido: ${file.name}. Solo PDF, Excel o CSV.`);
      return false;
    });

    const filesWithId = validFiles.map((file) => ({
      id: Math.random(),
      file,
      type: ALLOWED_TYPES[file.type]?.label,
      icon: ALLOWED_TYPES[file.type]?.icon,
      size: (file.size / 1024 / 1024).toFixed(2),
    }));

    setFiles([...files, ...filesWithId]);
  };

  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const uploadFile = async (fileWrapper) => {
    const { id, file } = fileWrapper;
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("tipo_documento", "CERTIFICADO");

    try {
      const token = localStorage.getItem("access_token");
      setProgress((prev) => ({ ...prev, [id]: 0 }));

      const response = await axios.post(
        "http://localhost:8000/api/certificados-upload/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress((prev) => ({ ...prev, [id]: percentCompleted }));
          },
        }
      );

      setFiles(files.filter((f) => f.id !== id));
      setProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[id];
        return newProgress;
      });

      return response.data;
    } catch (error) {
      alert(
        `Error al subir ${file.name}: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0) {
      alert("Selecciona al menos un archivo");
      return;
    }

    setUploading(true);
    const results = [];

    try {
      for (const fileWrapper of files) {
        const result = await uploadFile(fileWrapper);
        results.push(result);
      }

      if (onUploadComplete) {
        onUploadComplete(results);
      }

      alert(
        `${results.length} archivo(s) subido(s) correctamente`
      );
    } catch (error) {
      console.error("Error durante carga:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Zona Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? `${bgHover} ${borderColor} scale-105` : ""}
          ${dark ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"}
          hover:${bgHover} hover:border-blue-400
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.xls,.xlsx,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-4xl mb-3">
          <img src="/Carpeta.webp" alt="Carpeta" style={{ width: '48px', height: '48px', margin: '0 auto' }} />
        </div>
        <h3 className={`text-lg font-semibold mb-1 ${textColor}`}>
          {isDragging ? "¡Suelta los archivos aquí!" : "Arrastra certificados aquí"}
        </h3>
        <p className={`text-sm ${textColor}`}>
          o haz click para seleccionar (PDF, Excel, CSV)
        </p>
        <p className={`text-xs ${textColor} mt-2`}>
          Máximo 10 MB por archivo
        </p>
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4
            className={`text-sm font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}
          >
            📋 {files.length} archivo(s) seleccionado(s)
          </h4>

          {files.map((fileWrapper) => {
            const isUploading = progress[fileWrapper.id] !== undefined;
            const progressPercent = progress[fileWrapper.id] || 0;

            return (
              <div
                key={fileWrapper.id}
                className={`
                  p-3 rounded-lg border
                  ${dark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fileWrapper.icon}</span>
                    <div>
                      <p className={`font-medium ${dark ? "text-white" : "text-gray-900"}`}>
                        {fileWrapper.file.name}
                      </p>
                      <p className={`text-xs ${textColor}`}>
                        {fileWrapper.type} • {fileWrapper.size} MB
                      </p>
                    </div>
                  </div>

                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(fileWrapper.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Barra de progreso */}
                {isUploading && (
                  <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? "bg-gray-600" : "bg-gray-300"}`}>
                    <div
                      className="h-full bg-blue-500 transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Botón de carga */}
          {files.length > 0 && Object.keys(progress).length === 0 && (
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={uploading}
              className={`
                w-full py-2 rounded-lg font-medium transition-all
                ${uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              `}
            >
              {uploading ? "Subiendo..." : `⬆️ Subir ${files.length} archivo(s)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
