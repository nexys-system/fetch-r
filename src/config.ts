import dotenv from "dotenv";

dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || "mysecretjttoken";
