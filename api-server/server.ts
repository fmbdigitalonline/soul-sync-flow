import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { registerPipelineRoutes } from './routes/pipeline-routes.ts';

dotenv.config({ path: '.env' });

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: true,
});

server.get('/health', async () => ({ status: 'ok', environment: 'staging' }));
await registerPipelineRoutes(server);

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';

server.listen({ port, host }).catch((error) => {
  server.log.error(error);
  process.exit(1);
});
