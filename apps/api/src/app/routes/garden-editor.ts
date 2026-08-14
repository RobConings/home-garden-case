import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import {
  internalServerErrorResponseSchema,
  notFoundErrorResponseSchema,
  validationErrorResponseSchema,
} from '../schemas/error.schema';
import {
  gardenEditorPlantsResponseSchema,
  gardenEditorShapesResponseSchema,
  replaceGardenEditorPlantsSchema,
  replaceGardenEditorShapesSchema,
} from '../schemas/garden-editor.schema';
import { gardenIdParamsSchema } from '../schemas/garden.schema';
import { GardenEditorService } from '../services/garden-editor.service';

export default async function (fastify: FastifyInstance) {
  const gardenEditorService =
    fastify.diContainer.resolve<GardenEditorService>('gardenEditorService');

  fastify.withTypeProvider<ZodTypeProvider>().get<{
    Params: z.infer<typeof gardenIdParamsSchema>;
  }>(
    '/gardens/:gardenId/editor-shapes',
    {
      schema: {
        description: 'Get garden editor shapes',
        tags: ['gardens'],
        params: gardenIdParamsSchema,
        response: {
          200: gardenEditorShapesResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const shapes = await gardenEditorService.getGardenEditorShapes(request.params.gardenId);
      return reply.send(shapes);
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().put<{
    Params: z.infer<typeof gardenIdParamsSchema>;
    Body: z.infer<typeof replaceGardenEditorShapesSchema>;
  }>(
    '/gardens/:gardenId/editor-shapes',
    {
      schema: {
        description: 'Replace garden editor shapes',
        tags: ['gardens'],
        params: gardenIdParamsSchema,
        body: replaceGardenEditorShapesSchema,
        response: {
          200: gardenEditorShapesResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const shapes = await gardenEditorService.replaceGardenEditorShapes(
        request.params.gardenId,
        request.body,
      );
      return reply.send(shapes);
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().get<{
    Params: z.infer<typeof gardenIdParamsSchema>;
  }>(
    '/gardens/:gardenId/editor-plants',
    {
      schema: {
        description: 'Get garden editor plant placements',
        tags: ['gardens'],
        params: gardenIdParamsSchema,
        response: {
          200: gardenEditorPlantsResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const plants = await gardenEditorService.getGardenEditorPlants(request.params.gardenId);
      return reply.send(plants);
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().put<{
    Params: z.infer<typeof gardenIdParamsSchema>;
    Body: z.infer<typeof replaceGardenEditorPlantsSchema>;
  }>(
    '/gardens/:gardenId/editor-plants',
    {
      schema: {
        description: 'Replace garden editor plant placements',
        tags: ['gardens'],
        params: gardenIdParamsSchema,
        body: replaceGardenEditorPlantsSchema,
        response: {
          200: gardenEditorPlantsResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const plants = await gardenEditorService.replaceGardenEditorPlants(
        request.params.gardenId,
        request.body,
      );
      return reply.send(plants);
    },
  );
}
