import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { coreEngineService } from '../services/core-engine.ts';

const processMessageSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1),
  agentMode: z.enum(['guide', 'coach', 'companion']).optional(),
  currentState: z.string().optional(),
});

const personaSchema = z.object({
  userId: z.string().min(1),
  mbtiType: z.string().min(1),
  gates: z.array(z.number().int().min(1).max(64)),
  astroData: z.object({
    sunSign: z.number(),
    moonSign: z.number(),
    ascendant: z.number(),
    lifePathNumber: z.number(),
  }),
});

const conflictSchema = z.object({
  conflicts: z.array(z.object({
    type: z.enum(['framework_mismatch', 'trait_contradiction', 'goal_conflict', 'temporal_inconsistency']),
    frameworks: z.array(z.string()),
    conflictingData: z.record(z.unknown()),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    sessionId: z.string().min(1),
    currentMode: z.string().min(1),
    userInput: z.string().optional(),
  })),
});

const feedbackSchema = z.object({
  userId: z.string().min(1),
  isPositive: z.boolean(),
  contextVector: z.array(z.number()),
});

export async function registerPipelineRoutes(server: FastifyInstance) {
  server.post('/pipeline/process-message', async (request, reply) => {
    const payload = processMessageSchema.parse(request.body);
    const result = await coreEngineService.processMessage(payload);
    return reply.send(result);
  });

  server.post('/pipeline/create-persona', async (request, reply) => {
    const payload = personaSchema.parse(request.body);
    const result = await coreEngineService.createPersona(payload);
    return reply.send(result);
  });

  server.post('/pipeline/resolve-conflicts', async (request, reply) => {
    const payload = conflictSchema.parse(request.body);
    const result = await coreEngineService.resolve(payload);
    return reply.send({ resolutions: Array.from(result.entries()) });
  });

  server.post('/pipeline/update-weights', async (request, reply) => {
    const payload = feedbackSchema.parse(request.body);
    await coreEngineService.updateWeightsFromFeedback(payload);
    return reply.send({ success: true });
  });
}
