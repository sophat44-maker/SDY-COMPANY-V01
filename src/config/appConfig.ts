/**
 * Global Enterprise Application Configuration
 * SDY C&I - Commercial & Industrial Fit-Out Systems
 * 
 * Production Vercel / Cloud Run Deployment Entry point
 * All environment variables are loaded dynamically with safe fallback defaults.
 */

export const APP_CONFIG = {
  APP_NAME: 'SDY C&I Architecture & Fit-Out Catalog',
  APP_VERSION: 'v2.5.0-Enterprise',
  DEFAULT_LANGUAGE: 'en',
  
  // Dynamic API Endpoint (Overridden by VITE_API_URL in .env)
  API_BASE_URL: (import.meta as any).env?.VITE_API_URL || '',
  
  // Google Drive CDN CDN Transformer Pattern
  DRIVE_CDN_BASE: 'https://lh3.googleusercontent.com/d/',

  // Local Storage Keys
  STORAGE_KEYS: {
    SETTINGS: 'sdy_sheets_config_v2',
    SESSION: 'sdy_admin_session_v2',
    LANGUAGE: 'sdy_user_language_v2',
    THEME: 'sdy_theme_mode_v2',
  },

  // Cache TTLs in milliseconds
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
};

export default APP_CONFIG;
