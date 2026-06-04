import dotenv from "dotenv";
import path   from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from Server folder explicitly
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.test"), override: true });