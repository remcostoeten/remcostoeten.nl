function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const authConfig = {
  adminEmail: getEnvVar("ADMIN_EMAIL", "remcostoeten@hotmail.com"),
  adminPassword: getEnvVar("ADMIN_PASSWORD", "Mhca6r4g1!"),
  sessionDuration: parseInt(getEnvVar("SESSION_DURATION", "604800000")), // 7 days in ms
  passwordSalt: getEnvVar("PASSWORD_SALT", "salt_remco_2024"),
  maxLoginAttempts: parseInt(getEnvVar("MAX_LOGIN_ATTEMPTS", "5")),
  lockoutDuration: parseInt(getEnvVar("LOCKOUT_DURATION", "900000")), // 15 minutes
} as const;
