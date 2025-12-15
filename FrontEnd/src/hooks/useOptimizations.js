// Proxy que re-exporta desde useOptimizations.jsx
// Esto evita conflictos con el parseador de JSX de Vite
export { 
  useAsync, 
  LoadingSpinner, 
  ErrorAlert, 
  SuccessAlert, 
  useFormWithValidation, 
  useRetryableRequest, 
  useDebouncedValue, 
  useOnlineStatus, 
  OfflineIndicator 
} from './useOptimizations.jsx';
