export function pluralizePL(
  count: number,
  singular: string,
  pluralFew: string,
  pluralMany: string = pluralFew,
): string {
  if (count === 1) {
    return singular;
  }

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
  ) {
    return pluralFew;
  }

  return pluralMany;
}
