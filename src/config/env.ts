// Configuración de variables de entorno
export const config = {
  // URL del backend API
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",

  // Nombre de la aplicación
  appName: import.meta.env.VITE_APP_NAME || "VacApp",

  // Versión de la aplicación
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Modo de desarrollo
  isDevelopment: import.meta.env.DEV,

  // Modo de producción
  isProduction: import.meta.env.PROD,
} as const;

// Validar que las variables críticas estén definidas
if (!config.apiUrl) {
  console.warn("⚠️ VITE_API_URL no está definida, usando URL por defecto");
}

// Exportar la configuración por defecto
export default config;
