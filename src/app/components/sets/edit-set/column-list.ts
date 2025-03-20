export interface IColumnList {
  name: string;
  key: string;
  type: 'number' | 'text' | 'select' | 'image';
  classTh?: string;
  classTd?: string;
  width?: number;
  unit?: string;
  readOnly?: boolean;
  // action?: (value: any) => any;
}

export const columnList: IColumnList[] = [
  {
    name: 'id',
    key: 'id',
    classTh: 'hidden',
    classTd: 'hidden',
    type: 'text',
  },
  {
    name: 'KOLEJNOSC',
    key: 'kolejnosc',
    type: 'number',
  },
  {
    name: 'PRODUKT',
    key: 'produkt',
    type: 'text',
  },
  {
    name: 'ZDJĘCIE',
    key: 'image',
    type: 'image',
  },
  {
    name: 'PRODUCENT',
    key: 'producent',
    type: 'text',
  },
  {
    name: 'KOLEKCJA/SERIA',
    key: 'kolekcja',
    type: 'text',
  },
  {
    name: 'NR KATALOGOWY',
    key: 'nrKatalogowy',
    type: 'text',
  },
  {
    name: 'KOLOR',
    key: 'kolor',
    type: 'text',
  },
  {
    name: 'ILOŚĆ',
    key: 'ilosc',
    type: 'number',
  },
  {
    name: 'CENA NETTO',
    key: 'netto',
    type: 'number',
    unit: 'PLN',
  },
  {
    name: 'CENA BRUTTO',
    key: 'brutto',
    type: 'number',
    unit: 'PLN',
    readOnly: true,
    classTd: 'read-only',
  },
  {
    name: 'WARTOŚĆ NETTO',
    key: 'wartoscNetto',
    type: 'number',
    unit: 'PLN',
    readOnly: true,
    classTd: 'read-only',
  },
  {
    name: 'WARTOŚĆ BRUTTO',
    key: 'wartoscBrutto',
    type: 'number',
    unit: 'PLN',
    readOnly: true,
    classTd: 'read-only',
  },
  {
    name: 'DOSTAWCA',
    key: 'dostawca',
    type: 'select',
  },
  {
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    type: 'text',
  },

  {
    name: 'LINK',
    key: 'link',
    type: 'text',
  },
];
