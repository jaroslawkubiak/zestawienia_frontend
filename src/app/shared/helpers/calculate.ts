export function calculateBrutto(netto: number): number {
  return +(Math.round(netto * 1.23 * 100) / 100).toFixed(2);
}

export function calculateNetto(brutto: number): number {
  return +(Math.round((brutto / 1.23) * 100) / 100).toFixed(2);
}

export function calculateWartosc(ilosc: number, cena: number): number {
  return Number((Math.round(ilosc * cena * 100) / 100).toFixed(2));
}
