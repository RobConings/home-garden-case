import { z } from 'zod/v4';
import {
  hasMinimumPasswordLength,
  hasPasswordCapital,
  hasPasswordDigit,
  hasPasswordSpecialCharacter,
} from '../shared/password';

export const userIdParamsSchema = z.object({
  userId: z.coerce.number().int().positive('User ID must be a positive integer'),
});

z.globalRegistry.add(userIdParamsSchema, { id: 'UserId' });

export const emailParamsSchema = z.object({
  emailAddress: z
    .email('Invalid email address format')
    .min(1, 'Email address is required')
    .trim()
    .toLowerCase(),
});

z.globalRegistry.add(emailParamsSchema, { id: 'Email' });

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  emailAddress: z
    .email('Invalid email address format')
    .min(1, 'Email address is required')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .refine(hasMinimumPasswordLength, 'Password must include at least 8 characters')
    .refine(hasPasswordCapital, 'Password must include a capital letter')
    .refine(hasPasswordDigit, 'Password must include a digit')
    .refine(hasPasswordSpecialCharacter, 'Password must include a special character'),
});

z.globalRegistry.add(createUserSchema, { id: 'CreateUser' });

export const loginUserSchema = z.object({
  emailAddress: z
    .email('Invalid email address format')
    .min(1, 'Email address is required')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

z.globalRegistry.add(loginUserSchema, { id: 'LoginUser' });

export const resetPasswordSchema = z.object({
  emailAddress: z
    .email('Invalid email address format')
    .min(1, 'Email address is required')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .refine(hasMinimumPasswordLength, 'Password must include at least 8 characters')
    .refine(hasPasswordCapital, 'Password must include a capital letter')
    .refine(hasPasswordDigit, 'Password must include a digit')
    .refine(hasPasswordSpecialCharacter, 'Password must include a special character'),
});

z.globalRegistry.add(resetPasswordSchema, { id: 'ResetPassword' });

export const updateUserSchema = createUserSchema
  .omit({
    password: true,
  })
  .partial();

z.globalRegistry.add(updateUserSchema, { id: 'UpdateUser' });

export const userResponseSchema = z.object({
  userId: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  emailAddress: z.email(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

z.globalRegistry.add(userResponseSchema, { id: 'User' });

export const usersResponseSchema = z.array(userResponseSchema);
z.globalRegistry.add(usersResponseSchema, { id: 'Users' });
