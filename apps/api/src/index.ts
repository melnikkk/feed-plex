import 'dotenv/config';
import { env } from './env';
import { buildApp } from './app';

const app = buildApp();

await app.listen({ port: env.PORT, host: env.HOST });

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    app.close().finally(() => process.exit(0));
  });
}
