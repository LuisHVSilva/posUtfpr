import dotenv from "dotenv";
import path from "path";

const nodeEnv = process.env.NODE_ENV?.trim() || "local";
const envFile = `.env.${nodeEnv}`;

dotenv.config({
    path: path.resolve(process.cwd(), envFile),
});
