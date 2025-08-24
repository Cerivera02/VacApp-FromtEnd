// Configuración de variables de entorno
export const config = {
  // URL del backend API
  apiUrl: import.meta.env.VITE_API_URL,

  // Nombre de la aplicación
  appName: import.meta.env.VITE_APP_NAME || "VacApp",

  // Versión de la aplicación
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Modo de desarrollo
  isDevelopment: import.meta.env.DEV,

  // Modo de producción
  isProduction: import.meta.env.PROD,
} as const;

// Exportar la configuración por defecto
export default config;
