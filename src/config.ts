// Bun automatically loads .env files

export const port: number = process.env.PORT ? Number(process.env.port) : 9000;

export const jwtSecret = process.env.JWT_SECRET || "mysecretjwttoken";

export const sha: string = process.env.GIT_SHA_ENV || "sha_undefined";
export const version: string =
  process.env.GIT_VERSION_ENV || "version_undefined";
