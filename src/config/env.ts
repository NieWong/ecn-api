import "dotenv/config";

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  port: Number(process.env["PORT"] ?? 4000),
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] ?? "1d",
  uploadDir: process.env["UPLOAD_DIR"] ?? "uploads",
  uploadMaxMb: Number(process.env["UPLOAD_MAX_MB"] ?? 25),
};
