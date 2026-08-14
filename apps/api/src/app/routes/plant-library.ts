import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import {
  internalServerErrorResponseSchema,
  notFoundErrorResponseSchema,
  validationErrorResponseSchema,
} from '../schemas/error.schema';
import { emptyResponseSchema } from '../schemas/general.schema';
import {
  createPlantLibrarySchema,
  plantLibraryIdParamsSchema,
  plantLibraryListResponseSchema,
  plantLibraryOwnerQuerySchema,
  plantLibraryOwnerRequiredQuerySchema,
  plantLibraryPageQuerySchema,
  plantLibraryPageResponseSchema,
  plantLibraryResponseSchema,
  updatePlantLibrarySchema,
} from '../schemas/plant-library.schema';
import { PlantLibraryService } from '../services/plant-library.service';

export default async function (fastify: FastifyInstance) {
  const plantLibraryService =
    fastify.diContainer.resolve<PlantLibraryService>('plantLibraryService');

  /**
   * GET /plant-library
   * Get selectable plant templates
   */
  fastify.withTypeProvider<ZodTypeProvider>().get<{
    Querystring: z.infer<typeof plantLibraryOwnerQuerySchema>;
  }>(
    '/plant-library',
    {
      schema: {
        description: 'Get selectable plant templates',
        tags: ['plant-library'],
        querystring: plantLibraryOwnerQuerySchema,
        response: {
          200: plantLibraryListResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const plants = await plantLibraryService.getVisiblePlants(request.query.ownerUserId);
      return reply.send(plants);
    },
  );

  /**
   * GET /plant-library/page
   * Get a paged searchable plant template list
   */
  fastify.withTypeProvider<ZodTypeProvider>().get<{
    Querystring: z.infer<typeof plantLibraryPageQuerySchema>;
  }>(
    '/plant-library/page',
    {
      schema: {
        description: 'Get a paged searchable plant template list',
        tags: ['plant-library'],
        querystring: plantLibraryPageQuerySchema,
        response: {
          200: plantLibraryPageResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const page = await plantLibraryService.getVisiblePlantPage(request.query.ownerUserId, {
        search: request.query.search,
        limit: request.query.limit,
        offset: request.query.offset,
      });
      return reply.send(page);
    },
  );

  /**
   * GET /plant-library/:plantLibraryId
   * Get a selectable plant template by ID
   */
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get<{
      Params: z.infer<typeof plantLibraryIdParamsSchema>;
      Querystring: z.infer<typeof plantLibraryOwnerQuerySchema>;
    }>(
      '/plant-library/:plantLibraryId',
      {
        schema: {
          description: 'Get a selectable plant template by ID',
          tags: ['plant-library'],
          params: plantLibraryIdParamsSchema,
          querystring: plantLibraryOwnerQuerySchema,
          response: {
            200: plantLibraryResponseSchema,
            400: validationErrorResponseSchema,
            404: notFoundErrorResponseSchema,
            500: internalServerErrorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const plant = await plantLibraryService.getVisiblePlantById(
          request.params.plantLibraryId,
          request.query.ownerUserId,
        );
        return reply.send(plant);
      },
    );

  /**
   * POST /plant-library
   * Add a custom selectable plant template
   */
  fastify.withTypeProvider<ZodTypeProvider>().post<{
    Body: z.infer<typeof createPlantLibrarySchema>;
  }>(
    '/plant-library',
    {
      schema: {
        description: 'Add a custom selectable plant template',
        tags: ['plant-library'],
        body: createPlantLibrarySchema,
        response: {
          201: plantLibraryResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const plant = await plantLibraryService.createCustomPlant(request.body);
      return reply.status(201).send(plant);
    },
  );

  /**
   * PUT /plant-library/:plantLibraryId
   * Edit a custom selectable plant template
   */
  fastify.withTypeProvider<ZodTypeProvider>().put<{
    Params: z.infer<typeof plantLibraryIdParamsSchema>;
    Querystring: z.infer<typeof plantLibraryOwnerRequiredQuerySchema>;
    Body: z.infer<typeof updatePlantLibrarySchema>;
  }>(
    '/plant-library/:plantLibraryId',
    {
      schema: {
        description: 'Edit a custom selectable plant template',
        tags: ['plant-library'],
        params: plantLibraryIdParamsSchema,
        querystring: plantLibraryOwnerRequiredQuerySchema,
        body: updatePlantLibrarySchema,
        response: {
          200: plantLibraryResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const plant = await plantLibraryService.updateCustomPlant(
        request.params.plantLibraryId,
        request.query.ownerUserId,
        request.body,
      );
      return reply.send(plant);
    },
  );

  /**
   * DELETE /plant-library/:plantLibraryId
   * Delete a custom selectable plant template
   */
  fastify.withTypeProvider<ZodTypeProvider>().delete<{
    Params: z.infer<typeof plantLibraryIdParamsSchema>;
    Querystring: z.infer<typeof plantLibraryOwnerRequiredQuerySchema>;
  }>(
    '/plant-library/:plantLibraryId',
    {
      schema: {
        description: 'Delete a custom selectable plant template',
        tags: ['plant-library'],
        params: plantLibraryIdParamsSchema,
        querystring: plantLibraryOwnerRequiredQuerySchema,
        response: {
          204: emptyResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      await plantLibraryService.deleteCustomPlant(
        request.params.plantLibraryId,
        request.query.ownerUserId,
      );
      return reply.status(204).send();
    },
  );
}
