import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import axios from 'axios';

export const useAsync = (asyncFunction, immediate = true) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = React.useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await asyncFunction(...args);
        setData(response);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, loading, error, data };
};

export const LoadingSpinner = ({ theme = 'light', size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} animate-spin`}>
        <div
          className={`w-full h-full rounded-full border-4 border-transparent ${
            theme === 'dark'
              ? 'border-t-blue-400 border-r-blue-400'
              : 'border-t-blue-600 border-r-blue-600'
          }`}
        />
      </div>
    </div>
  );
};

export const ErrorAlert = ({ error, theme = 'light', onClose }) => {
  if (!error) return null;

  const errorMessage = error?.response?.data?.detail || error?.message || 'Ha ocurrido un error inesperado';

  return (
    <div
      className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${
        theme === 'dark'
          ? 'bg-red-900/20 border-red-500 text-red-300'
          : 'bg-red-100 border-red-500 text-red-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">❌</span>
        <div>
          <p className="font-semibold">Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-4 hover:opacity-70 transition-opacity ${
            theme === 'dark' ? 'text-red-300' : 'text-red-700'
          }`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export const SuccessAlert = ({ message, theme = 'light', onClose, duration = 5000 }) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 flex justify-between items-center animate-in fade-in ${
        theme === 'dark'
          ? 'bg-green-900/20 border-green-500 text-green-300'
          : 'bg-green-100 border-green-500 text-green-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl"></span>
        <p>{message}</p>
      </div>
      <button
        onClick={handleClose}
        className={`ml-4 hover:opacity-70 transition-opacity ${
          theme === 'dark' ? 'text-green-300' : 'text-green-700'
        }`}
      >
        ✕
      </button>
    </div>
  );
};

export const useFormWithValidation = (initialValues, onSubmit, validate) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    if (validate) {
      const error = validate(name, values[name]);
      if (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate) {
      const newErrors = {};
      Object.keys(values).forEach((name) => {
        const error = validate(name, values[name]);
        if (error) newErrors[name] = error;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      console.error('Error en formulario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
};

export const useRetryableRequest = (requestFn, maxRetries = 3) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const execute = React.useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await requestFn(...args);
          setData(response);
          setRetryCount(0);
          return response;
        } catch (err) {
          if (i === maxRetries - 1) {
            setError(err);
            throw err;
          }
          setRetryCount(i + 1);
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    },
    [requestFn, maxRetries]
  );

  return { execute, loading, error, data, retryCount };
};

export const useDebouncedValue = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export const OfflineIndicator = ({ theme = 'light' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 p-3 text-center font-semibold ${
        theme === 'dark'
          ? 'bg-gray-900 text-gray-300 border-b border-gray-700'
          : 'bg-gray-100 text-gray-700 border-b border-gray-300'
      }`}
    >
      📡 Sin conexión. Algunos datos pueden estar desactualizados.
    </div>
  );
};
