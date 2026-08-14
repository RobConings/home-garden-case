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

export function requirePlainText(value: unknown, label: string, maxLength: number) {
  const text = sanitizePlainText(value);

  if (!text) {
    throw new PlainTextValidationError(`${label} is required.`);
  }

  if (text.length > maxLength) {
    throw new PlainTextValidationError(`${label} must be ${maxLength} characters or fewer.`);
  }

  return text;
}

export function optionalPlainText(value: unknown, label: string, maxLength: number) {
  const text = sanitizePlainText(value);

  if (!text) {
    return null;
  }

  if (text.length > maxLength) {
    throw new PlainTextValidationError(`${label} must be ${maxLength} characters or fewer.`);
  }

  return text;
}

export function toSafeDisplayText(value: unknown, maxLength = textLimits.notes) {
  return sanitizePlainText(value).slice(0, maxLength);
}

export class PlainTextValidationError extends Error {}

function isAllowedPlainTextCharacter(character: string) {
  const codePoint = character.charCodeAt(0);

  return codePoint === 10 || (codePoint >= 32 && codePoint !== 127);
}
