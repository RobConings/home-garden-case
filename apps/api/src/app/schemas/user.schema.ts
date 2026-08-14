import { z } from 'zod/v4';
import {
  hasMinimumPasswordLength,
  hasPasswordCapital,
  hasPasswordDigit,
  hasPasswordSpecialCharacter,
} from '../shared/password';
import {
  nullablePlainTextResponseSchema,
  requiredPlainTextSchema,
  textLimits,
} from '../shared/plain-text';

export const userIdParamsSchema = z.object({
  userId: z.coerce.number().int().positive('User ID must be a positive integer'),
});

z.globalRegistry.add(userIdParamsSchema, { id: 'UserId' });

export const emailParamsSchema = z.object({
  emailAddress: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email address is required')
    .max(textLimits.email, `Email address must be ${textLimits.email} characters or fewer`)
    .email('Invalid email address format'),
});

z.globalRegistry.add(emailParamsSchema, { id: 'Email' });

export const createUserSchema = z.object({
  firstName: requiredPlainTextSchema('First name', textLimits.personName),
  lastName: requiredPlainTextSchema('Last name', textLimits.personName),
  emailAddress: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email address is required')
    .max(textLimits.email, `Email address must be ${textLimits.email} characters or fewer`)
    .email('Invalid email address format'),
  password: z
    .string()
    .max(textLimits.password, `Password must be ${textLimits.password} characters or fewer`)
    .refine(hasMinimumPasswordLength, 'Password must include at least 8 characters')
    .refine(hasPasswordCapital, 'Password must include a capital letter')
    .refine(hasPasswordDigit, 'Password must include a digit')
    .refine(hasPasswordSpecialCharacter, 'Password must include a special character'),
});

z.globalRegistry.add(createUserSchema, { id: 'CreateUser' });

export const loginUserSchema = z.object({
  emailAddress: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email address is required')
    .max(textLimits.email, `Email address must be ${textLimits.email} characters or fewer`)
    .email('Invalid email address format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(textLimits.password, `Password must be ${textLimits.password} characters or fewer`),
});

z.globalRegistry.add(loginUserSchema, { id: 'LoginUser' });

export const resetPasswordSchema = z.object({
  emailAddress: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email address is required')
    .max(textLimits.email, `Email address must be ${textLimits.email} characters or fewer`)
    .email('Invalid email address format'),
  password: z
    .string()
    .max(textLimits.password, `Password must be ${textLimits.password} characters or fewer`)
    .refine(hasMinimumPasswordLength, 'Password must include at least 8 characters')
    .refine(hasPasswordCapital, 'Password must include a capital letter')
    .refine(hasPasswordDigit, 'Password must include a digit')
    .refine(hasPasswordSpecialCharacter, 'Password must include a special character'),
});

z.globalRegistry.add(resetPasswordSchema, { id: 'ResetPassword' });

export const themePreferenceSchema = z.enum(['light', 'dark']);

z.globalRegistry.add(themePreferenceSchema, { id: 'ThemePreference' });

export const updateUserSchema = createUserSchema
  .omit({
    password: true,
  })
  .partial();

z.globalRegistry.add(updateUserSchema, { id: 'UpdateUser' });

export const updateUserThemeSchema = z.object({
  themePreference: themePreferenceSchema,
});

z.globalRegistry.add(updateUserThemeSchema, { id: 'UpdateUserTheme' });

export const userResponseSchema = z.object({
  userId: z.number(),
  firstName: nullablePlainTextResponseSchema(textLimits.personName),
  lastName: nullablePlainTextResponseSchema(textLimits.personName),
  emailAddress: z
    .string()
    .max(textLimits.email, `Email address must be ${textLimits.email} characters or fewer`)
    .email(),
  themePreference: themePreferenceSchema,
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

z.globalRegistry.add(userResponseSchema, { id: 'User' });

export const usersResponseSchema = z.array(userResponseSchema);
z.globalRegistry.add(usersResponseSchema, { id: 'Users' });
