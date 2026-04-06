import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    // OAuth providers
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    // GitHub webhooks
    GITHUB_WEBHOOK_SECRET: z.string().min(1).optional(),
    // Graph storage
    GRAPH_DATA_DIR: z.string().min(1).default("./data/graphs"),
    // Python parser
    PARSER_PYTHON_PATH: z.string().default("python3"),
    PARSER_SCRIPT_PATH: z.string().default("./parser/main.py"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
