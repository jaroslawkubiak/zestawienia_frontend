export interface IColumnList {
  name: string;
  key: string;
  type: 'number' | 'string' | 'select' | 'image';
  classTh?: string;
  classTd?: string;
  classFooter?: string;
  width?: number;
  value?: number | string;
  unit?: string;
  readOnly?: boolean;
  // action?: (value: any) => any;
}

export const columnList: IColumnList[] = [
  {
    name: 'id',
    key: 'id',
    type: 'string',
    classTh: 'hidden',
    classTd: 'hidden',
    classFooter: 'hidden',
  },
  {
    name: 'KOLEJNOSC',
    key: 'kolejnosc',
    type: 'string',
    classTh: 'hidden',
    classTd: 'hidden',
    classFooter: 'hidden',
  },
  {
    name: 'PRODUKT',
    key: 'produkt',
    type: 'string',
  },
  {
    name: 'ZDJĘCIE',
    key: 'image',
    type: 'image',
  },
  {
    name: 'PRODUCENT',
    key: 'producent',
    type: 'string',
  },
  {
    name: 'DOSTAWCA',
    key: 'supplierId',
    type: 'select',
    classTd: 'select-field'
  },
  {
    name: 'KOLEKCJA/SERIA',
    key: 'kolekcja',
    type: 'string',
  },
  {
    name: 'NR KATALOGOWY',
    key: 'nrKatalogowy',
    type: 'string',
  },
  {
    name: 'KOLOR',
    key: 'kolor',
    type: 'string',
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
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    type: 'string',
  },
  {
    name: 'LINK',
    key: 'link',
    type: 'string',
  },
];
