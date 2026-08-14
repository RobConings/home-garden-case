export const passwordRequirements = [
  {
    label: '8 characters',
    test: hasMinimumPasswordLength,
  },
  {
    label: 'Capital',
    test: hasPasswordCapital,
  },
  {
    label: 'Digit',
    test: hasPasswordDigit,
  },
  {
    label: 'Special character',
    test: hasPasswordSpecialCharacter,
  },
] as const;

export function hasMinimumPasswordLength(value: string) {
  return value.length >= 8;
}

export function hasPasswordCapital(value: string) {
  return /[A-Z]/.test(value);
}

export function hasPasswordDigit(value: string) {
  return /\d/.test(value);
}

export function hasPasswordSpecialCharacter(value: string) {
  return /[^A-Za-z0-9]/.test(value);
}

export function isStrongPassword(value: string) {
  return passwordRequirements.every((requirement) => requirement.test(value));
}
