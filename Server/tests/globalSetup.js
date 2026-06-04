import dotenv from "dotenv";
import path   from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load main .env first
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Load test .env — overrides test credentials only
dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: true });

export default async function globalSetup() {
  process.env.NODE_ENV = "test";

  const mongoose   = (await import("mongoose")).default;
  const Maintaince = (await import("../Models/Maintaince.js")).default;

  await mongoose.connect(process.env.MONGO_URI);
  await Maintaince.updateOne(
    {},
    { $set: { maintenance_mode: false } },
    { upsert: true }
  );
  console.log("Global setup: maintenance mode disabled");
  await mongoose.disconnect();
}