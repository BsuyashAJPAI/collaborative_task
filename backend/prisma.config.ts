import "dotenv/config";
import { defineConfig, env } from "prisma/config"; // Import 'env' here

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the Prisma helper instead of process.env
    url: env("DATABASE_URL"),
  },
});