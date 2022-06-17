import dotenv from "dotenv";

dotenv.config();

export const port: number = process.env.PORT ? 9000 : Number(process.env.port);

export const jwtSecret = process.env.JWT_SECRET || "mysecretjttoken";
