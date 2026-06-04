import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath }    from "url";
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.test"), override: true });

describe("ENV check", () => {
  test("Test credentials are loaded", () => {
    console.log("ADMIN EMAIL:", process.env.TEST_ADMIN_EMAIL);
    console.log("SUP EMAIL:  ", process.env.TEST_SUP_EMAIL);
    console.log("STD EMAIL:  ", process.env.TEST_STD_EMAIL);
    console.log("STD ID:     ", process.env.TEST_STD_ID);

    expect(process.env.TEST_ADMIN_EMAIL).toBeDefined();
    expect(process.env.TEST_SUP_EMAIL).toBeDefined();
    expect(process.env.TEST_STD_EMAIL).toBeDefined();
  });
});