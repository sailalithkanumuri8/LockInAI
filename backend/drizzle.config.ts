import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url: Resource.Database.url,
    authToken: Resource.Database.token,
  },
  verbose: true,
  strict: true,
  schema: "src/db.ts",
});
