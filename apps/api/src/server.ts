import { buildApp } from './app';
import { readConfig } from './config';
import { readAiConfig } from './platform/llm/config';
import { createAiServices } from './platform/llm/create-ai';

const config = readConfig(process.env);
const ai = createAiServices(readAiConfig(process.env));
const app = buildApp(
  {
    logger: {
      level: config.LOG_LEVEL,
      redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
    },
  },
  { ai },
);

let stopping = false;

async function shutdown() {
  if (stopping) return;
  stopping = true;

  try {
    await app.close();
  } catch (error) {
    app.log.error(error, 'API shutdown failed');
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.error(error, 'API startup failed');
  process.exitCode = 1;
}
