// Environment configuration with validation
interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };
  features: {
    enableRealtime: boolean;
    enableAnalytics: boolean;
    enableNotifications: boolean;
  };
}

// Validate required environment variables
const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Environment configuration
export const env: EnvironmentConfig = {
  supabase: {
    url: validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
    anonKey: validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },
  app: {
    name: 'Serrano Tex IMS',
    version: '1.0.0',
    environment: (import.meta.env.VITE_APP_ENV as any) || 'development',
    debug: import.meta.env.DEV || false,
  },
  features: {
    enableRealtime: import.meta.env.VITE_ENABLE_REALTIME !== 'false',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  },
};

// Environment-specific configurations
export const isDevelopment = env.app.environment === 'development';
export const isProduction = env.app.environment === 'production';
export const isStaging = env.app.environment === 'staging';

// API endpoints
export const apiEndpoints = {
  base: env.supabase.url,
  auth: `${env.supabase.url}/auth/v1`,
  rest: `${env.supabase.url}/rest/v1`,
  realtime: `${env.supabase.url}/realtime/v1`,
  storage: `${env.supabase.url}/storage/v1`,
};

// Security configuration
export const security = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  requireMFA: isProduction,
};

export default env;