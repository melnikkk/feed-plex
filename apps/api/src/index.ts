import "dotenv/config";
import { env } from "./env";
import { buildApp } from "./app";

const app = buildApp();

await app.listen({ port: env.PORT, host: env.HOST });
