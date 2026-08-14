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
