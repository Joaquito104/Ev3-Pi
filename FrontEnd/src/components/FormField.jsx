import React from 'react';

/**
 * Componente FormField reutilizable con validación integrada
 */
export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  onChange,
  onBlur,
  placeholder,
  required = false,
  theme = 'light',
  disabled = false,
  maxLength = null,
  children = null
}) => {
  const showError = touched && error;

  const inputClasses = `
    w-full px-4 py-2 rounded-lg border transition-colors
    ${showError
      ? dark
        ? 'border-red-500 bg-red-900/10 text-red-100'
        : 'border-red-500 bg-red-50 text-red-900'
      : theme === 'dark'
      ? 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400 hover:border-gray-500 focus:border-blue-500 focus:outline-none'
      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 hover:border-gray-400 focus:border-blue-500 focus:outline-none'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label className={`block mb-2 font-medium text-sm ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={4}
          className={inputClasses}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClasses}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}

      {maxLength && (
        <p className={`text-xs mt-1 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {value?.length || 0}/{maxLength}
        </p>
      )}

      {showError && (
        <p className={`text-sm mt-1 ${
          theme === 'dark' ? 'text-red-300' : 'text-red-600'
        }`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
