import { z } from 'zod/v4';

export const textLimits = {
  name: 120,
  personName: 80,
  email: 254,
  password: 128,
  shortText: 160,
  description: 240,
  notes: 1000,
  search: 120,
};

export function sanitizePlainText(value: unknown) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .split('\r\n')
    .join('\n')
    .split('\r')
    .join('\n')
    .split('')
    .filter(isAllowedPlainTextCharacter)
    .join('')
    .trim();
}

export function requiredPlainTextSchema(label: string, maxLength: number) {
  return z.preprocess(
    sanitizePlainText,
    z
      .string()
      .min(1, `${label} is required`)
      .max(maxLength, `${label} must be ${maxLength} characters or fewer`),
  );
}

export function optionalPlainTextSchema(label: string, maxLength: number) {
  return z.preprocess(
    (value) => {
      if (value === undefined) {
        return undefined;
      }

      const text = sanitizePlainText(value);
      return text ? text : null;
    },
    z
      .string()
      .max(maxLength, `${label} must be ${maxLength} characters or fewer`)
      .nullable()
      .optional(),
  );
}

export function plainTextResponseSchema(maxLength: number) {
  return z.preprocess(
    (value) => sanitizePlainText(value).slice(0, maxLength),
    z.string().max(maxLength),
  );
}

export function nullablePlainTextResponseSchema(maxLength: number) {
  return z.preprocess((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    const text = sanitizePlainText(value).slice(0, maxLength);
    return text ? text : null;
  }, z.string().max(maxLength).nullable());
}

function isAllowedPlainTextCharacter(character: string) {
  const codePoint = character.charCodeAt(0);

  return codePoint === 10 || (codePoint >= 32 && codePoint !== 127);
}
