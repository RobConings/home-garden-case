import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';
import {
  internalServerErrorResponseSchema,
  notFoundErrorResponseSchema,
  unauthorizedErrorResponseSchema,
  validationErrorResponseSchema,
} from '../schemas/error.schema';
import { loginUserSchema, resetPasswordSchema, userResponseSchema } from '../schemas/user.schema';
import { UserService } from '../services/user.service';

export default async function (fastify: FastifyInstance) {
  const userService = fastify.diContainer.resolve<UserService>('userService');

  /**
   * POST /auth/login
   * Authenticate a user
   */
  fastify.post<{
    Body: z.infer<typeof loginUserSchema>;
  }>(
    '/auth/login',
    {
      schema: {
        description: 'Authenticate a user',
        tags: ['auth'],
        body: loginUserSchema,
        response: {
          200: userResponseSchema,
          400: validationErrorResponseSchema,
          401: unauthorizedErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await userService.authenticateUser(request.body);
      return reply.send(user);
    },
  );

  /**
   * POST /auth/reset-password
   * Reset a user password
   */
  fastify.post<{
    Body: z.infer<typeof resetPasswordSchema>;
  }>(
    '/auth/reset-password',
    {
      schema: {
        description: 'Reset a user password',
        tags: ['auth'],
        body: resetPasswordSchema,
        response: {
          200: userResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await userService.resetPassword(request.body);
      return reply.send(user);
    },
  );
}
