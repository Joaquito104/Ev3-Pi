/**
 * Validadores reutilizables para formularios
 */

export const validators = {
  email: (value) => {
    if (!value) return 'El email es requerido';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : 'Email inválido';
  },

  rut: (value) => {
    if (!value) return 'El RUT es requerido';
    // Formato: XX.XXX.XXX-X
    const regex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    if (!regex.test(value)) return 'RUT debe ser formato: XX.XXX.XXX-X';
    return null;
  },

  rutSimple: (value) => {
    if (!value) return 'El RUT es requerido';
    const cleaned = value.replace(/[^\dkK]/g, '');
    return cleaned.length >= 8 ? null : 'RUT inválido (mínimo 8 dígitos)';
  },

  phone: (value) => {
    if (!value) return 'El teléfono es requerido';
    const regex = /^(\+56|0)?[1-9]\d{1,8}$/;
    return regex.test(value.replace(/\D/g, '')) ? null : 'Teléfono inválido';
  },

  password: (value) => {
    if (!value) return 'La contraseña es requerida';
    if (value.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'Debe contener mayúsculas';
    if (!/[0-9]/.test(value)) return 'Debe contener números';
    return null;
  },

  notEmpty: (value) => {
    return value && String(value).trim() ? null : 'Este campo es requerido';
  },

  minLength: (min) => (value) => {
    return value && value.length >= min ? null : `Mínimo ${min} caracteres`;
  },

  maxLength: (max) => (value) => {
    return value && value.length <= max ? null : `Máximo ${max} caracteres`;
  },

  number: (value) => {
    return value && !isNaN(value) ? null : 'Debe ser un número';
  },

  positiveNumber: (value) => {
    if (!value || isNaN(value)) return 'Debe ser un número';
    return Number(value) > 0 ? null : 'Debe ser un número positivo';
  },

  date: (value) => {
    if (!value) return 'La fecha es requerida';
    const date = new Date(value);
    return date instanceof Date && !isNaN(date) ? null : 'Fecha inválida';
  },

  fileSize: (maxMB) => (file) => {
    if (!file) return 'El archivo es requerido';
    const maxBytes = maxMB * 1024 * 1024;
    return file.size <= maxBytes ? null : `Máximo ${maxMB}MB`;
  },

  fileType: (allowedTypes) => (file) => {
    if (!file) return 'El archivo es requerido';
    return allowedTypes.includes(file.type) ? null : `Tipos permitidos: ${allowedTypes.join(', ')}`;
  },

  match: (compareValue, fieldName) => (value) => {
    return value === compareValue ? null : `No coincide con ${fieldName}`;
  }
};

/**
 * Hook para validación de formularios con realtime feedback
 */
export const useFormValidation = (initialValues, onSubmit) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateField = (name, value, validator) => {
    if (!validator) return null;
    if (typeof validator === 'function') {
      return validator(value);
    }
    return null;
  };

  const handleChange = (e, validator) => {
    const { name, value, type, checked, files } = e.target;
    const fieldValue = type === 'checkbox' ? checked : (type === 'file' ? files?.[0] : value);

    setValues((prev) => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validar en tiempo real si ya fue tocado
    if (touched[name]) {
      const error = validateField(name, fieldValue, validator);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e, validator) => {
    const { name, value, type, files } = e.target;
    const fieldValue = type === 'file' ? files?.[0] : value;

    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, fieldValue, validator);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValues,
    setErrors,
    handleChange,
    handleBlur
  };
};
