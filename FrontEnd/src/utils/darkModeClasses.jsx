/**
 * Clases de utilidad para dark mode consistente
 * Usa: darkBg, darkText, darkBorder, darkCard, darkButton, etc.
 * Nota: Para evitar warnings de fast-refresh, solo exportar componentes React
 * o mover constantes a archivos separados .js
 */

// eslint-disable-next-line react-refresh/only-export-components
export const darkModeClasses = {
  // Fondos
  pageBg: "bg-gray-50 dark:bg-slate-950",
  cardBg: "bg-white dark:bg-gray-900/70",
  inputBg: "bg-white dark:bg-gray-800",
  hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
  
  // Texto
  text: "text-gray-900 dark:text-white",
  textMuted: "text-gray-600 dark:text-gray-400",
  textSecondary: "text-gray-500 dark:text-gray-500",
  
  // Bordes
  border: "border-gray-300 dark:border-gray-700",
  borderLight: "border-gray-200 dark:border-gray-800",
  borderHover: "border-gray-400 dark:border-gray-600",
  
  // Botones
  buttonPrimary: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white",
  buttonSecondary: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white",
  buttonDanger: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white",
  buttonSuccess: "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white",
  
  // Estados de validación
  success: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200",
  error: "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200",
  
  // Badges/etiquetas
  badgeDefault: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  badgePrimary: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  badgeSuccess: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  badgeError: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  
  // Tablas
  tableHeader: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
  tableRow: "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
  
  // Inputs
  input: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400",
  
  // Dropdowns/Selects
  select: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none",
};

/**
 * Componente Button reutilizable con dark mode
 */
// eslint-disable-next-line react-refresh/only-export-components
export const DarkModeButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = "transition-colors duration-200 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: darkModeClasses.buttonPrimary,
    secondary: darkModeClasses.buttonSecondary,
    danger: darkModeClasses.buttonDanger,
    success: darkModeClasses.buttonSuccess,
  }[variant] || darkModeClasses.buttonPrimary;

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }[size] || "px-4 py-2 text-base";

  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Componente Input reutilizable con dark mode
 */
// eslint-disable-next-line react-refresh/only-export-components
export const DarkModeInput = ({
  label,
  error,
  touched,
  theme = 'light',
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className={`block mb-2 font-medium text-sm ${darkModeClasses.text}`}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input 
        className={`w-full px-4 py-2 rounded-lg ${darkModeClasses.input} ${className} ${
          touched && error ? 'border-red-500 dark:border-red-500' : ''
        }`}
        {...props}
      />
      {touched && error && (
        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Componente Card reutilizable con dark mode
 */
// eslint-disable-next-line react-refresh/only-export-components
export const DarkModeCard = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`${darkModeClasses.cardBg} border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default darkModeClasses;
